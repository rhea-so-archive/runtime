require('app-module-path').addPath(__dirname);
require('source-map-support').install();

import '00_Utils/debugger';

import Runtime from 'rhea-runtime';

let isServiceDown: boolean = false;

async function main() {
	await Runtime.boot();

	Runtime.get('/', async (_req, res) => {
		res.json({
			code: 1,
			message: 'Hello, World!'
		});
	});

	Runtime.get('/health', async (_req, res) => {
		if (isServiceDown === true) {
			res.status(500);
			res.json({
				code: 0,
				message: 'Graceful shutdown'
			});
			return;
		}
		res.json({
			code: 1,
			message: 'Health check success'
		});
	});

	await Runtime.open(); // .env에 PORT를 넣어주세요
	console.log('Server has started');
}

function gracefulShutdown() {
	console.log('Graceful shutdown started')
	isServiceDown = true;
	// 프로그램을 종료할 준비
	setTimeout(() => {
		process.exit(0);
	}, 1000 * 5);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

main().catch((error) => {
	console.error(error);
	process.exit(0);
});