import * as NACT from 'nact';

export class ActorManager {
	private constructor() { }

	public system: NACT.ActorSystemRef;

	private actors: Map<string, NACT.Ref<any>>;

	public static create(): ActorManager {
		const instance = new ActorManager();
		instance.system = NACT.start();
		instance.actors = new Map<string, NACT.Ref<any>>();

		return instance;
	}

	public get(name: string): NACT.Ref<any> | undefined {
		return this.actors.get(name);
	}

	public set(name: string, actor: NACT.Ref<any>): void {
		this.actors.set(name, actor);
	}

	public delete(name: string): void {
		const actor = this.get(name);
		if (actor) {
			NACT.stop(actor);
			this.actors.delete(name);
		}
	}

	public destroy(): void {
		this.actors.clear();
		NACT.stop(this.system);
	}
}