let amount = 0;
function updateDOM(lastD) {
const interval = setInterval(function() {
  let change = (lastD-amount) / 10;
  change = change >= 0 ? Math.ceil(change) : Math.floor(change);
  amount += change;
  console.log(amount)
  if (amount === lastD)
      clearInterval(interval);
	  document.getElementById('animateCount').textContent = amount;
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
			updateDOM(res)
		});
	} else {
		document.location = '/u/'
	}
}

start();