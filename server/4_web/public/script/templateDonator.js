let donatorName;

// const socketListeningEvent = `donation_last`
// const textId = `lastDon`

async function start() {
	const socket = await connect();
	// Listen update for the total amount

	// Get query
	const params = new Proxy(new URLSearchParams(window.location.search), {get: (searchParams, prop) => searchParams.get(prop),});

	if (params?.color ?? null) {
		document.getElementById(textId).style.color = `#${params.color}`;
	}

	socket.on(socketListeningEvent, (res) => {
		console.log(res);
		if (type === 0)
			donatorName = res?.at(0)?.name ?? 0;
		else if (type === 1)
			donatorName = res?.at(-1)?.name ?? 0;
		else if (type == 2)
			donatorName = res;
			console.log(donatorName);
		document.getElementById(textId).textContent = donatorName;
	});
}

start();