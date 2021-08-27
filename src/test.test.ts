import { Runtime } from './index';

async function main() {
	await Runtime.start({ port: 3000 });
	Runtime.createActor({
		func: (state = {}, msg, ctx) => {
			if (msg.sender) {
				Runtime.dispatch(msg.sender, { message: msg.data.message + ' - ActorA' });
			}
			return state;
		},
		name: 'actorA',
		properties: {
			onCrash: (msg, error, ctx) => {
				Runtime.dispatch(msg.sender, error);
				return ctx.stop;
			}
		}
	});

	Runtime.createActor({
		func: async (state = {}, msg, ctx) => {
			if (msg.sender) {
				const response = await Runtime.query('actorA', { message: msg.data.message });
				response.data.message += ' - ActorB';
				Runtime.dispatch(msg.sender, response);
			}
			return state;
		},
		name: 'actorB'
	});

	console.log(await Runtime.query('actorB', { message: 'Hello, World!' }));

	Runtime.stop();
}

main().catch((error) => { console.error(error); });