import { Server } 		from 'socket.io'

import dotenv			from 'dotenv'
dotenv.config()

import { sleep }		from '../0_utils/sleep.js'
import color			from '../0_utils/color.js';
import db				from '../2_dbManagement/database.js'
import update			from './updateFront.js';
import { log, logErr }			from '../0_utils/log.js'
import { getAllStreamer } from '../2_dbManagement/getAllStreamer.js';

export let front = null
let connectedClient = 0;

import	fs				from 'fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const streamerGoalFile = join(__dirname, '..', 'streamerGoal.json');
/**
 * Start the socket for both streamlab and front-end connection
 */
export async function startSocketServer(server){
	// WS server
	front = new Server(server, {cors: { origin: "*"}})

	// Listen all incoming connection of the 
	front.on('connect', (data) => {
		// Add new client
		log(`${color.FgMagenta}[${connectedClient}][connect]:${data.id} ${color.Reset}`);
		connectedClient++;
		// Client will ask `whoami` to recive all streamer info (slug, name, id, PP)
		data.on('whoami',(res) => {
			if (res['slug'] !== undefined){
				log(`${color.FgMagenta}[whoami] from ${res.slug} ${color.Reset}`);//DEBUG show when client ask whoami
				// Try to find the streamer in the team
				for (const [id, streamer] of Object.entries(db.streamer)){
					if (streamer.slug === res.slug){
						data.emit('youare', {
							id: id,
							streamer: streamer,
							goals: Object.hasOwn(db.goals, id) ? db.goals[id] : null,
						});
						return;
					}
				}
			}
			// If the user is not found return to the front "error" `-404`
			data.emit('youare', {"error": 404});
		})

		// update.updateFrontLight();
		data.on('init', () => {
			update.getFront(data);
		})
		
		data.on('disconnect', () => {
			connectedClient--;
			log(`${color.FgMagenta}${color.Dim}[${connectedClient}][disconnect]:${data.id} ${color.Reset}`);
		})

		data.on('getStreamer', () => {
			data.emit('allStreamer', db.streamer);
		})

		/*************************  ADMIN DEBUG  **************************** */
		// Listen for Page Admin to refresh streamer subscribed in streamlab charity team
		// `nswkvz3po5tpwp`
		data.on('nswkvz3po5tpwp', () => {
			log(`${color.FgRed}${color.BgWhite}Refresh all streamer!!!${color.Reset}`)
			getAllStreamer();
		});
		// Force refresh all client page
		// `ceybt29oezjd7t`
		data.on('ceybt29oezjd7t', () => {
			log(`${color.FgRed}${color.BgWhite}Refresh all client!!!${color.Reset}`)
			forceRefreshClient();
		});
		/******************************************************************** */

		data.on('addNewGoal', (res) => {
			log(`${color.FgMagenta}${color.Dim}addNewGoal${color.Reset}`)
			if (!Object.hasOwn(db.goals, res.id)){
				db.goals[res.id] = []
			}
			db.goals[res.id][res.index] = {
				value: res.value,
				text: res.text
			}
			console.log(`goals.${res.id}`)
			console.log(Object.hasOwn(db.goals, res.id) ? db.goals[res.id] : {})
			front.emit(`goals.${res.id}`, Object.hasOwn(db.goals, res.id) ? db.goals[res.id] : {})
			fs.writeFile(streamerGoalFile, JSON.stringify(db.goals), (err) => {
				if (err) throw err;
				console.log('');
			  });
		});
		
		data.on('goals', (id) => {
			data.emit(`goals.${id}`, Object.hasOwn(db.goals, id) ? db.goals[id] : {})
		});
	})
}

/**
 * /!\ Will force refresh of all client /!\
 */
export function forceRefreshClient() {
	front.emit('forceRefresh', null);
}