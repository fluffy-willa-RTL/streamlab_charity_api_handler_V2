import * as connect		from './0_utils/connect.js';
import cors from 'cors';
import express from "express";
import axios from 'axios'

import socket 		from './1_socket_streamlab/socket.js'
import db			from './0_utils/database.js'


import dotenv from 'dotenv'
// Init .env
dotenv.config()

// Set the __diname 
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
// dir path constructor
function publicPathFile(path, file) {
	return join(__dirname, 'www', 'public', path, file);
}

// Fetch all streamer in the team
/// NOTE: `await` to avoid that a clien ask `whoami` when the user db is not set
await db.getAllStreamer()

export const app = express()

// Allow CORS
app.use(cors())

// Set the public folder
app.use(express.static('./server/www/public'));

/**
 * FRONT END
 */
// app.get('/', (req, res) => {
// 	res.send("~UwU~");
// })

app.get('/u/', (req, res) => {
	res.sendFile(publicPathFile('html', 'linkAccount.html'))
})

// Dashboard for user
app.get('/u/:slug', (req, res) => {//TODO chage to slug
	res.sendFile(publicPathFile('html', 'u.html'))
})

// Donation goal for user
app.get('/a/streamergoal/:slug', (req, res) => {//TODO chage to slug
	res.sendFile(publicPathFile('html', 'aStreamerGoal.html'))
})

// Redirect to auth link streamlab
app.get('/', (req, res) => {
	res.redirect(connect.get_auth_url());
})

// Get the `code` query to acces the user info and generate they link for `/u/:slug`
app.get('/redirect', async (req, res) => {//TODO TODO TODO TODO 							TODO slug the username 
	let data;
	if ('code' in req.query){
		data = await connect.getUserData(req.query.code);
	}
	data ? res.redirect('/u/'+ data.slug) : res.send("Error!")
})

/**
 * DEV ENDPOINT
 */
app.get('/forceRefresh', (req, res) => {
	socket.forceRefreshClient();
	res.send("Send forceRefresh all client")
})

/**
 * BACK END
 */

const server = app.listen(process.env.PORT, () => {
	console.log(`[*.*]:${process.env.PORT}`);
})


socket.startSocket(server)