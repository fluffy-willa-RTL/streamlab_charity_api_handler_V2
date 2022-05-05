async function connect() {
	// Try to connect to the backen socket
	const socket = await io.connect(`${window.location.protocol}//${window.location.hostname}`, {
		reconnectionDelayMax: 5000,
		secure: true, // Enable ssl
	});
	
	// Listen if a connection error occur
	socket.on('connect_error', (err) => {console.error(`err`, err);})
	
	// Listen if we lost connection
	socket.on('disconnect', () => {
		// console.warn('WS disconnect')
	});
	
	// Listen if a connection have made with the backend
	socket.on('connect', () => {
		// console.log(`Connected!`)
		// send to server a request for information
		socket.emit('init');
	});
	
	// Forece refresh the tab
	socket.on('forceRefresh', () => {
		document.location.reload(true)
	});
	return socket;
}