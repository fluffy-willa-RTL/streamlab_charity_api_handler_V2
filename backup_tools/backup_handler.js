import axios from 'axios';
import expressStatusMonitor from 'express-status-monitor';
import express from 'express';
import db from './mongo.js'
import dotenv from 'dotenv'

import { alertHook } from './alertHook.js'

// Init .env
dotenv.config()

import { Console } from 'console';

import fs from 'fs'

const app = express()
app.use(expressStatusMonitor())

app.listen(process.env.BACKUP_PORT, () => {
	console.log(`[*.*]:${process.env.BACKUP_PORT}`);
})


export async function sleep (miliseconds) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, miliseconds);
	});
}

const myLogger = new Console({
	stdout: fs.createWriteStream("db_backup.json"),
	stderr: fs.createWriteStream("db_backup.err"),
});

export async function addDonationtoDB(donation)
{
	db.don.insertOne(donation, (err) => {
		if (err && err.code !== 11000) {
			alertHook("Fatal error mongodb.insertOne", err)
		}
	})
}

export async function addMultipleDonationtoDB(donationArray){
	const option = {ordered: false}
	db.don.insertMany(donationArray, option, (err) => {
		if (err && err.code !== 11000) {
			alertHook("Fatal error mongodb.insertOne", err)
		}
	})
}




function donationArrayConstructor(array) {
	let res = []
	for (let i in array)
	{
		// console.log(array[i]);
		res.push({
			_id			: array[i]?.donation?.id									?? 0,
			name		: array[i]?.donation?.display_name							?? null,
			message		: array[i]?.donation?.comment?.text							?? null,
			amount		: array[i]?.donation?.converted_amount						?? 0,
			date		: Date.parse(array[i]?.donation?.created_at) / 1000			?? 0,
			streamer_id	: array[i]?.member?.id										?? 72567 //parseInt(Math.random() * (10 ** 16)), //TODO REMOVE TESTING
		})
	}
	myLogger.table(res);
	return res
}

export async function get3000Donations(donationId = null){
	let url = `https://streamlabscharity.com/api/v1/teams/${process.env.STREAMLAB_CHARITY_TEAM}/donations`
	if (donationId)
	url += `?id=${donationId}`
	
	let data = await axios.get(url)
	.then((res) => {return res.data;})
	.catch((err)=> {alertHook(`Error axios get ${url}`, err)})
	if (data === null)
	{
		console.log("Axios null res");
		await sleep(5000);
		return (await get3000Donations(donationId))
	}
	console.log(url)
	let array = donationArrayConstructor(data)
	if (array.length > 0){
		addMultipleDonationtoDB(array)
		return ((array[array.length - 1])?._id ?? null)
	}
	return null
}

export async function getAllDonations(id){
	if (id === undefined){
		id = await get3000Donations()
	}
	while (id) {
		await sleep(2000);
		id = await get3000Donations(id)
	}
	console.log('ended')
}
console.log("start", Date.now())


let db_buff = [];

db_buff = await db.don.find({})
.toArray()
.then((res) => 
{
	console.log('Backup fetch from mongoDB');
	return res;
});

// WARN /!\ JSON.stringify will copy all array to the heap,
//          so if the db_buff is 80M, the heap will go to 180M the time of the stringify !!
myLogger.log(JSON.stringify(db_buff));
console.log("db_backup.json writed");

// console.log(db_buff?.at(-1)?._id ?? 0)
// getAllDonations(db_buff?.at(-1)?._id ?? undefined)
//TODO Continue to populate the db from the last id
//TODO TODO Find a way to get the last id with mongodb
// getAllDonations()