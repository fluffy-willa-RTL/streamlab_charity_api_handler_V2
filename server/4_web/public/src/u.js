let linkToGenerate = null;

async function start () {
	if (slug) {
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

		// Forece refresh the tab
		socket.on('forceRefresh', () => {
			document.location.reload(true)
		});

		socket.on('connect', () => {
			// Ask the streamer data
			socket.emit('whoami', {"slug":slug})
			// Listen for the streamer data
			socket.on('youare', (res) => {
				// If the slug is in the `res` init data and return the function
				// If the back dont find the user
				if (res && 'error' in res) {
					document.getElementById('welcomeMessage').textContent = `On ne t'a pas trouvé dans la team, vérifie que tu as bien lié ton compte Streamlabs avec la campagne.\nRends-toi sur http://dev.fluffy.dreemcloud.net/u/ pour plus d'info.`;
					window.location = '/u/';
				}
				if (res && 'streamer' in res) {
					data = res;
					document.getElementById('welcomeMessage').textContent =  `Salut ${data.streamer.display_name}`;
					console.log(`Salut ${data.streamer.display_name}, tu n'es pas censé être là, ouste !`);
					console.log(data);
					// Show all component
					if (linkToGenerate === null) {
						linkToGenerate = [
							{
								title: `Total récolté par ${data.streamer.display_name}`,
								src: `/a/${data.id}/total/me`,
							},
							{
								title: `Total récolté par la Team`,
								src: `/a/${data.id}/total/all`,
							},
							{
								title: `Total récolté par ${data.streamer.display_name} et la Team`,
								src: `/a/${data.id}/total/me-all`,
							},
						];
						const list = document.getElementById("myList");
						linkToGenerate.forEach((item) => {
							const div = document.createElement('div');
							div.style = '  margin: auto;   width: 50%;   border: 3px solid green;   padding: 10px;'
							const title = document.createElement("a");
							title.textContent = item.title;
							title.href = item.src;
							div.appendChild(title);
							const frame = document.createElement("iframe");
							frame.src = item.src;
							frame.width = 200;
							frame.height = 250;
							div.appendChild(frame);
							list.appendChild(div);
						});
					}
				}
			})
		})
		return ;
	}
	window.location = '/u/';
}

start();
