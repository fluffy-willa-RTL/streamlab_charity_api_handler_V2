let linkToGenerate = null;
let iframeId = [];
let indexGoal = 0;
let generateAllDivs;

async function start () {
	if (!slug) {
		window.location = '/u/';
		return ;
	}
	// Try to connect to the backen socket
	const socketClient = await io(`${window.location.protocol}//${window.location.hostname}`, {
		reconnectionDelayMax: 5000,
		secure: true, // Enable ssl
	});

	// Increment eatch time a connection attempt.
	let connectionAttempt = 0;
	// Listen if a connection error occur
	socketClient.on('connect_error', (err) => {
		connectionAttempt++;
		document.getElementById('welcomeMessage').textContent =  `La connexion a été perdue tentative de reconnexion en cours #${connectionAttempt}`;
		console.log(`connect_error`, err);
	})

	// Listen if we lost connection
	socketClient.on('disconnect', () => {
		console.warn('WS disconnect')
	});

	// Forece refresh the tab
	socketClient.on('forceRefresh', () => {
		document.location.reload(true)
	});

	socketClient.on('connect', () => {
		// Reset conenction attempt counter
		connectionAttempt = 0;
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
			
			console.log(`Salut ${data.streamer.display_name}, tu n'es pas censé être là, ouste !`);
			document.getElementById('welcomeMessage').textContent =  `Salut ${data.streamer.display_name}`;
			// Dont generate the content if they have been generate befor.
			if (linkToGenerate !== null) {
				return ;
			}

			// Generate the streamer donation link
			// TODO TODO find a way to get the base link from the back with dotenv
			const donationLink = `https://streamlabscharity.com/teams/@24h-gaming-televie/24h-gaming?member=${data?.id}`;

			document.getElementById("warnButton").addEventListener('click', () => {pastbin(donationLink)});
			document.getElementById("warnLink").href 		= donationLink;
			document.getElementById("warnLink").textContent = donationLink;

			
			
			// For each settings generate all component in the parent list
			
			linkToGenerate = generateMap(data)
			generateAllDivs = {
				'https://media.discordapp.net/attachments/968445978157912084/970680995529494549/fond-top_don_par.png': [
					linkToGenerate['id/donation/big'],
					linkToGenerate['id/donator/big'],
					linkToGenerate['total/all'],
					linkToGenerate['id/total/me'],
				],
				'https://media.discordapp.net/attachments/968445978157912084/970676373838503977/habillage-game.png': [
					linkToGenerate['id/donation/big'],
					linkToGenerate['id/donator/big'],
					linkToGenerate['total/all'],
					linkToGenerate['id/total/me'],
				],
				'https://media.discordapp.net/attachments/968445978157912084/971386083042545694/ecran_cagnotte.png': [
					linkToGenerate['total/all'],
				],
				'https://cdn.discordapp.com/attachments/882258638629126166/971493817335300136/unknown.png': [
					linkToGenerate['donation/last10'],
				],
				'https://cdn.discordapp.com/attachments/882258638629126166/971520612369571890/unknown.png': [
					linkToGenerate['id/goal/bar'],
					linkToGenerate['id/goal/before'],
					linkToGenerate['id/goal/next'],
					linkToGenerate['id/goal/text'],
				],
			}

			let showcaseId = 0;
			for (let [link, elem] of Object.entries(generateAllDivs)){
				createNewAssetShowcase('showcaseList', showcaseId, link, showcaseId)
				
				let newId = 0;
				elem.forEach((item) => {
					createNewDivForList(`assetList_${showcaseId}`, newId, item);
					newId++;
				});
				showcaseId++;
			}

			let id = 0;
			for (const item of Object.values(linkToGenerate)){
				createNewDivForList('myList', id, item);
				id++;
			}

			if (data.goals !== null){
				indexGoal = 0
				for (let [id, elem] of Object.entries(data.goals)){
					addGoalDiv(id, elem.value, elem.text, socketClient, data.id)
					indexGoal = parseInt(id) + 1
				}
			}

			document.getElementById("addGoalButton").addEventListener("click", () => {addNewGoal(socketClient, data)});
		})

		// Init color selector
		colorInit();
	})
}

function createNewAssetShowcase(parentId, id, link, showcaseId){
	const goalList = document.getElementById(parentId)
	if (!goalList)
		return ;
	const newElem = document.getElementById('assetShowcaseTemplate').content.cloneNode(true);
	const divElem = newElem.getElementById('assetShowcase')
	
	divElem.id = `assetShowcase_${id}`;
	if (showcaseId % 2 === 0){
		divElem.style = "background-color: #535863";
	}
	divElem.getElementsByClassName('showcaseImage')[0].src	= link;
	divElem.getElementsByClassName('assetList')[0].id	= `assetList_${id}`;

	goalList.appendChild(newElem);
}

