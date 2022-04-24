#! /usr/bin/env node

const fs = require('fs');
const { stderr } = require('process');
const readline = require('readline');
const packageJSON = require('./templates/toChange/package.json');
const exec = require('child_process').exec;

// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const successMSG = (msg => console.warn("\x1b[1m", "\x1b[32m", msg, "\x1b[0m"));
const warnMSG = (msg => console.warn("\x1b[2m", "\x1b[30m", "\x1b[43m", msg, "\x1b[0m"));
// const errMSG = (msg => console.error("\x1b[5m", "\x1b[30m", "\x1b[41m", msg, "\x1b[0m"));
const errMSG = (msg => console.error("\x1b[1m", "\x1b[31m", msg, "\x1b[0m"));
const waitMSG = (msg => console.log("\x1b[1m", "\x1b[34m", ` --> ${msg}`, "\x1b[0m"));
const rewriteLastLine = (msg, writeFunction = successMSG) => {
    process.stdout.moveCursor(0, -1) // up one line
    process.stdout.clearLine(1) // from cursor to end
    writeFunction(msg);
}

const exitProg = () => process.exit(1);

const rl = readline.createInterface(process.stdin, process.stdout);

const prompt = async (message) => {
    return new Promise((resolve, reject) => {
        rl.question(message, (input) => resolve(input));
    });
}

const checkResponseError = ({error, stdout, stderr}, {devNull = false, getSTDERR = false, ignoreError=false}) => {
    if (error && !ignoreError) {
        if (stdout) successMSG(stdout);
        if (stderr) errMSG(stderr);
        errMSG(error);
        exitProg();
    }
    if (stderr && devNull !== true) {
        if (stdout) successMSG(stdout);
        if (stderr) errMSG(stderr);
    }
    if(getSTDERR) return stderr;
    return stdout;
}

/**
 * returns an object with an stdout
 * on error it exit the Programm
 * on stderr it prints it out
 */
const execAsync = async (command, workingDir = './', params={}) => {
    return new Promise((resolve, reject) => {
        exec(command, { cwd: workingDir }, (error, stdout, stderr) => resolve(checkResponseError({error, stdout, stderr}, params)))
    })
}

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
                warnMSG(`-- The key/value is not avalable => ${key}/${value}`)
            }
        }
        else if (param.startsWith('-')) {
            const key = param.substring(1);
            const value = (array[index + 1] && !(array[index + 1].startsWith('-'))) ? array[index + 1] : true;
            if (shortInputMap.hasOwnProperty(key)) {
                inputParams[shortInputMap[key]] = value;
            } else {
                warnMSG(`- The key/value is not avalable => ${key}/${value}`)
            }
        }
    });

    if (inputParams.help) printHelpMenu();

    if (inputParams.projectName === undefined) inputParams.projectName = await prompt('Enter the project-name: ');
    if (inputParams.author_name === undefined) inputParams.author_name = await prompt('Enter the author-name: ');
    if (inputParams.author_email === undefined) inputParams.author_email = await prompt('Enter the author-email: ');

    if (inputParams.packageName === undefined) inputParams.packageName = `swissglider.${inputParams.projectName}`;
    if (inputParams.projectFolder === undefined) inputParams.projectFolder = inputParams.projectName.replace(/ +/g, '_');
}


const createProjectFolder = () => {
    // **************************************
    // create folder
    // **************************************

    if (!fs.existsSync(inputParams.projectFolder)) {
        fs.mkdirSync(inputParams.projectFolder);
    }

    if (fs.readdirSync(inputParams.projectFolder).length !== 0) {
        errMSG(`Projectfolder: ${inputParams.projectFolder} musst be empty !!`)
        exitProg();
    }
}


const createPackageJSON = () => {
    // **************************************
    // create Package.json
    // **************************************
    packageJSON.name = inputParams.packageName.toLowerCase();
    if (inputParams.version) packageJSON.version = inputParams.version;
    packageJSON.author.name = inputParams.author_name;
    packageJSON.author.email = inputParams.author_email;
    if (inputParams.license) packageJSON.license = inputParams.license;
    if (inputParams.keywords) packageJSON.keywords = inputParams.keywords;

    // console.log(JSON.stringify(packageJSON, null, 2));
    fs.writeFileSync(`./${inputParams.projectFolder}/package.json`, JSON.stringify(packageJSON, null, 2))
}

const adaptFilesWIthPackageName = async () => {
    const cdw = `./${inputParams.projectFolder}`;

    waitMSG('change files with new packageName');
    const command1 = `sed -i "s/\${packageName}/${inputParams.packageName}/" ./.github/workflows/gh-pages.yml`;
    const command2 = `sed -i "s/\${packageName}/${inputParams.packageName}/" ./liveStorybook/stories_/Default.stories.tsx`;
    console.log(command1);
    console.log(command2);
    await execAsync(`ls -la`, cdw, {devNull:true});
    await execAsync(`sed -i "s/\${packageName}/${inputParams.packageName}/" ./.github/workflows/gh-pages.yml`, cdw, {devNull:true});
    await execAsync(`sed -i "s/\${packageName}/${inputParams.packageName}/" ./liveStorybook/stories_/Default.stories.tsx`, cdw, {devNull:true});
    rewriteLastLine(' ✔  changed files with new packageName');
}

