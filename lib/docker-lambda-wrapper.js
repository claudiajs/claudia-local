'use strict'

const spawnSync = require('child_process').spawnSync

const ENV_VARS = [
  'AWS_REGION',
  'AWS_DEFAULT_REGION',
  'AWS_ACCOUNT_ID',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SESSION_TOKEN',
  'AWS_LAMBDA_FUNCTION_NAME',
  'AWS_LAMBDA_FUNCTION_VERSION',
  'AWS_LAMBDA_FUNCTION_MEMORY_SIZE',
  'AWS_LAMBDA_FUNCTION_TIMEOUT',
  'AWS_LAMBDA_FUNCTION_HANDLER',
  'AWS_LAMBDA_EVENT_BODY',
]
const ENV_ARGS = [].concat.apply([], ENV_VARS.map(x => ['-e', x]))

// Will spawn `docker run` synchronously and return stdout
module.exports = function runSync(options) {
  options = options || {}
  const dockerImage = options.dockerImage || 'lambci/lambda'
  const handler = options.handler || 'index.handler'
  const event = options.event || {}
  const taskDir = options.taskDir == null ? process.cwd() : options.taskDir
  const cleanUp = options.cleanUp == null ? true : options.cleanUp
  const addEnvVars = options.addEnvVars || false
  const dockerArgs = options.dockerArgs || []
  const spawnOptions = options.spawnOptions || {encoding: 'utf8'}
  const returnSpawnResult = options.returnSpawnResult || false

  const args = ['run']
    .concat(taskDir ? ['-v', `${taskDir}:/var/task`] : [])
    .concat(cleanUp ? ['--rm'] : [])
    .concat(addEnvVars ? ENV_ARGS : [])
    .concat(dockerArgs)
    .concat([dockerImage, handler, JSON.stringify(event)])

  const spawnResult = spawnSync('docker', args, spawnOptions)

  if (returnSpawnResult)
    return spawnResult

  if (spawnResult.error || spawnResult.status !== 0) {
    var err = spawnResult.error
    if (!err) {
      err = new Error(spawnResult.stdout || spawnResult.stderr)
      err.code = spawnResult.status
      err.stdout = spawnResult.stdout
      err.stderr = spawnResult.stderr
    }
    throw err
  }

  // If stdio is inherited, stdout/stderr will be null
  if (spawnResult.stdout == null) return null

  var stdout = spawnResult.stdout.trim().split('\n')
  try {
    return JSON.parse(stdout[stdout.length - 1])
  } catch (err) {
    // This should return undefined and not null to indicate that either the
    // Lambda function had not output or the output could not be parsed. Both
    // cases should be rare and are most likely the result of an issue with the
    // Lambda function.
    return
  }
}
