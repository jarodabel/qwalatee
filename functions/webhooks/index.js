var admin = require('firebase-admin');
const functions = require("firebase-functions")

exports.lobEvent = (req) => {
  return new Promise((resolve, reject) => {
    try {
      const db = admin.firestore();
      const data = req.body

      let collectionRef;
      const success = (documentRef) => {
        functions.logger.log(`Added document at ${documentRef.path})`);
        resolve("endpoint for lob webhooks");
      };
      const failure = (error) => {
        functions.logger.error(error);
        reject("error");
      };
      collectionRef = db.collection('lob-events');
      collectionRef.add(data).then(success).catch(failure);
    }
    catch (err) {
      functions.logger.error(err);
      reject("error");
    }
  });
}

