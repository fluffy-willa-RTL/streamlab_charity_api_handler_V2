import cors				from 'cors';
import express			from "express";
import https			from 'https';
import http				from 'http';
import	fs				from 'fs'
import yesno			from 'yesno'

import { log, logErr }			from './0_utils/log.js'
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

const streamerGoalFile = join(__dirname, 'streamerGoal.json');

// Check if file exist
fs.open(streamerGoalFile, 'r', async (err, file) => {
	if (err) {
		log(`${color.FgRed}${color.BgWhite}${streamerGoalFile} don't exist !${color.Reset}`);

		// If don't exit create it
		fs.open(streamerGoalFile, 'w', (err, file) => {
			if (err) throw err;
			fs.writeFile(streamerGoalFile, JSON.stringify({}), (err) => {
				if (err) {
					logErr(`Fail to write ${streamerGoalFile}`);
					throw err;
				};
				fs.chmod(streamerGoalFile, 0o777, (error) => {
					if (error) throw err;
				});
			});
			log(`${color.FgYellow}${streamerGoalFile} Created${color.Reset}`);
		});
		return ;
	}
	log(`${color.FgYellow}${streamerGoalFile} exist.${color.Reset}`);
	db.goals = await readStreamerDonationGoal();
	log(JSON.stringify(db.goals, null, 2));
});


// Read the donation goal json
async function readStreamerDonationGoal() {
	
	try {
		const data = await fs.promises.readFile(streamerGoalFile, 'utf8');
		return JSON.parse(data);
	} catch (error) {
		logErr(`${color.BgWhite}${color.FgRed}${error} Fail to read ${streamerGoalFile} !!${color.Reset}`);
		return ;
	}
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
		'admin'
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
				log(`${color.FgYellow}Admin try to auth${color.Reset}`);
				return reject()
			}

			// Decode username and password
			const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')

			// Check the username and password
			if(!(username === process.env.ADMUSR && password === process.env.ADMPSSWRD)) {
				logErr(`${color.FgRed}${color.BgWhite}Fail admin auth !! [${username}][${password}]${color.Reset}`);
				return reject()
			}
			log(`${color.FgGreen}Admin auth${color.Reset}`);
			res.sendFile(publicPathFile(join('src', 'menu', '9je5vyhjh8doxj', 'admin.html')))
			return ;
		}
	}
	res.sendFile(publicPathFile(join('src', 'menu', 'streamerDashboard.html')))
})

// Dashboard for technical team
app.get('/dashboard', async (req, res) => {
	const reject = () => {
		res.setHeader('www-authenticate', 'Basic')
		res.sendStatus(401)
	}
	// Request auth
	const authorization = req.headers.authorization

	// Check if auth is not empty
	if(!authorization) {
		log(`${color.FgYellow}Tech team try to auth${color.Reset}`);
		return reject()
	}

	// Decode username and password
	const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')

	// Check the username and password
	if(! (username === process.env.TCHUSR && password === process.env.TCHPSSWD)) {
		logErr(`${color.FgRed}${color.BgWhite}Fail Tech team auth !! [${username}][${password}]${color.Reset}`);
		return reject()
	}
	log(`${color.FgGreen}Tech team auth${color.Reset}`);
	res.sendFile(publicPathFile(join('src', 'menu', '9je5vyhjh8doxj', 'dashboard.html')))
	return ;
})

/******************************************************************************/
/*                                 ASSETS                                     */
/*******************************************************************************
/a/total/all				=> Total of all streamers					(text)
/a/donation/last			=> Last donation of all streamers			(text)
/a/donation/big				=> Biggest donation of all streamers		(text)
/a/donation/last10			=> Last 10 donations of all streamers		(asset)
/a/donation/big10			=> Biggest 10 donations of all streamers	(asset)

/a/:id/total/me				=> Total of streamer id						(text)
/a/:id/total/bar			=> Donation bar of the Streamer				(asset)
/a/:id/goal/next			=> Next donation goal ammount				(asset)
/a/:id/goal/before			=> Last donation goal ammount				(asset)
/a/:id/goal/text			=> Text of the actual donation goal			(asset)

/a/:id/donation/last		=> Last donation of streamer id				(text)
/a/:id/donation/big			=> Biggest donation of streamer id			(text)
/a/:id/donation/last10		=> Last 10 donations of streamer id			(asset)
/a/:id/donation/big10		=> Biggest 10 donations of streamer id		(asset)

*************************            GLOBAL            ************************/

