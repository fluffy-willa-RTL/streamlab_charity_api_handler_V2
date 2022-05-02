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
			document.getElementById('welcomeMessage').textContent =  `Salut ${data.streamer.display_name}`;
			console.log(`Salut ${data.streamer.display_name}, tu n'es pas censé être là, ouste !`);
			// Show all component
			if (linkToGenerate !== null) {
				return ;
			}
			linkToGenerate = generateArray(data);
			const list = document.getElementById("myList");
			let id = 0;
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
				for (let [id, elem] of Object.entries(data.goals)){
					addGoalDiv(id, elem.value, elem.text)
					indexGoal = id + 1
				}
			}

			document.getElementById("addGoalButton").addEventListener("click", () => {
				let promptValue;
				let goalValue = Number('no')
				while (!Number.isInteger(goalValue)){
					promptValue = prompt('New Goal Value (EUR)');
					if (!promptValue){
						return;
					}
					goalValue = Number(promptValue)
				}
				const goalText = prompt('Text Associated with the Goal')
				const verify = prompt('Are you sure ? (yes/no)')
				if (verify !== 'yes' && verify !== 'y'){
					console.log('hello')
					return;
				}
				addGoalDiv(indexGoal, goalValue, goalText)
				socketClient.emit('addNewGoal', {
					id: data.id,
					index: indexGoal,
					value: goalValue,
					text: goalText,
				})
				indexGoal++;
			});
		})
	})
}

function addGoalDiv(index, value, text){
	const goalList = document.getElementById('goalList')
	const newElem = (document.getElementById('goalTemplate')).content.cloneNode(true);
	const divElem = newElem.getElementById('goal')
	divElem.id = `goal_${index}`;
	divElem.getElementsByClassName("goalIndex")[0].textContent = index;
	divElem.getElementsByClassName("goalValue")[0].textContent = value;
	divElem.getElementsByClassName("goalText")[0].textContent = text;
	goalList.appendChild(newElem);
}

// function editGoalDiv(index, value, text){
// 	const divElem = newElem.getElementById('goal')
// 	divElem.id = `goal_${index}`;
// 	divElem.getElementsByClassName("goalIndex")[0].textContent = index;
// 	divElem.getElementsByClassName("goalValue")[0].textContent = value;
// 	divElem.getElementsByClassName("goalText")[0].textContent = text;
// 	goalList.appendChild(newElem);
// }

function pastbin (data) {
	try {
		navigator.clipboard.writeText(data);
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
	for (let id = 0; id < len; id++) {
		const url = `${linkToGenerate[id].src}?color=${event.target.value.substring(1)}`;
		const elements = document.getElementById(`listElement_${id}`);
		elements.getElementsByTagName('iframe')[0].src = url;
		elements.getElementsByTagName('a')[0].href = url;
		elements.getElementsByTagName('button')[0].onclick = function () {pastbin(`${window.location.protocol}//${window.location.hostname}${linkToGenerate[id].src}?color=${event.target.value.substring(1)}`)};
	}
}

function generateArray(data){
	return ([
		{
			title:	`Total récolté par ${data.streamer.display_name}`,
			src:	`/a/${data.id}/total/me`,
			width:	900,
			height:	200,
		},
		{
			title:	`Total récolté par la Team`,
			src:	`/a/total/all`,
			width:	900,
			height:	200,
		},
		{
			title:	`Derniere donation récoltée par ${data.streamer.display_name}`,
			src:	`/a/${data.id}/donation/last`,
			width:	900,
			height:	200,
		},
		{
			title:	`Derniere donateur pour ${data.streamer.display_name}`,
			src:	`/a/${data.id}/donator/last`,
			width:	1500,
			height:	200,
		},
		{
			title:	`Plus grosse donation récoltée par ${data.streamer.display_name}`,
			src:	`/a/${data.id}/donation/big`,
			width:	900,
			height:	200,
		},
		{
			title:	`Derniere donation récoltée la team`,
			src:	`/a/donation/last`,
			width:	900,
			height:	200,
		},
		{
			title:	`Plus grosse donation récoltée la team`,
			src:	`/a/donation/big`,
			width:	900,
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
	]);
};

start();