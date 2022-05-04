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

function updateSingleElem(elem, newColor) {
	const url = new URL(elem.getElementsByClassName('assetFrame')[0].src)
	url.searchParams.delete('color');
	url.searchParams.append('color', newColor)

	console.log(url)
	elem.getElementsByClassName('assetButton')[0].addEventListener('click', () => {pastbin(url)});
	elem.getElementsByClassName('assetFrame')[0].src = url;
}

function updateAllColor(event) {
	const list = document.getElementsByClassName('listElement')
	for (const elem of list){
		updateSingleElem(elem, event.target.value.substring(1))
	}
}
