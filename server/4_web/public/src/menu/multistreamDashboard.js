async function start() {
	const socket = await connect();
	socket.emit('getStreamer');
	socket.on('allStreamer', (data) => {
		const list = document.getElementById("list");
		let id = 0;
		for (const item of Object.values(data)) {
			const newElem = document.getElementById("streamerSelectorTemplate").content.cloneNode(true);
			const divParent = newElem.getElementById("listElement");

			divParent.id = item.twitch_slug;
			divParent.getElementsByClassName("checkbox")[0].id = `checkbox_${id}`;
			divParent.getElementsByClassName("checkboxLabel")[0].setAttribute('for', `checkbox_${id}`);
			divParent.getElementsByClassName("checkboxLabel")[0].textContent = item.display_name;
			divParent.getElementsByClassName("streamerPP")[0].src = item.avatarURL;
			list.appendChild(newElem);
			id++;
		}
	})
}

function redirectLink() {
	// Check if a box have been selected.
	let boxAreSelect = false;

	let urlRedirect = "https://www.multitwitch.tv";
	const el = document.getElementsByClassName("listElement");
	for (const item of el) {
		const box = item.getElementsByClassName("checkbox")[0];
		if (box.checked) {
			urlRedirect += `/${item.id}`;
			boxAreSelect = true;
		}
	}
	if (boxAreSelect) {
		document.location = urlRedirect;
	}
}

start();