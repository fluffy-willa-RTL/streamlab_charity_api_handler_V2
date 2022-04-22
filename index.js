import cors from 'cors';
import express from "express";

import socket 		from './1_socket_streamlab/socket.js'
import db			from './0_utils/database.js'


import dotenv from 'dotenv'
// Init .env
dotenv.config()

db.getAllStreamerV2()

export const app = express()

// Allow CORS
app.use(cors())

/**
 * FRONT END
 */
app.get('/', (req, res) => {
	console.log('UwU');
	res.send("~UwU~");
})

//WIP fluffy
app.get('/u/:slug', (req, res) => {

})

/**
 * BACK END
 */

const server = app.listen(process.env.PORT, () => {
	console.log(`[*.*]:${process.env.PORT}`);
})

socket.startSocket(server)