const sendEmail = require('./contact-us');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendEmail = functions.https.onRequest(async (req, res) => {
  sendEmail.sendgridEmail(req);
});
