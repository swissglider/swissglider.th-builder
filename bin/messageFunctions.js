// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const successMSG = (msg => console.log("\x1b[1m", "\x1b[32m", msg, "\x1b[0m"));
const warnMSG = (msg => console.warn("\x1b[2m", "\x1b[30m", "\x1b[43m", msg, "\x1b[0m"));
// const errMSG = (msg => console.error("\x1b[5m", "\x1b[30m", "\x1b[41m", msg, "\x1b[0m"));
const errMSG = (msg) => {
    console.error("\x1b[1m", "\x1b[31m", msg, "\x1b[0m");
}

const waitMSG = (msg) => {
     console.log("\x1b[5m", "\x1b[34m", " ☕ ", "\x1b[1m", "\x1b[34m", msg, "\x1b[0m");
}

const successJobMSG = (msg, successIcon = "✔") => {
    process.stdout.moveCursor(0, -1) // up one line
    process.stdout.clearLine(1) // from cursor to end
    console.log("\x1b[1m", "\x1b[32m", ` ${successIcon}  `,"\x1b[0m" , msg);
}

const rewriteLastLine = (msg, writeFunction = successMSG) => {
    process.stdout.moveCursor(0, -1) // up one line
    process.stdout.clearLine(1) // from cursor to end
    writeFunction(msg);
}

const stdMSG = (msg => console.log(msg));

const msgFunctions = {
    successMSG: successMSG,
    warnMSG: warnMSG,
    errMSG: errMSG,
    waitMSG: waitMSG,
    rewriteLastLine: rewriteLastLine,
    successJobMSG:successJobMSG,
    stdMSG:stdMSG,
}

export default msgFunctions;