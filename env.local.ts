const environment = require('./environment');

const isProd = process.env.firebaseEnv === 'prod';
console.log('isProd', isProd);

process.env.production = isProd.toString();
process.env.blogger = environment.e.blogger;
process.env.sendGrid = environment.e.sendGrid;
// firebase
process.env.firebase_apiKey = isProd
  ? environment.e.firebase.apiKey
  : environment.e.firebaseDev.apiKey;
process.env.firebase_appId = isProd
  ? environment.e.firebase.appId
  : environment.e.firebaseDev.appId;
process.env.firebase_authDomain = isProd
  ? environment.e.firebase.authDomain
  : environment.e.firebaseDev.authDomain;
process.env.firebase_databaseURL = isProd
  ? environment.e.firebase.databaseURL
  : environment.e.firebaseDev.databaseURL;
process.env.firebase_measurementId = isProd
  ? environment.e.firebase.measurementId
  : environment.e.firebaseDev.measurementId;
process.env.firebase_messagingSenderId = isProd
  ? environment.e.firebase.messagingSenderId
  : environment.e.firebaseDev.messagingSenderId;
process.env.firebase_projectId = isProd
  ? environment.e.firebase.projectId
  : environment.e.firebaseDev.projectId;
process.env.firebase_storageBucket = isProd
  ? environment.e.firebase.storageBucket
  : environment.e.firebaseDev.storageBucket;
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
