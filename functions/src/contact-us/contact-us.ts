const sgMail = require('@sendgrid/mail');
exports.sendEmail = functions.https.onRequest(async (req, res) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const body = req.body;
  console.log(body);
  const msg = {
    to: 'arodjabel@gmail.com',
    from: 'test@example.com',
    subject: 'Sending with Twilio SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };
  sgMail.send(msg);
});
