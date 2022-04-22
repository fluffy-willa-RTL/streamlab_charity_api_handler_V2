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
			
			updateFront()
		}
	})
	
	
	front.on('connect', (data) => {
		console.log('connection to the front successful', data.id)

		data.on('whoami',(res) => {
			if (res['slug'] !== undefined){
				for (var streamer of Object.values(db.streamer)){
					console.log(streamer.slug, res.slug)
					if (streamer.slug === res.slug){
						data.emit('youare', streamer);
						return;
					}
				}
			}
			data.emit('youare', null);
		})

		data.on('refresh-streamer',(res) => {
			db.getAllStreamer()
		})
	})
}

function updateFront(){
	let res = {
		total: 0,
		total_streamer: {},
		donation_last: {},
		donation_biggest: {},
	}
	
	for (const [id, don] of Object.entries(db.don)) {
		// console.log(don)
		//add total amount
		res.total += don.amount;

		//add total for single streamer
		if (!res.total_streamer[don.streamer_id]){
			res.total_streamer[don.streamer_id] = 0;
		}
		res.total_streamer[don.streamer_id] += don.amount;

		//add last donations
		if (!res.donation_last[don.streamer_id]){
			res.donation_last[don.streamer_id] = [];
		}
		res.donation_last[don.streamer_id].push(don)
		if (res.donation_last[don.streamer_id].length > 10){
			res.donation_last[don.streamer_id].shift()
		}

		//add biggest donations	
		if (!res.donation_biggest[don.streamer_id]){
			res.donation_biggest[don.streamer_id] = [];
		}

		if (res.donation_biggest[don.streamer_id].length === 0){
			res.donation_biggest[don.streamer_id].push(don)
		}
		else{
			for (let i in res.donation_biggest[don.streamer_id] + 1){
				if ((res.donation_biggest[don.streamer_id]?.[i-1]?.amount ?? Infinity) >= don.amount
					&& (don.amount >= (res.donation_biggest[don.streamer_id]?.[i]?.amount ?? -Infinity))	){
					res.donation_biggest[don.streamer_id].splice(i, 0, don);
					break
				}
			}
			res.donation_biggest[don.streamer_id].splice(10)
		}
		
	}
	console.table(res.donation_biggest[72567])
}

function temp(input, output){
	return (input !== undefined ? input : output)
}

export default {
	startSocket,
}
