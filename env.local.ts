const environment = require('./environment');

process.env.production = environment.e.production;
process.env.blogger = environment.e.blogger;
process.env.sendGrid = environment.e.sendGrid;
// firebase
process.env.firebase_apiKey = environment.e.firebase.apiKey;
process.env.firebase_appId = environment.e.firebase.appId;
process.env.firebase_authDomain = environment.e.firebase.authDomain;
process.env.firebase_databaseURL = environment.e.firebase.databaseURL;
process.env.firebase_measurementId = environment.e.firebase.measurementId;
process.env.firebase_messagingSenderId =
  environment.e.firebase.messagingSenderId;

process.env.firebase_projectId = environment.e.firebase.projectId;
process.env.firebase_storageBucket = environment.e.firebase.storageBucket;
// web
process.env.web_client_id = environment.e.web.client_id;
process.env.web_project_id = environment.e.web.project_id;
process.env.web_auth_uri = environment.e.web.auth_uri;
process.env.web_token_uri = environment.e.web.token_uri;
process.env.web_auth_provider_x509_cert_url =
  environment.e.web.auth_provider_x509_cert_url;
process.env.web_client_secret = environment.e.web.client_secret;
process.env.web_javascript_origins = environment.e.web.javascript_origins;
process.env.web_api_key = environment.e.web.api_key;
