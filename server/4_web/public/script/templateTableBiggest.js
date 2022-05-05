let prev = {};
let data = null;

async function start() {
	const socket = await connect();

	// Get query//TODO
	const params = new Proxy(new URLSearchParams(window.location.search), {get: (searchParams, prop) => searchParams.get(prop),});

	if (params?.color ?? null) {
		document.getElementsByClassName('text').style.color = `#${params.color}`;
	}

	socket.on(socketListeningEvent, (res) => {
		data = {}

		for (let i of res){
			data[i._id] = i
		}
		let donationList = document.getElementById(`donationList`)
		
		for (let el of Object.values(prev)){
			const oldElem = document.getElementById(`donation_${el._id}`)
			oldElem.remove()
		}

		for (let el of Object.values(data)){			
			const newElem = (document.getElementById("templateDonation")).content.cloneNode(true);
			newElem.getElementById(`donation`).id = `donation_${el._id}`;
			donationList.appendChild(newElem);
			let elem = document.getElementById(`donation_${el._id}`);
			if (prev[el._id] == undefined){
				elem.classList.add("animate__animated");
				elem.classList.add("animate__fadeIn");
				animateMoneySingle(el.amount, elem)
			}
			else {
				elem.getElementsByClassName('value')[0].textContent = moneyConverter.format(el.amount / 100)
			}
			elem.getElementsByClassName('name')[0].textContent = convertLongText(el.name, 25);
		}

		prev = data
	});
}

start();