async function start() {
	const socket = await connect();
	socket.emit('getStreamer');
	socket.on('allStreamer', (data) => {
		const list = document.getElementById('list');
		for (const item of Object.values(data)) {
			const div = document.createElement(`div`);
			div.className = `listElement`;
			
			const linkImg = document.createElement("a");
			linkImg.href = `/u/${item?.slug}`;
			const img = document.createElement("img");
			img.src = item?.avatarURL;
			img.href = `/u/${item?.slug}`;
			linkImg.appendChild(img);
			div.appendChild(linkImg);
			
						const link = document.createElement("a");
						link.textContent		= item?.display_name;
						link.href				= `/u/${item?.slug}`;
						link.className			= 'nameLink';
						link.target			= '_blank';
						div.appendChild(link);

			list.appendChild(div);
		}
	})
}

start();