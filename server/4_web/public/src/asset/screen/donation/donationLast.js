const totalGlobal = {
	amount: 0,
	display: 0
}

const totalStreamer = {
	amount: 0,
	display: 0
}

async function start() {
	const socket = await connect();
	// Listen update for the total amount

	socket.on(`donation_last`, (res) => {
		console.log(res)
		totalGlobal.amount = res?.at(-1)?.amount ?? 0;
		animateMoney(totalGlobal, 'lastDon');
	});
}

start();