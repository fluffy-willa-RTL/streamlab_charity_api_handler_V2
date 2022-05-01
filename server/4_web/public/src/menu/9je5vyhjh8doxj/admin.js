function socketEmit(event) {
	socket.emit(event);
}

async function start () {

	const socket = await connect();
}

start();