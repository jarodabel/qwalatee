const functions = require('firebase-functions');
const axios = require('axios');
const btoa = require('btoa');

const _url = 'https://api.lob.com/v1/letters';

const getHeaders = (env) => {
  const token = env === 'Live' ? functions.config().lob.live_key : functions.config().lob.test_key;
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + btoa(`${token}:`),
    },
  };
};

exports.lobGetLetter = (req) => {
  return new Promise((success, failure) => {
    try {
      if (req.method !== 'POST') {
        const error = new Error('Only POST requests are accepted');
        error.code = 405;
        throw error;
      }
      const id = req.body.id;
      const env = req.query.env;
      const options = getHeaders(env);
      const url = `${_url}/${id}`;

      axios
        .get(url, options)
        .then((res) => {
          return res.data;
        })
        .then((obj) => {
          success(obj);
        })
        .catch((error) => {
          console.log(error)
          if (error.response) {
            console.error(error.response.body);
          }
          failure(error);
        });
    } catch (err) {
      failure('error');
    }
  });
};

exports.lobPostLetter = (req) => {
  return new Promise((success, failure) => {
    try {
      if (req.method !== 'POST') {
        const error = new Error('Only POST requests are accepted');
        error.code = 405;
        throw error;
      }
      const env = req.query.env;
      const options = getHeaders(env);
      const data = req.body;
      axios({
        method: 'post',
        responseType: 'json',
        url: _url,
        data,
        headers: options.headers,
      })
        .then((res) => {
          return res.data;
        })
        .then((data) => {
          success(data);
        })
        .catch((error) => {
          if (error.response) {
            console.error(error.response.body);
          }
          failure(error);
        });
    } catch (err) {
      failure('error');
    }
  });
};
