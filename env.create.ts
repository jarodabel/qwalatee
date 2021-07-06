const fs = require('fs');

const targetPath = './src/environments/environment.ts';

if (process.env.local) {
  require('./env.local');
}

const envConfigFile = `export const environment = {
   blogger: '${process.env.blogger}',
   production: '${process.env.production}',
   firebase: {
     apiKey: '${process.env.firebase_apiKey}',
     authDomain: '${process.env.firebase_authDomain}',
     databaseURL: '${process.env.firebase_databaseURL}',
     projectId: '${process.env.firebase_projectId}',
     storageBucket: '${process.env.firebase_storageBucket}',
     messagingSenderId: '${process.env.firebase_messagingSenderId}',
     appId: '${process.env.firebase_appId}',
     measurementId: '${process.env.firebase_measurementId}',
   },
   sendGrid: '${process.env.sendGrid}',
   web: {
    client_id: '${process.env.web_client_id}',
    project_id: '${process.env.web_project_id}',
    auth_uri: '${process.env.web_auth_uri}',
    token_uri: '${process.env.web_token_uri}',
    auth_provider_x509_cert_url: '${process.env.web_auth_provider_x509_cert_url}',
    client_secret: '${process.env.web_client_secret}',
    javascript_origins: [
      "http://localhost:4200"
    ],
    api_key: '${process.env.web_api_key}',
  }
};
`;

if (!fs.existsSync('./src/environments/')) {
  fs.mkdirSync('./src/environments/', {
    recursive: true,
  });
}

fs.writeFile(targetPath, envConfigFile, { flag: 'w' }, (err) => {
  if (err) {
    throw console.error(err);
  } else {
    console.log(
      `Angular environment.ts file generated correctly at ${targetPath} \n`
    );
  }
});
