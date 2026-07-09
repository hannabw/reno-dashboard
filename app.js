// ── Reno Dashboard — App ──

// ── Utilities ──
function fmt$(n) { return '$' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 }); }
function fmtDate(d) { if (!d) return '—'; const dt = new Date(d + 'T12:00:00'); return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function uid() { return '_' + Math.random().toString(36).slice(2, 9); }
function escHtml(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
function toast(msg, dur = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}
function showModal(id) { document.getElementById(id).classList.remove('hidden'); }
function hideModal(id) { document.getElementById(id).classList.add('hidden'); }

const PRIORITY_LABELS = { high: 'High', med: 'Medium', low: 'Low' };
const STATUS_COLORS = {
  'need-to-order': 'badge-danger', 'ordered': 'badge-warn',
  'in-transit': 'badge-info', 'delivered': 'badge-success',
};
const TRADE_STATUS = {
  'urgent': ['badge-danger', 'Urgent'],
  'quoting': ['badge-warn', 'Quoting'],
  'hired': ['badge-success', 'Hired'],
  'not-hired': ['badge-neutral', 'Not hired'],
  'complete': ['badge-brass', 'Complete'],
};
const INV_STATUS = {
  'unpaid': ['badge-danger', 'Unpaid'],
  'paid': ['badge-success', 'Paid'],
  'disputed': ['badge-warn', 'Disputed'],
};

// ── Nav ──
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const view = document.getElementById('view-' + name);
  if (view) view.classList.add('active');
  document.querySelectorAll(`.nav-item[data-view="${name}"]`).forEach(n => n.classList.add('active'));
  document.getElementById('page-title').textContent = {
    dashboard: 'Dashboard', timeline: 'Timeline & Milestones',
    tasks: 'Tasks', trades: 'Trades & Contacts', budget: 'Budget',
    invoices: 'Invoices & Receipts', orders: 'Orders & Parts',
    decisions: 'Decisions Log', docs: 'Photos & Documents', settings: 'Settings'
  }[name] || name;
  // Render the active view
  const renders = {
    dashboard: renderDashboard, timeline: renderTimeline,
    tasks: renderTasks, trades: renderTrades, budget: renderBudget,
    invoices: renderInvoices, orders: renderOrders,
    decisions: renderDecisions, settings: renderSettings,
  };
  if (renders[name]) renders[name]();
}

// ── Dashboard ──
function renderDashboard() {
  const meta = Store.getMeta();
  const taskStats = Store.getTaskStats();
  const spent = Store.getTotalSpent();
  const budget = Number(meta.totalBudget);
  const spentPct = budget ? Math.round((spent / budget) * 100) : 0;
  const days = Store.getDaysToMoveIn();
  const orders = Store.getOrders();
  const openOrders = orders.filter(o => o.status !== 'delivered').length;

  document.getElementById('dash-budget-val').textContent = fmt$(spent);
  document.getElementById('dash-budget-sub').textContent = 'of ' + fmt$(budget) + ' total';
  document.getElementById('dash-budget-bar').style.width = spentPct + '%';
  document.getElementById('dash-budget-bar').className = 'metric-bar-fill' + (spentPct > 90 ? ' danger' : spentPct > 70 ? ' warn' : '');

  document.getElementById('dash-tasks-val').textContent = taskStats.pct + '%';
  document.getElementById('dash-tasks-sub').textContent = taskStats.done + ' of ' + taskStats.total + ' done';
  document.getElementById('dash-tasks-bar').style.width = taskStats.pct + '%';

  document.getElementById('dash-days-val').textContent = days > 0 ? days : 'Past!';
  document.getElementById('dash-days-bar').style.width = Math.min(100, Math.max(0, Math.round(((180 - days) / 180) * 100))) + '%';

  document.getElementById('dash-orders-val').textContent = openOrders;
  const arriving = orders.filter(o => o.status === 'in-transit').length;
  document.getElementById('dash-orders-sub').textContent = arriving + ' arriving soon';

  // Sidebar budget
  document.getElementById('sb-budget-fill').style.width = spentPct + '%';
  document.getElementById('sb-budget-text').textContent = fmt$(spent) + ' / ' + fmt$(budget);

  // Quick tasks
  const openTasks = Store.getTasks().filter(t => t.status !== 'done').slice(0, 6);
  document.getElementById('dash-tasks-list').innerHTML = openTasks.length ? openTasks.map(t => `
    <tr>
      <td><span class="priority-dot priority-${escHtml(t.priority)}" title="${escHtml(PRIORITY_LABELS[t.priority])}"></span></td>
      <td>${escHtml(t.text)}</td>
      <td><span class="badge badge-neutral">${escHtml(t.trade)}</span></td>
      <td><button class="btn btn-sm btn-primary" onclick="quickDoneTask('${escHtml(t.id)}')">Done</button></td>
    </tr>
  `).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--ink-faint);padding:20px;">All tasks complete! 🎉</td></tr>';

  // Upcoming milestones
  const upcoming = Store.getMilestones().filter(m => m.status !== 'done').slice(0, 5);
  document.getElementById('dash-milestones').innerHTML = upcoming.map(m => {
    const dotClass = m.status === 'done' ? 'done' : m.category === 'Goal' ? 'goal' : m.date && new Date(m.date) < new Date(Date.now() + 14 * 86400000) ? 'active' : 'pending';
    return `<div class="timeline-item">
      <div class="tl-dot ${dotClass}">${m.status === 'done' ? '✓' : (m.category === 'Goal' ? '★' : '')}</div>
      <div class="tl-content">
        <div class="tl-title">${escHtml(m.emoji || '')} ${escHtml(m.title)}</div>
        <div class="tl-meta">${m.date ? fmtDate(m.date) : 'Date TBD'} · ${escHtml(m.category)}</div>
      </div>
    </div>`;
  }).join('');

  // Budget snapshot
  const budgetItems = Store.getBudget().slice(0, 7);
  const totalAlloc = Store.getTotalAllocated();
  document.getElementById('dash-budget-rows').innerHTML = budgetItems.map(b => {
    const pct = b.allocated ? Math.round((b.spent / b.allocated) * 100) : 0;
    return `<div class="budget-row">
      <div class="budget-cat">${escHtml(b.category)}</div>
      <div class="budget-bar-wrap"><div class="budget-bar-inner" style="background:${escHtml(b.color)};width:${pct}%"></div></div>
      <div class="budget-amt">${fmt$(b.allocated)}</div>
    </div>`;
  }).join('');
}

