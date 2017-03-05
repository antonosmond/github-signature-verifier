'use strict';

const AWS = require('aws-sdk');
const crypto = require('crypto');

AWS.config.apiVersions = {
  ssm: '2014-11-06'
};
AWS.config.region = process.env.REGION || 'eu-west-1';

function validEvent(event) {
  if (!event.headers || !event.headers['X-Hub-Signature']) {
    return false;
  }
  if (!/^sha1=[0-9a-f]{40}/.test(event.headers['X-Hub-Signature'])) {
    return false;
  }
  if (!event.body || typeof(event.body) !== 'string') {
    return false;
  }
  return true;
}

function getSecret() {
  return new Promise((resolve, reject) => {
    const ssm = new AWS.SSM();
    const params = {
      Names: ['GitHubWebhookSecret'],
      WithDecryption: true
    };
    ssm.getParameters(params, (err, data) => {
      if (err) return reject(err);
      if (!data.Parameters.length) {
        return reject(new Error('GitHubWebhookSecret not found'));
      }
      return resolve(data.Parameters[0].Value);
    });
  });
}

function validSignature(event, secret) {
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(event.body);
  const expectedSignature = hmac.digest('hex');
  const requestSignature = event.headers['X-Hub-Signature'].split('=')[1];
  return requestSignature === expectedSignature;
}

function respond(statusCode, msg) {
  const response = {
    headers: {},
    statusCode: statusCode || 500,
    body: '{}'
  };
  if (msg) {
    response.body = JSON.stringify({
      message: msg
    });
  }
  return response;
}

exports.handler = (event, context, callback) => {

  // log the event and context for debugging
  console.log(event);
  console.log(context);

  // if the event doesn't contain what we need to perform signature verification, respond with '400 Bad Request'
  if (!validEvent(event)) {
    return callback(null, respond(400, 'Bad Request'));
  }

  // get our copy of the secret from the AWS parameter store
  getSecret()
    .then(secret => {
      // if the signature is not valid, respond with '401 Unauthorized'
      if (!validSignature(event, secret)) {
        return callback(null, respond(401, 'Unauthorized'));
      }
      // the signature is calid so respond with '200 OK'
      return callback(null, respond(200, 'Signature verification successfull'));
    })
    .catch(err => {
      // trap any errors and respond with '500 Server Error'
      console.log(err);
      return callback(null, respond(500, 'Server Error'));
    });

};
