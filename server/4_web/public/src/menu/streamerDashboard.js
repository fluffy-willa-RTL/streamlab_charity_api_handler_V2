let linkToGenerate = null;
let iframeId = [];
let indexGoal = 0;

async function start () {
	if (!slug) {
		window.location = '/u/';
		return ;
	}
	// Try to connect to the backen socket
	const socketClient = await io(`${window.location.protocol}//${window.location.hostname}`, {
		reconnectionDelayMax: 5000,//TODO check the doc
		secure: true, // Enable ssl
	});

	// Listen if a connection error occur
	socketClient.on('connect_error', (err) => {console.log(`err`, err);})

	// Listen if we lost connection
	socketClient.on('disconnect', () => {
		console.warn('WS disconnect')
	});

	// Forece refresh the tab
	socketClient.on('forceRefresh', () => {
		document.location.reload(true)
	});

	socketClient.on('connect', () => {
		// Ask the streamer data
		socketClient.emit('whoami', {"slug":slug})
		// Listen for the streamer data
		socketClient.on('youare', (res) => {
			// If the slug is in the `res` init data and return the function
			// If the back dont find the user
			if (res && 'error' in res) {
				document.getElementById('welcomeMessage').textContent = `On ne t'a pas trouvé dans la team, vérifie que tu as bien lié ton compte Streamlabs avec la campagne.\nRends-toi sur http://dev.fluffy.dreemcloud.net/u/ pour plus d'info.`;
				window.location = '/u/';
			}
			data = res;
			console.log(res);
			
			console.log(`Salut ${data.streamer.display_name}, tu n'es pas censé être là, ouste !`);
			// Show all component
			if (linkToGenerate !== null) {
				return ;
			}
			document.getElementById('welcomeMessage').textContent =  `Salut ${data.streamer.display_name}`;

			// Generate the streamer donation link
			const warnMessage = document.getElementById("warn");

			const streamerDonationLink = document.createElement("a");
			// TODO TODO find a way to get the base link from the back with dotenv
			const donationLink = `https://streamlabscharity.com/teams/@24h-gaming-televie/24h-gaming?member=${data?.id}`;
			streamerDonationLink.href = donationLink;
			streamerDonationLink.textContent = donationLink;
			streamerDonationLink.target = '_blank';

			warnMessage.appendChild(streamerDonationLink);
			
			const copyButton = document.createElement('button');
			copyButton.textContent	= 'Click to copy';
			copyButton.onclick		= function () {pastbin(donationLink)};
			warnMessage.appendChild(copyButton);
			// Get all previews settings
			linkToGenerate = generateArray(data);
			// Get the parent list
			const list = document.getElementById("myList");
			let id = 0;
			// For each settings generate all component in the parent list
			linkToGenerate.forEach((item) => {
				const div = document.createElement('div');
				div.className	= `listElement`
				div.id			= `listElement_${id}`

				// Pastebin work only on https
				if (window.location.protocol === 'https:') {
					const copyButton = document.createElement('button');
					copyButton.textContent	= 'Click to copy';
					copyButton.onclick		= function () {pastbin(`${window.location.protocol}//${window.location.hostname}${item.src}`)};
					div.appendChild(copyButton);
				} else console.warn("connection is on http:");

				const title = document.createElement("a");
				title.textContent		= item.title;
				title.href				= item.src;
				title.target			= '_blank';
				div.appendChild(title);

				const text = document.createElement("p");
				text.textContent		= `width: ${item.width} px, height: ${item.height} px`;
				div.appendChild(text);

				const frame = document.createElement("iframe");
				frame.src = item.src;
				frame.width = item.width;
				frame.height = item.height;
				div.appendChild(frame);
				list.appendChild(div);
				id++;
			});
			colorInit()

			if (data.goals !== null){
				console.log(data.goals)
				indexGoal = 0
				for (let [id, elem] of Object.entries(data.goals)){
					addGoalDiv(id, elem.value, elem.text, socketClient, data.id)
					indexGoal = parseInt(id) + 1
				}
			}

			document.getElementById("addGoalButton").addEventListener("click", () => {addNewGoal(socketClient, data)});
		})
	})
}

function pastbin (data) {
	try {
		navigator.clipboard.writeText(data);
	}
	catch {
		alert(`Error!`);
	}
}

function generateArray(data){
	return ([
		{
			title:	`Donation goal de ${data.streamer.display_name}`,
			src:	`/a/${data.id}/total/bar`,
			width:	600,
			height:	100,
		},
		{
			title:	`Total récolté par ${data.streamer.display_name}`,
			src:	`/a/${data.id}/total/me`,
			width:	250,
			height:	50,
		},
		{
			title:	`Total récolté par la Team`,
			src:	`/a/total/all`,
			width:	250,
			height:	50,
		},
		{
			title:	`Derniere donation récoltée par ${data.streamer.display_name}`,
			src:	`/a/${data.id}/donation/last`,
			width:	250,
			height:	50,
		},
		{
			title:	`Pseudo du dernier donateur de ${data.streamer.display_name}`,
			src:	`/a/${data.id}/donator/last`,
			width:	400,
			height:	60,
		},
		{
			title:	`Plus grosse donation récoltée par ${data.streamer.display_name}`,
			src:	`/a/${data.id}/donation/big`,
			width:	250,
			height:	50,
		},
		{
			title:	`TODO nom du dernier plus gros donateur`,
			src:	`/a/${data.id}/donation/big`,
			width:	250,
			height:	50,
		},
		{
			title:	`Derniere donation récoltée la team`,
			src:	`/a/donation/last`,
			width:	250,
			height:	50,
		},
		{
			title:	`Plus grosse donation récoltée de la team`,
			src:	`/a/donation/big`,
			width:	250,
			height:	50,
		},
		{
			title:	`Timer de l'évent`,
			src:	`/a/timer/elapsedCount?time=1651856400000`,
			width:	250,
			height:	50,
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
		{
			title:	`10 Plus grosse donation récoltée la team`,
			src:	`/a/donation/big10`,
			width:	500,
			height:	1025,
		},
	]);
};

start();