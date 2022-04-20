import cors from 'cors';
import express from "express";
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())

app.get('/', (req, res) => {
	console.log('UwU');
	res.send("~UwU~");
})

const server = app.listen(process.env.PORT, () => {
	console.log(`[*.*]:${process.env.PORT}`);
})

/**
 * Init socket.io
 */

// io = new Server(server, {cors: { origin: "*"}})