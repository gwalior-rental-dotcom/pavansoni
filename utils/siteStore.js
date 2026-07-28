const fs = require('fs');
const path = require('path');
const Site = require('../models/Site');

// Sirf pehli baar (jab DB khaali ho) seed karne ke liye purani JSON file use hogi
const SEED_FILE = path.join(__dirname, '..', 'data', 'site.json');

let cache = null;

// Server start hote waqt ek baar call hota hai — MongoDB se data la ke cache me rakhta hai
async function loadSite() {
  let doc = await Site.findOne({});
  if (!doc) {
    // Database khaali hai (pehli baar) — purani site.json se seed karo
    const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
    doc = await Site.create(seed);
    console.log('Site data seeded into MongoDB from data/site.json');
  }
  cache = doc.toObject();
  delete cache._id;
  delete cache.__v;
  delete cache.createdAt;
  delete cache.updatedAt;
  return cache;
}

// Baaki poora app (admin.js, site.js) yahi functions pehle jaisa hi call karta rahega
function getSite() {
  return cache;
}

function saveSite(data) {
  cache = data; // turant memory me update, taaki response turant naya data dikhaye
  Site.findOneAndUpdate({}, { $set: data }, { upsert: true }).catch(err => {
    console.error('MongoDB save failed:', err.message);
  });
  return cache;
}

function updateSite(partial) {
  const merged = { ...cache, ...partial };
  return saveSite(merged);
}

module.exports = { getSite, saveSite, updateSite, loadSite };
