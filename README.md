# github-signature-verifier
A NodeJS Lambda function to verify signatures sent in GitHub Webhooks


#### Why
In order to have Lambda functions which are triggered by GitHub Webhooks, we need to provide an endpoint for GitHub to send the payload to.
This can be done using API Gateway, but API Gateway endpoints are public.
In order to secure the API endpoints, we need authentication to verify that requests made to it are genuine and have originated from our own GitHub account.

#### How
GitHub allows to us to define a [secret](https://developer.github.com/webhooks/securing/) to be used with a Webhook payload.
If a secret has been added to the Webhook in GitHub, it will be used in combination with the Webhook payload to generate a signature which will be sent in the `X-Hub-Signature` header of the API request. The signature generated by GitHub uses an HMAC hexdigest resulting in a SHA1 hash.
In order to verify this signature in our Lambda functions, we need to take the request body we've received along with our own copy of the secret, generate the HMAC-SHA1 hash and compare it to the hash we received from GitHub in the `X-Hub-Signature` header. If the hashes match, we know that the request we've received is a genuine request from our own GitHub account and the payload has not been tampered with.

#### Signature Verification Flow
![alt tag](https://github.com/antonosmond/github-signature-verifier/blob/master/GitHubSignatureVerificationFlow.png)

#### The Secret
The secret used by the `githubSignatureVerifier` function is stored and encrypted in AWS Parameter Store with the name `GitHubWebhookSecret`. It is the value of this parameter which should be added to your GitHub Webhooks.

#### Usage
To avoid repeating the verification logic in multiple places and to ensure other functions don't need access to the secret, the `githubSignatureVerifier` function will handle the signature verification and can be invoked by other Lambda functions which need it. You will need to invoke the `githubSignatureVerifier` function from within your own function and a detailed example can be found [here](src/example.js).

#### Testing your Lambda function
Use the [create-test-event.js](src/create-test-event.js) file in this repo to generate Lambda test events for testing signature verification:
```sh
node create-test-event.js
```
