import io 				from 'socket.io-client'
import { Server } 		from 'socket.io'

import dotenv			from 'dotenv'
dotenv.config()

import db				from '../0_utils/database.js'
import { updateFront }	from './updateFront.js'

let streamlabs
let front

/**
 * Start the socket for both streamlab and front-end connection
 */
function startSocket(server){
	const streamlabUrl = 'https://sockets.streamlabs.com?token=' + process.env.SOCKET_DEV
	// WS client /!\ streamlab use V2 server /!\
	streamlabs = io(streamlabUrl, {transports: ['websocket']})

	// WS server
	front = new Server(server, {cors: { origin: "*"}})

	// Check te connection with the streamlab WS
	streamlabs.on('connect', 		() 		=> {console.log('WS.client.[connect]')})
	streamlabs.on('connect_error', 	(err) 	=> {console.log('WS.client.[connect_error]:', err)})
	streamlabs.on('disconnect', 	() 		=> {console.log('WS.client.[disconnect]')})

	// Listen all 'event' from streamlab WS
	streamlabs.on('event', 	 (data) => {
		if (data.type === 'streamlabscharitydonation'){
			let _id	= data?.message?.[0]?.charityDonationId								?? parseInt(Math.random() * (10 ** 16)) //TODO REMOVE TESTING
			let res = {
				name		: data?.message?.[0]?.from									?? null,
				message		: data?.message?.[0]?.message								?? null,
				amount		: parseInt(parseFloat(data?.message?.[0]?.amount) * 100)	?? 0,
				date		: Date.parse(data?.message?.[0]?.createdAt)	/ 1000			?? 0,
				streamer_id	: data?.message?.[0]?.memberId								?? 72567 //parseInt(Math.random() * (10 ** 16)), //TODO REMOVE TESTING
			}

			// Check if the id exist in the db
			if (db.don[_id] === undefined){
				db.don[_id] = res
			}
			//TODO why ? @willa
			updateFront(streamlabs)
		}
	})
	
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
		//TODO @willa why ?
		data.on('refresh-streamer',(res) => {
			db.getAllStreamer()
		})
	})
}

/**
 * /!\ Will force refresh of all client /!\
 */
	function forceRefreshClient() {
	front.emit('forceRefresh', null);
}


export default {
	startSocket, forceRefreshClient
}
