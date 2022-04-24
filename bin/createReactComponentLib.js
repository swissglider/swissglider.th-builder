#! /usr/bin/env node

import fs from 'fs'; 
import msgFunctions from './messageFunctions.js';
import execAsync from './asyncExecHandler.js';
import exitProg from './exitHandler.js';

const inputParams = {
    projectName: undefined,
    packageName: undefined,
    projectFolder: undefined,
    author_name: undefined,
    author_email: undefined,
    version: undefined,
    license: undefined,
    keywords: undefined,
    description: '',
    branch: 'main',
    help: false,
}

const shortInputMap = {
    h: 'help',
}

const printHelpMenu = () => {
    console.log("---------- Help Menu --------");
    exitProg();
}

const grapInputParameters = async () => {
    // **************************************
    // grap the input params
    // **************************************
    const args = process.argv.slice(2);
    args.forEach((param, index, array) => {
        if (param.startsWith('--')) {
            const key = param.substring(2);
            const value = (array[index + 1] && !(array[index + 1].startsWith('-'))) ? array[index + 1] : true;
            if (inputParams.hasOwnProperty(key)) {
                inputParams[key] = value;
            } else {
                msgFunctions.warnMSG(`-- The key/value is not avalable => ${key}/${value}`)
            }
        }
        else if (param.startsWith('-')) {
            const key = param.substring(1);
            const value = (array[index + 1] && !(array[index + 1].startsWith('-'))) ? array[index + 1] : true;
            if (shortInputMap.hasOwnProperty(key)) {
                inputParams[shortInputMap[key]] = value;
            } else {
                msgFunctions.warnMSG(`- The key/value is not avalable => ${key}/${value}`)
            }
        }
    });

    if (inputParams.help) printHelpMenu();

    if (inputParams.projectName === undefined) inputParams.projectName = await msgFunctions.prompt('Enter the project-name: ');
    if (inputParams.author_name === undefined) inputParams.author_name = await msgFunctions.prompt('Enter the author-name: ');
    if (inputParams.author_email === undefined) inputParams.author_email = await msgFunctions.prompt('Enter the author-email: ');
    inputParams.author_name = inputParams.author_name.toLowerCase();

    if (inputParams.packageName === undefined) inputParams.packageName = `${inputParams.author_name}.${inputParams.projectName}`;
    if (inputParams.projectFolder === undefined) inputParams.projectFolder = inputParams.projectName;
    inputParams.projectFolder = inputParams.projectFolder.replace(/ +/g, '_');
    inputParams.packageName = inputParams.packageName.toLowerCase();
    console.log(inputParams.packageName );
    console.log(inputParams.author_name)
}


const createProjectFolder = () => {
    // **************************************
    // create folder
    // **************************************

    if (!fs.existsSync(inputParams.projectFolder)) {
        fs.mkdirSync(inputParams.projectFolder);
    }

    if (fs.readdirSync(inputParams.projectFolder).length !== 0) {
        msgFunctions.errMSG(`Projectfolder: ${inputParams.projectFolder} musst be empty !!`)
        exitProg();
    }
}


const createPackageJSON = () => {
    // **************************************
    // create Package.json
    // **************************************


    msgFunctions.waitMSG('create package.json ...');
    const rawPackageJSON = fs.readFileSync(`./${inputParams.projectFolder}/package.json`);
    const newPackageJSON = JSON.parse(rawPackageJSON);
    newPackageJSON.name = inputParams.packageName;
    if (inputParams.version) newPackageJSON.version = inputParams.version;
    newPackageJSON.author = {
        name: inputParams.author_name,
        email: inputParams.author_email,
    }
    if (inputParams.license) newPackageJSON.license = inputParams.license;
    if (inputParams.keywords) newPackageJSON.keywords = inputParams.keywords;

    fs.writeFileSync(`./${inputParams.projectFolder}/package.json`, JSON.stringify(newPackageJSON, null, 2));
    msgFunctions.successJobMSG('npm package.json created');

}

