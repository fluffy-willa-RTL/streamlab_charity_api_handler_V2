let colorWell
let defaultColor = "#0000ff";
let colorPreview = document.getElementById('colorPreview');
function colorInit() {
	
	window.addEventListener("load", colorInit, false);
	colorlisten();
}

function colorlisten() {
	colorWell = document.querySelector("#colorWell");
	colorWell.value = defaultColor;
	colorWell.addEventListener("input", updateFirstColor, false);
	colorWell.addEventListener("change", updateAllColor, false);
	colorWell.select();
}

function updateFirstColor(event) {
	colorPreview.style.color = event.target.value;
}

function updateAllColor(event) {
	let id = 0;
	for (const item of Object.values(linkToGenerate)){
		const elements = document.getElementById(`listElement_${id}`);

		// Check if `color` qery exit, if true will set() else will append.
		if (item.src.searchParams.has('color')) {
			item.src.searchParams.set('color', event.target.value.substring(1))
		} else {
			item.src.searchParams.append('color', event.target.value.substring(1))
		}
		elements.getElementsByTagName('iframe')[0].src = item.src;
		elements.getElementsByTagName('a')[0].href = item.src;
		elements.getElementsByTagName('button')[0].onclick = function () {pastbin(item.src)};
		id++;
	}
}
