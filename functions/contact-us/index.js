'use strict';

// * curl -X POST "https://us-central1-pdsa-oskee.cloudfunctions.net/sendEmail?sg_key=" --data '{"to":"karleaabel@gmail.com","from":"arodjabel@gmail.com","subject":"I love you ","body":"from llamas computer"}' --header "Content-Type: application/json"

const sgMail = require('@sendgrid/mail');
/**
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.query The parsed querystring.
 * @param {string} req.query.sg_key Your SendGrid API key.
 * @param {object} req.body The request payload.
 * @param {string} req.body.to Email address of the recipient.
 * @param {string} req.body.from Email address of the sender.
 * @param {string} req.body.subject Email subject line.
 * @param {string} req.body.text Body of the email subject line.
 * @param {string} req.body.html Body of the email subject line.
 * @param {object} res Cloud Function response context.
 */
exports.sendgridEmail = async (req) => {
  return new Promise((success, failure) => {
    try {
      if (req.method !== 'POST') {
        const error = new Error('Only POST requests are accepted');
        error.code = 405;
        throw error;
      }

      sgMail.setApiKey(req.query.sg_key);
      const msg = {
        to: req.body.to,
        from: req.body.from,
        html: req.body.html,
        subject: req.body.subject,
        text: req.body.text,
      };
      // Make the request to SendGrid's API
      console.log(`Sending email to: ${req.body.to}`);
      // const response = await client.API(request);
      sgMail.send(msg).then(
        () => {
          success();
        },
        (error) => {
          console.error(error);
          if (error.response) {
            console.error(error.response.body);
          }
          failure();
        }
      );
    } catch (err) {
      console.error(err);
      failure();
    }
  })

};
