var admin = require('firebase-admin');
const functions = require("firebase-functions")

exports.lobEvent = (req) => {
  return new Promise((resolve, reject) => {
    try {
      const db = admin.firestore();
      const data = req.body
      if(!data.id || !data.reference_id || !data.event_type) {
        reject("Invalid request");
      }

      const evt = {
        id: data.id,
        reference_id: data.reference_id,
        ...data.event_type,
      }

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
      collectionRef.doc(data.id).set(evt).then(success).catch(failure);
    }
    catch (err) {
      functions.logger.error(err);
      reject("error");
    }
  });
}

