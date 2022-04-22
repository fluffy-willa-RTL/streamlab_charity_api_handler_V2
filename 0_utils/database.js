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

let streamer = {}

async function getAllStreamerV2(){
	const url = `https://streamlabscharity.com/api/v1/teams/${process.env.STREAMLAB_CHARITY_TEAM}/members`
	const nbPage = await axios.get(url).then((res) => {return res.data.last_page;})

	for (let i = 1; i < nbPage + 1; i++){
		const data =  await axios.get(url + `?page=${i}`).then((res) => {return res.data;})
		for (let newStreamer of data.data){
			if (streamer[newStreamer.user._id] === undefined){
				streamer[newStreamer.user.id] = {
					display_name	: newStreamer?.user?.display_name				?? null,
					slug			: slugify(newStreamer?.user?.display_name		?? null),
					avatarURL		: newStreamer?.user?.avatar?.url				?? null,
					goal			: newStreamer?.goal?.amount						?? 0,
				}
			}
		}
	}
	
	console.table(streamer, ['display_name', 'slug', 'goal'])
}



export default {
	don,
	front,
	streamer,
	getAllStreamerV2
}
