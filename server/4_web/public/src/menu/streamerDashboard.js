let linkToGenerate = null;
let iframeId = [];

async function start () {
	if (slug) {
		// Try to connect to the backen socket
		const socket = await io(`${window.location.protocol}//${window.location.hostname}`, {
			reconnectionDelayMax: 5000,//TODO check the doc
			secure: true, // Enable ssl
		});

		// Listen if a connection error occur
		socket.on('connect_error', (err) => {console.log(`err`, err);})

		// Listen if we lost connection
		socket.on('disconnect', () => {
			console.warn('WS disconnect')
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
								title:	`Total récolté par ${data.streamer.display_name}`,
								src:	`/a/${data.id}/total/me`,
								width:	500,
								height:	200,
							},
							{
								title:	`Total récolté par la Team`,
								src:	`/a/total/all`,
								width:	500,
								height:	200,
							},
							{
								title:	`Derniere donation récoltée ${data.streamer.display_name}`,
								src:	`/a/${data.id}/donation/last`,
								width:	500,
								height:	200,
							},
							{
								title:	`Plus grosse donation récoltée ${data.streamer.display_name}`,
								src:	`/a/${data.id}/donation/big`,
								width:	500,
								height:	200,
							},
							{
								title:	`Derniere donation récoltée la team`,
								src:	`/a/donation/last`,
								width:	500,
								height:	200,
							},
							{
								title:	`Plus grosse donation récoltée la team`,
								src:	`/a/donation/big`,
								width:	500,
								height:	200,
							},
							{
								title:	`10 Derniere donation récoltée ${data.streamer.display_name}`,
								src:	`/a/${data.id}/donation/last10`,
								width:	500,
								height:	1025,
							},
							{
								title:	`10 Plus grosse donation récoltée ${data.streamer.display_name}`,
								src:	`/a/${data.id}/donation/big10`,
								width:	500,
								height:	1025,
							},
							{
								title:	`10 Derniere donation récoltée la team`,
								src:	`/a/donation/last10`,
								width:	500,
								height:	1025,
							},
							{
								title:	`10 Plus grosse donation récoltée la team`,
								src:	`/a/donation/big10`,
								width:	500,
								height:	1025,
							},
						];
						const list = document.getElementById("myList");
						let id = 0;
						linkToGenerate.forEach((item) => {
							const div = document.createElement('div');
							div.className	= `listElement`
							div.id			= `listElement_${id}`

							// Pastebin work only on https
							if (window.location.protocol === 'https:') {
								const copyButton = document.createElement('button');
								copyButton.textContent = 'Click to copy'
								copyButton.onclick = function () {pastbin(`${window.location.protocol}//${window.location.hostname}${item.src}`)};
								div.appendChild(copyButton);
							} else console.warn("connection is on http:");

							const title = document.createElement("a");
							title.textContent		= item.title;
							title.href				= item.src;
							title.target			= '_blank';
							title.id				= `a_${id}`;
							div.appendChild(title);

							const frame = document.createElement("iframe");
							frame.src = item.src;
							frame.width = item.width;
							frame.height = item.height;
							frame.id = `frame_${id}`
							div.appendChild(frame);
							list.appendChild(div);
							id++;
						});
						colorInit()
					}
				}
			})
		})
		return ;
	}
	window.location = '/u/';
}

function pastbin (data) {
	try {
		navigator.clipboard.writeText(data);
		alert(`Copied the text: ${data}`);
	}
	catch {
		alert(`Error!`);
	}
}

let colorWell
let defaultColor = "#0000ff";
let colorPreview = document.getElementById('colorPreview');
function colorInit() {
	
	window.addEventListener("load", colorInit, false);
	colorlisten();
}

function colorlisten() {
	colorWell = document.querySelector("#colorWell");
	colorWell.value = defaultColor;
	colorWell.addEventListener("input", updateFirstColor, false);
	colorWell.addEventListener("change", updateAllColor, false);
	colorWell.select();
  }

  function updateFirstColor(event) {
	colorPreview.style.color = event.target.value;
  }

  function updateAllColor(event) {
	  const len = document.getElementById('myList').childElementCount;
	for (let i = 0; i < len; i++) {
		const url = `${linkToGenerate[i].src}?color=${event.target.value.substring(1)}`;
		document.getElementById(`frame_${i}`).src = url;
		document.getElementById(`a_${i}`).href = url; 
	}
}
 

start();