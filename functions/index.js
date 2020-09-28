const sendEmail = require('./contact-us');
const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });

const admin = require('firebase-admin');
admin.initializeApp();

exports.sendEmail = functions.https.onRequest(async (req, res) => {
  cors(req, res, () => {
    sendEmail.sendgridEmail(req).then(
      () => {
        res.status(200).send();
      },
      () => {
        res.status(400).send({ message: 'general error' });
      }
    );
  });
});
