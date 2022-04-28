const moneyConverter = Intl.NumberFormat('fr-FR', {
	style: 'currency',
	currency: 'EUR',
});

/*
input :
	obj: {
		diplay: xxx		=> set to set 0 as global variable
		amount: xxx		=> set to set 0 as global variable
	}
	id:
		css id of the item we want to change
*/
function animateMoney(obj, id) {
	const interval = setInterval(function() {
		if (obj.display === obj.amount)
			clearInterval(interval);
		let change = (obj.amount - obj.display) / 10;
		change = change >= 0 ? Math.ceil(change) : Math.floor(change);
		obj.display += change;
		document.getElementById(id).textContent = moneyConverter.format(obj.display / 100);
	}, 20);
};

function convertLongText(text, len = 15){
	if (text.length > len){
		text = text.slice(0, len);
		text += '...'
	}
	return text
}