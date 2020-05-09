'use strict'

const test = require('@pre-bundled/tape')

const { WaitGroup } = require('../index')

process.on('unhandledRejection', (maybeErr) => {
  const err = /** @type {Error} */ (maybeErr)
  throw err
})

test('create WG and add', (assert) => {
  const wg = new WaitGroup()

  wg.add(1)

  let finished = false
  const p = (async () => {
    await wg.wait()
    finished = true
  })()

  // eslint-disable-next-line @typescript-eslint/require-await
  const p2 = (async () => {
    assert.equal(finished, false)
    wg.done()
    assert.equal(finished, false)
  })()

  p2
    .then(async () => p)
    .then(() => {
      assert.equal(finished, true)
      assert.end()
    }, null)
})

test('Add twice and done', (assert) => {
  const wg = new WaitGroup()

  wg.add(2)

  let finished = false
  const p = (async () => {
    await wg.wait()
    finished = true
  })()

  // eslint-disable-next-line @typescript-eslint/require-await
  const p2 = (async () => {
    assert.equal(finished, false)
    wg.done()
    assert.equal(finished, false)
    wg.done()
    assert.equal(finished, false)
  })()

  p2
    .then(async () => p)
    .then(() => {
      assert.equal(finished, true)
      assert.end()
    }, null)
})

test('Call done without add', (assert) => {
  const wg = new WaitGroup()

  process.on('uncaughtException', uncaught)

  wg.done()

  /**
   * @param {Error} err
   * @returns {void}
   */
  function uncaught (err) {
    assert.ok(err)
    assert.equal(err.message, 'sync: negative WaitGroup counter')

    process.removeListener('uncaughtException', uncaught)
    assert.end()
  }
})

test('Call wait without add', (assert) => {
  const wg = new WaitGroup()
  let finished = false

  const p = (async () => {
    await wg.wait()
    finished = true
  })()

  p.then(() => {
    assert.equal(finished, true)
    assert.end()
  }, null)
})

test('Call add after done', (assert) => {
  const wg = new WaitGroup()

  process.on('uncaughtException', uncaught)

  wg.add(1)

  let finished = false
  const p = (async () => {
    await wg.wait()
    finished = true
  })()

  // eslint-disable-next-line @typescript-eslint/require-await
  const p2 = (async () => {
    assert.equal(finished, false)
    wg.done()
    assert.equal(finished, false)
  })()

  p2
    .then(async () => p)
    .then(() => {
      wg.add(1)
    }, null)

  /**
   * @param {Error} err
   * @returns {void}
   */
  function uncaught (err) {
    assert.ok(err)
    assert.equal(err.message,
      'sync: WaitGroup misuse: WaitGroup is reused')

    process.removeListener('uncaughtException', uncaught)
    assert.end()
  }
})

test('Double call wait after done', (assert) => {
  const wg = new WaitGroup()
  wg.add(1)

  /**
   * @type {boolean[]}
   */
  const finishedCounters = []

  const p = (async () => {
    await wg.wait()
    finishedCounters[0] = true
  })()

  const p2 = (async () => {
    await wg.wait()
    finishedCounters[1] = true
  })()

  // eslint-disable-next-line @typescript-eslint/require-await
  const p3 = (async () => {
    wg.done()
  })()

  Promise.all([p, p2, p3])
    .then(async () => {
      assert.equal(finishedCounters.length, 2)
      assert.equal(finishedCounters[0], true)
      assert.equal(finishedCounters[1], true)

      return wg.wait()
    })
    .then(() => {
      assert.end()
    }, null)
})
