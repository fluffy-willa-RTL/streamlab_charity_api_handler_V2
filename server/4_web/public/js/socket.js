async function connect() {
	// Try to connect to the backen socket
	const socket = await io(`ws://${window.location.hostname}`, {
		reconnectionDelayMax: 5000,//TODO check the doc
	});
	
	// Listen if a connection error occur
	socket.on('connect_error', (err) => {console.log(`err`, err);})
	
	// Listen if we lost connection
	socket.on('disconnect', () => {
		console.log('WS disconnect')
	});
	
	// Listen if a connection have made with the backend
	socket.on('connect', () => {
		console.log(`Connected!`)
	});
	
	// Forece refresh the tab
	socket.on('forceRefresh', () => {
		document.location.reload(true)
	});
	return socket;
}