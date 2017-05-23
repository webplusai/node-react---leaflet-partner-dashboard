const mongoose = require('mongoose');

const eventNotificationSchema = new mongoose.Schema({

}, { collection: 'EventNotification' });

module.exports = mongoose.model('EventNotification', eventNotificationSchema);
