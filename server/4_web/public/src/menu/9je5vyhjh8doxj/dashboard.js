async function start() {
	const socket = await connect();
	socket.emit('getStreamer');
	socket.on('allStreamer', (data) => {
		console.log(data);
		const list = document.getElementById('list');
		for (const item of Object.values(data)) {
			const div = document.createElement(`div`);
			div.className = `listElement`;
			const link = document.createElement("a");
			link.textContent		= item.display_name;
			link.href				= `/u/${item.slug}`;
			link.target			= '_blank';
			div.appendChild(link);
			list.appendChild(div);
		}
	})
}

start();