let displayAmount = 0;
let amount = 0;
function updateDOM() {
const interval = setInterval(function() {
	if (displayAmount === amount)
		clearInterval(interval);
	let change = (amount-displayAmount) / 10;
	change = change >= 0 ? Math.ceil(change) : Math.floor(change);
	displayAmount += change;
	// console.log(displayAmount)
	document.getElementById('animateCount').textContent = displayAmount;
}, 20);
}

async function start() {
	const	id =  window.location.pathname.slice('/a/'.length, -('/streamertotal'.length))
	if (id)
	{
		const socket = await connect();
		// Listen update for the total amount
		socket.emit('init', {test: '123'});
		socket.on(`total.${id}`, (res) => {
			console.log('res socket', res);
			updateDOM()
			amount = res;
		});
	} else {
		document.location = '/u/'
	}
}

start();