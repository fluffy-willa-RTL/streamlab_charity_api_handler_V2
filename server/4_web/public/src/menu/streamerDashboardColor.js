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
	  const len = document.getElementById('myList').childElementCount;
	for (let id = 0; id < len; id++) {
		const url = `${linkToGenerate[id].src}?color=${event.target.value.substring(1)}`;
		const elements = document.getElementById(`listElement_${id}`);
		elements.getElementsByTagName('iframe')[0].src = url;
		elements.getElementsByTagName('a')[0].href = url;
		elements.getElementsByTagName('button')[0].onclick = function () {pastbin(`${window.location.protocol}//${window.location.hostname}${linkToGenerate[id].src}?color=${event.target.value.substring(1)}`)};
	}
}