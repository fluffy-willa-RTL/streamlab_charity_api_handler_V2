async function start() {
	// window.location = 'https://google.com'
	if (slug) {
		// Try to connect to the backen socket
		const socket = await io('ws://dev.willa.dreemcloud.net', {
			reconnectionDelayMax: 5000,
		});
		
		// Listen if a connection error occur
		socket.on('connect_error', () => {console.log('err');})

		// Listen if we lost connection
		socket.on('disconnect', () => {
			console.log('streamlabs disconnect')
			document.getElementById('welcomeMessage').textContent = 'Connexion perdue, reconnexion en cours.\nSi cela prend plus d’une minute, contactez les dev.';
		})

		// Listen if a connection have made with the backend
		socket.on('connect', () => {
			console.log('Connected!')
			
			// Ask the streamer data
			socket.emit('whoami', {"slug":slug})
			// Listen for the streamer data
			socket.on('youare', (res) => {
				// If the slug is in the `res` init data and return the function
				if (res && 'streamer' in res) {
					data = res;
					document.getElementById('welcomeMessage').textContent =  `Salut ${data.streamer.display_name}`;
					console.log(`Salut ${data.streamer.display_name}, tu n'es pas censé être là, ouste !`);
					console.log(data);
					return ;
				}
				
				// If the back dont find the user
				if (res && 'error' in res) {
					document.getElementById('welcomeMessage').textContent = `On ne t'a pas trouvé dans la team, vérifie que tu as bien lié ton compte Streamlabs avec la campagne.\nRends-toi sur http://dev.fluffy.dreemcloud.net/u/ pour plus d'info.`;
				}
				window.location = '/u/';
			})
		})

		socket.on('forceRefresh', () => {
			document.location.reload(true)
		})
	}
}

start();