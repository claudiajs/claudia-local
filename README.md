# Claudia-local

[WIP] Run AWS Lambda functions created with Claudia.js locally.

This project is based on [docker-lambda](https://github.com/lambci/docker-lambda) created by [Michael Hart](https://github.com/mhart).

## Example

lambda.js:

```javascript
exports.handler = function (event, context) {
  context.succeed('hello world');
};
```

Run:

```shell
claudia-local --handler lambda.handler
```

Result:

```shell
hello world
```
