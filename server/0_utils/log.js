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

export async function log(msg) {
	// const dateNow = date.toLocaleTimeString();
	const dateNow = date24Now();
	console.log(`[${dateNow}]: ${msg}`);
	logFile.log(`[${dateNow}]: ${msg}`);
}

export async function logTable(msg, option) {
	// const dateNow = date.toLocaleTimeString("fr-BE", {hour12: false});
	const dateNow = date24Now();
	console.log(`[${dateNow}]`);
	console.table(msg, option);
	logFile.log(`[${dateNow}]`);
	logFile.table(msg, option);
}

export async function logErr(msg) {
	// const dateNow = date.toLocaleTimeString("fr-BE", {hour12: false});
	const dateNow = date24Now();
	console.log(`[${dateNow}]: ${msg}`);
	logFile.error(`[${dateNow}]: ${msg}`);
}

export async function logGoal(msg) {
	const dateNow = date24Now();
	donationGoalFile.log(`[${dateNow}]: ${msg}`);
}

export async function logSocket(msg) {
	const dateNow = date24Now();
	console.log(`[${dateNow}]: ${msg}`);
	socketConnectionFile.log(`[${dateNow}]: ${msg}`);
}

const logFilePath = join(__dirname, "..", "log", `log_${startTime}.log`);
const errFilePath = join(__dirname, "..", "log", `err_${startTime}.log`);

export const logFile = new Console({
	stdout: fs.createWriteStream(logFilePath),
	stderr: fs.createWriteStream(errFilePath),
});

const donationGoalFilePath = join(__dirname, "..", "log", `log_donation_goal_${startTime}.log`);

const donationGoalFile = new Console({
	stdout: fs.createWriteStream(donationGoalFilePath),
	stderr: fs.createWriteStream(donationGoalFilePath),
});

const socketConnectionFilePath = join(__dirname, "..", "log", `log_socket_connection_${startTime}.log`);

const socketConnectionFile = new Console({
	stdout: fs.createWriteStream(socketConnectionFilePath),
	stderr: fs.createWriteStream(socketConnectionFilePath),
});
