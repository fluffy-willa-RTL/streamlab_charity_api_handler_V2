let socket = null;

async function start () {
	socket = await connect();
}

function socketEmit(event) {
	if (confirm(`Emit ?`))
	if (socket === null) {
		alert("Emit fail! socket === null")
		return ;
	}
	socket.emit(event);
}
start();