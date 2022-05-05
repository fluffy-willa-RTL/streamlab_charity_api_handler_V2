const totalGlobal = {
	amount: 0,
	display: 0
}

// const socketListeningEvent = `donation_last`
// const textId = `lastDon`

async function start() {
	const socket = await connect();
	// Listen update for the total amount

	// Get query//TODO
	const params = new Proxy(new URLSearchParams(window.location.search), {get: (searchParams, prop) => searchParams.get(prop),});

	if (params?.color ?? null) {
		document.getElementById(textId).style.color = `#${params.color}`;
	}

	socket.on(socketListeningEvent, (res) => {
		if (type === 0)
			totalGlobal.amount = res?.at(0)?.amount ?? 0;
		else if (type === 1)
			totalGlobal.amount = res?.at(-1)?.amount ?? 0;
		else if (type == 2)
			totalGlobal.amount = res
		animateMoney(totalGlobal, textId);
	});
}

start();