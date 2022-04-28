let prev = {};
let data = null;

async function start() {
	const	id = window.location.pathname.split('/')[2]

	if (id)
	{
		// document.getElementById('streamerId').textContent = id;
		
		const socket = await connect();
		// Listen update for the total amount
		socket.emit('init');

		socket.on(`donation_last.${id}`, (res) => {
			data = {}

			for (let i of res){
				data[i._id] = i
			}
			let donationList = document.getElementById(`donationList`)

			for (let el of Object.values(data)){			
				if (prev[el._id] === undefined){
					const newElem = (document.getElementById("templateDonation")).content.cloneNode(true);
					newElem.getElementById(`donation`).id = `donation_${el._id}`;
					donationList.appendChild(newElem);
				}
				
				let elem = document.getElementById(`donation_${el._id}`);
				elem.getElementsByClassName('name')[0].textContent = convertLongText(el.name);
				elem.getElementsByClassName('value')[0].textContent = moneyConverter.format(el.amount / 100);
				
			}

			for (let el of Object.values(prev)){
				if (data[el._id] === undefined){
					const oldElem = document.getElementById(`donation_${el._id}`)
					oldElem.remove()
					continue
				}
			}

			prev = data
		});
	} else {
		document.location = '/u/'
	}
}

start();