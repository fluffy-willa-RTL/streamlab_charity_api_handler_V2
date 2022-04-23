import { Server } 		from 'socket.io'

import dotenv			from 'dotenv'
dotenv.config()

import db				from '../1_dbManagement/database.js'

let front

/**
 * Start the socket for both streamlab and front-end connection
 */
export function startSocketServer(server){
	// WS server
	front = new Server(server, {cors: { origin: "*"}})

	// Listen all incoming connection of the 
	front.on('connect', (data) => {
		console.log('WS.server.[connect]', data.id)
		// Client will ask `whoami` to recive all streamer info (slug, name, id, PP)
		data.on('whoami',(res) => {
			if (res['slug'] !== undefined){
				console.log(`WS.server.[whoami] from ${res.slug}`);//DEBUG show when client ask whoami
				// Try to find the streamer in the team
				for (var streamer of Object.values(db.streamer)){
					if (streamer.slug === res.slug){
						data.emit('youare', streamer);
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
}

/**
 * /!\ Will force refresh of all client /!\
 */
export function forceRefreshClient() {
	front.emit('forceRefresh', null);
}