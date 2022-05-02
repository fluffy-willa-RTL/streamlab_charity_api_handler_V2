// const socketListeningEvent = `donation_last`
// const textId = `lastDon`

let prev = 0;
let total = 0;
let prcnt = 0;
let goals = {}

async function start() {
	const socket = await connect();
	// Listen update for the total amount

	// Get query
	const params = new Proxy(new URLSearchParams(window.location.search), {get: (searchParams, prop) => searchParams.get(prop),});

	if (params.color) {
		console.log(color)
	}

	console.log(socketListeningEvent)
	socket.on(socketListeningEvent, (res) => {
		total = res.total;
		goals = res.goals;
		console.log(goals)
		let index = -1;
		for (let i of Object.keys(goals)){
			
			if (total < goals[i].value * 100){
				index = i
				break;
			}
			prev = goals[i].value * 100;
		}
		if (index !== -1) {
			prcnt = (total - prev) / ((goals[index].value * 100) - prev) * 100;
		}
		else {
			prcnt = 100;
		}
		if (prcnt > 99){
			prcnt = 99
		}
		document.getElementById('bar').style.gridTemplateColumns = `${parseInt(prcnt)}% auto`;
		console.log(prcnt)
	});
}

start();