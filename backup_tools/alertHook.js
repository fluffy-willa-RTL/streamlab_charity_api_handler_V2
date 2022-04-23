
/**
 * env var
 */
 import dotenv from 'dotenv';

 dotenv.config()
 // Global env
 const g_env = process.env
 
 /**************************************************************************** */
 
 
 /**
  * Error webhook
  */
 import axios from 'axios';
 
 /**
  * 
  * @param {*} title Title of the error
  * @param {*} err The return error @ json format
  * @param {*} msg custom msg
  */
 function alertHook (title, err = null, msg = null) {
	 // const content = "<@&963457791262089267>";
	 let description = '';
	 if (err)
	 {
		 err = JSON.stringify(err, null, 2);
		 description = (`\`\`\`json\n${err}\n\`\`\``)
	 }
	 const param = {
		 "username":"streamlab_charity_api_handler",
		 "avatar_url":"https://i.la-croix.com/729x0/smart/2021/02/25/1201142528/Warning-attention_0.jpg",
		 // "content": content,
		 "embeds":[
			 {
				 "title": title,
				 "color":16711680,
				 "description": description,
				 "timestamp":"",
				 "author":{
					 "name": msg
				 },
			 }
		 ],
	 }
	 console.log(msg);
	 axios.post(g_env.WEBHOOK_LINK, param)
	 .then((res) => console.log("(ok) alertHook hook post!"))
	 .catch((err) => console.log("[KO] alertHook hook post FAIL!!!\n" + err))
 
 }
 
 export { alertHook }