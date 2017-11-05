'use strict'

const spawn = require('child_process').spawn

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
module.exports = function run(options) {
  options = options || {}
  const dockerImage = options.dockerImage || 'lambci/lambda'
  const handler = options.handler || 'index.handler'
  const event = options.event || {}
  const taskDir = options.taskDir == null ? process.cwd() : options.taskDir
  const cleanUp = options.cleanUp == null ? true : options.cleanUp
  const addEnvVars = options.addEnvVars || false
  const dockerArgs = options.dockerArgs || []
  const spawnOptions = options.spawnOptions || {
    encoding: 'utf8',
    stdio: 'inherit',
    shell: true
  }
  const returnSpawnResult = options.returnSpawnResult || false

  const args = ['run']
    .concat(taskDir ? ['-v', `${taskDir}:/var/task`] : [])
    .concat(cleanUp ? ['--rm'] : [])
    .concat(addEnvVars ? ENV_ARGS : [])
    .concat(dockerArgs)
    .concat([dockerImage, handler, JSON.stringify(event)])

  const dockerProcess = spawn('docker', args, spawnOptions)

  const timeout = setTimeout(() => {
    dockerProcess.kill('SIGKILL')
    console.log('☠️')
  }, options.timeout * 1000)

  dockerProcess.on('close', () => clearTimeout(timeout))

  return dockerProcess
}
