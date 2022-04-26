async function start() {
	const	id =  window.location.pathname.slice('/a/'.length, -('/streamergoal'.length))
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

			// Listen update for the total amount
			socket.on(`total.${id}`, (res) => {
				console.log('res socket', res);
				updateDOM(res)
			});
		})


		// Forece refresh the tab
		socket.on('forceRefresh', () => {
			document.location.reload(true)
		})
	}
}

function updateDOM(nextVal) {//TODO fix self implémentation
	if (nextVal == currentAmount) {
		return;
	}
	interval = window.setInterval(function() {
		if (currentAmount != nextVal) {
			let change = (nextVal - currentAmount) / 10;
			change = change >= -1 ? Math.ceil(change) : Math.floor(change);
			// Increment cent amount
			currentAmount =+ change;
			// Conv to euro
			let euroAmount = currentAmount / 100;
			document.getElementById('animateCount').textContent = euroAmount.toLocaleString("fr-FR", {
				style: "currency",
				currency: "EUR"
			})
			console.log("updated");
		}
	}.bind(this), 20);
}
currentAmount = 0;
updateDOM(0);
start();