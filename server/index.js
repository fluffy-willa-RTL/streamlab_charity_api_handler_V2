import cors				from 'cors';
import express			from "express";
import yesno			from 'yesno'

import * as connect									from './0_utils/connect.js';
import color 										from './0_utils/color.js';
import { sleep } 									from './0_utils/sleep.js';
import { startRecovery } 							from './1_recovery/recovery.js'
import db											from './2_dbManagement/database.js'
import { getAllStreamer }							from './2_dbManagement/getAllStreamer.js'
import { startSocketClient } 						from './3_socket/socketClient.js'
import { startSocketServer, forceRefreshClient }	from './3_socket/socketServer.js'
import update										from './3_socket/updateFront.js'


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

startSocketClient()

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
/**/ await sleep(1000)
/**/ if (await yesno({question: 'Start Recovery mode ?', defaultValue: true})){
/**/ 	await startRecovery();
/**/ }
/**/
//////////// RECOVERY MODE ////////////

// Fetch all streamer in the team
/// NOTE: `await` to avoid that a clien ask `whoami` when the user db is not set
await getAllStreamer()

export const app = express()

// Allow CORS
app.use(cors())

// Set the public folder
app.use(express.static(join(__dirname, '4_web', 'public')));

/**
 * FRONT END
 */

app.get('/u/', (req, res) => {
	res.sendFile(publicPathFile(join('src', 'streamerNotFound.html')))
})

app.get('/a/', (req, res) => {
	res.sendFile(publicPathFile(join('src', 'streamerNotFound.html')))
})

// Dashboard for user
app.get('/u/:slug', (req, res) => {
	const admin = [
		'fluffykaiju-',
		'willa-234',
		'fluffy-api',
	];
	for (const user of admin)
	{
		if (user === req.params.slug) {
			res.sendFile(publicPathFile(join('src', '9je5vyhjh8doxj-admin.html')))
			return ;
		}
	}
	res.sendFile(publicPathFile(join('src', 'streamerDashboard.html')))
})

/******************************************************************************/
/*                                 ASSETS                                     */
/******************************************************************************/

// Donation goal for user
app.get('/a/:id/total/me', (req, res) => {
	res.sendFile(publicPathFile(join('src', 'asset', 'streamer','total', 'totalMe.html')))
})

// Donation goal for user
app.get('/a/:id/total/all', (req, res) => {
	res.sendFile(publicPathFile(join('src', 'asset', 'streamer','total','totalGlobal.html')))
})

// Donation goal for user
app.get('/a/:id/total/me-all', (req, res) => {
	res.sendFile(publicPathFile(join('src', 'asset', 'streamer','total','totalMeAndGlobal.html')))
})

/******************************************************************************/

// Donation goal for user
app.get('/a/:id/donation/last', (req, res) => {
	res.sendFile(publicPathFile(join('src', 'asset', 'streamer','donation','donationLast.html')))
})

// Donation goal for user
app.get('/a/:id/donation/big', (req, res) => {
	res.sendFile(publicPathFile(join('src', 'asset', 'streamer','donation','donationBiggest.html')))
})


/******************************************************************************/
/******************************************************************************/

// Redirect to auth link streamlab
app.get('/', (req, res) => {
	res.redirect(connect.get_auth_url());
})

// Get the `code` query to acces the user info and generate they link for `/u/:slug`
app.get('/redirect', async (req, res) => {
	if (!Object.hasOwn(req.query, 'code')) {
		console.log(color.FgRed + color.BgWhite + 'Error streamlab auth return null !' + color.Reset);
		res.status(400).send("Fatal error ! Streamlabs send null response ! Réessayer de vous connecter si le problème ce rèpète constactez les dev.");
		return;
	}
	const data = await connect.getUserData(req.query.code);
	if (data === null) {
		console.log(color.FgRed + color.BgWhite + 'Error streamlab auth return null !' + color.Reset);
		res.status(400).send("Fatal error ! Streamlabs send null response ! Réessayer de vous connecter si le problème ce rèpète constactez les dev.");
		return;
	}
	res.redirect('/u/'+ data.slug);
});

/**
 * DEV ENDPOINT
 */


app.get('/9je5vyhjh8doxj-admin', (req, res) => {
	res.sendFile(publicPathFile(join('html', '9je5vyhjh8doxj-admin.html')))
})

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

	// Init the front buffer
	update.updateFrontLight();
	update.updateFrontHeavyLoop();

	// Disable recovery mode to allow fronten update
	recoveryMode = false;
})
