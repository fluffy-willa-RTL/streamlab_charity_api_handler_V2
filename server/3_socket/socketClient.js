import io 				from 'socket.io-client';

import dotenv			from 'dotenv';
dotenv.config();

import db				from '../2_dbManagement/database.js';
import { updateFront }	from './updateFront.js';

let streamlabs;
let is_first = true;
export let first_id = null;
export let socketClientIsConnected = null;

/**
 * Start the socket for both streamlab and front-end connection
 */
export function startSocketClient(){
	console.log('Try to connect WS streamlabs');
	const streamlabUrl = 'https://sockets.streamlabs.com?token=' + process.env.SOCKET_WILLA;
	// WS client /!\ streamlab use V2 server /!\
	streamlabs = io(streamlabUrl, {transports: ['websocket']});

	// Check te connection with the streamlab WS
	streamlabs.on('connect', 		() 		=> {
		socketClientIsConnected = true;
		console.log('WS.client.[connect]')
	});
	streamlabs.on('connect_error', 	(err) 	=> {console.log('WS.client.[connect_error]:', err)});
	streamlabs.on('disconnect', 	() 		=> {console.log('WS.client.[disconnect]')});

	// Listen all 'event' from streamlab WS
	streamlabs.on('event', 	 (data) => {
		// Write donation in `db.don`
		if (data.type === 'streamlabscharitydonation'){
			let _id	= data?.message?.[0]?.charityDonationId									?? parseInt(Math.random() * (10 ** 16)) //TODO REMOVE TESTING

			if (is_first){
				first_id = _id
				is_first = false;
			}

			// Check if the id exist in the db
			if (db.don[_id] === undefined){
				db.don[_id] = {
					name		: data?.message?.[0]?.from									?? null,
					message		: data?.message?.[0]?.message								?? null,
					amount		: parseInt(parseFloat(data?.message?.[0]?.amount) * 100)	?? 0,
					date		: Date.parse(data?.message?.[0]?.createdAt)	/ 1000			?? 0,
					streamer_id	: data?.message?.[0]?.memberId								?? 72567 //parseInt(Math.random() * (10 ** 16)), //TODO REMOVE TESTING
				}
			}
			//TODO why ? @willa
			// updateFront(streamlabs)
		}
	})
}