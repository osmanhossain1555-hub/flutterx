const defaultData = {
  overview: { incomeTarget: 10400, expenseBudget: 15160 },
  accounts: [
    { name: 'Cash Euro', type: 'Payment', balance: 2372.97 },
    { name: 'Money Pro Bank', type: 'Payment', balance: 17679.00 },
    { name: 'National Bank', type: 'Payment', balance: 15410.00 },
    { name: 'Credit Card', type: 'Credit', balance: -5031.00 },
    { name: 'Bike', type: 'Asset', balance: 1000.00 },
    { name: 'Motorbike', type: 'Asset', balance: 14400.00 },
    { name: 'Car', type: 'Asset', balance: 50000.00 }
  ],
  goals: [
    { name: 'No debt', saved: 95309, target: 100000 },
    { name: 'Yacht', saved: 56188.23, target: 180000 }
  ],
  planner: [
    { name: 'Salary', date: 'Aug 10', amount: 6100 },
    { name: 'Interest income', date: 'Aug 15', amount: 400 },
    { name: 'Cafe', date: 'Aug 18', amount: 74 }
  ],
  budget: {
    categories: [
      { name: 'Travelling', icon: '✈️', spent: 10000, budget: 10000, color: '#20d39b' },
      { name: 'Education', icon: '🎓', spent: 1000, budget: 1000, color: '#b5d931' },
      { name: 'Cafe', icon: '☕', spent: 900, budget: 900, color: '#ffd53b' },
      { name: 'Clothing', icon: '🧥', spent: 738, budget: 1400, color: '#ffe89f' },
      { name: 'Home', icon: '🏠', spent: 650, budget: 1500, color: '#ff9b21' },
      { name: 'Car', icon: '🚗', spent: 247, budget: 200, color: '#3db4ff' },
      { name: 'Utilities', icon: '⚙️', spent: 120, budget: 160, color: '#8b7cff' }
    ],
    bars: [82, 92, 58, 79, 22, 15, 12, 8]
  },
  transactions: [
    { date: '2023-07-30', category: 'Electricity', account: 'National Bank', type: 'expense', amount: 120, note: 'July bill' },
    { date: '2023-07-26', category: 'Clothing', account: 'Money Pro Bank', type: 'expense', amount: 700, note: 'Mall purchase' },
    { date: '2023-07-12', category: 'Cafe', account: 'Money Pro Bank', type: 'expense', amount: 38, note: 'Coffee meeting' },
    { date: '2023-07-10', category: 'Cafe', account: 'Money Pro Bank', type: 'expense', amount: 900, note: 'Team lunch' },
    { date: '2023-07-09', category: 'Education', account: 'Money Pro Bank', type: 'expense', amount: 1000, note: 'Course fee' },
    { date: '2023-07-08', category: 'Fuel', account: 'Money Pro Bank', type: 'expense', amount: 247, note: 'Petrol' },
    { date: '2023-07-05', category: 'Travelling', account: 'Money Pro Bank', type: 'expense', amount: 10000, note: 'Vacation booking' },
    { date: '2023-07-03', category: 'Furniture / Accessories', account: 'National Bank', type: 'expense', amount: 450, note: 'Desk lamp' },
    { date: '2023-07-29', category: 'Business Income', account: 'Money Pro Bank', type: 'income', amount: 3600, note: 'Client project' },
    { date: '2023-07-15', category: 'Interest Income', account: 'National Bank', type: 'income', amount: 400, note: 'Savings interest' },
    { date: '2023-07-10', category: 'Salary', account: 'Money Pro Bank', type: 'income', amount: 6000, note: 'Monthly salary' }
  ]
};

const storageKey = 'finance-tracker-pwa-forms';
let state = loadData();
let deferredPrompt = null;
let currentEditor = null;

