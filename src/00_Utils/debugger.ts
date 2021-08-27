import colors from 'colors';

let isActivate: boolean = true;
const log = console.log;
function baseLog(tag: string, ...args: any[]) {
	if (!isActivate) {
		return;
	}

	const date = new Date();
	log(
		colors.gray(date.toISOString().replace(/T/, ' ').replace(/\..+/, '') + ":" + String(date.getMilliseconds()).padStart(3, "0")),
		tag,
		...args
	);
};

console.log = (...args: any[]) => baseLog(colors.blue('[DEBUG]'), ...args);
console.error = (...args: any[]) => baseLog(colors.red('[ERROR]'), ...args);
console.info = (...args: any[]) => baseLog(colors.green('[INFO]'), ...args);
console.warn = (...args: any[]) => baseLog(colors.yellow('[WARN]'), ...args);

export function disableLogging() {
	isActivate = false;
}

export function enableLogging() {
	isActivate = true;
}