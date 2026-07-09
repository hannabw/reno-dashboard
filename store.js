// ── Reno Dashboard — Persistent Data Store ──
// All data lives in localStorage under the key 'renoData'

const STORE_KEY = 'renoData_v1';

const DEFAULT_DATA = {
  meta: {
    projectName: "Hanna & Connor's Renovation",
    address: '',
    totalBudget: 50000,
    moveInDate: '2025-09-30',
    housewarmingDate: '2025-10-18',
    christmasDate: '2025-12-24',
    createdAt: new Date().toISOString(),
  },

  tasks: [
    { id: 't1', text: 'Schedule asbestos inspection', trade: 'DIY', room: 'Whole house', priority: 'high', status: 'open', dueDate: '', notes: 'Required before ANY demo begins — popcorn ceilings may contain asbestos', createdAt: new Date().toISOString() },
    { id: 't2', text: 'Verify main water shut-off works', trade: 'DIY', room: 'Utility', priority: 'high', status: 'open', dueDate: '', notes: 'Confirm before demo day — do not assume it works', createdAt: new Date().toISOString() },
    { id: 't3', text: 'Get 2–3 HVAC reroute quotes', trade: 'HVAC', room: 'Kitchen / Hallway', priority: 'high', status: 'open', dueDate: '', notes: 'Must be rerouted to attic before soffit demo begins', createdAt: new Date().toISOString() },
    { id: 't4', text: 'Confirm solar panel ownership / financing status', trade: 'DIY', room: '', priority: 'high', status: 'open', dueDate: '', notes: 'Leased vs owned determines whether relocation is even possible', createdAt: new Date().toISOString() },
    { id: 't5', text: 'Remove toilets & vanities (demo prep)', trade: 'Plumber', room: 'Bathrooms', priority: 'med', status: 'open', dueDate: '', notes: 'Do during demo phase so tile can be laid full-floor later', createdAt: new Date().toISOString() },
    { id: 't6', text: 'Inspect & test salvaged recessed can lights', trade: 'DIY', room: 'Whole house', priority: 'med', status: 'open', dueDate: '', notes: 'Look for remodel/retrofit housings — those are reusable', createdAt: new Date().toISOString() },
    { id: 't7', text: 'Remove kitchen island', trade: 'DIY', room: 'Kitchen', priority: 'high', status: 'open', dueDate: '', notes: 'SharkBite cap on supply lines after shut-off confirmed', createdAt: new Date().toISOString() },
    { id: 't8', text: 'Get attic insulation quotes (blown-in)', trade: 'Contractor', room: 'Attic', priority: 'med', status: 'open', dueDate: '', notes: 'Coordinate timing with any ceiling vault decisions — attic is open & unobstructed', createdAt: new Date().toISOString() },
    { id: 't9', text: 'Pull building permits', trade: 'GC', room: 'Whole house', priority: 'high', status: 'open', dueDate: '', notes: 'Required before structural work, electrical, plumbing changes', createdAt: new Date().toISOString() },
    { id: 't10', text: 'Demo: remove dropped soffits (after HVAC reroute)', trade: 'DIY', room: 'Kitchen / Hallway', priority: 'high', status: 'open', dueDate: '', notes: 'Do NOT begin before HVAC is rerouted and asbestos is cleared', createdAt: new Date().toISOString() },
    { id: 't11', text: 'Remove wall between kitchen and back dining room', trade: 'DIY + GC', room: 'Kitchen', priority: 'high', status: 'open', dueDate: '', notes: 'Confirm load-bearing status before demo', createdAt: new Date().toISOString() },
    { id: 't12', text: 'Open up kitchen pass-through', trade: 'DIY + GC', room: 'Kitchen', priority: 'med', status: 'open', dueDate: '', notes: 'Part of the kitchen → dining room wall removal sequence', createdAt: new Date().toISOString() },
    { id: 't13', text: 'Plan recessed lighting layout', trade: 'Electrician', room: 'Whole house', priority: 'med', status: 'open', dueDate: '', notes: 'Pocket closets → surface flush mount; open rooms → recessed cans', createdAt: new Date().toISOString() },
    { id: 't14', text: 'Get 2–3 quotes for GC finish work', trade: 'GC', room: 'Whole house', priority: 'high', status: 'open', dueDate: '', notes: 'Drywall, cabinets, trim, flooring installs', createdAt: new Date().toISOString() },
    { id: 't15', text: 'Order white upper kitchen cabinets', trade: 'DIY', room: 'Kitchen', priority: 'med', status: 'open', dueDate: '', notes: 'Aesthetic: white uppers, warm wood lowers, brass hardware', createdAt: new Date().toISOString() },
    { id: 't16', text: 'Source brass cabinet hardware', trade: 'DIY', room: 'Kitchen', priority: 'low', status: 'open', dueDate: '', notes: 'Pulls and knobs — warm brass to match overall aesthetic', createdAt: new Date().toISOString() },
    { id: 't17', text: 'Evaluate hall closet removal (north wall TV wall)', trade: 'DIY', room: 'Living room', priority: 'low', status: 'open', dueDate: '', notes: 'Could clean up TV wall significantly', createdAt: new Date().toISOString() },
    { id: 't18', text: 'Backyard: plan concrete removal and paver layout', trade: 'Contractor', room: 'Backyard', priority: 'low', status: 'open', dueDate: '', notes: 'Extend grass over concrete area, add pavers', createdAt: new Date().toISOString() },
  ],

  milestones: [
    { id: 'm1', title: 'Asbestos test complete', date: '', status: 'pending', category: 'Pre-demo', notes: 'Blocker — everything waits on this', emoji: '🔬' },
    { id: 'm2', title: 'HVAC reroute contract signed', date: '2025-07-15', status: 'pending', category: 'Pre-demo', notes: '', emoji: '📋' },
    { id: 'm3', title: 'All permits pulled', date: '2025-07-20', status: 'pending', category: 'Pre-demo', notes: '', emoji: '📄' },
    { id: 'm4', title: 'HVAC rerouted to attic', date: '2025-07-31', status: 'pending', category: 'Rough-in', notes: 'Unlocks soffit demo', emoji: '🔧' },
    { id: 'm5', title: 'Demo day complete', date: '2025-08-07', status: 'pending', category: 'Demo', notes: 'Soffits, walls, island, old tile', emoji: '🔨' },
    { id: 'm6', title: 'Rough-in inspections pass', date: '2025-08-20', status: 'pending', category: 'Rough-in', notes: 'Plumbing, electrical, HVAC all signed off', emoji: '✅' },
    { id: 'm7', title: 'Drywall & insulation done', date: '2025-08-31', status: 'pending', category: 'Finish', notes: '', emoji: '🏗️' },
    { id: 'm8', title: 'Kitchen cabinets & countertops installed', date: '2025-09-10', status: 'pending', category: 'Finish', notes: '', emoji: '🍳' },
    { id: 'm9', title: 'Flooring complete', date: '2025-09-18', status: 'pending', category: 'Finish', notes: '', emoji: '🪵' },
    { id: 'm10', title: 'Punch list complete', date: '2025-09-25', status: 'pending', category: 'Finish', notes: '', emoji: '📝' },
    { id: 'm11', title: '🏡 Move-in ready', date: '2025-09-30', status: 'pending', category: 'Goal', notes: 'Out of rental by Sept 30', emoji: '🏡' },
    { id: 'm12', title: '🎉 Housewarming party', date: '2025-10-18', status: 'pending', category: 'Goal', notes: 'Fully styled and move-in complete', emoji: '🎉' },
    { id: 'm13', title: '🎄 Connor\'s family Christmas Eve', date: '2025-12-24', status: 'pending', category: 'Goal', notes: 'Host Christmas Eve party — house fully complete', emoji: '🎄' },
  ],

  trades: [
    { id: 'tr1', name: 'Asbestos Inspector', company: '', phone: '', email: '', status: 'urgent', hired: false, quoteAmount: '', responsibilities: 'Popcorn ceiling test before any demo cutting', notes: 'REQUIRED first step — do not demo without this', color: '#C0522A', initials: 'AB' },
    { id: 'tr2', name: 'HVAC Contractor', company: '', phone: '', email: '', status: 'quoting', hired: false, quoteAmount: '', responsibilities: 'Reroute ductwork from kitchen + hallway soffits up into attic', notes: 'Get 2–3 quotes. Attic is open & accessible — should help with cost', color: '#2A7A6B', initials: 'HV' },
    { id: 'tr3', name: 'Plumber', company: '', phone: '', email: '', status: 'not-hired', hired: false, quoteAmount: '', responsibilities: 'Cap kitchen island supply lines · Remove toilets & vanities · Verify/replace main shut-off', notes: 'SharkBite cap approach on main shut-off is the reliable path', color: '#1E5A8A', initials: 'PL' },
    { id: 'tr4', name: 'Electrician', company: '', phone: '', email: '', status: 'not-hired', hired: false, quoteAmount: '', responsibilities: 'Recessed lighting layout & rough-in · Panel inspection · New circuits as needed', notes: 'Plan pocket closet fixtures separately from open-room recessed cans', color: '#9B6A00', initials: 'EL' },
    { id: 'tr5', name: 'General Contractor', company: '', phone: '', email: '', status: 'not-hired', hired: false, quoteAmount: '', responsibilities: 'Finish work after demo · Drywall · Cabinet install · Trim · Load-bearing wall assessment', notes: 'Get 2–3 quotes for finish work. Confirm wall load-bearing status before demo', color: '#6B3A9E', initials: 'GC' },
    { id: 'tr6', name: 'Insulation Contractor', company: '', phone: '', email: '', status: 'not-hired', hired: false, quoteAmount: '', responsibilities: 'Blown-in attic insulation · High ROI — currently zero insulation', notes: 'Coordinate timing with ceiling vault decisions. Can cut bills 15–30%', color: '#4A7A2A', initials: 'IN' },
    { id: 'tr7', name: 'Tile Contractor', company: '', phone: '', email: '', status: 'not-hired', hired: false, quoteAmount: '', responsibilities: 'Bathroom floor tile (full floor after toilet/vanity removal) · Kitchen backsplash', notes: 'Remove toilets first so tile goes under — avoids cutouts', color: '#8A3A3A', initials: 'TI' },
  ],

  budget: [
    { id: 'b1', category: 'Kitchen', allocated: 12000, spent: 0, color: '#2A7A6B', notes: 'Cabinets, countertops, appliances, hardware' },
    { id: 'b2', category: 'Bathrooms', allocated: 10000, spent: 0, color: '#1E5A8A', notes: 'Tile, vanities, toilets, fixtures — full reno both baths' },
    { id: 'b3', category: 'Contingency', allocated: 10000, spent: 0, color: '#7A7060', notes: '20% buffer — do not touch until needed' },
    { id: 'b4', category: 'HVAC', allocated: 6000, spent: 0, color: '#9B6A00', notes: 'Duct reroute from soffits to attic' },
    { id: 'b5', category: 'Flooring', allocated: 5000, spent: 0, color: '#B8860B', notes: 'LVP or hardwood whole house' },
    { id: 'b6', category: 'Electrical', allocated: 4000, spent: 0, color: '#6B3A9E', notes: 'Recessed lighting, panel work, new circuits' },
    { id: 'b7', category: 'Demo & hauling', allocated: 2000, spent: 0, color: '#C0522A', notes: 'Dumpster, hauling — much of demo is DIY' },
    { id: 'b8', category: 'Insulation', allocated: 2500, spent: 0, color: '#4A7A2A', notes: 'Blown-in attic — high ROI' },
    { id: 'b9', category: 'Plumbing', allocated: 2000, spent: 0, color: '#2A5A7A', notes: 'Island cap, shut-off, vanity removals' },
    { id: 'b10', category: 'Backyard', allocated: 1500, spent: 0, color: '#7A4A2A', notes: 'Pavers, grass extension — lower priority' },
    { id: 'b11', category: 'Permits & inspections', allocated: 1500, spent: 0, color: '#5A5248', notes: 'Building permits, asbestos test, final inspections' },
    { id: 'b12', category: 'Lighting & fixtures', allocated: 2000, spent: 0, color: '#8A3A3A', notes: 'Any fixtures not salvaged from demo site' },
    { id: 'b13', category: 'Paint', allocated: 1000, spent: 0, color: '#3A6A8A', notes: 'Whole house — plan to DIY rolling' },
  ],

  invoices: [],

  orders: [
    { id: 'o1', item: 'SharkBite push-to-connect caps (10-pack)', vendor: 'Home Depot', cost: 28, status: 'need-to-order', eta: '', category: 'Plumbing', notes: 'For capping kitchen island supply lines', link: '' },
    { id: 'o2', item: 'Brass cabinet pull samples', vendor: 'Amazon / Rejuvenation', cost: 45, status: 'need-to-order', eta: '', category: 'Kitchen', notes: 'Test before committing to full order', link: '' },
    { id: 'o3', item: 'Recessed retrofit can light housings (salvaged)', vendor: 'Demo site', cost: 0, status: 'need-to-order', eta: '', category: 'Electrical', notes: 'Check for remodel/retrofit type — those are reusable in existing drywall', link: '' },
  ],

  decisions: [
    { id: 'd1', date: new Date().toISOString().split('T')[0], topic: 'Kitchen aesthetic', decision: 'White upper cabinets, warm wood tone lowers, brass hardware', alternatives: '', notes: 'Spanish / Mediterranean warmth direction' },
    { id: 'd2', date: new Date().toISOString().split('T')[0], topic: 'Kitchen island plumbing', decision: 'SharkBite cap on main shut-off — most reliable approach', alternatives: 'Penetrating oil on seized valves — low success odds (~20–30%)', notes: 'Verify main shut-off functions before demo day' },
    { id: 'd3', date: new Date().toISOString().split('T')[0], topic: 'HVAC duct routing', decision: 'Reroute to attic before soffit demo', alternatives: 'Rebuild soffits — rejected, defeats purpose', notes: 'Attic is open with standard truss framing — feasible' },
    { id: 'd4', date: new Date().toISOString().split('T')[0], topic: 'Solar panels', decision: 'TBD — confirm ownership/financing status first', alternatives: 'Relocate from demo site vs. new system (30% federal tax credit applies)', notes: 'Relocation reduces removal cost — compare total cost against new system net of credit' },
  ],

  photos: [],
  documents: [],
};