function loadData() {
  const fromStorage = localStorage.getItem(storageKey);
  return fromStorage ? JSON.parse(fromStorage) : structuredClone(defaultData);
}
function saveData() { localStorage.setItem(storageKey, JSON.stringify(state)); }
const formatCurrency = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value || 0));
const formatDate = value => new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function calcTotals() {
  const income = (state.transactions || []).filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
  const expense = (state.transactions || []).filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
  return { income, expense, profit: income - expense };
}
function renderSidebar() {
  const accountsList = document.getElementById('accountsList');
  accountsList.innerHTML = '';
  let total = 0;
  (state.accounts || []).forEach(acc => {
    total += Number(acc.balance || 0);
    const row = document.createElement('div');
    row.className = 'account-row';
    row.innerHTML = `<div><div class="account-name">${acc.name || ''}</div><div class="account-meta">${acc.type || ''}</div></div><div class="${Number(acc.balance || 0) >= 0 ? 'positive' : 'negative'}">${formatCurrency(acc.balance)}</div>`;
    accountsList.appendChild(row);
  });
  document.getElementById('accountsTotal').textContent = formatCurrency(total);

  const goalsList = document.getElementById('goalsList');
  goalsList.innerHTML = '';
  (state.goals || []).forEach(goal => {
    const pct = goal.target ? Math.round((Number(goal.saved || 0) / Number(goal.target || 1)) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'goal-row';
    row.innerHTML = `<div><div class="goal-name">${goal.name || ''}</div><div class="goal-meta">${pct}% complete</div></div><div class="positive">${formatCurrency(goal.saved)}</div>`;
    goalsList.appendChild(row);
  });
}
function renderHeader() {
  const totals = calcTotals();
  document.getElementById('netBalance').textContent = formatCurrency(totals.profit);
  document.getElementById('profitAmount').textContent = formatCurrency(totals.profit);
  const incomePct = Math.min(100, Math.round((totals.income / Number(state.overview?.incomeTarget || 1)) * 100));
  const expensePct = Math.min(100, Math.round((totals.expense / Number(state.overview?.expenseBudget || 1)) * 100));
  document.getElementById('incomeProgress').style.width = incomePct + '%';
  document.getElementById('expenseProgress').style.width = expensePct + '%';

  const now = new Date();
  document.getElementById('dayNumber').textContent = now.getDate();
  document.getElementById('fullDate').textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', year: 'numeric' });
  document.getElementById('monthLabel').textContent = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
function renderPlanner() {
  const planner = document.getElementById('plannerList');
  planner.innerHTML = '';
  (state.planner || []).forEach(item => {
    const row = document.createElement('div');
    row.className = 'planner-row';
    row.innerHTML = `<div><div class="txn-name">${item.name || ''}</div><div class="txn-meta">${item.date || ''}</div></div><div class="pill">${formatCurrency(item.amount)}</div>`;
    planner.appendChild(row);
  });
}
function renderBudget() {
  const bars = document.getElementById('barChart');
  bars.innerHTML = '';
  (state.budget?.bars || []).forEach((value, index) => {
    const item = document.createElement('div');
    item.className = 'bar ' + (index === 4 ? 'negative' : '');
    item.innerHTML = `<span style="height:${Math.max(8, Number(value) || 0)}%"></span>`;
    bars.appendChild(item);
  });
  const expenseTotal = (state.budget?.categories || []).reduce((s, c) => s + Number(c.spent || 0), 0);
  const totalBudget = (state.budget?.categories || []).reduce((s, c) => s + Number(c.budget || 0), 0);
  document.getElementById('budgetSummary').textContent = `${formatCurrency(expenseTotal)} spent of ${formatCurrency(totalBudget)} budget`;

  const grid = document.getElementById('categoryGrid');
  grid.innerHTML = '';
  (state.budget?.categories || []).forEach(cat => {
    const item = document.createElement('div');
    item.className = 'category-item';
    item.innerHTML = `<div class="circle" style="border-color:${cat.color || '#8fb0bf'}">${cat.icon || '•'}</div><div class="txn-name">${cat.name || ''}</div><div class="positive">${formatCurrency(cat.spent)}</div><div class="txn-meta">${formatCurrency(cat.budget)} budget</div>`;
    grid.appendChild(item);
  });
}
function renderLegend() {
  const legend = document.getElementById('legend');
  legend.innerHTML = '';
  (state.budget?.categories || []).forEach(cat => {
    const row = document.createElement('div');
    row.className = 'legend-row';
    row.innerHTML = `<div class="legend-left"><span class="swatch" style="background:${cat.color || '#8fb0bf'}"></span><span>${cat.name || ''}</span></div><strong>${formatCurrency(cat.spent)}</strong>`;
    legend.appendChild(row);
  });
}
function renderTransactionFilters() {
  const accountSelect = document.getElementById('filterAccount');
  const current = accountSelect.value || 'all';
  accountSelect.innerHTML = '<option value="all">All accounts</option>';
  [...new Set((state.transactions || []).map(t => t.account))].sort().forEach(acc => {
    const opt = document.createElement('option');
    opt.value = acc;
    opt.textContent = acc;
    if (acc === current) opt.selected = true;
    accountSelect.appendChild(opt);
  });
}
function renderTransactions() {
  const type = document.getElementById('filterType').value;
  const account = document.getElementById('filterAccount').value;
  const query = document.getElementById('searchInput').value.trim().toLowerCase();

  const rows = (state.transactions || [])
    .filter(t => type === 'all' || t.type === type)
    .filter(t => account === 'all' || t.account === account)
    .filter(t => !query || `${t.category || ''} ${t.note || ''}`.toLowerCase().includes(query))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const table = document.getElementById('transactionsTable');
  table.innerHTML = '';
  rows.forEach(tx => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${formatDate(tx.date)}</td><td>${tx.category || ''}</td><td>${tx.account || ''}</td><td style="text-transform:capitalize">${tx.type || ''}</td><td class="${tx.type === 'income' ? 'positive' : 'negative'}">${formatCurrency(tx.amount)}</td>`;
    table.appendChild(tr);
  });
  document.getElementById('txnCount').textContent = `${rows.length} items`;
}
function rerender() {
  saveData();
  renderSidebar();
  renderHeader();
  renderPlanner();
  renderBudget();
  renderLegend();
  renderTransactionFilters();
  renderTransactions();
}

function createInput(label, name, value = '', type = 'text') {
  return `<label><div class="subtle">${label}</div><input data-field="${name}" type="${type}" value="${String(value ?? '').replace(/"/g, '&quot;')}" /></label>`;
}
function createTextRow(title, idx, fieldsHtml, removeTarget, removeIndex) {
  return `<div class="editor-row"><div class="editor-row-header"><strong>${title} ${idx + 1}</strong><button type="button" class="mini remove-btn" data-remove="${removeTarget}" data-index="${removeIndex}">Remove</button></div><div class="editor-grid">${fieldsHtml}</div></div>`;
}

function showEditor(section) {
  currentEditor = section;
  document.getElementById('editorTitle').textContent = `Edit ${section}`;
  document.querySelectorAll('.editor-section').forEach(el => el.classList.add('hidden'));

  if (section === 'overview') buildOverviewEditor();
  if (section === 'accounts') buildAccountsEditor();
  if (section === 'goals') buildGoalsEditor();
  if (section === 'planner') buildPlannerEditor();
  if (section === 'budget') buildBudgetEditor();
  if (section === 'transactions') buildTransactionsEditor();

  document.getElementById('editorDialog').showModal();
}

function buildOverviewEditor() {
  const root = document.getElementById('editorOverview');
  root.classList.remove('hidden');
  root.innerHTML = `<div class="editor-grid">
    ${createInput('Income Target', 'incomeTarget', state.overview?.incomeTarget, 'number')}
    ${createInput('Expense Budget', 'expenseBudget', state.overview?.expenseBudget, 'number')}
  </div>`;
}

function buildAccountsEditor() {
  const root = document.getElementById('editorAccounts');
  root.classList.remove('hidden');
  root.innerHTML = `<div class="editor-list" id="accountsEditorList"></div><button type="button" class="mini add-item-btn" id="addAccountItem">Add Account</button>`;
  const list = root.querySelector('#accountsEditorList');
  (state.accounts || []).forEach((acc, i) => {
    list.insertAdjacentHTML('beforeend', createTextRow('Account', i, `
      ${createInput('Name', 'name', acc.name)}
      ${createInput('Type', 'type', acc.type)}
      ${createInput('Balance', 'balance', acc.balance, 'number')}
    `, 'accounts', i));
  });
  root.querySelector('#addAccountItem').onclick = () => {
    state.accounts.push({ name: '', type: 'Payment', balance: 0 });
    buildAccountsEditor();
  };
  hookRemoveButtons();
}

function buildGoalsEditor() {
  const root = document.getElementById('editorGoals');
  root.classList.remove('hidden');
  root.innerHTML = `<div class="editor-list" id="goalsEditorList"></div><button type="button" class="mini add-item-btn" id="addGoalItem">Add Goal</button>`;
  const list = root.querySelector('#goalsEditorList');
  (state.goals || []).forEach((goal, i) => {
    list.insertAdjacentHTML('beforeend', createTextRow('Goal', i, `
      ${createInput('Name', 'name', goal.name)}
      ${createInput('Saved', 'saved', goal.saved, 'number')}
      ${createInput('Target', 'target', goal.target, 'number')}
    `, 'goals', i));
  });
  root.querySelector('#addGoalItem').onclick = () => {
    state.goals.push({ name: '', saved: 0, target: 0 });
    buildGoalsEditor();
  };
  hookRemoveButtons();
}

function buildPlannerEditor() {
  const root = document.getElementById('editorPlanner');
  root.classList.remove('hidden');
  root.innerHTML = `<div class="editor-list" id="plannerEditorList"></div><button type="button" class="mini add-item-btn" id="addPlannerItem">Add Planner Item</button>`;
  const list = root.querySelector('#plannerEditorList');
  (state.planner || []).forEach((item, i) => {
    list.insertAdjacentHTML('beforeend', createTextRow('Planner Item', i, `
      ${createInput('Name', 'name', item.name)}
      ${createInput('Date Label', 'date', item.date)}
      ${createInput('Amount', 'amount', item.amount, 'number')}
    `, 'planner', i));
  });
  root.querySelector('#addPlannerItem').onclick = () => {
    state.planner.push({ name: '', date: '', amount: 0 });
    buildPlannerEditor();
  };
  hookRemoveButtons();
}

function buildBudgetEditor() {
  const root = document.getElementById('editorBudget');
  root.classList.remove('hidden');
  const bars = (state.budget?.bars || []).join(', ');
  root.innerHTML = `
    <div class="editor-row">
      <div class="editor-row-header"><strong>Bar Values</strong></div>
      <div class="editor-grid single">
        <label><div class="subtle">Comma-separated percentages</div><input id="budgetBarsInput" value="${bars.replace(/"/g, '&quot;')}" /></label>
      </div>
    </div>
    <div class="editor-list" id="budgetCategoryEditorList"></div>
    <button type="button" class="mini add-item-btn" id="addBudgetCategory">Add Budget Category</button>
  `;
  const list = root.querySelector('#budgetCategoryEditorList');
  (state.budget?.categories || []).forEach((cat, i) => {
    list.insertAdjacentHTML('beforeend', createTextRow('Category', i, `
      ${createInput('Name', 'name', cat.name)}
      ${createInput('Icon', 'icon', cat.icon)}
      ${createInput('Spent', 'spent', cat.spent, 'number')}
      ${createInput('Budget', 'budget', cat.budget, 'number')}
      ${createInput('Color', 'color', cat.color)}
    `, 'budget.categories', i));
  });
  root.querySelector('#addBudgetCategory').onclick = () => {
    state.budget.categories.push({ name: '', icon: '•', spent: 0, budget: 0, color: '#8fb0bf' });
    buildBudgetEditor();
  };
  hookRemoveButtons();
}

function buildTransactionsEditor() {
  const root = document.getElementById('editorTransactions');
  root.classList.remove('hidden');
  root.innerHTML = `<div class="editor-list" id="transactionsEditorList"></div><button type="button" class="mini add-item-btn" id="addTransactionItem">Add Transaction Row</button>`;
  const list = root.querySelector('#transactionsEditorList');
  (state.transactions || []).forEach((tx, i) => {
    list.insertAdjacentHTML('beforeend', createTextRow('Transaction', i, `
      ${createInput('Date', 'date', tx.date, 'date')}
      ${createInput('Category', 'category', tx.category)}
      ${createInput('Account', 'account', tx.account)}
      ${createInput('Type', 'type', tx.type)}
      ${createInput('Amount', 'amount', tx.amount, 'number')}
      ${createInput('Note', 'note', tx.note || '')}
    `, 'transactions', i));
  });
  root.querySelector('#addTransactionItem').onclick = () => {
    state.transactions.push({ date: new Date().toISOString().slice(0,10), category: '', account: '', type: 'expense', amount: 0, note: '' });
    buildTransactionsEditor();
  };
  hookRemoveButtons();
}

function hookRemoveButtons() {
  document.querySelectorAll('[data-remove]').forEach(btn => {
    btn.onclick = () => {
      const target = btn.dataset.remove;
      const idx = Number(btn.dataset.index);
      if (target === 'accounts') state.accounts.splice(idx, 1);
      if (target === 'goals') state.goals.splice(idx, 1);
      if (target === 'planner') state.planner.splice(idx, 1);
      if (target === 'transactions') state.transactions.splice(idx, 1);
      if (target === 'budget.categories') state.budget.categories.splice(idx, 1);
      showEditor(currentEditor);
    };
  });
}

function saveCurrentEditor() {
  if (currentEditor === 'overview') {
    state.overview = {
      incomeTarget: Number(document.querySelector('#editorOverview [data-field="incomeTarget"]').value || 0),
      expenseBudget: Number(document.querySelector('#editorOverview [data-field="expenseBudget"]').value || 0)
    };
  }

  if (currentEditor === 'accounts') {
    state.accounts = [...document.querySelectorAll('#accountsEditorList .editor-row')].map(row => ({
      name: row.querySelector('[data-field="name"]').value,
      type: row.querySelector('[data-field="type"]').value,
      balance: Number(row.querySelector('[data-field="balance"]').value || 0)
    }));
  }

  if (currentEditor === 'goals') {
    state.goals = [...document.querySelectorAll('#goalsEditorList .editor-row')].map(row => ({
      name: row.querySelector('[data-field="name"]').value,
      saved: Number(row.querySelector('[data-field="saved"]').value || 0),
      target: Number(row.querySelector('[data-field="target"]').value || 0)
    }));
  }

  if (currentEditor === 'planner') {
    state.planner = [...document.querySelectorAll('#plannerEditorList .editor-row')].map(row => ({
      name: row.querySelector('[data-field="name"]').value,
      date: row.querySelector('[data-field="date"]').value,
      amount: Number(row.querySelector('[data-field="amount"]').value || 0)
    }));
  }

  if (currentEditor === 'budget') {
    state.budget.bars = (document.getElementById('budgetBarsInput').value || '')
      .split(',')
      .map(v => Number(v.trim()))
      .filter(v => !Number.isNaN(v));
    state.budget.categories = [...document.querySelectorAll('#budgetCategoryEditorList .editor-row')].map(row => ({
      name: row.querySelector('[data-field="name"]').value,
      icon: row.querySelector('[data-field="icon"]').value,
      spent: Number(row.querySelector('[data-field="spent"]').value || 0),
      budget: Number(row.querySelector('[data-field="budget"]').value || 0),
      color: row.querySelector('[data-field="color"]').value
    }));
  }

  if (currentEditor === 'transactions') {
    state.transactions = [...document.querySelectorAll('#transactionsEditorList .editor-row')].map(row => ({
      date: row.querySelector('[data-field="date"]').value,
      category: row.querySelector('[data-field="category"]').value,
      account: row.querySelector('[data-field="account"]').value,
      type: row.querySelector('[data-field="type"]').value,
      amount: Number(row.querySelector('[data-field="amount"]').value || 0),
      note: row.querySelector('[data-field="note"]').value
    }));
  }

  document.getElementById('editorDialog').close();
  rerender();
}

document.querySelectorAll('[data-editor]').forEach(btn => {
  btn.addEventListener('click', () => showEditor(btn.dataset.editor));
});

document.getElementById('saveSectionBtn').addEventListener('click', e => {
  e.preventDefault();
  saveCurrentEditor();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  state = structuredClone(defaultData);
  rerender();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'finance-tracker-data.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    state = JSON.parse(await file.text());
    rerender();
  } catch {
    alert('Could not import JSON file.');
  } finally {
    e.target.value = '';
  }
});

