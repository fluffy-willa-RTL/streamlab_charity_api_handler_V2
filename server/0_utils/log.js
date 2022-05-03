import { Console } from 'node:console';
import fs from 'node:fs';

const startTime = new Date().toLocaleTimeString();

export function log(msg) {
	console.log(`[${new Date().toLocaleTimeString()}]: ${msg}`);
	logFile.log(`[${new Date().toLocaleTimeString()}]: ${msg}`);
}

export function logTable(msg, option) {
	console.log(`[${new Date().toLocaleTimeString()}]`);
	console.table(msg, option);
	logFile.log(`[${new Date().toLocaleTimeString()}]`);
	logFile.table(msg, option);
}

export function logErr(msg) {
	console.log(`[${new Date().toLocaleTimeString()}]: ${msg}`);
	logFile.error(`[${new Date().toLocaleTimeString()}]: ${msg}`);
}

export const logFile = new Console({
	stdout: fs.createWriteStream(`log_${startTime}.txt`),
	stderr: fs.createWriteStream(`errLog_${startTime}.txt`),
});
