'use strict';

const crypto = require('crypto');
const AWS = require('aws-sdk');

AWS.config.apiVersions = {
  ssm: '2014-11-06'
};
AWS.config.region = process.env.REGION || 'eu-west-1';

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
        return reject(new Error('"GitHubWebhookSecret" not found'));
      }
      return resolve(data.Parameters[0].Value);
    });
  });
}

const testData = {
  'action': 'published',
  'release': {
    'tag_name': '2.1.7',
    'target_commitish': 'master',
    'name': 'test',
    'draft': false,
    'author': {
      'login': 'CompareTheMarket',
    },
    'prerelease': false,
    'assets': [
      {
        'name': 'cloudkat-linux',
        'browser_download_url': 'https://github.com/CompareTheMarket/cloudkat/releases/download/2.1.7/cloudkat-linux'
      }
    ],
    'tarball_url': 'https://api.github.com/repos/CompareTheMarket/cloudkat/tarball/2.1.7',
    'zipball_url': 'https://api.github.com/repos/CompareTheMarket/cloudkat/zipball/2.1.7',
  },
  'repository': {
    'id': 83574183,
    'name': 'cloudkat',
    'full_name': 'CompareTheMarket/cloudkat',
    'private': true,
    'default_branch': 'master'
  }
};

getSecret()
  .then(secret => {
    const hmac = crypto.createHmac('sha1', secret);
    const body = JSON.stringify(testData);
    hmac.update(body);
    const event = {
      headers: {
        'X-Hub-Signature': `sha1=${hmac.digest('hex')}`
      },
      body: JSON.stringify(testData)
    };
    console.log(JSON.stringify(event, null, 2));
  })
  .catch(err => {
    console.log(err);
  });
