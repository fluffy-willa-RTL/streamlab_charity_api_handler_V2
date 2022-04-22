import axios from 'axios'

import { slugify }	from './slugify.js'

import dotenv from 'dotenv'
dotenv.config()

let don = {}
let front = {
	total: 0,
	total_streamer: {},
	donation_special: {},
}

let streamer = await getAllStreamer()

async function getAllStreamer(){
	let res = []
	let url = `https://streamlabscharity.com/api/v1/teams/${process.env.STREAMLAB_CHARITY_TEAM}/members`

	let data = await axios.get(url)
					.then((res) => {return res.data;})
	
	for (let i in data.data){
		res.push({
			_id				: data.data[i]?.user?.id						?? 0,
			display_name	: data.data[i]?.user?.display_name				?? null,
			slug			: slugify(data.data[i]?.user?.display_name		?? null),
			avatarURL		: data.data[i]?.user?.avatar?.url				?? null,
			goal			: data.data[i]?.goal?.amount					?? 0,
		})
	}
	const lastPage = data.last_page
	let nbPage = 2
	while (nbPage <= data.last_page){
		url = `https://streamlabscharity.com/api/v1/teams/${process.env.STREAMLAB_CHARITY_TEAM}/members?page=${nbPage}`
		let data = await axios.get(url)
					.then((res) => {return res.data;})
		for (let i in data.data){
			res.push({
				_id				: data.data[i]?.user?.id						?? 0,
				display_name	: data.data[i]?.user?.display_name				?? null,
				slug			: slugify(data.data[i]?.user?.display_name		?? null),
				avatarURL		: data.data[i]?.user?.avatar?.url				?? null,
				goal			: data.data[i]?.goal?.amount					?? 0,
			})
		}
		nbPage++
	}
	return (res)
}

function string_to_slug (str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

export default {
	don,
	front,
	streamer,
}