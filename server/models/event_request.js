const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.Promise = require('bluebird');

const EventRequestSchema = new Schema({}, { collection: 'EventRequest' });

module.exports = mongoose.model('EventRequest', EventRequestSchema);
