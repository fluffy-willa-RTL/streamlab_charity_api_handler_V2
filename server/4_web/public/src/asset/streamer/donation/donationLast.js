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

		socket.on(`donation_last.${id}`, (res) => {
			totalGlobal.amount = res?.at(-1)?.amount ?? 0;
			animateMoney(totalGlobal, 'lastDon');
		});
	} else {
		document.location = '/u/'
	}
}

start();