const setupGitReactTypescript = async () => {
    const cdw = `./${inputParams.projectFolder}`;

    waitMSG('installing Git ...');
    await execAsync(`git init --quiet --initial-branch=${inputParams.branch}`, cdw);
    rewriteLastLine(' ✔  installed Git');

    waitMSG('installing React ...');
    await execAsync(`npm install react react-dom typescript @types/react --save-dev`, cdw);
    rewriteLastLine(' ✔  installed React');

    waitMSG('installing Webpack ...');
    await execAsync(`npm install webpack --save-dev`, cdw);
    rewriteLastLine(' ✔  installed Webpack');

    waitMSG('installing Rollup ...');
    await execAsync(`npm install rollup @rollup/plugin-node-resolve @rollup/plugin-typescript @rollup/plugin-commonjs --save-dev`, cdw);
    await execAsync(`npm install rollup-plugin-dts @rollup/plugin-json rollup-plugin-postcss rollup-plugin-peer-deps-external rollup-plugin-terser --save-dev`, cdw);
    rewriteLastLine(' ✔  installed Rollup');

    waitMSG('copy config files from Github ...');
    const tmpF = '__temp__';
    await execAsync(`mkdir ${tmpF}`, cdw);
    await execAsync(`git clone --depth 1 --filter=blob:none --no-checkout https://github.com/swissglider/swissglider.th-builder`, `${cdw}/${tmpF}`, {devNull:true});
    await execAsync(`git checkout --quiet main -- templates`, `${cdw}/${tmpF}/swissglider.th-builder`);
    await execAsync(` cp -rT ./${tmpF}/swissglider.th-builder/templates/toCopy .`, cdw);
    await execAsync(` rm -rf ./${tmpF}`, cdw);
    rewriteLastLine(' ✔  copy config from Github');

    waitMSG('installing semantic-release ...');
    await execAsync(`npm  install @semantic-release/changelog @semantic-release/commit-analyzer @semantic-release/git @semantic-release/release-notes-generator --save-dev`, cdw, {devNull:true});
    rewriteLastLine(' ✔  installed semantic-release');

    waitMSG('installing storybook ...');
    await execAsync(`npx sb init --builder webpack5`, cdw, {devNull:true});
    await execAsync(`npx sb upgrade --prerelease`, cdw, {devNull:true});
    await execAsync(` rm -rf ./src/stories`, cdw, {devNull:true});
    rewriteLastLine(' ✔  installed storybook');
}

const adaptFilesJSON = async () => {
    const cdw = `./${inputParams.projectFolder}`;
    waitMSG('adapting package.json ...');
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
    rewriteLastLine(' ✔  npm install successfull');
}

const reInstallNPM = async () => {
    const cdw = `./${inputParams.projectFolder}`;

    waitMSG('reinstalling npm (npm install) ...');
    await execAsync(`rm -rf ./node_modules`, cdw, {devNull:true});
    await execAsync(`rm -rf ./package-lock.json`, cdw, {devNull:true});
    await execAsync(`npm install`, cdw, {devNull:true});
    rewriteLastLine(' ✔  package.json adapted');
}

const createGitHubRepository = async () => {
    const cdw = `./${inputParams.projectFolder}`;

    waitMSG('creating github repository ...');
    await execAsync(`git add . && git commit -m "initial commit"`, cdw);
    await execAsync(`gh auth status`, cdw, {devNull:true})
    await execAsync(`gh repo create ${inputParams.packageName} --public --source=. --remote=origin --description="${inputParams.description}" --push`, cdw)
    rewriteLastLine(' ✔  github repository created and pushed');
}

const checkIfGithubAuthenticated = async () => {

    waitMSG('checking if github authenticated ...');
    const authResponse = await execAsync(`gh auth status`, '.', {devNull:true, getSTDERR:true, ignoreError:true});
    if(!authResponse.includes('Logged in to')){
        errMSG('you have to login to github first, use: gh auth login');
        exitProg();
    }
    rewriteLastLine(' ✔  github authentication ok');
}

const createLiveStoryBookEnvironmen = async () => {

    const cdw = `./${inputParams.projectFolder}/liveStorybook`;

    waitMSG('createLiveStoryBookEnvironment::adapt own packageJSON');
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
    rewriteLastLine(' ✔  createLiveStoryBookEnvironment::adapt own packageJSON');

    waitMSG('createLiveStoryBookEnvironment::install Packages');
    await execAsync(`npm install react react-dom typescript @types/react --save`, cdw);
    await execAsync(`npm install webpack --save-dev`, cdw);
    await execAsync(`npx sb init --builder webpack5`, cdw, {devNull:true});
    await execAsync(`npx sb upgrade --prerelease`, cdw, {devNull:true});
    await execAsync(` rm -rf ./stories`, cdw, {devNull:true});
    await execAsync(` mv ./stories_ ./stories`, cdw, {devNull:true});
    await execAsync(`rm -rf ./node_modules`, cdw, {devNull:true});
    await execAsync(`rm -rf ./package-lock.json`, cdw, {devNull:true});
    await execAsync(`npm install`, cdw, {devNull:true});
    rewriteLastLine(' ✔  createLiveStoryBookEnvironment::install Packages');

}

const main = async () => {
    // **************************************
    // Main Program
    // **************************************
    successMSG("====================================================================")
    successMSG("  Welcome and thanks for using Swissglider's - TheHome - Builder")
    successMSG("      😊 😊 Take a coffee, this will go some minutes 😊 😊")
    successMSG("====================================================================")
    successMSG(``);
    await checkIfGithubAuthenticated();
    await grapInputParameters();
    createProjectFolder();
    createPackageJSON();
    await adaptFilesWIthPackageName();
    await setupGitReactTypescript();
    await adaptFilesJSON();
    await reInstallNPM();
    await createLiveStoryBookEnvironmen();


    await createGitHubRepository();
    process.exit();
}

main();