// ── Store API ──
const Store = {
  _data: null,

  load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      this._data = raw ? JSON.parse(raw) : this._deepClone(DEFAULT_DATA);
      // Migrate missing keys from defaults
      const def = DEFAULT_DATA;
      if (!this._data.decisions) this._data.decisions = def.decisions;
      if (!this._data.photos) this._data.photos = [];
      if (!this._data.documents) this._data.documents = [];
    } catch(e) {
      console.warn('Store load error, resetting', e);
      this._data = this._deepClone(DEFAULT_DATA);
    }
    return this;
  },

  save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(this._data));
    } catch(e) {
      console.error('Save failed', e);
    }
    return this;
  },

  get(key) { return this._data[key]; },

  set(key, value) {
    this._data[key] = value;
    this.save();
    return this;
  },

  getMeta() { return this._data.meta; },
  setMeta(meta) { this._data.meta = { ...this._data.meta, ...meta }; this.save(); },

  // Tasks
  getTasks() { return this._data.tasks || []; },
  addTask(task) {
    task.id = 't' + Date.now();
    task.createdAt = new Date().toISOString();
    this._data.tasks.unshift(task);
    this.save();
    return task;
  },
  updateTask(id, updates) {
    const i = this._data.tasks.findIndex(t => t.id === id);
    if (i > -1) { this._data.tasks[i] = { ...this._data.tasks[i], ...updates }; this.save(); }
  },
  deleteTask(id) {
    this._data.tasks = this._data.tasks.filter(t => t.id !== id);
    this.save();
  },

  // Milestones
  getMilestones() { return this._data.milestones || []; },
  updateMilestone(id, updates) {
    const i = this._data.milestones.findIndex(m => m.id === id);
    if (i > -1) { this._data.milestones[i] = { ...this._data.milestones[i], ...updates }; this.save(); }
  },
  addMilestone(m) {
    m.id = 'ms' + Date.now();
    this._data.milestones.push(m);
    this.save();
    return m;
  },
  deleteMilestone(id) {
    this._data.milestones = this._data.milestones.filter(m => m.id !== id);
    this.save();
  },

  // Trades
  getTrades() { return this._data.trades || []; },
  addTrade(t) {
    t.id = 'tr' + Date.now();
    this._data.trades.push(t);
    this.save();
    return t;
  },
  updateTrade(id, updates) {
    const i = this._data.trades.findIndex(t => t.id === id);
    if (i > -1) { this._data.trades[i] = { ...this._data.trades[i], ...updates }; this.save(); }
  },
  deleteTrade(id) {
    this._data.trades = this._data.trades.filter(t => t.id !== id);
    this.save();
  },

  // Budget
  getBudget() { return this._data.budget || []; },
  updateBudgetItem(id, updates) {
    const i = this._data.budget.findIndex(b => b.id === id);
    if (i > -1) { this._data.budget[i] = { ...this._data.budget[i], ...updates }; this.save(); }
  },
  addBudgetItem(b) {
    b.id = 'b' + Date.now();
    this._data.budget.push(b);
    this.save();
    return b;
  },

  // Invoices
  getInvoices() { return this._data.invoices || []; },
  addInvoice(inv) {
    inv.id = 'inv' + Date.now();
    inv.createdAt = new Date().toISOString();
    this._data.invoices.unshift(inv);
    this.save();
    return inv;
  },
  updateInvoice(id, updates) {
    const i = this._data.invoices.findIndex(v => v.id === id);
    if (i > -1) { this._data.invoices[i] = { ...this._data.invoices[i], ...updates }; this.save(); }
  },
  deleteInvoice(id) {
    this._data.invoices = this._data.invoices.filter(v => v.id !== id);
    this.save();
  },

  // Orders
  getOrders() { return this._data.orders || []; },
  addOrder(o) {
    o.id = 'o' + Date.now();
    this._data.orders.unshift(o);
    this.save();
    return o;
  },
  updateOrder(id, updates) {
    const i = this._data.orders.findIndex(o => o.id === id);
    if (i > -1) { this._data.orders[i] = { ...this._data.orders[i], ...updates }; this.save(); }
  },
  deleteOrder(id) {
    this._data.orders = this._data.orders.filter(o => o.id !== id);
    this.save();
  },

  // Decisions log
  getDecisions() { return this._data.decisions || []; },
  addDecision(d) {
    d.id = 'dc' + Date.now();
    this._data.decisions.unshift(d);
    this.save();
    return d;
  },
  deleteDecision(id) {
    this._data.decisions = this._data.decisions.filter(d => d.id !== id);
    this.save();
  },

  // Computed
  getTotalSpent() {
    const inv = this.getInvoices().filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount || 0), 0);
    return inv;
  },
  getTotalAllocated() {
    return this.getBudget().reduce((s, b) => s + Number(b.allocated || 0), 0);
  },
  getTaskStats() {
    const tasks = this.getTasks();
    const done = tasks.filter(t => t.status === 'done').length;
    return { total: tasks.length, done, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
  },
  getDaysToMoveIn() {
    const target = new Date(this.getMeta().moveInDate);
    const now = new Date();
    return Math.ceil((target - now) / 86400000);
  },

  exportJSON() {
    const blob = new Blob([JSON.stringify(this._data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'reno-dashboard-backup.json'; a.click();
  },

  importJSON(jsonStr) {
    try {
      this._data = JSON.parse(jsonStr);
      this.save();
      return true;
    } catch(e) { return false; }
  },

  _deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
};
