// frontend/bin.js

const __dirname = path.dirname(new URL(import.meta.url).pathname);

import path from 'path';
const join = path.join.bind(path, __dirname);
import childProcess from 'child_process';

const args = process.argv.slice(2);

if (args.length !== 1) {
    console.error('Usage: node bin.js <path>');
    process.exit(1);
}

childProcess.exec("npm start", (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});