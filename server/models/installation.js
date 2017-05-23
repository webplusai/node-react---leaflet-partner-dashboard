const mongoose = require('mongoose');

const installationSchema = new mongoose.Schema({

}, { collection: '_Installation' });

module.exports = mongoose.model('Installation', installationSchema);
