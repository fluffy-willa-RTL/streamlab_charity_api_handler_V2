function updateDOM(amount, id) {
	document.getElementById('animateCount').textContent = amount;
	document.getElementById('streamerId').textContent = id;
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
			updateDOM(res, id)
		});
	} else {
		document.location = '/u/'
	}
}

start();