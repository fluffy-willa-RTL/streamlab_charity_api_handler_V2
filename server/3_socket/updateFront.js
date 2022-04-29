import db				from '../2_dbManagement/database.js'
import { front }		from './socketServer.js';
import { sleep }		from '../0_utils/sleep.js'

let nbLastDonation = 10
let nbBiggestDonation = 10

export function updateFrontHeavy(){
	// console.log('heavy')
	let res = {
		donation_biggest: {},
	}
	
	//update dif
	for (const [id, don] of Object.entries(db.don)) {
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
					&& (don.amount >= (res.donation_biggest[don.streamer_id]?.[i]?.amount ?? -Infinity))){
					res.donation_biggest[don.streamer_id].splice(i, 0, don);
					res.donation_biggest[don.streamer_id][i]._id = id 
					break
				}
			}
			res.donation_biggest[don.streamer_id].splice(nbBiggestDonation)
		}
		
	}

	//check dif

	//check biggest donation for single streamer
	for (let id in res.donation_biggest){
		for (let i in res.donation_biggest[id]){
			if (res.donation_biggest[id].at(-i)._id !== db.front.donation_biggest?.[id]?.at(-i)?._id ?? null){
				front.emit(`donation_biggest.${id}`, res.donation_biggest[id])
				// console.log(`donation_biggest.${id}`)
				break
			}
		}
	}

	db.front.donation_biggest = res.donation_biggest
}

export function updateFrontLight(don){
	// console.log('light')
	let res = {
		total: 0,
		total_streamer: {},
		donation_last: {},
	}
	
	//update dif
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
		res.donation_last[don.streamer_id].at(-1)._id = id 
		if (res.donation_last[don.streamer_id].length > nbLastDonation){
			res.donation_last[don.streamer_id].shift()
		}
	}

	//check dif

	//check Total
	if (res.total !== db.front.total){
		front.emit(`total`, res.total)
		// console.log(`total`)
		db.front.total = res.total
	}

	//check Total for single streamer
	for (let id in res.total_streamer){
		if (res.total_streamer[id] != (db.front.total_streamer?.[id] ?? null)){
			front.emit(`total.${id}`, res.total_streamer[id])
			// console.log(`total.${id}`)
		}
		// console.log(id, res.donation_last[id])
		if (res.donation_last[id].at(-1)._id != (db.front.donation_last?.[id]?.at(-1)?._id ?? null)){
			front.emit(`donation_last.${id}`, res.donation_last[id])
			// console.log(`donation_last.${id}`)
		}
	}

	// front.emit('donation_last', don)

	db.front.total_streamer = res.total_streamer
	db.front.donation_last = res.donation_last
}

function getFront(socket){
	socket.emit(`total`, db.front.total)
	// console.log(`total`)

	for (let id in db.front.total_streamer){
		socket.emit(`total.${id}`,  db.front.total_streamer[id])
		// console.log(`total.${id}`)

		socket.emit(`donation_last.${id}`,  db.front.donation_last[id])
		// console.log(`donation_last.${id}`)

		socket.emit(`donation_biggest.${id}`,  db.front.donation_biggest[id])
		// console.log(`donation_biggest.${id}`)

	}
}

async function updateFrontHeavyLoop () {
	while (true){
		updateFrontHeavy()
		await sleep(5000)
	}
}

export default {
	getFront,
	updateFrontLight,
	updateFrontHeavy,
	updateFrontHeavyLoop,
}