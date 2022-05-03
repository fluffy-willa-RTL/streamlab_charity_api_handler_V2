import axios 			from 'axios'

import db 				from './database.js'
import { slugify }		from '../0_utils/slugify.js'
import { log, logTable }			from '../0_utils/log.js'

import dotenv 			from 'dotenv'
dotenv.config()

/**
 * @description Update the db.streamer with all new streamer subscribed in the streamlab charity team
 */
export async function getAllStreamer(){
	const url = `https://streamlabscharity.com/api/v1/teams/${process.env.STREAMLAB_CHARITY_TEAM}/members`
	const nbPage = await axios.get(url)
						.then((res) => {return res.data.last_page;})
						.catch((err) => {console.log(err)})

	for (let i = 1; i < nbPage + 1; i++){
		const data =  await axios.get(url + `?page=${i}`)
									.then((res) => {return res.data;})
									.catch((err) => {console.log('Error:', err)})
		for (let newStreamer of data.data){
			if (db.streamer[newStreamer.user._id] === undefined){
				db.streamer[newStreamer.user.id] = {
					display_name	: newStreamer?.user?.display_name				?? null,
					slug			: slugify(newStreamer?.user?.display_name		?? null),
					avatarURL		: newStreamer?.user?.avatar?.url				?? null,
					goal			: newStreamer?.goal?.amount						?? 0,
				}
			}
		}
	}
	logTable(db.streamer, ['display_name', 'slug'])
}