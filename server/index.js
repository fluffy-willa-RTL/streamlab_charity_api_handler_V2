import * as connect		from './0_utils/connect.js';
import cors				from 'cors';
import express			from "express";
import db				from './2_dbManagement/database.js'

import { startRecovery } 							from './1_recovery/recovery.js'
import { getAllStreamer }							from './2_dbManagement/getAllStreamer.js'
import { startSocketClient } 						from './3_socket/socketClient.js'
import { startSocketServer, forceRefreshClient }	from './3_socket/socketServer.js'


import dotenv from 'dotenv'
// Init .env
dotenv.config()

export let recoveryMode = true

// Set the __diname 
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));

// dir path constructor
function publicPathFile(path) {
	return join(__dirname, '4_web', 'public', path);
}

//TODO REMOVE DEBUG
import {Console} from 'node:console';
import fs from 'node:fs'
const dblog = new Console({
	stdout: fs.createWriteStream("dblog.json"),
	stderr: fs.createWriteStream("dblog.err"),
});
const streamlog = new Console({
	stdout: fs.createWriteStream("streamer_log.json"),
	stderr: fs.createWriteStream("streamer_log.err"),
});


/**
 * When the back start it will run the `RECOVERY MODE`, all the component will be
 * loaded AFTER the `RECOVERY MODE`.
 * @ start RECOVERY MODE will listent the streamlabs WS hand write in the `db.don`,
 * In the same time, downlaod all the donations in the backup DB to the `db.don` and finally,
 * will ask to the streamlab API all the donation after the last donation from the backup DB and check 
 * if we find the first donation from the WS.
 */
//////////// RECOVERY MODE ////////////
/**/
/**/ startSocketClient()
/**/ await startRecovery();
/**/
//////////// RECOVERY MODE ////////////

// Fetch all streamer in the team
/// NOTE: `await` to avoid that a clien ask `whoami` when the user db is not set
await getAllStreamer()

dblog.log(JSON.stringify(db.don));
streamlog.log(JSON.stringify(db.streamer));

export const app = express()

// Allow CORS
app.use(cors())

// Set the public folder
app.use(express.static(join(__dirname, '4_web', 'public')));

/**
 * FRONT END
 */
// app.get('/', (req, res) => {
// 	res.send("~UwU~");
// })

app.get('/u/', (req, res) => {
	res.sendFile(publicPathFile(join('html', 'streamerNotFound.html')))
})

app.get('/a/', (req, res) => {
	res.sendFile(publicPathFile(join('html', 'streamerNotFound.html')))
})

// Dashboard for user
app.get('/u/:slug', (req, res) => {//TODO chage to slug
	res.sendFile(publicPathFile(join('html', 'streamerDashboard.html')))
})

// Donation goal for user
app.get('/a/:id/streamertotal', (req, res) => {
	res.sendFile(publicPathFile(join('html', 'asset', 'streamerTotal.html')))
})

// Redirect to auth link streamlab
app.get('/', (req, res) => {
	res.redirect(connect.get_auth_url());
})

// Get the `code` query to acces the user info and generate they link for `/u/:slug`
app.get('/redirect', async (req, res) => {//TODO TODO TODO TODO 							TODO slug the username 
	let data;
	if ('code' in req.query){
		data = await connect.getUserData(req.query.code);
	}
	data ? res.redirect('/u/'+ data.slug) : res.send("Error!")
})

/**
 * DEV ENDPOINT
 */
app.get('/forceRefresh', (req, res) => {
	forceRefreshClient();
	res.send("Send forceRefresh all client")
})

/**
 * BACK END
 */

const server = app.listen(process.env.PORT, () => {
	console.log(`[*.*]:${process.env.PORT}`);

	// Run WS server only when the web serv is started
	startSocketServer(server)

	// Disable recovery mode to allow fronten update
	recoveryMode = false;
})