document.getElementById('addBtn').addEventListener('click', () => {
  document.getElementById('txDate').value = new Date().toISOString().slice(0, 10);
  document.getElementById('txDialog').showModal();
});

document.getElementById('saveTxBtn').addEventListener('click', event => {
  event.preventDefault();
  const tx = {
    date: document.getElementById('txDate').value,
    type: document.getElementById('txType').value,
    category: document.getElementById('txCategory').value.trim(),
    account: document.getElementById('txAccount').value.trim(),
    amount: Number(document.getElementById('txAmount').value),
    note: document.getElementById('txNote').value.trim()
  };
  if (!tx.date || !tx.category || !tx.account || !tx.amount) return;
  state.transactions.push(tx);
  const found = (state.accounts || []).find(a => a.name.toLowerCase() === tx.account.toLowerCase());
  if (found) found.balance += tx.type === 'income' ? tx.amount : -tx.amount;
  else state.accounts.unshift({ name: tx.account, type: 'Payment', balance: tx.type === 'income' ? tx.amount : -tx.amount });
  document.getElementById('txDialog').close();
  rerender();
});

['filterType', 'filterAccount', 'searchInput'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderTransactions);
  document.getElementById(id).addEventListener('change', renderTransactions);
});

// Install behavior
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installInfo').classList.add('hidden');
  document.getElementById('installBtn').disabled = false;
});

document.getElementById('installBtn').addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    return;
  }
  document.getElementById('installInfo').classList.remove('hidden');
  if (window.matchMedia('(display-mode: standalone)').matches) {
    document.getElementById('installInfo').textContent = 'The app is already installed.';
  }
});

function updateOnlineStatus() {
  document.getElementById('offlineBanner').classList.toggle('hidden', navigator.onLine);
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try { await navigator.serviceWorker.register('./service-worker.js'); } catch (e) {}
  });
}

rerender();