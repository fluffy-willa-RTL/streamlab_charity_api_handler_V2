import axios from 'axios';
import 'dotenv/config' //for reading env

import { slugify } from './slugify.js';

export function get_auth_url() {
	const paramsAutorization = {
		'client_id'     : process.env.CLIENT_ID,
		'redirect_uri'  : process.env.PROTOCOL + '://' + process.env.BASE_URL + '/redirect',
		'response_type' : 'code',
		'scope'         : '',
	};
	return (process.env.STREAMLAB_URL + 'authorize?' + new URLSearchParams(paramsAutorization));
}

export async function getUserData(code) {
	const postData = {
		'grant_type'   : 'authorization_code',
		'client_id'    : process.env.CLIENT_ID,
		'client_secret': process.env.SL_SECRET,
		'redirect_uri' : process.env.PROTOCOL + '://' + process.env.BASE_URL + '/redirect',
		'code'         : code
	};
	console.log('connection...');
	return (make_requests(postData));
}

export async function refreshUserData(refreshToken) {
	const postData = {
		'grant_type'   : 'refresh_token',
		'client_id'    : process.env.CLIENT_ID,
		'client_secret': process.env.SL_SECRET,
		'redirect_uri' : process.env.PROTOCOL + '://' + process.env.BASE_URL + '/redirect',
		'refresh_token': refreshToken
	};
	console.log('refreshing...');
	return (make_requests(postData));
}

async function	make_requests(postData)
{
	// Request the `access_token` to the api
	const tokens = await axios.post(process.env.STREAMLAB_URL + 'token', postData)
		.then((res) => {return res.data;})
		.catch(() => {return null});
	if (tokens === null)
		return (null);

	// Request user data from the api
	const userdata = await axios.get(process.env.STREAMLAB_URL + 'user', {params: {
		access_token: tokens.access_token
	}}).then((res) => {return res.data;})
		.catch(() => {return null});
	if (userdata === null)
		return (null);
	// console.log(userdata);

	//We add our custom `slug` for the frontend
	return ({
		id            : userdata.streamlabs.id,
		display_name  : userdata.streamlabs.display_name,
		slug          : slugify(userdata.streamlabs.display_name),
		access_token  : tokens.access_token,
		refresh_token : tokens.refresh_token
	});
}