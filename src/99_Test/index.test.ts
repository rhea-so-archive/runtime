require('source-map-support').install();
require('colorful-debugger').active();

import { actorBasicTest } from './03_Actor/01_ActorBasic.test';

describe('01_REST', () => {

});

describe('02_Socket.io', () => {

});

describe('03_Actor', () => {
	actorBasicTest();
});