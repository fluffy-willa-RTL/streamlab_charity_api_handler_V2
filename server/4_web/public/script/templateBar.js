function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let prev = 0;
let prevIndex = 0;
let total = 0;
let prcnt = 0;
let goals = {}

const id = window.location.pathname.split('/')[2];
if (!id){
	document.location = '/u/';
}
const socketListeningEvent = `total.${id}`;

async function start() {
	const socket = await connect();
	// Listen update for the total amount

	// Get query
	const params = new Proxy(new URLSearchParams(window.location.search), {get: (searchParams, prop) => searchParams.get(prop),});

	if (params.color) {
		document.querySelector(':root').style.setProperty('--color-lines', `#${params.color}`);
	}

	socket.emit(`goals`, id)

	socket.on(`goals.${id}`, (res) => {
		goals = res;

		for (let i of Object.values(goals)){
			i.value *= 100;
		}

		console.log('goals', goals)
		updateWidth()
	});

	socket.on(`total.${id}`, (res) => {
		total = res;

		console.log(total)
		updateWidth()
	});
}

async function updateWidth(){
	let newPrcnt = 100;
	let index = 0;
	for (const i of Object.keys(goals)){
		if (total < goals[i].value){
			newPrcnt = ((total - prev) / (goals[i].value - prev) * 100);
			break;
		}
		index++;
		prev = goals[i].value;
	}
	prcnt = newPrcnt;

	while (prevIndex < index){
		document.getElementById('filled').style.width = `100%`;
		await sleep(1500);
		document.getElementById('filled').style.width = `0%`;
		await sleep(1500);
		prevIndex++;
	}

	document.getElementById('filled').style.width = `${prcnt}%`;
}

start();