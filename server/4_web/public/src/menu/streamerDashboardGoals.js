function addNewGoal(socket, data){
	const form = addGoalForm()
	if (Object.hasOwn(form, 'error')){
		return ;
	}
	addGoalDiv(indexGoal, form.value, form.text, socket, data.id)
	socket.emit('addNewGoal', {
		id: data.id,
		index: indexGoal,
		value: form.value,
		text: form.text,
	})
	indexGoal++;
}

function editGoal(socket, id, index) {
	socket.emit('goals', id)
	socket.on(`goals.${id}`, (res) => {
		const form = editGoalForm(res[index])
		if (Object.hasOwn(form, 'error')){
			socket.off(`goals.${id}`);
			return ;
		}
		editGoalDiv(index, form.value, form.text)
		socket.emit('addNewGoal', {
			id: data.id,
			index: index,
			value: form.value,
			text: form.text,
		})
		socket.off(`goals.${id}`);
	})
}

function deleteGoal(socket, id, index){
	socket.emit('goals', id)
	socket.on(`goals.${id}`, (res) => {
		socket.off(`goals.${id}`);

		const form = deleteGoalForm(res[index])
		if (Object.hasOwn(form, 'error')){
			socket.off(`goals.${id}`);
			return ;
		}

		socket.emit('deleteGoal', {
			id: data.id,
			index: index
		})
		
		socket.emit('goals', id)
		socket.on(`goals.${id}`, (dbGoals) => {
			socket.off(`goals.${id}`);

			deleteListDiv()
			indexGoal = 0
			for (let [id, elem] of Object.entries(dbGoals)){
				addGoalDiv(id, elem.value, elem.text, socket, data.id)
				indexGoal = parseInt(id) + 1
			}
		})
	})
}

/******************************************************************************/

function addGoalDiv(index, value, text, socket, id){
	const goalList = document.getElementById('goalList')
	const newElem = document.getElementById('goalTemplate').content.cloneNode(true);
	const divElem = newElem.getElementById('goal')
	divElem.id = `goal_${index}`;
	divElem.getElementsByClassName('goalIndex')[0].textContent = index;
	divElem.getElementsByClassName('goalValue')[0].textContent = moneyConverter.format(value);
	divElem.getElementsByClassName('goalText')[0].textContent = text;
	divElem.getElementsByClassName('editGoal')[0].addEventListener('click', () => {editGoal(socket, id, index)})
	divElem.getElementsByClassName('deleteGoal')[0].addEventListener('click', () => {deleteGoal(socket, id, index)})
	goalList.appendChild(newElem);
}

function editGoalDiv(index, value, text){
	const divElem = document.getElementById(`goal_${index}`)
	divElem.getElementsByClassName('goalIndex')[0].textContent = index;
	divElem.getElementsByClassName('goalValue')[0].textContent = moneyConverter.format(value);
	divElem.getElementsByClassName('goalText')[0].textContent = text;
}

function deleteListDiv(index, value, text){
	const goalList = document.getElementById('goalList').getElementsByClassName('goal')
	for (let i = goalList.length - 1; i >= 0; i--){
		goalList[i].remove()
	}
}