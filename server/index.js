import cors				from 'cors';
import express			from "express";
import https			from 'https';
import http				from 'http';
import	fs				from 'fs'
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

app.get('/u/',			(req, res) => {res.sendFile(publicPathFile(join('src', 'menu', 'streamerNotFound.html')))})
app.get('/a/',			(req, res) => {res.sendFile(publicPathFile(join('src', 'menu', 'streamerNotFound.html')))})
app.get('/favicon.ico',	(req, res) => {res.sendFile(publicPathFile(join('png', 'favicon-televie.png')))})

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
			const reject = () => {
				res.setHeader('www-authenticate', 'Basic')
				res.sendStatus(401)
			}
			// Request auth
			const authorization = req.headers.authorization

			// Check if auth is not empty
			if(!authorization) {
				console.log(color.FgRed + color.BgWhite + "Fail admin auth !!" + color.Reset);
				return reject()
			}

			// Decode username and password
			const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')

			// Check the username and password
			if(! (username === process.env.ADMUSR && password === process.env.ADMPSSWRD)) {
				console.log(color.FgRed + color.BgWhite + `Fail admin auth !! [${username}][${password}]` + color.Reset);
				return reject()
			}
			res.sendFile(publicPathFile(join('src', 'menu', '9je5vyhjh8doxj', 'admin.html')))
			return ;
		}
	}
	res.sendFile(publicPathFile(join('src', 'menu', 'streamerDashboard.html')))
})

// Dashboard for technical team
app.get('/dashboard', (req, res) => {
	const reject = () => {
		res.setHeader('www-authenticate', 'Basic')
		res.sendStatus(401)
	}
	// Request auth
	const authorization = req.headers.authorization

	// Check if auth is not empty
	if(!authorization) {
		console.log(color.FgRed + color.BgWhite + "Fail admin auth !!" + color.Reset);
		return reject()
	}

	// Decode username and password
	const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')

	// Check the username and password
	if(! (username === process.env.TCHUSR && password === process.env.TCHPSSWD)) {
		console.log(color.FgRed + color.BgWhite + `Fail admin auth !! [${username}][${password}]` + color.Reset);
		return reject()
	}
	res.sendFile(publicPathFile(join('src', 'menu', '9je5vyhjh8doxj', 'admin.html')))// TODO create a new page
	return ;
})

/******************************************************************************/
/*                                 ASSETS                                     */
/*******************************************************************************
/a/total/all			=> Total of all streamers						(text)
/a/donation/last		=> Last donation of all streamers				(text)
/a/donation/big			=> Biggest donation of all streamers			(text)
/a/donation/last10		=> Last 10 donations of all streamers			(asset)
/a/donation/big10		=> Biggest 10 donations of all streamers		(asset)

/a/:id/total/all		=> Total of streamer id							(text)
/a/:id/donation/last	=> Last donation of streamer id					(text)
/a/:id/donation/big		=> Biggest donation of streamer id				(text)
/a/:id/donation/last10	=> Last 10 donations of streamer id				(asset)
/a/:id/donation/big10	=> Biggest 10 donations of streamer id			(asset)

*************************            GLOBAL            ************************/

app.get('/a/total/all',			(req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'screen','total','totalGlobal.html')))})
app.get('/a/donation/last',		(req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'screen','donation','donationLast.html')))})
app.get('/a/donation/big',		(req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'screen','donation','donationBiggest.html')))})
app.get('/a/donation/last10',	(req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'screen','donation','donationLast10.html')))})
app.get('/a/donation/big10',	(req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'screen','donation','donationBiggest10.html')))})

/************************           STREAMER           ************************/

app.get('/a/:id/total/me',			(req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','total','totalMe.html')))})
app.get('/a/:id/donation/last',		(req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','donation', 'donationLast.html')))})
app.get('/a/:id/donation/big',		(req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','donation','donationBiggest.html')))})
app.get('/a/:id/donation/last10',	(req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','donation','donationLast10.html')))})
app.get('/a/:id/donation/big10',	(req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','donation','donationBiggest10.html')))})

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

// Redirect to auth link streamlab
app.get('/', (req, res) => {res.redirect(connect.get_auth_url());})

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

app.get('/forceRefresh', (req, res) => {
	forceRefreshClient();
	res.send("Send forceRefresh all client")
})

/**
 * BACK END
 */

//  const server = app.listen(process.env.PORT, () => {
	 
// 	 // Run WS server only when the web serv is started
// 	 startSocketServer(server)
	 
// 	// Init the front buffer
// 	update.updateFrontLight();
// 	update.updateFrontHeavyLoop();
	
// 	// Disable recovery mode to allow fronten update
// 	recoveryMode = false;
// 	console.log(`[*.*]:${process.env.PORT}`);
// });

// Certificate
const privateKey = fs.readFileSync(process.env.PKEY, 'utf8');
const certificate = fs.readFileSync(process.env.CERT, 'utf8');
const ca = fs.readFileSync(process.env.CA, 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

// const httpServer = http.createServer(app);

const httpsServer = https.createServer(credentials ,app);

httpsServer.listen(process.env.PORT, () => {
	 
	 // Run WS server only when the web serv is started
	 startSocketServer(httpsServer)
	 
	// Init the front buffer
	update.updateFrontLight();
	update.updateFrontHeavyLoop();
	
	// Disable recovery mode to allow fronten update
	recoveryMode = false;
	console.log(`[*.*]:${process.env.PORT}`);
});

