const environment = require('./environment');

process.env.apiKey = environment.e.firebase.apiKey;
process.env.authDomain = environment.e.firebase.authDomain;
process.env.databaseURL = environment.e.firebase.databaseURL;
process.env.projectId = environment.e.firebase.projectId;
process.env.storageBucket = environment.e.firebase.storageBucket;
process.env.messagingSenderId = environment.e.firebase.messagingSenderId;
process.env.appId = environment.e.firebase.appId;
process.env.measurementId = environment.e.firebase.measurementId;
process.env.blogger = environment.e.blogger;
process.env.production = environment.e.production;
process.env.sendGrid = environment.e.sendGrid;
