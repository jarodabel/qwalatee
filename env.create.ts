const fs = require('fs');

const targetPath = './src/environments/environment.ts';

if (process.env.local) {
  require('./env.local');
}

const envConfigFile = `export const environment = {
   blogger: '${process.env.blogger}',
   production: '${process.env.production}',
   firebase: {
     apiKey: '${process.env.apiKey}',
     authDomain: '${process.env.authDomain}',
     databaseURL: '${process.env.databaseURL}',
     projectId: '${process.env.projectId}',
     storageBucket: '${process.env.storageBucket}',
     messagingSenderId: '${process.env.messagingSenderId}',
     appId: '${process.env.appId}',
     measurementId: '${process.env.measurementId}',
   },
   sendGrid: '${process.env.sendGrid}',
};
`;

fs.writeFile(targetPath, envConfigFile, { flag: 'w' }, (err) => {
  if (err) {
    throw console.error(err);
  } else {
    console.log(
      `Angular environment.ts file generated correctly at ${targetPath} \n`
    );
  }
});
