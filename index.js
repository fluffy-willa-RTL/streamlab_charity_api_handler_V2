import * as connect		from './0_utils/connect.js';
import cors from 'cors';
import express from "express";
import axios from 'axios'

import socket 		from './1_socket_streamlab/socket.js'
import db			from './0_utils/database.js'


import dotenv from 'dotenv'
import { query } from 'express';
// Init .env
dotenv.config()

db.getAllStreamerV2()

export const app = express()

// Allow CORS
app.use(cors())

/**
 * FRONT END
 */
// app.get('/', (req, res) => {
// 	res.send("~UwU~");
// })

app.get('/u', (req, res) => {
	res.send('Error no slug')
})

// Dashboard for user
app.get('/u/:display_name', (req, res) => {//TODO chage to slug
	res.send(req.params.display_name)
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
	data ? res.redirect('/u/'+ data.display_name) : res.send("Error!")
})

/**
 * BACK END
 */

const server = app.listen(process.env.PORT, () => {
	console.log(`[*.*]:${process.env.PORT}`);
})

// socket.startSocket(server)