app.get('/a/total/all',			async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'screen','total','totalGlobal.html')))})
app.get('/a/donation/last',		async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'screen','donation','donationLast.html')))})
app.get('/a/donation/big',		async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'screen','donation','donationBiggest.html')))})
app.get('/a/donation/last10',	async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'screen','donation','donationLast10.html')))})
app.get('/a/donation/big10',	async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'screen','donation','donationBiggest10.html')))})

/************************           STREAMER           ************************/

app.get('/a/:id/total/me',			async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','total','totalMe.html')))})
app.get('/a/:id/total/bar',			async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','total','donationBar.html')))})
app.get('/a/:id/goal/next',			async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','total','donationGoalAfter.html')))})
app.get('/a/:id/goal/before',		async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','total','donationGoalBefore.html')))})
app.get('/a/:id/goal/text',			async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','total','donationGoalText.html')))})

app.get('/a/:id/donation/last',		async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','donation', 'donationLast.html')))})
app.get('/a/:id/donation/big',		async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','donation','donationBiggest.html')))})
app.get('/a/:id/donation/last10',	async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','donation','donationLast10.html')))})
app.get('/a/:id/donation/big10',	async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','donation','donationBiggest10.html')))})

app.get('/a/:id/donator/last',		async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','donator', 'donationLastDonator.html')))})
app.get('/a/:id/donator/big',		async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'streamer','donator', 'donationLastTopDonator.html')))})

/************************             TIME             ************************/

app.get('/a/timer/countdown',	async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'screen','timer','countdown.html')))})
app.get('/a/timer/elapsedCount',	async (req, res) => {res.sendFile(publicPathFile(join('src', 'asset', 'screen','timer','elapsedCount.html')))})

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

// Redirect to auth link streamlab
app.get('/', async (req, res) => {res.redirect(connect.get_auth_url());})

// Get the `code` query to acces the user info and generate they link for `/u/:slug`
app.get('/redirect', async (req, res) => {
	if (!Object.hasOwn(req.query, 'code')) {
		logErr(`${color.FgRed}${color.BgWhite}Error streamlab auth return null !${color.Reset}`);
		res.status(400).send("Fatal error ! Streamlabs send null response ! Réessayer de vous connecter si le problème ce rèpète constactez les dev.");
		return;
	}
	const data = await connect.getUserData(req.query.code);
	if (data === null) {
		logErr(`${color.FgRed} + ${color.BgWhite}Error streamlab auth return null !${color.Reset}`);
		res.status(400).send("Fatal error ! Streamlabs send null response ! Réessayer de vous connecter si le problème ce rèpète constactez les dev.");
		return;
	}
	res.redirect('/u/'+ data.slug);
});

/**
 * BACK END
 */
if (process.env.PROTOCOL === 'http') {
	const server = app.listen(process.env.HTTP_PORT, () => {
		
		// Run WS server only when the web serv is started
		startSocketServer(server)
		
		// Init the front buffer
		update.updateFrontLight();
		update.updateFrontHeavyLoop();
		
		// Disable recovery mode to allow fronten update
		recoveryMode = false;
		log(`[*.*]:${process.env.HTTP_PORT}`);
	});
}

	if (process.env.PROTOCOL === 'https') {

		// Certificate
		const privateKey1 = fs.readFileSync(process.env.PKEY1, 'utf8');
		const certificate1 = fs.readFileSync(process.env.CERT1, 'utf8');
		const ca1 = fs.readFileSync(process.env.CA1, 'utf8');
		
		const credentials1 = {
			key: privateKey1,
			cert: certificate1,
			ca: ca1
		};
		// Certificate
		const privateKey2 = fs.readFileSync(process.env.PKEY2, 'utf8');
		const certificate2 = fs.readFileSync(process.env.CERT2, 'utf8');
		const ca2 = fs.readFileSync(process.env.CA2, 'utf8');
		
		const credentials2 = {
			key: privateKey2,
			cert: certificate2,
			ca: ca2
		};
		
		const httpsServer = https.createServer(credentials1 ,app);
		httpsServer.addContext(process.env.SECOND_BASE_URL, credentials2);

		httpsServer.listen(process.env.HTTPS_PORT, () => {
		
			// Run WS server only when the web serv is started
			startSocketServer(httpsServer);
			
			// Init the front buffer
			update.updateFrontLight();
			update.updateFrontHeavyLoop();
			
			// Disable recovery mode to allow fronten update
			recoveryMode = false;
			log(`[*.*]:${process.env.HTTPS_PORT}`);
		});
	}