'use strict'

const exec = require('child_process').exec

function execPromise(command, options) {
  return new Promise((resolve, reject) => {
    exec(command, options, (err, stdout, stderr) => {
      if (err)
        return reject(err)

      if (stdout)
        return resolve(stdout)

      if (stderr)
        return reject(stderr)
    })
  })
}

function getAWSCredentials(profile = 'default') {
  return execPromise('aws help')
    .then(() => {
      return Promise.all([
        execPromise(`aws configure get aws_access_key_id --profile ${profile}`),
        execPromise(`aws configure get aws_secret_access_key --profile ${profile}`)
      ])
        .then(result => ({
          aws_access_key_id: result[0].split('\n')[0],
          aws_secret_access_key: result[1].split('\n')[0]
        }))
    })
    .catch(() => null)
}

module.exports = getAWSCredentials
