const sendEmail = require('./contact-us');
const lobRequest = require('./statements');
const webhook = require('./webhooks');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

exports.sendEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const message = await sendEmail.sendgridEmail(req);
    res.send(JSON.stringify({ message }));
    res.end();
  });
});

exports.postLobRequest = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    lobRequest
      .lobPostLetter(req)
      .then((data) => {
        res.set('Content-Type', 'application/json');
        res.status(200).send(data);
        res.end();
      })
      .catch((err) => {
        console.log(err);
        res.set('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({ message: err }));
        res.end();
      });
  });
});

exports.getLobRequest = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    lobRequest
      .lobGetLetter(req)
      .then((data) => {
        res.set('Content-Type', 'application/json');
        res.status(200).send(data);
        res.end();
      })
      .catch((err) => {
        console.log(err);
        res.set('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({ message: err }));
        res.end();
      });
  });
});

exports.lobEventWebhook = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    webhook.lobEvent(req).then((data) => {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
      res.end();
    })
    .catch((err) => {
      res.set('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({ message: err }));
      res.end();
    });
  });
});
