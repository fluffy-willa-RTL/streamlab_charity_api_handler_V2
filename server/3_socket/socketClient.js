import io 				from 'socket.io-client';

import dotenv			from 'dotenv';
dotenv.config();

import { recoveryMode } from '../index.js';
import color			from '../0_utils/color.js';
import db				from '../2_dbManagement/database.js';
import { updateFront }	from './updateFront.js';

let is_first = true;
export let first_id = null;
export let socketClientIsConnected = null;

export let streamlabs;

/**
 * Start the socket for both streamlab and front-end connection
 */
export function startSocketClient(){
	console.log(color.FgCyan, 'Try to connect WS streamlabs', color.Reset);
	const streamlabUrl = 'https://sockets.streamlabs.com?token=' + process.env.SOCKET_WILLA;
	// WS client /!\ streamlab use V2 server /!\
	streamlabs = io(streamlabUrl, {transports: ['websocket']});

	// Check te connection with the streamlab WS
	streamlabs.on('connect', 		() 		=> {
		socketClientIsConnected = true;
		console.log(color.FgCyan, 'WS.client.[connect]', color.Reset)
	});
	streamlabs.on('connect_error', 	(err) 	=> {console.log(color.FgCyan, 'WS.client.[connect_error]:', err)}, color.Reset);
	streamlabs.on('disconnect', 	() 		=> {console.log(color.FgCyan, 'WS.client.[disconnect]')}, color.Reset);

	// Listen all 'event' from streamlab WS
	streamlabs.on('event', 	 (data) => {
		// Write donation in `db.don`
		if (data.type === 'streamlabscharitydonation'){
			let _id;
			if (is_first){
				_id = '341678066055122944'//TODO REMOVE debug
				first_id = _id
				is_first = false;
			}
			else {
				_id	= data?.message?.[0]?.charityDonationId				?? parseInt(Math.random() * (10 ** 16)) //TODO REMOVE TESTING
			}

			console.log(_id)

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

			console.log(_id);
			//TODO why ? @willa
			if (!recoveryMode)
				updateFront()//TODO CHECK
		}
	})
}