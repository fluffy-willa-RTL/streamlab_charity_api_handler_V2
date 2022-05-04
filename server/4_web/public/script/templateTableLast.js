let prev = {};
let data = null;

async function start() {
	const socket = await connect();
	// Listen update for the total amount

	socket.on(socketListeningEvent, (res) => {
		data = {}

		for (let i of res){
			data[i._id] = i
		}
		
		for (let el of Object.values(data)){
			let isNew = true
			if (prev[el._id] === undefined){
				isNew = false
				const newElem = (document.getElementById("templateDonation")).content.cloneNode(true);
				newElem.getElementById(`donation`).id = `donation_${el._id}`;
				donationList.insertBefore(newElem, donationList.firstChild);
			}
			
			let elem = document.getElementById(`donation_${el._id}`);
			if (isNew){
				elem.getElementsByClassName('value')[0].textContent = moneyConverter.format(el.amount / 100)
			}
			else{
				animateMoneySingle(el.amount, elem)
			}
			elem.getElementsByClassName('name')[0].textContent = convertLongText(el.name, 20);
			
			
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
}

start();