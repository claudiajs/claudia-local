# claudia-local

[WIP] Run AWS Lambda functions created with Claudia.js locally.

This project is based on [docker-lambda](https://github.com/lambci/docker-lambda) created by [Michael Hart](https://github.com/mhart). Inspired by [SAM Local](https://github.com/awslabs/aws-sam-local).

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

![Example in terminal](./assets/example.png)

## Installation

### Prerequisites

Running serverless projects and functions locally requires Docker to be installed and running.

To install docker visit:

- Mac: [Docker for Mac](https://store.docker.com/editions/community/docker-ce-desktop-mac)
- Windows: [Docker Toolbox](https://download.docker.com/win/stable/DockerToolbox.exe)
- Linux: Check your distro’s package manager (for example: `yum install docker`)

Verify that docker is working, and that you can run docker commands from the CLI (for example: `docker ps`). You do not need to install/fetch/pull any containers, that will be done automatically.

### Install from NPM

TBA