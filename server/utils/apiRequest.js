const axios = require('axios');

const headers = {
  'Content-Type': 'application/json',
  'X-Parse-Application-Id': process.env.PARSE_APPLICATION_ID,
  'X-Parse-Master-Key': process.env.PARSE_MASTER_KEY,
};

module.exports = {
  get(path, params) {
    const url = `http://${process.env.API_HOST}/parse/classes/${path}`;
    return axios.get(url, { params, headers, });
  }
};