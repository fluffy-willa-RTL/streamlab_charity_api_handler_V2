import io 				from 'socket.io-client';

import dotenv			from 'dotenv';
dotenv.config();

import { recoveryMode } from '../index.js';
import color			from '../0_utils/color.js';
import db				from '../2_dbManagement/database.js';
import update			from './updateFront.js';
import { log, logErr, logSocket }			from '../0_utils/log.js'

let is_first = true;
export let first_id = null;
export let socketClientIsConnected = null;

export let streamlabs;


const match = 		{
	"407185386314534912" : "391569706399698944",
	"408998456787603456" : "408998415784087552" ,
	"409009074945003520" : "358629692280016896",
	"409014219317579776" : "348104756033622016",
	"409014757606166528" : "409014738152984576",
	"409019542984069120" : "409019459894906880",
	"409048029413380096" : "331529988769714176",
	"409053099299311616" : "283862512225619968",
	"409297609132478464" : "393871068827357184",
	"409376340609994752" : "409376160510775296",
	"409397246845652992" : "397344152083369984",
	"409724439501082624" : "409724424426754048",
	"410104068950855680" : "409085469473771520",
	"410350582008778752" : "410350564631777280",
	"410432311956475904" : "410432262694375424",
}


/**
 * Start the socket for both streamlab and front-end connection
 */
export function startSocketClient(){
	log(`${color.FgCyan}Try to connect WS streamlabs${color.Reset}`);
	const streamlabUrl = 'https://sockets.streamlabs.com?token=' + process.env.SOCKET_DEV;
	// WS client /!\ streamlab use V2 server /!\
	streamlabs = io(streamlabUrl, {transports: ['websocket']});

	// Check te connection with the streamlab WS
	streamlabs.on('connect', 		() 		=> {
		socketClientIsConnected = true;
		logSocket(`${color.FgCyan}WS.client.[connect]${color.Reset}`)
	});
	streamlabs.on('connect_error', 	(err) 	=> {logErr(`${color.FgRed}${color.BgWhite}WS.client.[connect_error]${color.Reset}`)});
	streamlabs.on('disconnect', 	() 		=> {logErr(`${color.FgRed}${color.BgWhite}WS.client.[disconnect]${color.Reset}`)});

	// Listen all 'event' from streamlab WS
	streamlabs.on('event', 	 (data) => {
		// Write donation in `db.don`
		if (data.type === 'streamlabscharitydonation'){
			let _id;
			if (is_first){
				first_id = data?.message?.[0]?.charityDonationId
				is_first = false;
			}
			else {
				_id	= data?.message?.[0]?.charityDonationId				?? parseInt(Math.random() * (10 ** 16)) //TODO REMOVE TESTING
			};

			// Check if the id exist in the db
			if (db.don[_id] === undefined){
				db.don[_id] = {
					name		: data?.message?.[0]?.from									?? null,
					message		: data?.message?.[0]?.message								?? null,
					amount		: parseInt(parseFloat(data?.message?.[0]?.amount) * 100)	?? 0,
					date		: Date.parse(data?.message?.[0]?.createdAt)	/ 1000			?? 0,	
					streamer_id	: match[data?.message?.[0]?.memberId]						?? ( data?.message?.[0]?.message	?? null)
				};
				log(`${color.FgCyan}New donation from ${db.don[_id].name} of ${db.don[_id].amount} to ${db.don[_id].streamer_id} ${color.Reset}`);
			};

			if (!recoveryMode){
				update.updateFrontLight()

			};
		}
	})
}