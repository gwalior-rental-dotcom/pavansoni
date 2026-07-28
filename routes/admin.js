const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getSite, updateSite, saveSite } = require('../utils/siteStore');
const { requireAdmin } = require('../middleware/auth');

// ---- Image upload setup ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'public', 'uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Only image files allowed'), ok);
  }
});

// backup file upload (json), reuse same uploads dir then delete after import
const backupUpload = multer({ dest: path.join(__dirname, '..', 'public', 'uploads') });

// ---- Login ----
router.get('/login', (req, res) => {
  res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { error: 'Invalid username or password' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// ---- Dashboard ----
router.get('/dashboard', requireAdmin, (req, res) => {
  const site = getSite();
  res.render('admin/dashboard', { site, saved: req.query.saved || null });
});

// ---- Update simple text sections ----
router.post('/update/hero', requireAdmin, (req, res) => {
  updateSite({
    brandName: req.body.brandName,
    heroBadge: req.body.heroBadge,
    heroTitle: req.body.heroTitle,
    heroHighlight: req.body.heroHighlight,
    heroSubtitle: req.body.heroSubtitle,
    heroButtonText: req.body.heroButtonText,
    heroSecondaryButtonText: req.body.heroSecondaryButtonText,
    trustText: req.body.trustText,
    leadsGeneratedText: req.body.leadsGeneratedText,
    heroStat1Label: req.body.heroStat1Label,
    heroStat1Value: req.body.heroStat1Value,
    heroStat1Sub: req.body.heroStat1Sub,
    heroStat2Label: req.body.heroStat2Label,
    heroStat2Value: req.body.heroStat2Value,
    heroStat2Sub: req.body.heroStat2Sub
  });
  res.redirect('/admin/dashboard?saved=hero');
});

router.post('/update/problem', requireAdmin, (req, res) => {
  const update = {
    problemEyebrow: req.body.problemEyebrow,
    problemHeading: req.body.problemHeading,
    problemHeadingHighlight: req.body.problemHeadingHighlight,
    problemSubtitle: req.body.problemSubtitle
  };
  try { update.problemCards = JSON.parse(req.body.problemCards); } catch (e) {}
  updateSite(update);
  res.redirect('/admin/dashboard?saved=problem');
});

router.post('/update/solution', requireAdmin, (req, res) => {
  updateSite({
    solutionEyebrow: req.body.solutionEyebrow,
    solutionHeading: req.body.solutionHeading,
    solutionText: req.body.solutionText,
    solutionPoints: req.body.solutionPoints
      ? req.body.solutionPoints.split('\n').map(s => s.trim()).filter(Boolean)
      : []
  });
  res.redirect('/admin/dashboard?saved=solution');
});

router.post('/update/whychoose', requireAdmin, (req, res) => {
  const update = {
    whyChooseEyebrow: req.body.whyChooseEyebrow,
    whyChooseHeading: req.body.whyChooseHeading,
    whyChooseSubtitle: req.body.whyChooseSubtitle
  };
  try { update.whyChooseCards = JSON.parse(req.body.whyChooseCards); } catch (e) {}
  updateSite(update);
  res.redirect('/admin/dashboard?saved=whychoose');
});

router.post('/update/process', requireAdmin, (req, res) => {
  const update = {
    processEyebrow: req.body.processEyebrow,
    processHeading: req.body.processHeading,
    processSubtitle: req.body.processSubtitle
  };
  try { update.processSteps = JSON.parse(req.body.processSteps); } catch (e) {}
  updateSite(update);
  res.redirect('/admin/dashboard?saved=process');
});

router.post('/update/results', requireAdmin, (req, res) => {
  const update = {
    resultsEyebrow: req.body.resultsEyebrow,
    resultsHeading: req.body.resultsHeading,
    resultsSubtitle: req.body.resultsSubtitle
  };
  try { update.resultsStats = JSON.parse(req.body.resultsStats); } catch (e) {}
  try { update.caseStudies = JSON.parse(req.body.caseStudies); } catch (e) {}
  updateSite(update);
  res.redirect('/admin/dashboard?saved=results');
});

router.post('/update/testimonials', requireAdmin, (req, res) => {
  const update = {
    testimonialsEyebrow: req.body.testimonialsEyebrow,
    testimonialsHeading: req.body.testimonialsHeading
  };
  try { update.testimonials = JSON.parse(req.body.testimonials); } catch (e) {}
  updateSite(update);
  res.redirect('/admin/dashboard?saved=testimonials');
});

router.post('/update/about', requireAdmin, (req, res) => {
  updateSite({
    aboutEyebrow: req.body.aboutEyebrow,
    aboutHeading: req.body.aboutHeading,
    aboutText: req.body.aboutText,
    experienceYears: req.body.experienceYears,
    aboutChecklist: req.body.aboutChecklist
      ? req.body.aboutChecklist.split('\n').map(s => s.trim()).filter(Boolean)
      : []
  });
  res.redirect('/admin/dashboard?saved=about');
});

router.post('/update/contact', requireAdmin, (req, res) => {
  updateSite({
    contactEyebrow: req.body.contactEyebrow,
    contactHeading: req.body.contactHeading,
    contactSubtitle: req.body.contactSubtitle,
    contactChecklist: req.body.contactChecklist
      ? req.body.contactChecklist.split('\n').map(s => s.trim()).filter(Boolean)
      : [],
    whatsappNumber: (req.body.whatsappNumber || '').replace(/[^0-9]/g, ''),
    phone: req.body.phone,
    email: req.body.email,
    footerText: req.body.footerText
  });
  res.redirect('/admin/dashboard?saved=contact');
});

// ---- Image uploads ----
router.post('/upload/hero-image', requireAdmin, upload.single('heroImage'), (req, res) => {
  if (req.file) updateSite({ heroImage: '/uploads/' + req.file.filename });
  res.redirect('/admin/dashboard?saved=heroImage');
});

router.post('/upload/about-image', requireAdmin, upload.single('aboutImage'), (req, res) => {
  if (req.file) updateSite({ aboutImage: '/uploads/' + req.file.filename });
  res.redirect('/admin/dashboard?saved=aboutImage');
});

// ---- Backup: export current content as JSON (download before redeploying) ----
router.get('/export', requireAdmin, (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename=site-backup.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(getSite(), null, 2));
});

// ---- Backup: restore content from a previously exported JSON file ----
router.post('/import', requireAdmin, backupUpload.single('backupFile'), (req, res) => {
  try {
    if (req.file) {
      const parsed = JSON.parse(fs.readFileSync(req.file.path, 'utf-8'));
      saveSite(parsed);
      fs.unlinkSync(req.file.path); // clean up temp copy
    }
    res.redirect('/admin/dashboard?saved=import');
  } catch (e) {
    res.redirect('/admin/dashboard?saved=import-failed');
  }
});

module.exports = router;
