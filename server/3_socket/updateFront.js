import db				from '../2_dbManagement/database.js'
import { front }		from './socketServer.js';

export function updateFront(){
	let res = {
		total: 0,
		total_streamer: {},
		donation_last: {},
		donation_biggest: {},
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
					&& (don.amount >= (res.donation_biggest[don.streamer_id]?.[i]?.amount ?? -Infinity))){
					res.donation_biggest[don.streamer_id].splice(i, 0, don);
					res.donation_biggest[don.streamer_id][i]._id = id 
					break
				}
			}
			res.donation_biggest[don.streamer_id].splice(10)
		}
		
	}

	//check dif
	//check Total
	if (res.total !== db.front.total){
		front.emit(`total`, res.total)
		// console.log(`total`)
	}

	//check Total for single streamer
	for (let id in res.total_streamer){
		if (res.total_streamer[id] != db.front.total_streamer[id]){
			front.emit(`total.${id}`, res.total_streamer[id])
			// console.log(`total.${id}`)
		}
	}

	//check last donation for single streamer
	for (let id in res.donation_last){
		if (res.donation_last[id].at(-1)._id != db.front.donation_last?.[id]?.at(-1)?._id ?? null){
			front.emit(`donation_last.${id}`, res.donation_last[id])
			// console.log(`donation_last.${id}`)
		}
	}

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

	db.front = res
}