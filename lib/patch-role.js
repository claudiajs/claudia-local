'use strict'

const aws = require('aws-sdk')
const iamInstance = new aws.IAM()

function patchRole(role, arn, iam = iamInstance) {
  if (!role)
    return Promise.reject('Role is required')

  if (!arn)
    return Promise.reject('ARN is required')

  return iam.getRole({
    RoleName: role
  })
    .promise()
    .then(response => {
      const assumeRolePolicyDocument = JSON.parse(unescape(response.Role.AssumeRolePolicyDocument))

      const principalArn = assumeRolePolicyDocument.Statement
        .find(statement => statement.Principal && statement.Principal.AWS === arn)

      if (principalArn) {
        return Promise.resolve()
      }

      assumeRolePolicyDocument.Statement.push({
        Effect: 'Allow',
        Principal: {
          AWS: arn
        },
        Action: 'sts:AssumeRole'
      })

      return iam.updateAssumeRolePolicy({
        PolicyDocument: JSON.stringify(assumeRolePolicyDocument),
        RoleName: role
      })
        .promise()
    })
}

module.exports = patchRole
