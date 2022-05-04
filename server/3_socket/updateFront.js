import db				from '../2_dbManagement/database.js'
import { front }		from './socketServer.js';
import { sleep }		from '../0_utils/sleep.js'

let nbLastDonation = 10
let nbBiggestDonation = 10

export function updateFrontHeavy(){
	let res = {
		don_big: [],
		don_streamer_big: {},
	}
	
	//update dif
	for (const [id, don] of Object.entries(db.don)) {
		//add biggest donations	
		if (!res.don_streamer_big[don.streamer_id])
			res.don_streamer_big[don.streamer_id] = [];
		
		addOnlyBiggestInArray(res.don_big, don, id);
		addOnlyBiggestInArray(res.don_streamer_big[don.streamer_id], don, id);
	}
	
	//check dif
	
	//check biggest donation for single streamer
	for (let id in res.don_streamer_big){
		for (let i in res.don_streamer_big[id]){
			if (res.don_streamer_big[id].at(-i)._id !== db.front.don_streamer_big?.[id]?.at(-i)?._id ?? null){
				front.emit(`donation_biggest.${id}`, res.don_streamer_big[id]);
				break;
			}
		}
	}

	// Global donatoin biggest
	for (let i in res.don_big){
		if (res.don_big.at(-i)._id !== db.front.don_big?.at(-i)?._id ?? null){
			front.emit(`donation_biggest`, res.don_big);
			break;
		}
	}
	
	db.front.don_big = res.don_big;
	db.front.don_streamer_big = res.don_streamer_big;
}

export function updateFrontLight(){
	let res = {
		total: 0,
		total_streamer: {},
		don_last: [],
		don_streamer_last: {},
	}
	
	//update dif
	for (const [id, don] of Object.entries(db.don)) {
		//add total amount
		res.total += don.amount;
		
		//add total for single streamer
		if (!res.total_streamer[don.streamer_id])
			res.total_streamer[don.streamer_id] = 0;
		res.total_streamer[don.streamer_id] += don.amount;
			
		//add last donations
		if (!res.don_streamer_last[don.streamer_id])
			res.don_streamer_last[don.streamer_id] = [];
		res.don_streamer_last[don.streamer_id].push(don)
		res.don_streamer_last[don.streamer_id].at(-1)._id = id 
		if (res.don_streamer_last[don.streamer_id].length > nbLastDonation)
			res.don_streamer_last[don.streamer_id].shift();

		//add global last donation
		res.don_last.push(don)
		res.don_last.at(-1)._id = id 
		if (res.don_last.length > nbLastDonation)
			res.don_last.shift();
	}

	//check dif
	
	//check Total
	if (res.total !== db.front.total){
		front.emit(`total`, res.total)
		db.front.total = res.total
	}
	
	if (res.don_last?.at(-1)?._id ?? null != (db.front.don_last?.at(-1)?._id ?? null))
		front.emit(`donation_last`, res.don_last)

	//check Total for single streamer
	for (let id in res.total_streamer){
		if (res.total_streamer[id] != (db.front.total_streamer?.[id] ?? null)){
			front.emit(`total.${id}`, res.total_streamer[id])
		}
		if (res.don_streamer_last[id].at(-1)._id != (db.front.don_streamer_last?.[id]?.at(-1)?._id ?? null))
			front.emit(`donation_last.${id}`, res.don_streamer_last[id])
	}
	
	db.front.total_streamer		= res.total_streamer
	db.front.don_last			= res.don_last
	db.front.don_streamer_last	= res.don_streamer_last
}

function getFront(socket){
	socket.emit(`total`, db.front.total)
	socket.emit(`donation_last`,				db.front.don_last)
	socket.emit(`donation_biggest`,				db.front.don_big)
	for (let id of Object.keys(db.front.total_streamer)){
		socket.emit(`total.${id}`,				db.front.total_streamer[id])
		socket.emit(`donation_last.${id}`,		db.front.don_streamer_last[id])
		socket.emit(`donation_biggest.${id}`,	db.front.don_streamer_big[id])
	}
}

async function updateFrontHeavyLoop () {
	while (true){
		updateFrontHeavy()
		await sleep(5000)
	}
}

function addOnlyBiggestInArray(array, don, id){
	if (array.length === 0)
			array.push(don)
	else {
		for (let i in array + 1){
			if ((array?.[i-1]?.amount ?? Infinity) >= don.amount
				&& (don.amount >= (array?.[i]?.amount ?? -Infinity))){
				array.splice(i, 0, don);
				array[i]._id = id 
				break
			}
		}
		array.splice(nbBiggestDonation)
	}
	return array
}

export default {
	getFront,
	updateFrontLight,
	updateFrontHeavy,
	updateFrontHeavyLoop,
}
	