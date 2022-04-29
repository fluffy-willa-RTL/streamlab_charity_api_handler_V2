const totalGlobal = {
	amount: 0,
	display: 0
}

const totalStreamer = {
	amount: 0,
	display: 0
}

async function start() {
	const	id = window.location.pathname.split('/')[2]
	if (id)
	{
		const socket = await connect();
		// Listen update for the total amount

		socket.on(`donation_biggest.${id}`, (res) => {
			totalStreamer.amount = res?.[0].amount ?? 0;
			animateMoney(totalStreamer, 'biggestDon');
		});
	} else {
		document.location = '/u/'
	}
}

start();