# Real Estate Lead-Gen Site — Node.js + Express + Admin Panel

Poora backend-driven landing page, ab reference design (floating stat cards,
icon circles, dark process/CTA sections, case-study charts, testimonial
avatars) ke saath. Admin panel se hero, problem section, solution,
why-choose-me, process steps, results + case studies, testimonials, about,
aur contact — sab edit ho sakta hai, images bhi upload ho sakti hain.
Leads seedha WhatsApp par jaate hain — koi database nahi.


## Tech Stack
- Node.js + Express
- EJS templates (server-rendered)
- MongoDB (Atlas free tier) via Mongoose
- express-session + connect-mongo (session store DB me, server restart pe login nahi ukhadta)
- Multer (image uploads)

## 1. Local Setup

```bash
npm install
cp .env.example .env
```

`.env` file kholo aur ye values bharo:

```
PORT=3000
MONGO_URI=<neeche step 2 se milega>
SESSION_SECRET=koi_bhi_random_lambi_string
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<apna strong password>
```

Phir:

```bash
npm run dev        # nodemon ke saath (auto-restart)
# ya
npm start
```

Site: http://localhost:3000
Admin: http://localhost:3000/admin/login

Pehli baar seed data (screenshot jaisa design content) daalne ke liye:

```bash
node seed.js
```

## 2. FREE MongoDB (koi card, koi issue nahi)

1. https://www.mongodb.com/cloud/atlas/register par free account banao
2. "Shared / Free (M0)" cluster create karo (512MB, forever free)
3. Database Access me ek user banao (username + password)
4. Network Access me "Allow access from anywhere" (0.0.0.0/0) add karo
   — kyunki Render/Railway ka IP fixed nahi hota
5. Cluster > Connect > "Drivers" > connection string copy karo, jaise:
   `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/leadgen?retryWrites=true&w=majority`
6. Ye string apne `.env` me `MONGO_URI` me daal do

## 3. FREE Deployment — Render.com (recommended)

Render sabse aasan hai Express apps ke liye, free tier me card nahi mangta.

1. Is project ko GitHub par push karo (naya repo bana ke)
2. https://render.com par jaake GitHub se sign up karo
3. "New +" → "Web Service" → apna repo select karo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. "Environment" tab me apne `.env` wali saari variables add karo
   (MONGO_URI, SESSION_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD) — PORT mat daalo, Render khud deta hai
6. Deploy karo — 2-3 minute me live URL milega (jaise `https://yourname.onrender.com`)

**Note (free tier ka issue jo aata hai):** Render ka free web service 15 min
inactivity ke baad "sleep" ho jaata hai, aur next request pe wapas jaagne me
~30-50 second lagte hain. Ye ek baar ka delay hai, koi crash nahi. Agar ye
avoid karna hai to:
- Ek free "uptime monitor" (jaise UptimeRobot / cron-job.org) laga do jo har
  10 min me site ko ping kare, ya
- Railway.app try karo (free $5/month credit, sleep nahi hota jab tak credit
  khatam na ho)

## 4. Alternative Free Options

| Platform | Free? | Notes |
|---|---|---|
| **Render** | Haan (permanent) | Sleeps after 15 min idle, sabse simple setup |
| **Railway** | $5 credit/month free | Sleep nahi hota, credit khatam hone tak |
| **Cyclic.sh** | Haan | Serverless, thoda alag file-upload handling chahiye |
| **Fly.io** | Haan (limited) | Thoda technical, Docker chahiye |
| MongoDB Atlas | Haan (512MB forever) | Database ke liye |

Beginner ke liye **Render + MongoDB Atlas** combo sabse issue-free hai.

## 5. Admin Panel Kaise Use Karein

1. `/admin/login` par jaake apna ADMIN_USERNAME/PASSWORD daalo
2. Dashboard me har section ek collapsible panel hai (Hero, Problem, Solution,
   Why Choose Me, Process, Results, Testimonials, About, Contact)
3. Simple fields (title, subtitle, text) — seedha textbox me edit karo
4. List wale sections (cards, testimonials, process steps) — JSON format me
   edit hote hain (icon/title/desc jaise fields). Naya item add karna ho to
   JSON array me `{ }` block copy-paste karke naye values daal do
5. Images (Hero photo, About photo) — neeche "Upload" form se seedha file
   select karke upload karo, turant live ho jaayega
6. Contact form se aane wali saari inquiries "Leads" panel me dikhengi

## 6. Security Note

- `.env` file kabhi GitHub par push mat karo (`.gitignore` me already excluded hai)
- Production me strong `ADMIN_PASSWORD` aur random `SESSION_SECRET` use karo
- Agar chaho to future me multiple admin users + bcrypt hashing add kar sakte ho
  (abhi single admin env-based hai, simplicity ke liye)

## Project Structure

```
server.js              → app entry point
config/db.js           → MongoDB connection
models/Site.js         → saara editable page content (single document)
models/Lead.js         → contact form submissions
middleware/auth.js      → admin session guard
routes/site.js          → public landing page + contact form
routes/admin.js         → login, dashboard, section updates, image upload
views/site/index.ejs     → public page template
views/admin/*.ejs        → admin login + dashboard
public/css/style.css     → all styling
public/uploads/          → uploaded images
seed.js                  → initial content loader
```
