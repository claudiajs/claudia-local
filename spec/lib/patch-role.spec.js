'use strict'

const underTest = require('../../lib/patch-role')

describe('Patch role', () => {
  it('should export a function', () => {
    expect(typeof underTest).toBe('function')
  })

  it('should return a promise', () => {
    const result = underTest().catch(() => {})
    expect(result instanceof Promise).toBeTruthy()
    expect(typeof result.then).toBe('function')
  })

  it('should reject the promise if role is not passed', done => {
    underTest()
      .then(done.fail)
      .catch(err => {
        expect(err).toBe('Role is required')
        done()
      })
  })

  it('should reject the promise if ARN is not passed', done => {
    underTest('role')
      .then(done.fail)
      .catch(err => {
        expect(err).toBe('ARN is required')
        done()
      })
  })
})