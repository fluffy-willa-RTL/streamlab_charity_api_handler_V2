import { Console } from 'node:console';
import fs from 'node:fs';

// Set the __diname 
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));

var startTime = date24Now();

// const startTime = date.toLocaleTimeString("fr-BE", {hour12: false});
function date24Now () {
	return new Date().toLocaleTimeString("fr-BE", {hour12: false});
}

export function log(msg) {
	// const dateNow = date.toLocaleTimeString();
	const dateNow = date24Now();
	console.log(`[${dateNow}]: ${msg}`);
	logFile.log(`[${dateNow}]: ${msg}`);
}

export function logTable(msg, option) {
	// const dateNow = date.toLocaleTimeString("fr-BE", {hour12: false});
	const dateNow = date24Now();
	console.log(`[${dateNow}]`);
	console.table(msg, option);
	logFile.log(`[${dateNow}]`);
	logFile.table(msg, option);
}

export function logErr(msg) {
	// const dateNow = date.toLocaleTimeString("fr-BE", {hour12: false});
	const dateNow = date24Now();
	console.log(`[${dateNow}]: ${msg}`);
	logFile.error(`[${dateNow}]: ${msg}`);
}

const logFilePath = join(__dirname, "..", "log", `log_${startTime}.log`);
const errFilePath = join(__dirname, "..", "log", `err_${startTime}.log`);
export const logFile = new Console({
	stdout: fs.createWriteStream(logFilePath),
	stderr: fs.createWriteStream(errFilePath),
});