function quickDoneTask(id) {
  Store.updateTask(id, { status: 'done' });
  renderDashboard();
  toast('Task marked done ✓');
}

// ── Timeline ──
function renderTimeline() {
  const milestones = Store.getMilestones();
  const categories = [...new Set(milestones.map(m => m.category))];
  const container = document.getElementById('timeline-list');
  container.innerHTML = categories.map(cat => {
    const items = milestones.filter(m => m.category === cat);
    return `<div style="margin-bottom:24px;">
      <div class="section-label">${escHtml(cat)}</div>
      ${items.map(m => {
        const dotClass = m.status === 'done' ? 'done' : m.category === 'Goal' ? 'goal' : m.date && new Date(m.date + 'T12:00:00') < new Date(Date.now() + 14 * 86400000) ? 'active' : 'pending';
        const isLate = m.date && m.status !== 'done' && new Date(m.date + 'T12:00:00') < new Date();
        return `<div class="timeline-item">
          <div class="tl-dot ${dotClass}">${m.status === 'done' ? '✓' : (m.category === 'Goal' ? '★' : '')}</div>
          <div class="tl-content">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span class="tl-title">${escHtml(m.emoji || '')} ${escHtml(m.title)}</span>
              ${isLate ? '<span class="badge badge-danger">Overdue</span>' : ''}
              ${m.status === 'done' ? '<span class="badge badge-success">Complete</span>' : ''}
            </div>
            <div class="tl-meta">${m.date ? fmtDate(m.date) : 'Date TBD'}${m.notes ? ' · ' + escHtml(m.notes) : ''}</div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0;">
            ${m.status !== 'done' ? `<button class="btn btn-sm btn-primary" onclick="markMilestoneDone('${m.id}')">✓ Done</button>` : `<button class="btn btn-sm" onclick="markMilestonePending('${m.id}')">Undo</button>`}
            <button class="btn btn-sm" onclick="editMilestone('${m.id}')"><i class="ti ti-edit"></i></button>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}

function markMilestoneDone(id) {
  Store.updateMilestone(id, { status: 'done' });
  renderTimeline(); renderDashboard();
  toast('Milestone complete! 🎉');
}
function markMilestonePending(id) {
  Store.updateMilestone(id, { status: 'pending' });
  renderTimeline();
}
function editMilestone(id) {
  const m = Store.getMilestones().find(x => x.id === id);
  if (!m) return;
  document.getElementById('ms-edit-id').value = m.id;
  document.getElementById('ms-edit-title').value = m.title;
  document.getElementById('ms-edit-date').value = m.date;
  document.getElementById('ms-edit-category').value = m.category;
  document.getElementById('ms-edit-notes').value = m.notes;
  showModal('modal-milestone');
}
function saveMilestone() {
  const id = document.getElementById('ms-edit-id').value;
  const data = {
    title: document.getElementById('ms-edit-title').value,
    date: document.getElementById('ms-edit-date').value,
    category: document.getElementById('ms-edit-category').value,
    notes: document.getElementById('ms-edit-notes').value,
  };
  if (id) { Store.updateMilestone(id, data); } else { Store.addMilestone({ ...data, status: 'pending', emoji: '📌' }); }
  hideModal('modal-milestone'); renderTimeline(); renderDashboard();
  toast('Milestone saved');
}
function openAddMilestone() {
  document.getElementById('ms-edit-id').value = '';
  document.getElementById('ms-edit-title').value = '';
  document.getElementById('ms-edit-date').value = '';
  document.getElementById('ms-edit-category').value = 'Pre-demo';
  document.getElementById('ms-edit-notes').value = '';
  showModal('modal-milestone');
}

// ── Tasks ──
let taskFilter = 'all';
let taskSearch = '';

function renderTasks() {
  let tasks = Store.getTasks();
  if (taskFilter !== 'all') tasks = tasks.filter(t => t.trade === taskFilter || (taskFilter === 'open' && t.status !== 'done') || (taskFilter === 'done' && t.status === 'done'));
  if (taskSearch) tasks = tasks.filter(t => t.text.toLowerCase().includes(taskSearch) || (t.notes || '').toLowerCase().includes(taskSearch));
  const open = tasks.filter(t => t.status !== 'done');
  const done = tasks.filter(t => t.status === 'done');

  const rowHtml = (t) => `
    <tr class="${t.status === 'done' ? 'opacity-50' : ''}">
      <td><span class="priority-dot priority-${escHtml(t.priority)}"></span></td>
      <td>
        <div style="font-weight:500;${t.status === 'done' ? 'text-decoration:line-through;color:var(--ink-faint)' : ''}">${escHtml(t.text)}</div>
        ${t.room ? `<div style="font-size:11px;color:var(--ink-faint);">${escHtml(t.room)}</div>` : ''}
        ${t.notes ? `<div style="font-size:11px;color:var(--ink-muted);margin-top:2px;">${escHtml(t.notes)}</div>` : ''}
      </td>
      <td><span class="badge badge-neutral">${escHtml(t.trade)}</span></td>
      <td>${t.dueDate ? fmtDate(t.dueDate) : '—'}</td>
      <td>
        <div class="actions">
          ${t.status !== 'done' ? `<button class="btn btn-sm btn-primary" onclick="doneTask('${t.id}')">✓</button>` : `<button class="btn btn-sm" onclick="reopenTask('${t.id}')">↩</button>`}
          <button class="btn btn-sm" onclick="editTask('${t.id}')"><i class="ti ti-edit"></i></button>
          <button class="btn btn-sm" onclick="deleteTask('${t.id}')"><i class="ti ti-trash"></i></button>
        </div>
      </td>
    </tr>`;

  document.getElementById('tasks-table-body').innerHTML = open.map(rowHtml).join('') +
    (done.length ? `<tr><td colspan="5" style="padding:12px;font-size:11px;color:var(--ink-faint);text-transform:uppercase;letter-spacing:.05em;">Completed (${done.length})</td></tr>` + done.map(rowHtml).join('') : '');
}

function doneTask(id) { Store.updateTask(id, { status: 'done' }); renderTasks(); renderDashboard(); toast('Task done ✓'); }
function reopenTask(id) { Store.updateTask(id, { status: 'open' }); renderTasks(); toast('Task reopened'); }
function deleteTask(id) { if (confirm('Delete this task?')) { Store.deleteTask(id); renderTasks(); toast('Task deleted'); } }

function editTask(id) {
  const t = Store.getTasks().find(x => x.id === id);
  if (!t) return;
  document.getElementById('task-edit-id').value = t.id;
  document.getElementById('task-edit-text').value = t.text;
  document.getElementById('task-edit-trade').value = t.trade;
  document.getElementById('task-edit-room').value = t.room || '';
  document.getElementById('task-edit-priority').value = t.priority;
  document.getElementById('task-edit-due').value = t.dueDate || '';
  document.getElementById('task-edit-notes').value = t.notes || '';
  showModal('modal-task');
}
function openAddTask() {
  document.getElementById('task-edit-id').value = '';
  document.getElementById('task-edit-text').value = '';
  document.getElementById('task-edit-trade').value = 'DIY';
  document.getElementById('task-edit-room').value = '';
  document.getElementById('task-edit-priority').value = 'med';
  document.getElementById('task-edit-due').value = '';
  document.getElementById('task-edit-notes').value = '';
  showModal('modal-task');
}
function saveTask() {
  const id = document.getElementById('task-edit-id').value;
  const data = {
    text: document.getElementById('task-edit-text').value.trim(),
    trade: document.getElementById('task-edit-trade').value,
    room: document.getElementById('task-edit-room').value,
    priority: document.getElementById('task-edit-priority').value,
    dueDate: document.getElementById('task-edit-due').value,
    notes: document.getElementById('task-edit-notes').value,
    status: 'open',
  };
  if (!data.text) { alert('Task name required'); return; }
  if (id) { Store.updateTask(id, data); } else { Store.addTask(data); }
  hideModal('modal-task'); renderTasks(); renderDashboard();
  toast('Task saved');
}
function filterTasks(f, el) {
  taskFilter = f;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderTasks();
}
function searchTasks(val) { taskSearch = val.toLowerCase(); renderTasks(); }

// ── Trades ──
function renderTrades() {
  const trades = Store.getTrades();
  document.getElementById('trades-list').innerHTML = trades.map(t => {
    const [badgeClass, badgeLabel] = TRADE_STATUS[t.status] || ['badge-neutral', t.status];
    return `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="trade-avatar" style="background:${escHtml(t.color)}22;color:${escHtml(t.color)}">${escHtml(t.initials)}</div>
          <div>
            <div style="font-weight:500">${escHtml(t.name)}</div>
            ${t.company ? `<div style="font-size:12px;color:var(--ink-muted)">${escHtml(t.company)}</div>` : ''}
          </div>
        </div>
      </td>
      <td>${t.phone ? `<a href="tel:${escHtml(t.phone)}" style="color:var(--teal)">${escHtml(t.phone)}</a>` : '<span style="color:var(--ink-faint)">—</span>'}</td>
      <td>${escHtml(t.responsibilities)}</td>
      <td>${t.quoteAmount ? fmt$(t.quoteAmount) : '—'}</td>
      <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
      <td>
        <div class="actions">
          <button class="btn btn-sm" onclick="editTrade('${t.id}')"><i class="ti ti-edit"></i></button>
          <button class="btn btn-sm" onclick="deleteTrade('${t.id}')"><i class="ti ti-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function editTrade(id) {
  const t = Store.getTrades().find(x => x.id === id);
  if (!t) return;
  ['id','name','company','phone','email','status','quoteAmount','responsibilities','notes'].forEach(k => {
    const el = document.getElementById('trade-edit-' + k);
    if (el) el.value = t[k] || '';
  });
  showModal('modal-trade');
}
function openAddTrade() {
  ['id','name','company','phone','email','quoteAmount','responsibilities','notes'].forEach(k => {
    const el = document.getElementById('trade-edit-' + k);
    if (el) el.value = '';
  });
  document.getElementById('trade-edit-status').value = 'not-hired';
  showModal('modal-trade');
}
function saveTrade() {
  const id = document.getElementById('trade-edit-id').value;
  const name = document.getElementById('trade-edit-name').value.trim();
  if (!name) { alert('Name required'); return; }
  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const colors = ['#2A7A6B','#1E5A8A','#9B6A00','#6B3A9E','#C0522A','#4A7A2A','#8A3A3A'];
  const data = {
    name, initials,
    company: document.getElementById('trade-edit-company').value,
    phone: document.getElementById('trade-edit-phone').value,
    email: document.getElementById('trade-edit-email').value,
    status: document.getElementById('trade-edit-status').value,
    quoteAmount: document.getElementById('trade-edit-quoteAmount').value,
    responsibilities: document.getElementById('trade-edit-responsibilities').value,
    notes: document.getElementById('trade-edit-notes').value,
    color: colors[Store.getTrades().length % colors.length],
  };
  if (id) { Store.updateTrade(id, data); } else { Store.addTrade(data); }
  hideModal('modal-trade'); renderTrades();
  toast('Trade contact saved');
}
function deleteTrade(id) { if (confirm('Remove this trade?')) { Store.deleteTrade(id); renderTrades(); toast('Removed'); } }

// ── Budget ──
function renderBudget() {
  const items = Store.getBudget();
  const totalAlloc = items.reduce((s, b) => s + Number(b.allocated), 0);
  const totalSpent = items.reduce((s, b) => s + Number(b.spent), 0);
  const meta = Store.getMeta();
  const budget = Number(meta.totalBudget);

  document.getElementById('budget-total').textContent = fmt$(budget);
  document.getElementById('budget-allocated').textContent = fmt$(totalAlloc);
  document.getElementById('budget-spent').textContent = fmt$(totalSpent);
  document.getElementById('budget-remaining').textContent = fmt$(budget - totalSpent);

  document.getElementById('budget-rows').innerHTML = items.map(b => {
    const pct = b.allocated ? Math.min(100, Math.round((b.spent / b.allocated) * 100)) : 0;
    const overBudget = b.spent > b.allocated;
    return `<tr>
      <td><span style="display:inline-flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:2px;background:${escHtml(b.color)};display:inline-block;"></span>${escHtml(b.category)}</span></td>
      <td>${fmt$(b.allocated)}</td>
      <td>${fmt$(b.spent)}</td>
      <td style="color:${overBudget ? 'var(--danger)' : 'var(--success)'}">${fmt$(b.allocated - b.spent)}</td>
      <td style="width:120px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <div class="progress-bar" style="flex:1"><div class="progress-fill ${overBudget ? 'danger' : ''}" style="width:${pct}%"></div></div>
          <span style="font-size:11px;color:var(--ink-muted);width:30px">${pct}%</span>
        </div>
      </td>
      <td><button class="btn btn-sm" onclick="editBudget('${b.id}')"><i class="ti ti-edit"></i></button></td>
    </tr>`;
  }).join('') + `<tr style="font-weight:600;border-top:2px solid var(--sand-border)">
    <td>Total</td><td>${fmt$(totalAlloc)}</td><td>${fmt$(totalSpent)}</td>
    <td style="color:var(--success)">${fmt$(budget - totalSpent)}</td><td></td><td></td>
  </tr>`;
}
function editBudget(id) {
  const b = Store.getBudget().find(x => x.id === id);
  if (!b) return;
  document.getElementById('budget-edit-id').value = b.id;
  document.getElementById('budget-edit-category').value = b.category;
  document.getElementById('budget-edit-allocated').value = b.allocated;
  document.getElementById('budget-edit-spent').value = b.spent;
  document.getElementById('budget-edit-notes').value = b.notes || '';
  showModal('modal-budget');
}
function saveBudgetItem() {
  const id = document.getElementById('budget-edit-id').value;
  const data = {
    category: document.getElementById('budget-edit-category').value,
    allocated: Number(document.getElementById('budget-edit-allocated').value) || 0,
    spent: Number(document.getElementById('budget-edit-spent').value) || 0,
    notes: document.getElementById('budget-edit-notes').value,
  };
  if (id) { Store.updateBudgetItem(id, data); } else { Store.addBudgetItem({ ...data, color: '#888780' }); }
  hideModal('modal-budget'); renderBudget(); renderDashboard();
  toast('Budget updated');
}
function openAddBudget() {
  document.getElementById('budget-edit-id').value = '';
  document.getElementById('budget-edit-category').value = '';
  document.getElementById('budget-edit-allocated').value = '';
  document.getElementById('budget-edit-spent').value = '0';
  document.getElementById('budget-edit-notes').value = '';
  showModal('modal-budget');
}

// ── Invoices ──
function renderInvoices() {
  const invoices = Store.getInvoices();
  const total = invoices.reduce((s, i) => s + Number(i.amount || 0), 0);
  const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount || 0), 0);
  document.getElementById('inv-total').textContent = fmt$(total);
  document.getElementById('inv-paid').textContent = fmt$(paid);
  document.getElementById('inv-outstanding').textContent = fmt$(total - paid);

  document.getElementById('invoices-list').innerHTML = invoices.length ? invoices.map(inv => {
    const [bc, bl] = INV_STATUS[inv.status] || ['badge-neutral', inv.status];
    return `<tr>
      <td>${fmtDate(inv.date)}</td>
      <td><div style="font-weight:500">${escHtml(inv.vendor)}</div>${inv.description ? `<div style="font-size:12px;color:var(--ink-muted)">${escHtml(inv.description)}</div>` : ''}</td>
      <td><span class="badge badge-neutral">${escHtml(inv.trade || '—')}</span></td>
      <td style="font-weight:500">${fmt$(inv.amount)}</td>
      <td><span class="badge ${bc}">${bl}</span></td>
      <td>
        <div class="actions">
          ${inv.status === 'unpaid' ? `<button class="btn btn-sm btn-primary" onclick="markInvPaid('${inv.id}')">Mark paid</button>` : ''}
          <button class="btn btn-sm" onclick="deleteInvoice('${inv.id}')"><i class="ti ti-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="6"><div class="empty-state"><i class="ti ti-file-invoice"></i><h3>No invoices yet</h3><p>Add invoices as contractors send them</p></div></td></tr>`;
}
function openAddInvoice() { showModal('modal-invoice'); }
function saveInvoice() {
  const data = {
    date: document.getElementById('inv-edit-date').value,
    vendor: document.getElementById('inv-edit-vendor').value.trim(),
    description: document.getElementById('inv-edit-desc').value,
    trade: document.getElementById('inv-edit-trade').value,
    amount: Number(document.getElementById('inv-edit-amount').value) || 0,
    status: document.getElementById('inv-edit-status').value,
    notes: document.getElementById('inv-edit-notes').value,
  };
  if (!data.vendor) { alert('Vendor required'); return; }
  Store.addInvoice(data);
  hideModal('modal-invoice');
  document.getElementById('inv-edit-vendor').value = '';
  document.getElementById('inv-edit-desc').value = '';
  document.getElementById('inv-edit-amount').value = '';
  document.getElementById('inv-edit-notes').value = '';
  renderInvoices(); renderDashboard();
  toast('Invoice added');
}
function markInvPaid(id) {
  Store.updateInvoice(id, { status: 'paid' });
  // Update budget spent for this trade
  renderInvoices(); renderDashboard(); renderBudget();
  toast('Invoice marked paid ✓');
}
function deleteInvoice(id) { if (confirm('Delete invoice?')) { Store.deleteInvoice(id); renderInvoices(); toast('Deleted'); } }

// ── Orders ──
function renderOrders() {
  const orders = Store.getOrders();
  const filterEl = document.getElementById('order-filter');
  const filter = filterEl ? filterEl.value : 'all';
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  document.getElementById('orders-list').innerHTML = filtered.length ? filtered.map(o => {
    const [bc, bl] = [STATUS_COLORS[o.status] || 'badge-neutral', {
      'need-to-order': 'Need to order', 'ordered': 'Ordered',
      'in-transit': 'In transit', 'delivered': 'Delivered'
    }[o.status] || o.status];
    return `<tr>
      <td><div style="font-weight:500">${escHtml(o.item)}</div>${o.notes ? `<div style="font-size:12px;color:var(--ink-muted)">${escHtml(o.notes)}</div>` : ''}</td>
      <td>${escHtml(o.vendor || '—')}</td>
      <td><span class="badge badge-neutral">${escHtml(o.category || '—')}</span></td>
      <td style="font-weight:500">${o.cost ? fmt$(o.cost) : '—'}</td>
      <td>${o.eta ? fmtDate(o.eta) : '—'}</td>
      <td><span class="badge ${bc}">${bl}</span></td>
      <td>
        <div class="actions">
          <button class="btn btn-sm" onclick="editOrder('${o.id}')"><i class="ti ti-edit"></i></button>
          <button class="btn btn-sm" onclick="deleteOrder('${o.id}')"><i class="ti ti-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="7"><div class="empty-state"><i class="ti ti-package"></i><h3>No orders here</h3></div></td></tr>`;
}
function editOrder(id) {
  const o = Store.getOrders().find(x => x.id === id);
  if (!o) return;
  document.getElementById('order-edit-id').value = o.id;
  document.getElementById('order-edit-item').value = o.item;
  document.getElementById('order-edit-vendor').value = o.vendor || '';
  document.getElementById('order-edit-category').value = o.category || '';
  document.getElementById('order-edit-cost').value = o.cost || '';
  document.getElementById('order-edit-status').value = o.status;
  document.getElementById('order-edit-eta').value = o.eta || '';
  document.getElementById('order-edit-notes').value = o.notes || '';
  document.getElementById('order-edit-link').value = o.link || '';
  showModal('modal-order');
}
function openAddOrder() {
  document.getElementById('order-edit-id').value = '';
  ['item','vendor','category','cost','eta','notes','link'].forEach(k => { document.getElementById('order-edit-' + k).value = ''; });
  document.getElementById('order-edit-status').value = 'need-to-order';
  showModal('modal-order');
}
function saveOrder() {
  const id = document.getElementById('order-edit-id').value;
  const data = {
    item: document.getElementById('order-edit-item').value.trim(),
    vendor: document.getElementById('order-edit-vendor').value,
    category: document.getElementById('order-edit-category').value,
    cost: Number(document.getElementById('order-edit-cost').value) || 0,
    status: document.getElementById('order-edit-status').value,
    eta: document.getElementById('order-edit-eta').value,
    notes: document.getElementById('order-edit-notes').value,
    link: document.getElementById('order-edit-link').value,
  };
  if (!data.item) { alert('Item name required'); return; }
  if (id) { Store.updateOrder(id, data); } else { Store.addOrder(data); }
  hideModal('modal-order'); renderOrders();
  toast('Order saved');
}
function deleteOrder(id) { if (confirm('Remove this order?')) { Store.deleteOrder(id); renderOrders(); toast('Removed'); } }

// ── Decisions ──
function renderDecisions() {
  const decisions = Store.getDecisions();
  document.getElementById('decisions-list').innerHTML = decisions.length ? decisions.map(d => `
    <div class="card" style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="font-size:11px;color:var(--ink-faint);">${fmtDate(d.date)}</span>
            <span class="badge badge-brass">${escHtml(d.topic)}</span>
          </div>
          <div style="font-weight:500;margin-bottom:4px;">${escHtml(d.decision)}</div>
          ${d.alternatives ? `<div style="font-size:12px;color:var(--ink-muted);">Alternatives considered: ${escHtml(d.alternatives)}</div>` : ''}
          ${d.notes ? `<div style="font-size:12px;color:var(--ink-muted);margin-top:4px;">${escHtml(d.notes)}</div>` : ''}
        </div>
        <button class="btn btn-sm" onclick="deleteDecision('${d.id}')"><i class="ti ti-trash"></i></button>
      </div>
    </div>
  `).join('') : `<div class="empty-state"><i class="ti ti-notes"></i><h3>No decisions logged yet</h3><p>Record every key decision so you never forget what you chose or why</p></div>`;
}
function openAddDecision() { showModal('modal-decision'); }
function saveDecision() {
  const data = {
    date: document.getElementById('dc-edit-date').value || new Date().toISOString().split('T')[0],
    topic: document.getElementById('dc-edit-topic').value.trim(),
    decision: document.getElementById('dc-edit-decision').value.trim(),
    alternatives: document.getElementById('dc-edit-alternatives').value,
    notes: document.getElementById('dc-edit-notes').value,
  };
  if (!data.decision) { alert('Decision text required'); return; }
  Store.addDecision(data);
  hideModal('modal-decision');
  ['date','topic','decision','alternatives','notes'].forEach(k => { document.getElementById('dc-edit-' + k).value = ''; });
  renderDecisions();
  toast('Decision logged');
}
function deleteDecision(id) { if (confirm('Delete this decision?')) { Store.deleteDecision(id); renderDecisions(); toast('Deleted'); } }

// ── Settings ──
function renderSettings() {
  const meta = Store.getMeta();
  document.getElementById('set-projectName').value = meta.projectName || '';
  document.getElementById('set-address').value = meta.address || '';
  document.getElementById('set-totalBudget').value = meta.totalBudget || 50000;
  document.getElementById('set-moveInDate').value = meta.moveInDate || '';
  document.getElementById('set-housewarmingDate').value = meta.housewarmingDate || '';
  document.getElementById('set-christmasDate').value = meta.christmasDate || '';
}
function saveSettings() {
  Store.setMeta({
    projectName: document.getElementById('set-projectName').value,
    address: document.getElementById('set-address').value,
    totalBudget: Number(document.getElementById('set-totalBudget').value),
    moveInDate: document.getElementById('set-moveInDate').value,
    housewarmingDate: document.getElementById('set-housewarmingDate').value,
    christmasDate: document.getElementById('set-christmasDate').value,
  });
  document.querySelector('.brand-title').textContent = document.getElementById('set-projectName').value;
  toast('Settings saved ✓');
}
function resetData() {
  if (confirm('This will reset ALL data to defaults. Are you sure?')) {
    localStorage.removeItem('renoData_v1');
    location.reload();
  }
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  Store.load();
  showView('dashboard');
  document.getElementById('set-moveInDate') && (document.getElementById('set-moveInDate').value = Store.getMeta().moveInDate);
});
