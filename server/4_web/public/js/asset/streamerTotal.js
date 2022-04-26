async function start() {
	const	id =  window.location.pathname.slice('/a/'.length, -('/streamergoal'.length))
	if (id)
	{
		
	} else {
		document.location = '/u/'
	}
}

			// Listen update for the total amount
			socket.on(`total.${id}`, (res) => {
				console.log('res socket', res);
				updateDOM(res)
			});


start();