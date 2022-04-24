import exec from 'child_process';
import msgFunctions from './messageFunctions.js';
import exitProg from './exitHandler.js';

const checkResponseError = ({error, stdout, stderr}, {devNull = false, getSTDERR = false, ignoreError=false}) => {
    if (error && !ignoreError) {
        if (stdout) msgFunctions.stdMSG(stdout);
        if (stderr) msgFunctions.errMSG(stderr);
        msgFunctions.errMSG(error);
        exitProg();
    }
    if (stderr && devNull !== true) {
        if (stdout) msgFunctions.stdMSG(stdout);
        if (stderr) msgFunctions.errMSG(stderr);
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
        exec.exec(command, { cwd: workingDir }, (error, stdout, stderr) => resolve(checkResponseError({error, stdout, stderr}, params)))
    })
}

export default execAsync;