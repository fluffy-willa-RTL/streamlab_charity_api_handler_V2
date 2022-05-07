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



// function resize_to_fit() {
// 	const output = document.querySelector('#username');
// 	const outputContainer = document.querySelector('body');
//   let fontSize = window.getComputedStyle(output).fontSize;
//   output.style.fontSize = (parseFloat(fontSize) - 1) + 'px';
  
//   if(output.clientHeight >= outputContainer.clientHeight){
//     resize_to_fit();
//   }
// }

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
			res = actualGoal.text;
			console.log("wip");
			// textFit(document.querySelector('div'));
			// fitty('div');
			fitty('#username', {
				minSize: 30,
				maxSize: 60,
				multiLine: true,
			});
			break;
		default:
			res = null
			break;
	}
	document.getElementById(textId).textContent = res;
}

start();