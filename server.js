require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
const { loadSite } = require('./utils/siteStore');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

app.use('/', require('./routes/site'));
app.use('/admin', require('./routes/admin'));

app.use((req, res) => {
  res.status(404).send('Page not found');
});

const PORT = process.env.PORT || 3000;

// Pehle MongoDB se connect karo aur site data load karo, TABHI server start karo
(async () => {
  try {
    await connectDB();
    await loadSite();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
})();