const downloadFromGithub = async () => {
    const cdw = `./${inputParams.projectFolder}`;

    msgFunctions.waitMSG('installing Git ...');
    await execAsync(`git init --quiet --initial-branch=${inputParams.branch}`, cdw);
    msgFunctions.successJobMSG('installed Git');

    msgFunctions.waitMSG('copy config files from Github ...');
    const tmpF = '__temp__';
    await execAsync(`mkdir ${tmpF}`, cdw);
    await execAsync(`git clone --depth 1 --filter=blob:none --no-checkout https://github.com/swissglider/swissglider.th-builder`, `${cdw}/${tmpF}`, {devNull:true});
    await execAsync(`git checkout --quiet main -- templates`, `${cdw}/${tmpF}/swissglider.th-builder`);
    await execAsync(` cp -rT ./${tmpF}/swissglider.th-builder/templates/toCopy .`, cdw);
    await execAsync(` rm -rf ./${tmpF}`, cdw);
    msgFunctions.successJobMSG('copy config from Github');

}

const adaptFilesWithPackageName = async () => {
    const cdw = `./${inputParams.projectFolder}`;

    msgFunctions.waitMSG('change files with new packageName');
    await execAsync(`sed -i "s/\\£{packageName}/${inputParams.packageName}/" ./.github/workflows/gh-pages.yml`, cdw, {devNull:true});
    await execAsync(`sed -i "s/\\£{packageName}/${inputParams.packageName}/" ./liveStorybook/stories_/Default.stories.tsx`, cdw, {devNull:true});
    msgFunctions.successJobMSG('changed files with new packageName');
}

const setupGitReactTypescript = async () => {
    const cdw = `./${inputParams.projectFolder}`;

    msgFunctions.waitMSG('installing React ...');
    await execAsync(`npm install react react-dom typescript @types/react --save-dev`, cdw);
    msgFunctions.successJobMSG('installed React');

    msgFunctions.waitMSG('installing Webpack ...');
    await execAsync(`npm install webpack --save-dev`, cdw);
    msgFunctions.successJobMSG('installed Webpack');

    msgFunctions.waitMSG('installing Rollup ...');
    await execAsync(`npm install rollup @rollup/plugin-node-resolve @rollup/plugin-typescript @rollup/plugin-commonjs --save-dev`, cdw);
    await execAsync(`npm install rollup-plugin-dts @rollup/plugin-json rollup-plugin-postcss rollup-plugin-peer-deps-external rollup-plugin-terser --save-dev`, cdw);
    msgFunctions.successJobMSG('installed Rollup');

    msgFunctions.waitMSG('installing semantic-release ...');
    await execAsync(`npm  install @semantic-release/changelog @semantic-release/commit-analyzer @semantic-release/git @semantic-release/release-notes-generator --save-dev`, cdw, {devNull:true});
    msgFunctions.successJobMSG('installed semantic-release');

    msgFunctions.waitMSG('installing storybook ...');
    await execAsync(`npx sb init --builder webpack5`, cdw, {devNull:true});
    await execAsync(`npx sb upgrade --prerelease`, cdw, {devNull:true});
    await execAsync(` rm -rf ./src/stories`, cdw, {devNull:true});
    msgFunctions.successJobMSG('installed storybook');
}

const adaptFilesJSON = async () => {
    const cdw = `./${inputParams.projectFolder}`;
    msgFunctions.waitMSG('adapting package.json ...');
    const rawPackageJSON = fs.readFileSync(`./${inputParams.projectFolder}/package.json`);
    const newPackageJSON = JSON.parse(rawPackageJSON);
    const reactVersion = newPackageJSON.devDependencies.react;
    const reactDOMVersion = newPackageJSON.devDependencies['react-dom'];
    // delete newPackageJSON.devDependencies.react;
    // delete newPackageJSON.devDependencies['react-dom'];
    newPackageJSON.peerDependencies = {
        react: reactVersion,
        'react-dom': reactDOMVersion
    }
    newPackageJSON.homepage = `https://${inputParams.author_name}.github.io/${inputParams.packageName}`
    newPackageJSON.release = {
        "plugins": [
            ["@semantic-release/commit-analyzer", {
                "preset": "angular",
                "releaseRules": [
                  {"type": "docs", "scope":"README", "release": "patch"},
                  {"type": "refactor", "release": "patch"},
                  {"type": "style", "release": "patch"},
                  {"type": "feat", "release": "patch"},
                  {"type": "ghp", release:false}, // only github pages generation -> no new release
                ]
              }],
          "@semantic-release/release-notes-generator",
          [
            "@semantic-release/npm",
            {
              "npmPublish": true
            }
          ],
          "@semantic-release/changelog",
          "@semantic-release/git"
        ],
        "branches": [
          "main"
        ]
      }
    fs.writeFileSync(`./${inputParams.projectFolder}/package.json`, JSON.stringify(newPackageJSON, null, 2));
    msgFunctions.successJobMSG('npm install successfull');
}

