import * as test from 'tape';

import { syncWaitGroup } from '../src/index';

test('syncWaitGroup is a function', (assert) => {
    assert.equal(typeof syncWaitGroup, 'function',
        'module is a function');

    assert.doesNotThrow(() => {
        syncWaitGroup();
    }, 'does not throw');

    assert.end();
});
