'use strict';

const AWS = require('aws-sdk');

AWS.config.apiVersions = {
  lambda: '2015-03-31',
};

AWS.config.region = process.env.REGION || 'eu-west-1';

// validateSignature should be passed the entire event object from your lambda function
function validateSignature(event) {
  return new Promise((resolve, reject) => {
    // create a lambda service object with the parameters below
    const lambda = new AWS.Lambda();
    const params = {
      FunctionName: 'githubSignatureVerifier',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify(event)
    };
    // invoke the githubSignatureVerifier lambda function
    lambda.invoke(params, (err, data) => {
      // an error means the invoke request could not be completed
      if (err) return reject(err);
      // IMPORTANT - data.Status code below is NOT the status code returned by the githubSignatureVerifier function
      // it is the status code returned by the AWS request to attempt to invoke the function
      // in ALL cases this should be 200. If it's not then we should treat it as a Server Error
      if (data.StatusCode !== 200) {
        return reject(new Error(`Received ${data.StatusCode} status when invoking githubSignatureVerifier`));
      }
      // here we want to resolve with the actual response from the githubSignatureVerifier function (data.Payload)
      // the receiver should propagate this response if the status code is NOT 200
      return resolve(JSON.parse(data.Payload));
    });
  });
}

exports.handler = (event, context, callback) => {

  // validate the signature in this request / event
  validateSignature(event)
    // the reponse is the response from the githubSignatureVerifier function
    .then(response => {
      // if the response is NOT a 200 response, propagate the response
      if (response.statusCode !== 200) {
        // return callback(null, respond(response.statusCode, JSON.parse(response.body).message));
        return callback(null, {
          headers: {},
          statusCode: response.statusCode,
          body: response.body
        });
      }
      // otherwise the signature was valid so we can continue
      // doStuff()
    })
    // catch any errors - invalid signatures are not an error and are handled by the code above
    .catch(err => {
      console.log(err);
      return callback(null, {
        headers: {},
        statusCode: 500,
        body: JSON.stringify({
          message: 'Server Error'
        })
      });
    });
};
