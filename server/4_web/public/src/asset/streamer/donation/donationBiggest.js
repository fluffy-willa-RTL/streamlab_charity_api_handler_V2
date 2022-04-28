const totalStreamer = {
	amount: 0,
	display: 0
}

async function start() {
	const	id = window.location.pathname.split('/')[2]

	if (id)
	{
		document.getElementById('streamerId').textContent = id;
		
		const socket = await connect();
		// Listen update for the total amount
		socket.emit('init');

		socket.on(`donation_biggest.${id}`, (res) => {
			console.log(res)
			// totalStreamer.amount = res;
			// animateMoney(totalStreamer, 'totalStreamer');
		});

	} else {
		document.location = '/u/'
	}
}

start();