async function start() {
	const	id = await window.location.pathname.substring('/a/streamergoal/'.length)
	// window.location = 'https://google.com'
	if (id) {
		document.getElementById('streamerId').textContent = id;
		// Try to connect to the backen socket
		const socket = await io('ws://dev.willa.dreemcloud.net', {
			reconnectionDelayMax: 5000,
		});
		
		// Listen if a connection error occur
		socket.on('connect_error', (err) => {console.log(`err`, err);})

		// Listen if we lost connection
		socket.on('disconnect', () => {
			console.log('WS disconnect')
		})

		// Listen if a connection have made with the backend
		socket.on('connect', () => {
			console.log(`Connected! Listening for (total.${id})`)
		})

		// socket.on('total.72567', (res) => {
		socket.on(`total.${id}`, (res) => {
				console.log('res socket', res);
		});

		socket.on('debug', () => console.log('update dom'));//TODO DEBUG
		
		// Forece refresh the tab
		socket.on('forceRefresh', () => {
			document.location.reload(true)
		})
	}
}

function updateDOM() {
	if (nextVal == centAmount) {
	return;
}
interval = window.setInterval(function() {
	if (centAmount != nextVal) {
		var change = (nextVal - centAmount) / 10;
		change = change >= -1 ? Math.ceil(change) : Math.floor(change);
		// Increment cent amount
		centAmount = centAmount + change;
		// Conv to euro
		euroAmount = centAmount / 100;
		document.getElementById('animateCount').textContent = euroAmount.toLocaleString("fr-FR", {
			style: "currency",
			currency: "EUR"
		})
		console.log("updated");
	}
}.bind(this), 20);
}
start();