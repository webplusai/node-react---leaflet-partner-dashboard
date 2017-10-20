import compact from 'lodash/compact';
import axios from 'axios';

import { API_URI, UPLOAD_HOST, PARSE_APPLICATION_ID, PARSE_MASTER_KEY, API_URI_BATCH } from '../config';

function headers() {
  return {
    headers: {
      'X-Parse-Application-Id': PARSE_APPLICATION_ID,
      'X-Parse-Master-Key': PARSE_MASTER_KEY,
      'Content-Type': 'application/json',
    }
  };
}

export default class apiRequest {
  static get(path, id = null, params = null) {
    return axios.get(`${API_URI}/${[compact([path, id]).join('/'), params].join('')}`, headers());
  }

  static post(path, data) {
    return axios.post(`${API_URI}/${path}`, data, headers());
  }

  //Added by Dayong on 11/17/2017 - for bulk-uploading events
  static batchPost(data) {
      return axios.post(`${API_URI_BATCH}`, data, headers());
  }

  static put(path, id, data) {
    return axios.put(`${API_URI}/${compact([path, id]).join('/')}`, data, headers());
  }

  static delete(path, id) {
    return axios.delete(`${API_URI}/${compact([path, id]).join('/')}`, headers());
  }

  static authGet(path) {
    return axios.get(`${UPLOAD_HOST}/${path}`, headers());
  }

  //Added by Dayong on 11/19/2017 - for email verification
  static authVerifyEmail(path, code) {
      console.log(`${UPLOAD_HOST}/${path}/${code}`);
      return axios.get(`${UPLOAD_HOST}/${path}/${code}`, headers());
  }

  static authToken(token) {
    return axios.get(`${UPLOAD_HOST}/token`, { headers: { authorization: token } });
  }

  static authPost(path, data) {
    return axios.post(`${UPLOAD_HOST}/${path}`, data);
  }

  static stripeGet(token, path = null) {
    return axios.get(`${UPLOAD_HOST}/${compact(['stripe', path]).join('/')}`, { headers: { authorization: token } });
  }
  //Added by Dayong on 11/19/2017 - for account balance
  static stripeGetBalance(token, cusId, path = null) {
      return axios.get(`${UPLOAD_HOST}/${compact(['stripe',cusId, path]).join('/')}`, { headers: { authorization: token } });
  }

  static stripePost(token, data = {}) {
    return axios.post(`${UPLOAD_HOST}/stripe`, data, { headers: { authorization: token } });
  }

  static stripeDelete(token, itemID) {
    return axios.delete(`${UPLOAD_HOST}/stripe/${itemID}`, { headers: { authorization: token } });
  }


}