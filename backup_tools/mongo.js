import dotenv from "dotenv";
import { LoggerLevel, MongoClient } from "mongodb"
import { alertHook } from './alertHook.js'


/**
 * Init .env file 
 */
dotenv.config();

const mongoDbUrl = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWD}@${process.env.MONGODB_ADDRESS}?${process.env.MONGODB_PARAMS}`
const mongoClient = new MongoClient(mongoDbUrl)

await mongoClient.connect()
	
const don		= mongoClient.db("rtl").collection("donations");
const streamer	= mongoClient.db("rtl").collection("streamer");

export default { don, streamer }