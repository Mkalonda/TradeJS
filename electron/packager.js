'use strict';

const
	path = require('path'),
	packager = require('electron-packager'),
	rebuild = require('electron-rebuild').default,
	rootSrc = path.join(__dirname, '..'),
	options = {
		dir: rootSrc,
		tmpdir: false,
		electronVersion: '1.6.2',
		name: 'TradeJS',
		appId: 'tradejs',
		out: './builds',
		overwrite: true,
		platform: 'win32',
		afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
			console.log('buidl apfadsfadsfsd', buildPath);
			let rebuildPath = path.join(__dirname, 'builds', `TradeJS-${platform}-${arch}`, 'resource', 'app', 'server');

			console.log('buildPath buildPath buildPathbuildPath', rebuildPath);

			// rebuild(rebuildPath, electronVersion, arch)
			// 	.then(() => callback())
			// 	.catch((error) => callback(error));
		}],
		ignore: function (filePath) {
			if (/\/client\//.test(filePath)) {
				if (filePath !== '/client' && !/client\/dist/.test(filePath))
					return true
			}

			if (/(.idea|\/_cache|electron\/node_modules|electron\/tmp|electron\/assets)/.test(filePath))
				return true;

			// if (/node_modules/.test(filePath)) {
			// 	if (/\/(obj|test.*?|spec.*?|htdocs|demo|example.*?|sample.*?)[\/$]/i.test(filePath)) {
			// 		return true;
			// 	}
			// 	if (/^(\..*|.*\.(sln|pdb|exp|lib|map|md|sh|gypi|gyp|h|cpp|xml|yml|html)|vcxproj.*|LICENSE|README|CONTRIBUTORS|vagrant|Dockerfile|Makefile)$/i.test(path.basename(filePath))) {
			// 		return true;
			// 	}
			// }
		}
	};

packager(options, (err, appPaths) => {
	console.log(err, appPaths);
});
