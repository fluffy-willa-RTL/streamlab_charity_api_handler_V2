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
	const streamlabUrl = 'https://sockets.streamlabs.com?token=' + process.env.SOCKET_WILLA

	streamlabs = io(streamlabUrl, {transports: ['websocket']})
	front = new Server(server, {cors: { origin: "*"}})
	
	streamlabs.on('connect', 		() 		=> {console.log('connection to streamlabs successful')})
	streamlabs.on('connect_error', 	(err) 	=> {console.log('error:', err)})
	streamlabs.on('disconnect', 	() 		=> {console.log('goodbye')})

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
			if (db.don[_id] === undefined){
				db.don[_id] = res
			}
			
			updateFront(streamlabs)
		}
	})
	
	
	front.on('connect', (data) => {
		console.log('connection to the front successful', data.id)

		data.on('whoami',(res) => {
			if (res['slug'] !== undefined){
				for (var streamer of Object.values(db.streamer)){
					if (streamer.slug === res.slug){
						data.emit('youare', streamer);
						return;
					}
				}
			}
			// If the user is not found return to the front `-404`
			data.emit('youare', {"error": 404});
		})

		data.on('refresh-streamer',(res) => {
			db.getAllStreamer()
		})
	})
}

export default {
	startSocket, forceRefreshClient
}
