import * as NACT from 'nact';
import Express from 'express';
import { ActorManager } from './01_ActorSystem/ActorManager';

interface Options {
	port: number
}

interface CreateActorOptions {
	func: NACT.ActorFunc<any, IRequest, any>,
	name: string,
	properties?: NACT.ActorProps<NACT.InferStateFromFunc<NACT.ActorFunc<any, any, any>>, NACT.InferMsgFromFunc<NACT.ActorFunc<any, any, any>>, any>,
	parent?: NACT.Ref<any>
}

interface CreateActorStatelessOptions {
	func: NACT.StatelessActorFunc<IRequest, any>,
	name: string,
	properties?: NACT.StatelessActorProps<NACT.InferMsgFromStatelessFunc<NACT.StatelessActorFunc<any, any>>, any>,
	parent?: NACT.Ref<any>
}

interface IRequest {
	type: 'success' | 'fail',
	data: any,
	reason?: string,
	sender?: NACT.Ref<any>
}

export class Runtime {
	private constructor() { }

	private static actorManager: ActorManager;

	public static async start(options: Options): Promise<void> {
		this.actorManager = ActorManager.create();
	}

	public static async stop(): Promise<void> {
		this.actorManager.destroy();
	}

	public static createActor(options: CreateActorOptions): NACT.Ref<any> {
		if (options.parent) {
			const actor = NACT.spawn(options.parent, options.func, options.name, options.properties);
			this.actorManager.set(options.name, actor);
			return actor;
		} else {
			const actor = NACT.spawn(this.actorManager.system, options.func, options.name, options.properties);
			this.actorManager.set(options.name, actor);
			return actor;
		}
	}

	public static createActorStateless(options: CreateActorStatelessOptions): NACT.Ref<any> {
		if (options.parent) {
			const actor = NACT.spawnStateless(options.parent, options.func, options.name, options.properties);
			this.actorManager.set(options.name, actor);
			return actor;
		} else {
			const actor = NACT.spawnStateless(this.actorManager.system, options.func, options.name, options.properties);
			this.actorManager.set(options.name, actor);
			return actor;
		}
	}

	public static dispatch(name: string | NACT.Ref<any>, data: any): void {
		if (data === undefined || data === null) {
			data = {}
		}

		const requestData: IRequest = {
			type: data.type ? data.type : 'success',
			data: data.data ? data.data : data,
			reason: data.reason ? data.reason : null
		}

		if (data instanceof Error) {
			requestData.type = 'fail';
			requestData.reason = (data as Error).message;
		}

		if (typeof name === 'string') {
			const actor = this.getActor(name);
			if (actor) {
				NACT.dispatch(actor, Object.assign(requestData));
			}
		} else {
			NACT.dispatch(name, Object.assign(requestData));
		}
	}

	public static async query(name: string, data: any, timeout: number = 1000): Promise<IRequest> {
		if (data === undefined || data === null) {
			data = {}
		}

		const requestData: IRequest = {
			type: data.type ? data.type : 'success',
			data: data.data ? data.data : data,
			reason: data.reason ? data.reason : null
		}

		if (data instanceof Error) {
			requestData.type = 'fail';
			requestData.reason = (data as Error).message;
		}

		const actor = this.getActor(name);
		if (actor) {
			try {
				return await NACT.query(actor, (sender) => Object.assign({ sender }, requestData), timeout);
			} catch (error) {
				return {
					type: 'fail',
					data: {},
					reason: 'Timeout'
				}
			}
		} else {
			return {
				type: 'fail',
				data: {},
				reason: 'Not Found'
			}
		}
	}

	public static getActor(name: string): NACT.Ref<any> | undefined {
		return this.actorManager.get(name);
	}

	public static deleteActor(name: string): void {
		this.actorManager.delete(name);
	}
}

export { NACT, Express };