function generateMap(data){
	return ({
		'id/goal/bar': {
			title:	`Donation goal de ${data.streamer.display_name}`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/${data.id}/total/bar`),
			width:	600,
			height:	100,
		},
		'id/goal/next': {
			title:	`Donation goal Actuel de ${data.streamer.display_name}`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/${data.id}/goal/next`),
			width:	250,
			height:	50,
		},
		'id/goal/before': {
			title:	`Donation goal precedent de ${data.streamer.display_name}`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/${data.id}/goal/before`),
			width:	250,
			height:	50,
		},
		'id/goal/text': {
			title:	`Text of the actual donation goal de ${data.streamer.display_name}`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/${data.id}/goal/text`),
			width:	250,
			height:	50,
		},
		'id/total/me': {
			title:	`Total récolté par ${data.streamer.display_name}`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/${data.id}/total/me`),
			width:	250,
			height:	50,
		},
		'total/all': {
			title:	`Total récolté par la Team`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/total/all`),
			width:	250,
			height:	50,
		},
		'id/donation/last': {
			title:	`Derniere donation récoltée par ${data.streamer.display_name}`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/${data.id}/donation/last`),
			width:	250,
			height:	50,
		},
		'id/donator/last': {
			title:	`Pseudo du dernier donateur de ${data.streamer.display_name}`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/${data.id}/donator/last`),
			width:	400,
			height:	80,
		},
		'id/donation/big': {
			title:	`Pseudo du dernier plus gros donateur`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/${data.id}/donation/big`),
			width:	250,
			height:	50,
		},
		'id/donator/big': {
			title:	`Pseudo du dernier donateur de ${data.streamer.display_name}`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/${data.id}/donator/big`),
			width:	400,
			height:	80,
		},
		'donation/last': {
			title:	`Derniere donation récoltée la team`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/donation/last`),
			width:	250,
			height:	50,
		},
		'donation/big': {
			title:	`Plus grosse donation récoltée de la team`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/donation/big`),
			width:	250,
			height:	50,
		},
		'timer': {
			title:	`Timer de l'évent`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/timer/elapsedCount?time=1651856400000`),
			width:	250,
			height:	50,
		},
		'qrcode': {
			title:	`Qrcode de Donation pour le streamer`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/${data.id}/qrcode`),
			width:	280,
			height:	280,
		},
		'id/donation/last10': {
			title:	`10 Derniere donation récoltée ${data.streamer.display_name}`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/${data.id}/donation/last10`),
			width:	500,
			height:	750,
		},
		'id/donation/big10': {
			title:	`10 Plus grosse donation récoltée ${data.streamer.display_name}`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/${data.id}/donation/big10`),
			width:	500,
			height:	750,
		},
		'donation/last10': {
			title:	`10 Derniere donation récoltée la team`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/donation/last10`),
			width:	500,
			height:	750,
		},
		'donation/big10': {
			title:	`10 Plus grosse donation récoltée la team`,
			src:	new URL(`${window.location.protocol}//${window.location.hostname}/a/donation/big10`),
			width:	500,
			height:	750,
		},
	});
};

function createNewDivForList(parentId, id, item){
	const goalList = document.getElementById(parentId)
	if (!goalList)
		return ;
	const newElem = document.getElementById('assetTemplate').content.cloneNode(true);
	const divElem = newElem.getElementById('listElement')
	
	divElem.id = `listElement_${id}`;
	divElem.getElementsByClassName('assetName')[0].textContent		= item.title;
	divElem.getElementsByClassName('assetName')[0].href				= item.src;
	divElem.getElementsByClassName('assetSize')[0].textContent		= `width: ${item.width} px, height: ${item.height} px`;
	divElem.getElementsByClassName('assetFrame')[0].src				= item.src;
	divElem.getElementsByClassName('assetFrame')[0].width			= item.width;
	divElem.getElementsByClassName('assetFrame')[0].height			= item.height;
	if (window.location.protocol === 'https:')
		divElem.getElementsByClassName('assetButton')[0].addEventListener('click', () => {pastbin(`${item.src}`)})
	else
		divElem.getElementsByClassName('assetButton')[0].addEventListener('click', () => {console.warn("connection is on http:");})

	goalList.appendChild(newElem);
}

function pastbin (data) {
	try {
		navigator.clipboard.writeText(data);
	}
	catch {
		alert(`Error!`);
	}
}

start();