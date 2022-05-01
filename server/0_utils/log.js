import { Console } from 'node:console';
import fs from 'node:fs';

export function log(msg) {
	console.log(`[${new Date().toLocaleTimeString()}]: ${msg}`);
	logFile.log(`[${new Date().toLocaleTimeString()}]: ${msg}`);
}

export function logErr(msg) {
	console.log(`[${new Date().toLocaleTimeString()}]: ${msg}`);
	logFile.error(`[${new Date().toLocaleTimeString()}]: ${msg}`);
}

export const logFile = new Console({
	stdout: fs.createWriteStream("log.txt"),
	stderr: fs.createWriteStream("errLog.txt"),
});
