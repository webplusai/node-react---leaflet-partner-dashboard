const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.Promise = require('bluebird');

const UserLocationSchema = new Schema({}, { collection: 'UserLocation' });

module.exports = mongoose.model('UserLocation', UserLocationSchema);
