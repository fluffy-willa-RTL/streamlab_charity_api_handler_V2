	// Get query
	const params = new Proxy(new URLSearchParams(window.location.search), {get: (searchParams, prop) => searchParams.get(prop),});

	if (params?.color ?? null) {
		document.getElementById("time").style.color = `#${params.color}`;
	}

	if (params?.time ?? null) {
		console.log(new Date(parseInt(params.time)));
		start(params.time);
	} else {
		document.getElementById("time").textContent = "No starting times!";
	}

	function Days(distance, neg) {
		const time = (distance / (1000 * 60 * 60 * 24));
		let days;
		if (neg === '-') {

			days = Math.ceil(time);
		} else {
			days = Math.floor(time);
		}
		return (days < 0) ? `${Math.abs(days)}d ` : ''
	}

	function Hours(distance, neg) {
		const time = (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60);
		if (neg === '-')
			return Math.abs(Math.ceil(time));
		return Math.abs(Math.floor(time));
	}

	function Minutes(distance, neg) {
		const time = (distance % (1000 * 60 * 60)) / (1000 * 60);
		if (neg === '-')
			return Math.abs(Math.ceil(time));
		return Math.abs(Math.floor(time));
	}

	function Seconds(distance, neg) {
		const time = (distance % (1000 * 60)) / 1000;
		if (neg === '-')
			return Math.abs(Math.ceil(time));
		return Math.abs(Math.floor(time));
	}

	async function start (startTime) {
		await connect();
		// Update the count down every 1 second
		setInterval(() => {
		// Get today's date and time
		const now = new Date().getTime();
		
			// Find the distance between now and the count down date
		const distance = now - startTime;
		const neg = (distance < 0) ? '-' : '';
		// Time calculations for days, hours, minutes and seconds
		let days = Days(distance, neg);
		const hours = Hours(distance, neg);
		const minutes = Minutes(distance, neg);
		const seconds = Seconds(distance, neg);
		// Output the result in an element with id="time"
		document.getElementById("time").textContent = `${neg}${days}${hours}h ${minutes}m  ${seconds}s`;
	}, 1000);
}