# 🏡 Hanna's Reno Dashboard

Your personal renovation command center. Tracks tasks, trades, budget, invoices, orders, milestones, and decisions for the full house reno.

---

## Getting this live on GitHub Pages (free, takes 5 minutes)

### Step 1 — Create a GitHub repo
1. Go to [github.com](https://github.com) and sign in
2. Click the **+** in the top right → **New repository**
3. Name it `reno-dashboard` (or anything you like)
4. Set it to **Public** (required for free GitHub Pages)
5. Click **Create repository**

### Step 2 — Upload the files
1. On the repo page, click **Add file → Upload files**
2. Drag in the entire `reno-dashboard` folder contents:
   - `index.html`
   - `css/` folder
   - `js/` folder
   - `README.md`
3. Scroll down and click **Commit changes**

### Step 3 — Turn on GitHub Pages
1. Go to **Settings** (tab at the top of your repo)
2. Scroll down to **Pages** in the left sidebar
3. Under **Source**, choose **Deploy from a branch**
4. Select `main` branch, `/ (root)` folder
5. Click **Save**
6. Wait ~60 seconds, refresh — you'll see a green banner with your URL

Your URL will be: `https://YOUR-GITHUB-USERNAME.github.io/reno-dashboard`

**Bookmark it. That's your dashboard, live forever.**

---

## How data is stored

All your data (tasks, budget, invoices, decisions, etc.) is saved in your **browser's localStorage**. This means:
- ✅ It persists between sessions on the same browser
- ✅ No login, no server, no monthly cost
- ⚠️ Data is per-browser — if you use Chrome on your laptop, it won't show on Safari on your phone
- ⚠️ Clearing browser data/cache will erase it

**Back up regularly:** Click **Backup** in the top right to download a JSON file. Keep this in Google Drive.

---

## What's included

| Section | What it does |
|---|---|
| Dashboard | At-a-glance: budget, tasks, milestones, open orders |
| Timeline | All milestones with dates and status — mark done as you go |
| Tasks | Full task list with trade owner, priority, room, due date |
| Trades & Contacts | Every contractor with phone, responsibilities, quote, status |
| Orders & Parts | Track what you've ordered, from where, ETA, status |
| Decisions Log | Record every key decision so you never forget what you chose or why |
| Budget | Category-by-category budget vs actual |
| Invoices | Log every invoice/receipt, mark as paid |
| Photos & Docs | Checklist of before-photos to take + links to Drive/Houzz/floor plans |
| Settings | Update project name, dates, total budget |

---

## Tips

- **Export a backup before clearing your browser** — Settings → Export backup
- **Add invoices as you go** — they feed your budget tracker automatically  
- **Use the Decisions Log liberally** — you'll thank yourself in 3 months when you can't remember why you picked a certain tile or contractor
- **The sequencing reminder** in Trades is pinned — don't skip asbestos test and HVAC reroute before demo

---

*Built with vanilla HTML/CSS/JS — no frameworks, no dependencies to break, works forever.*
