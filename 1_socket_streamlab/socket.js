
import io 			from 'socket.io-client'
import { Server } 	from 'socket.io'

import dotenv from 'dotenv'
dotenv.config()

let streamlabs
let front


/**
 * Start the socket for both streamlab and front-end connection
 */
function startSocket(server){
	const url = process.env.STREAMLAB_SOCKET_URL + process.env.STREAMLAB_SOCKET

	streamlabs = io(url, {transports: ['websocket']})
	front = new Server(server, {cors: { origin: "*"}})


	streamlabs.on('connect', 	() => {console.log('connection to streamlabs successful')})
	streamlabs.on('disconnect', () => {console.log('goodbye')})

	front.on('connect', 	() => {console.log('connection to the front successful')})
	front.on('disconnect',	() => {console.log('goodbye')})

	streamlabs.on('event', (data) => {
		if (data.type === 'streamlabscharitydonation'){
			console.log(data)
			// console.log(data.message[0])
		}
	})
}


export default {
	startSocket,
}