const reInstallNPM = async () => {
    const cdw = `./${inputParams.projectFolder}`;

    msgFunctions.waitMSG('reinstalling npm (npm install) ...');
    await execAsync(`rm -rf ./node_modules`, cdw, {devNull:true});
    await execAsync(`rm -rf ./package-lock.json`, cdw, {devNull:true});
    await execAsync(`npm install`, cdw, {devNull:true});
    msgFunctions.successJobMSG('package.json adapted');
}

const createGitHubRepository = async () => {
    const cdw = `./${inputParams.projectFolder}`;

    msgFunctions.waitMSG('creating github repository ...');
    await execAsync(`git add . && git commit -m "initial commit"`, cdw);
    await execAsync(`gh auth status`, cdw, {devNull:true})
    await execAsync(`gh repo create ${inputParams.packageName} --public --source=. --remote=origin --description="${inputParams.description}" --push`, cdw)
    msgFunctions.successJobMSG('github repository created and pushed');
}

const checkIfGithubAuthenticated = async () => {

    msgFunctions.waitMSG('checking if github authenticated ...');
    const authResponse = await execAsync(`gh auth status`, '.', {devNull:true, getSTDERR:true, ignoreError:true});
    if(!authResponse.includes('Logged in to')){
        msgFunctions.errMSG('you have to login to github first, use: gh auth login');
        exitProg();
    }
    msgFunctions.successJobMSG('github authentication ok');
}

const createLiveStoryBookEnvironmen = async () => {

    const cdw = `./${inputParams.projectFolder}/liveStorybook`;

    msgFunctions.waitMSG('createLiveStoryBookEnvironment::adapt own packageJSON');
    const rawPackageJSON = fs.readFileSync(`./${inputParams.projectFolder}/liveStorybook/package.json`);
    const newPackageJSON = JSON.parse(rawPackageJSON);
    if (inputParams.version) newPackageJSON.version = inputParams.version;
    newPackageJSON.author = {
        name: inputParams.author_name,
        email: inputParams.author_email,
    };
    if (inputParams.license) newPackageJSON.license = inputParams.license;
    newPackageJSON.homepage = `https://${inputParams.author_name}.github.io/${inputParams.packageName}`
    fs.writeFileSync(`./${inputParams.projectFolder}/liveStorybook/package.json`, JSON.stringify(newPackageJSON, null, 2));
    msgFunctions.successJobMSG('createLiveStoryBookEnvironment::adapt own packageJSON');

    msgFunctions.waitMSG('createLiveStoryBookEnvironment::install Packages');
    await execAsync(`npm install react react-dom typescript @types/react --save`, cdw);
    await execAsync(`npm install webpack --save-dev`, cdw);
    await execAsync(`npx sb init --builder webpack5`, cdw, {devNull:true});
    await execAsync(`npx sb upgrade --prerelease`, cdw, {devNull:true});
    await execAsync(` rm -rf ./stories`, cdw, {devNull:true});
    await execAsync(` mv ./stories_ ./stories`, cdw, {devNull:true});
    await execAsync(`rm -rf ./node_modules`, cdw, {devNull:true});
    await execAsync(`rm -rf ./package-lock.json`, cdw, {devNull:true});
    await execAsync(`npm install`, cdw, {devNull:true});
    msgFunctions.successJobMSG('createLiveStoryBookEnvironment::install Packages');

}

const main = async () => {
    // **************************************
    // Main Program
    // **************************************
    msgFunctions.stdMSG("====================================================================")
    msgFunctions.stdMSG("  Welcome and thanks for using Swissglider's - TheHome - Builder")
    msgFunctions.stdMSG("     😊 😊 Take a coffee, this will tage some minutes 😊 😊")
    msgFunctions.stdMSG("====================================================================")
    msgFunctions.stdMSG(``);
    await checkIfGithubAuthenticated();
    await grapInputParameters();
    createProjectFolder();


    await downloadFromGithub();
    createPackageJSON();
    await adaptFilesWithPackageName();
    await setupGitReactTypescript();
    await adaptFilesJSON();
    await reInstallNPM();
    await createLiveStoryBookEnvironmen();


    await createGitHubRepository();
    process.exit();
}

main();
