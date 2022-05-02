let socket = null;

async function start () {
	socket = await connect();
}

function socketEmit(event) {
	if (socket === null)
		return ;
	socket.emit(event);
}
start();