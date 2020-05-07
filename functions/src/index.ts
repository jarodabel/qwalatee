const functions = require('firebase-functions');
const contact = require('./contact-us/contact-us');

const admin = require('firebase-admin');
admin.initializeApp();
exports.contactUs = contact.sendEmail;
