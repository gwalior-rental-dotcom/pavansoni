const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

module.exports = mongoose.model('Site', siteSchema);
