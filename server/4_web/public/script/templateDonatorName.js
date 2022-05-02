// const socketListeningEvent = `donation_last`
// const textId = `lastDon`

async function start() {
	const socket = await connect();
	// Listen update for the total amount

	// Get query
	const params = new Proxy(new URLSearchParams(window.location.search), {get: (searchParams, prop) => searchParams.get(prop),});

	if (params.color) {
		document.getElementById(textId).style.color = `#${params.color}`;
	}

	socket.on(socketListeningEvent, (res) => {
		console.log(res);
		document.getElementById(textId).textContent = res?.at(-1)?.name;
	});
}

start();