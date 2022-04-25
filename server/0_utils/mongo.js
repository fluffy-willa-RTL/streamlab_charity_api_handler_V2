import { MongoClient }	from "mongodb";
import dotenv 			from "dotenv";

// import { alertHook }	from './alertHook.js';

/**
 * Init .env file 
 */
dotenv.config();

const mongoDbUrl = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWD}@${process.env.MONGODB_ADDRESS}?${process.env.MONGODB_PARAMS}`
const mongoClient = new MongoClient(mongoDbUrl)

try {
	await mongoClient.connect()
	
} catch (e) {
	console.log("[ERROR]!! MONGODB connection failure!");
}
const don		= mongoClient.db("rtl").collection("donations");
const streamer	= mongoClient.db("rtl").collection("streamer");

export default { don, streamer }