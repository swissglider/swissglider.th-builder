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

const exitProg = () => process.exit(1);

const rl = readline.createInterface(process.stdin, process.stdout);

const prompt = async (message) => {
    return new Promise((resolve, reject) => {
        rl.question(message, (input) => resolve(input));
    });
}

const checkResponseError = ({error, stdout, stderr}, devNull = false) => {
    if (error) {
        if (stdout) successMSG(stdout);
        if (stderr) errMSG(stderr);
        errMSG(error);
        exitProg();
    }
    if (stderr && devNull !== true) {
        if (stdout) successMSG(stdout);
        if (stderr) errMSG(stderr);
    }
    return stdout;
}

/**
 * returns an object with an stdout
 * on error it exit the Programm
 * on stderr it prints it out
 */
const execAsync = async (comman, workingDir = './', devNull = false) => {
    return new Promise((resolve, reject) => {
        exec(comman, { cwd: workingDir }, (error, stdout, stderr) => resolve(checkResponseError({error, stdout, stderr}, devNull)))
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
    packageJSON.name = inputParams.packageName;
    if (inputParams.version) packageJSON.version = inputParams.version;
    packageJSON.author.name = inputParams.author_name;
    packageJSON.author.email = inputParams.author_email;
    if (inputParams.license) packageJSON.license = inputParams.license;
    if (inputParams.keywords) packageJSON.keywords = inputParams.keywords;

    // console.log(JSON.stringify(packageJSON, null, 2));
    fs.writeFileSync(`./${inputParams.projectFolder}/package.json`, JSON.stringify(packageJSON, null, 2))
}

const setupGitReactTypescript = async () => {
    const cdw = `./${inputParams.projectFolder}`;

    waitMSG('installing Git ...');
    await execAsync(`git init --quiet --initial-branch=${inputParams.branch}`, cdw);

    waitMSG('installing React ...');
    await execAsync(`npm install react react-dom typescript @types/react --save-dev`, cdw);

    waitMSG('installing Webpack ...');
    await execAsync(`npm install webpack --save-dev`, cdw);

    waitMSG('installing Rollup ...');
    await execAsync(`npm install rollup @rollup/plugin-node-resolve @rollup/plugin-typescript @rollup/plugin-commonjs --save-dev`, cdw);
    await execAsync(`npm install rollup-plugin-dts @rollup/plugin-json rollup-plugin-postcss rollup-plugin-peer-deps-external rollup-plugin-terser --save-dev`, cdw);

    waitMSG('copy config files from Github ...');
    const tmpF = '__temp__';
    await execAsync(`mkdir ${tmpF}`, cdw);
    await execAsync(`git clone --depth 1 --filter=blob:none --no-checkout https://github.com/swissglider/swissglider.th-builder`, `${cdw}/${tmpF}`, true);
    await execAsync(`git checkout --quiet main -- templates`, `${cdw}/${tmpF}/swissglider.th-builder`);
    await execAsync(` cp -rT ./${tmpF}/swissglider.th-builder/templates/toCopy .`, cdw);
    await execAsync(` rm -rf ./${tmpF}`, cdw);

    waitMSG('installing semantic-release ...');
    await execAsync(`npm  install @semantic-release/changelog @semantic-release/commit-analyzer @semantic-release/git @semantic-release/release-notes-generator --save-dev`, cdw, true);

    waitMSG('installing storybook ...');
    await execAsync(`npx sb init --builder webpack5`, cdw, true);
    await execAsync(`npx sb upgrade --prerelease`, cdw, true);
    await execAsync(` rm -rf ./src/stories`, cdw, true);
}

const adaptPackageJSON = async () => {
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
    fs.writeFileSync(`./${inputParams.projectFolder}/package.json`, JSON.stringify(newPackageJSON, null, 2))
}

const reInstallNPM = async () => {
    const cdw = `./${inputParams.projectFolder}`;

    waitMSG('reinstalling npm (npm install) ...');
    await execAsync(`rm -rf ./node_modules`, cdw, true);
    await execAsync(`rm -rf ./package-lock.json`, cdw, true);
    await execAsync(`npm install`, cdw, true);
}

const createGitHubRepository = async () => {
    const cdw = `./${inputParams.projectFolder}`;

    waitMSG('creating github repository ...');
    await execAsync(`git add . && git commit -m "initial commit"`, cdw);
    const authResponce = await execAsync(`gh auth status`, cdw)
    execAsync(`gh repo create ${inputParams.packageName} --public --source=. --remote=origin --description=${inputParams.description} --push`, cdw)
}

const checkIfGithubAuthenticated = async () => {

    waitMSG('checking if github authenticated ...');
    const authResponce = await execAsync(`gh auth status`)
    if(!authResponce.includes('Logged in to')){
        errMSG('you have to login to github first, use: gh auth login');
        exitProg();
    }
}

const main = async () => {
    // **************************************
    // Main Program
    // **************************************
    successMSG("====================================================================")
    successMSG("  Welcome and thanks for using the Swissglider - TheHome - Builder")
    successMSG("====================================================================")
    successMSG(`Version ${process.env.package_version}`);
    await checkIfGithubAuthenticated();
    await grapInputParameters();
    createProjectFolder();
    createPackageJSON();
    await setupGitReactTypescript();
    await adaptPackageJSON();
    await reInstallNPM();
    process.exit();
}

main();
