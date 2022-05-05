import db										from '../2_dbManagement/database.js'
import mongo									from '../0_utils/mongo.js'
import { first_id, socketClientIsConnected }	from '../3_socket/socketClient.js';
import { sleep }								from '../0_utils/sleep.js';
import { log, logErr, logTable }									from '../0_utils/log.js';
import axios									from 'axios';
import fs										from 'fs';

import dotenv									from 'dotenv';
dotenv.config();

// Debug
import color from '../0_utils/color.js';

// Utils
async function get3000(donationId = null){
	let url = `https://streamlabscharity.com/api/v1/teams/${process.env.STREAMLAB_CHARITY_TEAM}/donations`
	if (donationId)
		url += `?id=${donationId}`

	log(`${color.FgRed}${url}${color.Reset}`)
	let data = await axios.get(url)
					.then((res) => {return res.data;})
					.catch((err)=> {log(`${err}`);})
	
	for (let i in data){
		if (db.don[data[i]?.donation.id] === undefined){
			db.don[data[i]?.donation.id] = {
				amount		: data[i]?.donation?.converted_amount		?? 0,
				message		: data[i]?.donation?.comment?.text			?? null,
				name		: data[i]?.donation?.display_name			?? null,
				streamer_id	: data[i]?.member?.user?.id 				?? 0,
				dateSec		: (Date.parse(data[i]?.donation?.created_at) /100)	?? 0
			}
		}
	}
	return data
}

/**
 * Main function
 */
export async function startRecovery () {
	// Wait the clien connection to streamlab
	log(`${color.FgRed}============== RECOVERY MODE START ==============${color.Reset}`);
	log(`${color.FgRed}Wait the WS client to connect${color.Reset}`);
	while (!socketClientIsConnected) {
		await sleep(50);
	}
	let last_id;

	log(`${color.FgRed}Fetch all donation from backup db${color.Reset}`);

	// Ask all raw donation in the db
	await	mongo.don.find({})
	.toArray()
	// Format donation to the map
	.then((res) => {
		// Get the last ID donnation form de DB
		last_id = res?.at(-1)?._id ?? 0;
		for (let donation of res){
			if (db.don[donation._id] === undefined) {
				db.don[donation._id] = {
					name		: donation.name,
					message		: donation.message,
					amount		: donation.amount,
					date		: donation.date,
					streamer_id	: donation.streamer_id
				}
			}
		}
	})
	log(`${color.FgRed}All backup data processed${color.Reset}`);

	log(`${color.FgCyan}Waiting for WS donation${color.Reset}`);

	// Wait for the first WS donation.
	while (!first_id)
		await sleep(50);

	let data = await get3000(last_id)
	// Last id from the API request
	let tempId = (data?.at(-1)?.donation?.id ?? null);
	while (!check_firstId_in_data(data, first_id)) {
		// Check if there is a last donnation from the API request
		if (data?.at(-1)?.donation?.id ?? null){
			tempId = data.at(-1).donation.id
		}
		await sleep(3500)
		data = await get3000(tempId)
	}

	log(`${color.FgRed}First WS id: ${first_id}${color.Reset}`);
	log(`${color.FgRed}============== RECOVERY MODE END ==============${color.Reset}`);
}

// Check if the first donnation we recieved from WS is in the local.db
function check_firstId_in_data(data, first_id) {
	for (let don of data) {
		if ((don?.donation?.id ?? -1) === first_id){
			log(`${color.FgRed}Found first socket ${first_id}${color.Reset}`);
			return true
		}
	}
	return false
}