'use strict'

const aws = require('aws-sdk')
const iamInstance = new aws.IAM()
const stsInstance = new aws.STS()

function getAWSCredentials(
  role,
  profile = 'default',
  iam = iamInstance,
  sts = stsInstance
) {
  if (!role) return Promise.reject('Role is required')

  return iam.getRole({
    RoleName: role
  })
    .promise()
    .then(response => {
      const arn = response.Role.Arn

      return sts.assumeRole({
        RoleArn: arn,
        RoleSessionName: 'claudia-local'
      }).promise()
    })
    .then(response => {
      const credentials = response.Credentials

      return {
        aws_access_key_id: credentials.AccessKeyId,
        aws_secret_access_key: credentials.SecretAccessKey
      }
    })
}

module.exports = getAWSCredentials

