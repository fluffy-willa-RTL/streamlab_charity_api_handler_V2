function addGoalForm(){
	let promptValue;
	let goalValue = Number('no')
	while (!Number.isInteger(goalValue)){
		promptValue = prompt('New Goal Value (EUR)');
		if (!promptValue){
			return {error: 0};
		}
		goalValue = Number(promptValue)
	}
	const goalText = prompt(`Value: ${goalValue}.00 €\nText Associated with the Goal`)
	
	if (!confirm(`Value: ${goalValue}.00 €\nText : ${goalText}\n\nAre you sure ?`)){
		return {error: 0};
	}

	return {
		value: goalValue,
		text:  goalText,
	}
}

function editGoalForm(old){
	let promptValue;
	let goalValue = Number('no')
	while (!Number.isInteger(goalValue)){
		promptValue = prompt(`Old value: ${old.value}\n New Goal Value (EUR)`);
		if (!promptValue){
			return {error: 0};
		}
		goalValue = Number(promptValue)
	}
	const goalText = prompt(`Value: ${goalValue}€\nOld text: ${old.text}\nText Associated with the Goal`)

	if (!confirm(`Value: ${goalValue}.00 €\nText : ${goalText}\n\nAre you sure ?`)){
		return {error: 0};
	}

	return {
		value: goalValue,
		text:  goalText,
	}
}

function deleteGoalForm(){
	// if (!confirm(`Value: ${goalValue}.00 €\nText : ${goalText}\n\nAre you sure ?`)){
	// 	return false;
	// }
	return true;
}
