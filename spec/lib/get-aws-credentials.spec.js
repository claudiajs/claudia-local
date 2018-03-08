'use strict'

const underTest = require('../../lib/get-aws-credentials')

const aws = require('aws-sdk')
let iamMock

describe('Get AWS Credentials for selected role', () => {
  it('should export the function', () => {
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

  it('should invoke iam.getRole when invoked with role name', () => {
    const iamMock = jasmine.createSpyObj('iamMock', ['getRole'])
    iamMock.getRole.and.returnValue({ promise: () => Promise.resolve() })
    underTest('role', 'default', iamMock)
      .catch(() => {})

    expect(iamMock.getRole).toHaveBeenCalled()
  })
})
