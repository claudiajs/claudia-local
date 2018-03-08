#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const minimist = require('minimist')
const dockerLambda = require('../lib/docker-lambda-wrapper')
const getAWSCredentials = require('../lib/get-aws-credentials')
const patchRole = require('../lib/patch-role')

function readArgs() {
  return minimist(process.argv.slice(1), {
    string: ['event', 'handler', 'memory', 'profile', 'region', 'role', 'runtime', 'source', 'timeout'],
    default: {
      event: {},
      memory: 128,
      profile: 'default',
      region: 'us-east-1',
      runtime: 'nodejs6.10',
      source: process.cwd(),
      timeout: 3,
      config: path.join(process.cwd(), 'claudia.json')
    }
  })
}

function setup(args) {
  const dockerArgs = [
    '-m', `${args.memory}M`,
    '-e', `AWS_LAMBDA_FUNCTION_MEMORY_SIZE=${args.memory}`,
    '-e', `AWS_LAMBDA_FUNCTION_TIMEOUT=${args.timeout}`,
    '-e', `AWS_REGION=${args.region}`
  ]

  return getAWSCredentials(args.role, args.profile)
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

      return dockerLambda(options)
    })
}

function cmd(console) {
  const args = readArgs()
  const command = args._ && args._.length && args._[1]

  if (fs.existsSync(args.config)) {
    const claudiaJson = require(args.config)
    // Override default args with values from claudia.json
    args.role = args.role || claudiaJson.lambda.role
    args.region = (args.region === 'us-east-1') ? claudiaJson.lambda.region : args.region
  }

  if (command === 'patch-role') {
    return patchRole(args.role, args.arn)
      .then(() => console.log('Role trust policy is patched. You can run `claudia-local` now.'))
      .catch(console.error)
  } else if (command) {
    return console.log('Unsupported command. Run `claudia-local -h` for more info.')
  }

  if (args.memory < 128 || args.memory > 1.5 * 1024 || args.memory % 64 > 0)
    throw new RangeError('You can set your memory in 64MB increments from 128MB to 1.5GB. Memory must be in MBs.')

  if (args.timeout < 3 || args.timeout > 300)
    throw new RangeError('You can set your timeout from 3 to 300 seconds.')

  if (['nodejs4.3', 'nodejs6.10'].indexOf(args.runtime) < 0)
    throw new Error('You can set your runtime to either "nodejs6.10" (default one) or "nodejs4.3".')

  return setup(args)
    .catch(err => {
      const errorRegex = /^User: ?(arn:aws:iam::[0-9]{12}:user\/[a-zA-Z0-9]{2,}) is not authorized to perform: sts:AssumeRole/
      
      if (err.code === 'AccessDenied' && errorRegex.test(err.message)) {
        const match = err.message.match(errorRegex)
        console.log(err.message)
        console.log(`Run the "claudia-local patch-role --arn ${match[1]}" command to patch assume role policy.`)
      } else {
        console.error(err)
      }
    })
}

if (require.main === module)
  cmd(console)

module.exports = cmd
