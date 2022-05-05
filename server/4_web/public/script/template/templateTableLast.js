let prev = {};
let data = null;
let color = '#0a4a91'

async function start() {
	const socket = await connect();

	// Get query
	const params = new Proxy(new URLSearchParams(window.location.search), {get: (searchParams, prop) => searchParams.get(prop),});

	if (params?.color ?? null) {
		color = `#${params.color}`
	}

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
				elem.getElementsByClassName('value')[0].textContent = moneyConverter.format(el.amount / 100);
			}
			else{
				animateMoneySingle(el.amount, elem)
			}
			elem.getElementsByClassName('name')[0].textContent = convertLongText(el.name, 20);
			elem.getElementsByClassName('name')[0].style.color = color;
			elem.getElementsByClassName('value')[0].style.color = color;
			
			
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