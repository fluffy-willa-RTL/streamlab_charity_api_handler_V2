if (id) {
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


	// Forece refresh the tab
	socket.on('forceRefresh', () => {
		document.location.reload(true)
	})
}