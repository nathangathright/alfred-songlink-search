'use strict';
const path = require('path');
const fs = require('fs');
const https = require('https');
const alfy = require('alfy');

let media = path.join(__dirname, 'media');
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

(async () => {
	const data = await alfy.fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(alfy.input)}&limit=9&media=music&entity=song`, {maxAge: cachelength});

	const results = data.results.map(result => {
		const iconPath = path.join(media, `${result.trackId}.jpg`);

		return {
			uid: result.trackId,
			title: result.trackName,
			subtitle: `${result.artistName} · Album: ${result.collectionName}`,
			arg: `https://song.link/${result.trackViewUrl}`,
			icon: {
				path: iconPath
			}
		};
	});

	data.results.forEach(result => {
		const iconPath = path.join(media, `${result.trackId}.jpg`);

		fs.exists(iconPath, exists => {
			if (!exists) {
				download(iconPath, result.artworkUrl100, () => {
					return true;
				});
			}
		});
	});

	alfy.output(results);
})();
