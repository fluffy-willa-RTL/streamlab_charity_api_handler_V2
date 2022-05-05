let goals = {};

let actualGoal = {
	value: 0,
	text: null,
};
let prevGoal = {
	value: 0,
	text: null,
};
let total = 0;

async function start() {
	const socket = await connect();
	// Listen update for the total amount

	// Get query
	const params = new Proxy(new URLSearchParams(window.location.search), {get: (searchParams, prop) => searchParams.get(prop),});

	if (params.color) {
		document.getElementById(textId).style.color = `#${params.color}`;
	}

	updateDOM()

	socket.emit('init')
	socket.emit('goals', id)

	socket.on(`total.${id}`, (res) => {
		total = res;
		updateDOM()
	});

	socket.on(`goals.${id}`, (data) => {
		goals = data;
		updateDOM()
	});
}

function updateDOM(){
	for (let i of Object.keys(goals)){
		if (total < goals[i].value * 100){
			actualGoal = goals[i]
			break;
		}
		prevGoal = goals[i];
	}

	let res;
	switch (whichElemToPick) {
		case 'after':
			res = moneyConverter.format(actualGoal.value)
			break;
		case 'before':
			res = moneyConverter.format(prevGoal.value)
			break;
		case 'text':
			res = actualGoal.text
			break;
		default:
			res = null
			break;
	}
	document.getElementById(textId).textContent = res;
}

start();