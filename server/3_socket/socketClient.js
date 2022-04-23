import io 				from 'socket.io-client'

import dotenv			from 'dotenv'
dotenv.config()

import db				from '../1_dbManagement/database.js'
import { updateFront }	from './updateFront.js'

let streamlabs

/**
 * Start the socket for both streamlab and front-end connection
 */
export function startSocketClient(){
	const streamlabUrl = 'https://sockets.streamlabs.com?token=' + process.env.SOCKET_DEV
	// WS client /!\ streamlab use V2 server /!\
	streamlabs = io(streamlabUrl, {transports: ['websocket']})

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
			// updateFront(streamlabs)
		}
	})
}