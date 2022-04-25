import db		from '../2_dbManagement/database.js'
import mongo	from '../0_utils/mongo.js'
import { first_id, socketClientIsConnected } from '../3_socket/socketClient.js';
import { sleep } from '../0_utils/sleep.js';

export async function startRecovery () {
	// Wait the clien connection to streamlab
	console.log('============== RECOVERY MODE START ==============');
	console.log('Wait the WS client to connect');
	while (!socketClientIsConnected) {
		await sleep(50);
	}
	let last_id;

	console.log('Fetch all donation from backup db');

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
	console.log('All backup data processed');

	console.log('Waiting for WS donation');

	// Wait for the first WS donation.
	while (!first_id)
		await sleep(50);

		while (/*apiCheck*/)
		//TODO loop with the api
	console.log('First WS id: ', first_id);
	console.log('============== RECOVERY MODE END ==============');
}