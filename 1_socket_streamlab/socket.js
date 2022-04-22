import io 			from 'socket.io-client'
import { Server } 		from 'socket.io'

import dotenv		from 'dotenv'
dotenv.config()

import db			from '../0_utils/database.js'


let streamlabs
let front

/**
 * Start the socket for both streamlab and front-end connection
 */
function startSocket(server){
	const streamlabUrl = 'https://sockets.streamlabs.com?token=' + process.env.SOCKET_DEV

	streamlabs = io(streamlabUrl, {transports: ['websocket']})
	front = new Server(server, {cors: { origin: "*"}})
	
	streamlabs.on('connect', 	() => {console.log('connection to streamlabs successful')})
	streamlabs.on('disconnect', () => {console.log('goodbye')})

	front.on('connect', 	() => {console.log('connection to the front successful')})
	front.on('disconnect',	() => {console.log('goodbye')})

	streamlabs.on('event', (data) => {
		console.log(data)
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
			updateFront(_id, res)
		}
	})

	console.table(db.streamer)

	console.log(db.streamer)
	// front.on('whoami', (data) => {
		
	// })
}

function updateFront(id, donation){
	//add total global
	db.front.total += donation.amount

	//add total for streamer
	if (!db.front.total_streamer[donation.streamer_id])
		db.front.total_streamer[donation.streamer_id] = 0
	db.front.total_streamer[donation.streamer_id] += donation.amount

	// //add donation_special slot if doesn't exist
	// if (!db.front.donation_special[donation.streamer_id])
	// 	db.front.donation_special[donation.streamer_id] = {}
	// //add donation_special slot if doesn't exist
	// if (!db.front.donation_special[donation.streamer_id][id])
	// 	db.front.donation_special[donation.streamer_id][id] = donation
	
	// db.front.donation_special[donation.streamer_id]

	console.log(db.front)
}



export default {
	startSocket,
}
