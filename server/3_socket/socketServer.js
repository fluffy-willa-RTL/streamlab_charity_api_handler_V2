import { Server } 		from 'socket.io'

import dotenv			from 'dotenv'
dotenv.config()

import { sleep }		from '../0_utils/sleep.js'
import color			from '../0_utils/color.js';
import db				from '../2_dbManagement/database.js'
import update			from './updateFront.js';

export let front = null

/**
 * Start the socket for both streamlab and front-end connection
 */
export async function startSocketServer(server){
	// WS server
	front = new Server(server, {cors: { origin: "*"}})

	// Listen all incoming connection of the 
	front.on('connect', (data) => {
		console.log(color.FgMagenta, '[connect]', data.id, color.Reset)
		// Client will ask `whoami` to recive all streamer info (slug, name, id, PP)
		data.on('whoami',(res) => {
			if (res['slug'] !== undefined){
				console.log(color.FgMagenta, `[whoami] from ${res.slug}`, color.Reset);//DEBUG show when client ask whoami
				// Try to find the streamer in the team
				for (var [id, streamer] of Object.entries(db.streamer)){
					if (streamer.slug === res.slug){
						data.emit('youare', {
							id: id,
							streamer: streamer
						});
						return;
					}
				}
			}
			// If the user is not found return to the front "error" `-404`
			data.emit('youare', {"error": 404});
		})

		//Listen for Page Admin to refresh streamer subscribed in streamlab charity team
		data.on('refresh-streamer',(res) => {
			db.getAllStreamer()
		})
	})

	// while (true){
	// 	update.updateFrontHeavy()
	// 	await sleep(5000)
	// }
}

/**
 * /!\ Will force refresh of all client /!\
 */
export function forceRefreshClient() {
	front.emit('forceRefresh', null);
}