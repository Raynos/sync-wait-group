import * as test from 'tape';
import * as CollapsedAssert from 'collapsed-assert';

import { WaitGroup } from '../src/index';

process.on('unhandledRejection', (err) => { throw err; });

function rethrow(err: Error): void {
    process.nextTick(() => { throw err; });
}

async function testWaitGroup(
    assert: CollapsedAssert, wg1: WaitGroup, wg2: WaitGroup
): Promise<void> {
    const n = 16;

    const exitedArr: boolean[] = [];
    const promises: Promise<void>[] = [];
    wg1.add(n);
    wg2.add(n);

    for (let i = 0; i < n; i++) {
        promises.push((async () => {
            wg1.done();
            await wg2.wait();
            exitedArr.push(true);
        })());
    }

    await wg1.wait();
    for (let i = 0; i < n; i++) {
        assert.equal(exitedArr.length, 0);
        wg2.done();
    }
    for (let i = 0; i < n; i++) {
        await promises[i];
        assert.equal(exitedArr[i], true);
    }
}

test('TestWaitGroup', async (assert) => {
    const wg1 = new WaitGroup();
    const wg2 = new WaitGroup();

    const cassert = new CollapsedAssert();
    await testWaitGroup(cassert, wg1, wg2);
    cassert.report(assert, 'assertions passed');

    assert.end();
});

test('TestWaitGroupMisuse', (assert) => {
    process.on('uncaughtException', uncaught);

    let didThrow = false;
    const wg = new WaitGroup();
    wg.add(1);
    wg.done();
    wg.done();

    setImmediate(() => {
        assert.equal(didThrow, true);

        assert.end();
    });

    function uncaught(err: Error): void {
        process.removeListener('uncaughtException', uncaught);

        assert.equal(err.message,
            'sync: negative WaitGroup counter');
        didThrow = true;
    }
});

test('TestWaitGroupRace', async (assert) => {
    const cassert = new CollapsedAssert();
    for (let i = 0; i < 1000; i++) {
        const wg = new WaitGroup();
        let n = 0;

        wg.add(1);
        (async () => {
            n++;
            wg.done();
        })().catch(rethrow);

        wg.add(1);
        (async () => {
            n++;
            wg.done();
        })().catch(rethrow);

        await wg.wait();
        cassert.equal(n, 2);
    }

    cassert.report(assert, 'all asserts passed');
    assert.end();
});
