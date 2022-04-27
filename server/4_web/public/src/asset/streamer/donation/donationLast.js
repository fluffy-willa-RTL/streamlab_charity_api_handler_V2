async function start() {
	const	id = window.location.pathname.split('/')[2]

	if (id)
	{
		document.getElementById('streamerId').textContent = id;
		
		const socket = await connect();
		// Listen update for the total amount
		socket.emit('init');

		socket.on(`donation_last.${id}`, (res) => {
			for (let i in res){
				if (document.getElementById(`donation_${i}`) == null){
					const newElem = (document.getElementById("templateDonation")).content.cloneNode(true);
					newElem.getElementById(`donation`).id = `donation_${i}`
					document.body.appendChild(newElem)
				}
				let elem = document.getElementById(`donation_${i}`)
				elem.getElementsByClassName('name')[0].textContent = res[i].name
				elem.getElementsByClassName('value')[0].textContent = res[i].amount
				elem.getElementsByClassName('message')[0].textContent = res[i].message

				console.log(elem)
				// document.body.appendChild(elem)
				// console.log(elem.getElementsByClassName('name').textContent)
			}
		});
	} else {
		document.location = '/u/'
	}
}

start();