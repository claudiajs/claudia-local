#!/usr/bin/env node

const minimist = require('minimist')
const dockerLambda = require('../lib/docker-lambda-wrapper')
const getAWSCredentials = require('../lib/get-aws-credentials')

function readArgs() {
  return minimist(process.argv.slice(1), {
    string: ['event', 'handler', 'memory', 'profile', 'runtime', 'source', 'timeout'],
    default: {
      event: {},
      memory: 128,
      profile: 'default',
      runtime: 'nodejs6.10',
      source: process.cwd(),
      timeout: 3
    }
  })
}

function cmd(console) {
  const args = readArgs()

  if (args.memory < 128 || args.memory > 1.5 * 1024 || args.memory % 64 > 0)
    throw new RangeError('You can set your memory in 64MB increments from 128MB to 1.5GB. Memory must be in MBs.')

  if (args.timeout < 3 || args.timeout > 300)
    throw new RangeError('You can set your timeout from 3 to 300 seconds.')

  if (['nodejs4.3', 'nodejs6.10'].indexOf(args.runtime) < 0)
    throw new Error('You can set your runtime to either "nodejs6.10" (default one) or "nodejs4.3".')

  const dockerArgs = [
    '-m', `${args.memory}M`,
    '-e', `AWS_LAMBDA_FUNCTION_MEMORY_SIZE=${args.memory}`,
    '-e', `AWS_LAMBDA_FUNCTION_TIMEOUT=${args.timeout}`
  ]

  getAWSCredentials(args.profile)
    .then(credentials => {
      if (credentials !== null) {
        dockerArgs.push('-e')
        dockerArgs.push(`AWS_ACCESS_KEY_ID=${credentials.aws_access_key_id}`)
        dockerArgs.push('-e')
        dockerArgs.push(`AWS_SECRET_ACCESS_KEY=${credentials.aws_secret_access_key}`)
      }

      const options = {
        dockerImage: `lambci/lambda:${args.runtime}`,
        event: args.event,
        handler: args.handler,
        timeout: args.timeout,
        dockerArgs: dockerArgs
      }

      const dockerProcess = dockerLambda(options)
    })
}

if (require.main === module)
  cmd(console)

module.exports = cmd
