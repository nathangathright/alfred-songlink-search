'use strict';
const path = require('path');
const fs = require('fs');
const https = require('https');
const alfy = require('alfy');

let platforms = path.join(__dirname, 'platforms');
let cachelength = 60 * 60 * 1000; // 1 hour cache

function ensureDirectoryExistence(filePath) {
	var dirname = path.dirname(filePath);
	if (fs.existsSync(dirname)) {
	  return true;
	}
	ensureDirectoryExistence(dirname);
	fs.mkdirSync(dirname);
}


function download(filename, url, callback) {
	ensureDirectoryExistence(filename)
	let file = fs.createWriteStream(filename);

	https.get(url, function (response) {
		if (callback !== undefined) {
			response.pipe(file).on('finish', () => {
				callback(file);
			});
		}
	});
}

const labels = {
	amazonMusic: 'Amazon Music',
	amazonStore: 'Amazon Store',
	appleMusic: 'Apple Music',
	audius: 'Audius',
	deezer: 'Deezer',
	google: 'Google',
	googleStore: 'Google Store',
	itunes: 'iTunes',
	napster: 'Napster',
	pandora: 'Pandora',
	soundcloud: 'Soundcloud',
	spinrilla: 'Spinrilla',
	spotify: 'Spotify',
	tidal: 'Tidal',
	yandex: 'Yandex',
	youtube: 'Youtube',
	youtubeMusic: 'Youtube Music'
};

(async () => {
	const data = await alfy.fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(alfy.input)}&userCountry=US&key=`, {maxAge: cachelength});
	const results = [];
	const keys = Object.keys(data.linksByPlatform);
	results.push({
		"title" : `Open in Songlink`,
		"arg" : data.pageUrl,
		icon: {
			path: `${platforms}/songlink.png`
		}
	})

	for(var i=0,n=keys.length;i<n;i++){
		var key = keys[i];
		results.push({
			"title" : `Open in ${labels[key]}`,
			"arg" : data.linksByPlatform[key].url,
			icon: {
				path: `${platforms}/${key}.png`
			}
		})
	}
    
	alfy.output(results);
})();
