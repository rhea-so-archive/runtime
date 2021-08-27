import * as NACT from 'nact';
import mochaIt from 'mocha-it';
import { expect } from 'chai';
import delay from 'delay';

export function actorBasicTest() {
	describe('01_Basic', () => {
		// https://nact.io/ko_kr/lesson/javascript/%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0
		it('01_Hello, World!', mochaIt(async (done) => {
			let responsed: boolean = false;

			// 액터 시스템을 시작하고 참조를 반환한다.
			const system = NACT.start();

			const greeting = NACT.spawnStateless(
				// 부모(상위) 액터 참조, 여기서는 ActorSystem(최상위 액터)
				system,

				// 메시지 핸들러 함수
				(msg, ctx) => {
					responsed = true;
				},

				// 액터의 이름(unique)
				'greeting'
			);

			// 액터에게 요청 보내기
			NACT.dispatch(greeting, { name: 'JeongHyeon Kim' });

			setTimeout(() => {
				expect(responsed).to.be.true;

				// 액터를 제거
				NACT.stop(greeting);

				// 액터 시스템을 제거
				NACT.stop(system);

				done();
			}, 100);
		}));

		// https://nact.io/ko_kr/lesson/javascript/%EC%83%81%ED%83%9C%EA%B0%80-%EC%9E%88%EB%8A%94-%EC%95%A1%ED%84%B0
		it('02_Memoization', mochaIt(async (done) => {
			let memoization: boolean = false;

			// 액터 시스템을 시작하고 참조를 반환한다.
			const system = NACT.start();

			const greeting = NACT.spawn(
				// 부모(상위) 액터 참조, 여기서는 ActorSystem(최상위 액터)
				system,

				// 메시지 핸들러 함수
				(state = {}, msg, ctx) => {
					if (state[msg.name] === undefined) {
						// 처음보는 요청인 경우
						state[msg.name] = true;
						return state;
					} else {
						// 똑같은 요청이 또 들어온 경우
						memoization = true;
						return state;
					}
				},

				// 액터의 이름(unique)
				'greeting'
			);

			// 액터에게 요청 보내기
			NACT.dispatch(greeting, { name: 'JeongHyeon Kim' });
			NACT.dispatch(greeting, { name: 'JeongHyeon Kim' });

			setTimeout(() => {
				expect(memoization).to.be.true;

				// 액터를 제거
				NACT.stop(greeting);

				// 액터 시스템을 제거
				NACT.stop(system);

				done();
			}, 100);
		}));

		// https://nact.io/ko_kr/lesson/javascript/%EC%95%A1%ED%84%B0-%EA%B0%84-%ED%86%B5%EC%8B%A0
		it('03_Ping Pong!', mochaIt(async (done) => {
			let didPong: boolean = false;

			// 액터 시스템을 시작하고 참조를 반환한다.
			const system = NACT.start();

			const ping = NACT.spawnStateless(
				// 부모(상위) 액터 참조, 여기서는 ActorSystem(최상위 액터)
				system,

				// 메시지 핸들러 함수
				async (msg, ctx) => {
					// ping: Pong is a little slow. So I'm giving myself a little handicap :P
					await delay(10);
					NACT.dispatch(msg.sender, { value: ctx.name, sender: ctx.self });
				},

				// 액터의 이름(unique)
				'ping'
			);

			const pong = NACT.spawnStateless(
				// 부모(상위) 액터 참조, 여기서는 ActorSystem(최상위 액터)
				system,

				// 메시지 핸들러 함수
				(msg, ctx) => {
					didPong = true;
					NACT.dispatch(msg.sender, { value: ctx.name, sender: ctx.self });
				},

				// 액터의 이름(unique)
				'pong'
			);

			// 액터에게 요청 보내기
			NACT.dispatch(ping, { sender: pong, value: 'begin' });

			setTimeout(() => {
				expect(didPong).to.be.true;

				// 액터를 제거
				NACT.stop(ping);
				NACT.stop(pong);

				// 액터 시스템을 제거
				NACT.stop(system);

				done();
			}, 100);
		}));

		// https://nact.io/ko_kr/lesson/javascript/%EC%A7%88%EC%9D%98%ED%95%98%EA%B8%B0
		it('04_Waiting Response', mochaIt(async (done) => {
			// 액터 시스템을 시작하고 참조를 반환한다.
			const system = NACT.start();

			const greeting = NACT.spawnStateless(
				// 부모(상위) 액터 참조, 여기서는 ActorSystem(최상위 액터)
				system,

				// 메시지 핸들러 함수
				(msg, ctx) => {
					NACT.dispatch(msg.sender, msg.name); // ② 받은 sender에게 응답을 되돌려준다
				},

				// 액터의 이름(unique)
				'greeting'
			);

			// 액터에게 요청 보내기
			const result = await NACT.query(greeting, (sender) => Object.assign({ sender, name: 'JeongHyeon Kim' }), 50); // ① sender를 msg에 담아서 보낸다

			// ③ 액터가 dispatch를 할때까지 기다릴 수 있다

			expect(result).to.be.equal('JeongHyeon Kim');

			setTimeout(() => {
				// 액터를 제거
				NACT.stop(greeting);

				// 액터 시스템을 제거
				NACT.stop(system);

				done();
			}, 100);
		}));

		// https://nact.io/ko_kr/lesson/javascript/%EC%A7%88%EC%9D%98%ED%95%98%EA%B8%B0
		it('05_Waiting Response With Async', mochaIt(async (done) => {
			// 액터 시스템을 시작하고 참조를 반환한다.
			const system = NACT.start();

			// spawnStateless도 똑같은 결과가 나온다
			const greeting = NACT.spawn(
				// 부모(상위) 액터 참조, 여기서는 ActorSystem(최상위 액터)
				system,

				// 메시지 핸들러 함수
				async (state = {}, msg, ctx) => {
					await delay(100);
					NACT.dispatch(msg.sender, msg.name);
				},

				// 액터의 이름(unique)
				'greeting'
			);

			async function test(name: string) {
				const result = await NACT.query(greeting, (sender) => Object.assign({ sender, name: name }), 500);
				expect(result).to.be.equal(name);
			}

			const startTime = Date.now();
			// 액터에게 요청 보내기 - 아래 요청들은 순차적으로 처리가 된다
			await Promise.all(['JeongHyeon Kim #1', 'JeongHyeon Kim #2', 'JeongHyeon Kim #3', 'JeongHyeon Kim #4'].map(async (name) => {
				await test(name);
			}));
			expect(Date.now() - startTime).to.be.greaterThanOrEqual(200); // delay 값보다 많은 시간이 걸려야한다. 한 액터에 들어오는 모든 요청은 동기로 처리되기 때문이다.

			// 액터를 제거
			NACT.stop(greeting);

			// 액터 시스템을 제거
			NACT.stop(system);

			done();
		}));

		// https://nact.io/ko_kr/lesson/javascript/%EC%95%A1%ED%84%B0%EC%9D%98-%EA%B3%84%EC%B8%B5-%EA%B5%AC%EC%A1%B0
		it('06_Parent -> Child', mochaIt(async (done) => {
			let responsed: boolean = false;

			// 액터 시스템을 시작하고 참조를 반환한다.
			const system = NACT.start();

			const parent = NACT.spawnStateless(
				// 부모(상위) 액터 참조, 여기서는 ActorSystem(최상위 액터)
				system,

				// 메시지 핸들러 함수
				(msg, ctx) => {
					const myChild = ctx.children.get('child');
					if (myChild !== undefined) {
						NACT.dispatch(myChild, msg);
					}
				},

				// 액터의 이름(unique)
				'parent'
			);

			const child = NACT.spawnStateless(
				// 부모(상위) 액터 참조, 여기서는 ActorSystem(최상위 액터)
				parent,

				// 메시지 핸들러 함수
				(msg, ctx) => {
					responsed = true;
				},

				// 액터의 이름(unique)
				'child'
			);

			// 액터에게 요청 보내기
			NACT.dispatch(parent, { name: 'JeongHyeon Kim' });

			setTimeout(() => {
				expect(responsed).to.be.true;

				// 액터를 제거
				NACT.stop(parent);
				NACT.stop(child);

				// 액터 시스템을 제거
				NACT.stop(system);

				done();
			}, 100);
		}));

		// https://nact.io/ko_kr/lesson/javascript/%EC%95%A1%ED%84%B0%EC%9D%98-%EA%B3%84%EC%B8%B5-%EA%B5%AC%EC%A1%B0
		it('07_Child -> Parent', mochaIt(async (done) => {
			let responsed: boolean = false;

			// 액터 시스템을 시작하고 참조를 반환한다.
			const system = NACT.start();

			const parent = NACT.spawnStateless(
				// 부모(상위) 액터 참조, 여기서는 ActorSystem(최상위 액터)
				system,

				// 메시지 핸들러 함수
				(msg, ctx) => {
					responsed = true;
				},

				// 액터의 이름(unique)
				'parent'
			);

			const child = NACT.spawnStateless(
				// 부모(상위) 액터 참조, 여기서는 ActorSystem(최상위 액터)
				parent,

				// 메시지 핸들러 함수
				(msg, ctx) => {
					NACT.dispatch(ctx.parent, msg);
				},

				// 액터의 이름(unique)
				'child'
			);

			// 액터에게 요청 보내기
			NACT.dispatch(child, { name: 'JeongHyeon Kim' });

			setTimeout(() => {
				expect(responsed).to.be.true;

				// 액터를 제거
				NACT.stop(parent);
				NACT.stop(child);

				// 액터 시스템을 제거
				NACT.stop(system);

				done();
			}, 100);
		}));

		// https://nact.io/ko_kr/lesson/javascript/%EA%B4%80%EB%A6%AC-%EA%B0%90%EB%8F%85-supervision
		it('08_Processing Crash', mochaIt(async (done) => {
			let crashedTime: number = 0;

			// 액터 시스템을 시작하고 참조를 반환한다.
			const system = NACT.start();

			// ! spawnStateless로 액터를 생성하면, onCrash를 받을 수 없다
			// ! 상태가 없기 때문에, 에러가 발생했을때에 초기화 작업이 필요없다.
			const greeting = NACT.spawn(
				// 부모(상위) 액터 참조, 여기서는 ActorSystem(최상위 액터)
				system,

				// 메시지 핸들러 함수
				(state = {}, msg, ctx) => {
					throw 'NACT.spawn - message handler throw!';
				},

				// 액터의 이름(unique)
				'greeting',

				{
					onCrash: async (msg, error, ctx) => {
						// ctx.stop - 예외를 일으킨 액터를 종료
						// ctx.stopAll - 같은 부모를 둔 액터를 모두 종료
						// ctx.reset - 예외를 일으킨 액터의 상태를 초기화
						// ctx.resetAll - 같은 부모를 둔 액터의 상태를 초기화
						// ctx.resume - 현재 상태 그대로 액터를 재개해서 다음 메시지를 계속 처리하도록 함
						// ctx.escalate - 부모 액터로 결정을 넘김

						crashedTime++;

						// 여기서 delay를 쓰면 그만큼 기다린다

						return ctx.resume;
					}
				}
			);

			// 액터에게 요청 보내기
			NACT.dispatch(greeting, { name: 'JeongHyeon Kim1' });
			NACT.dispatch(greeting, { name: 'JeongHyeon Kim2' });

			setTimeout(() => {
				expect(crashedTime).to.be.equal(2);

				// 액터를 제거
				NACT.stop(greeting);

				// 액터 시스템을 제거
				NACT.stop(system);

				done();
			}, 100);
		}));

		// https://nact.io/ko_kr/lesson/javascript/%ED%83%80%EC%9E%84%EC%95%84%EC%9B%83
		it('09_특정 시간동안 요청이 없을시 Actor를 자동 종료', mochaIt(async (done) => {
			let responsed: boolean = false;

			// 액터 시스템을 시작하고 참조를 반환한다.
			const system = NACT.start();

			const greeting = NACT.spawnStateless(
				// 부모(상위) 액터 참조, 여기서는 ActorSystem(최상위 액터)
				system,

				// 메시지 핸들러 함수
				(msg, ctx) => {
					responsed = true;
				},

				// 액터의 이름(unique)
				'greeting',

				{
					shutdownAfter: 100 // 100ms 동안 요청이 들어오지 않으면 자동으로 종료함
				}
			);

			await delay(200); // 200ms를 기다려 액터가 자동 제거 되기를 기다림

			// 액터에게 요청 보내기
			NACT.dispatch(greeting, { name: 'JeongHyeon Kim' });

			setTimeout(() => {
				expect(responsed).to.be.false; // 액터가 제거되어서, 처리가 안된 것을 확인함

				// 액터 시스템을 제거
				NACT.stop(system);

				done();
			}, 300);
		}));
	});
}