'use strict'

const aws = require('aws-sdk')

function getAWSCredentials(role, profile = 'default') {
  const iam = new aws.IAM()
  const sts = new aws.STS()

  return iam.getRole({
    RoleName: role
  }).promise()
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

