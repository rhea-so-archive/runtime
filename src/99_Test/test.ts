import { enableLogging, disableLogging } from '../00_Utils/debugger';

describe('Debugger', function () {
	it('Logging', function (done) {
		console.log('debug test1');
		console.error('error test1');
		console.info('info test1');
		console.warn('warn test1');

		disableLogging();

		console.log('debug test2');
		console.error('error test2');
		console.info('info test2');
		console.warn('warn test2');

		enableLogging();

		console.log('debug test3');
		console.error('error test3');
		console.info('info test3');
		console.warn('warn test3');

		done();
	});
});