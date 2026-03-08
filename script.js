const demoData = {
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
  budget: {
    total: 15160,
    incomeTarget: 10400,
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
const storageKey = 'finance-tracker-dashboard-demo';
function loadData() { const v = localStorage.getItem(storageKey); return v ? JSON.parse(v) : structuredClone(demoData); }
function saveData(data) { localStorage.setItem(storageKey, JSON.stringify(data)); }
let state = loadData();
const formatCurrency = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
const formatDate = value => new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
function calcTotals() {
  const income = state.transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = state.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  return { income, expense, profit: income - expense };
}
function renderSidebar() {
  const accountsList = document.getElementById('accountsList'); accountsList.innerHTML = ''; let total = 0;
  state.accounts.forEach(acc => {
    total += Number(acc.balance);
    const row = document.createElement('div'); row.className = 'account-row';
    row.innerHTML = `<div><div class="account-name">${acc.name}</div><div class="account-meta">${acc.type}</div></div><div class="${acc.balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(acc.balance)}</div>`;
    accountsList.appendChild(row);
  });
  document.getElementById('accountsTotal').textContent = formatCurrency(total);
  const goalsList = document.getElementById('goalsList'); goalsList.innerHTML = '';
  state.goals.forEach(goal => {
    const row = document.createElement('div'); row.className = 'goal-row';
    row.innerHTML = `<div><div class="goal-name">${goal.name}</div><div class="goal-meta">${Math.round((goal.saved / goal.target) * 100)}% complete</div></div><div class="positive">${formatCurrency(goal.saved)}</div>`;
    goalsList.appendChild(row);
  });
}
function renderHeader() {
  const totals = calcTotals();
  document.getElementById('netBalance').textContent = formatCurrency(totals.profit);
  document.getElementById('profitAmount').textContent = formatCurrency(totals.profit);
  document.getElementById('incomeProgress').style.width = Math.min(100, Math.round((totals.income / state.budget.incomeTarget) * 100)) + '%';
  document.getElementById('expenseProgress').style.width = Math.min(100, Math.round((totals.expense / state.budget.total) * 100)) + '%';
  const now = new Date();
  document.getElementById('dayNumber').textContent = now.getDate();
  document.getElementById('todayLabel').textContent = now.toLocaleDateString('en-US', { weekday: 'short' });
  document.getElementById('fullDate').textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', year: 'numeric' });
  document.getElementById('monthName').textContent = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  document.getElementById('monthLabel').textContent = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
function renderPlanner() {
  const planner = document.getElementById('plannerList'); planner.innerHTML = '';
  [{ name: 'Salary', date: 'Aug 10', amount: 6100, cls: 'pill' }, { name: 'Interest income', date: 'Aug 15', amount: 400, cls: 'pill' }, { name: 'Cafe', date: 'Aug 18', amount: 74, cls: 'pill yellow' }].forEach(item => {
    const row = document.createElement('div'); row.className = 'planner-row';
    row.innerHTML = `<div><div class="txn-name">${item.name}</div><div class="txn-meta">${item.date}</div></div><div class="${item.cls}">${formatCurrency(item.amount)}</div>`;
    planner.appendChild(row);
  });
}
function renderBudget() {
  const bars = document.getElementById('barChart'); bars.innerHTML = '';
  state.budget.bars.forEach((value, index) => { const item = document.createElement('div'); item.className = 'bar ' + (index === 4 ? 'negative' : ''); item.innerHTML = `<span style="height:${value}%"></span>`; bars.appendChild(item); });
  const expenseTotal = state.budget.categories.reduce((s, c) => s + c.spent, 0);
  document.getElementById('budgetSummary').textContent = `${formatCurrency(expenseTotal)} spent of ${formatCurrency(state.budget.total)} budget`;
  const grid = document.getElementById('categoryGrid'); grid.innerHTML = '';
  state.budget.categories.slice(0, 6).forEach(cat => {
    const item = document.createElement('div'); item.className = 'category-item';
    item.innerHTML = `<div class="circle" style="border-color:${cat.color}">${cat.icon}</div><div class="txn-name">${cat.name}</div><div class="positive">${formatCurrency(cat.spent)}</div><div class="txn-meta">${formatCurrency(cat.budget)} budget</div>`;
    grid.appendChild(item);
  });
}
function renderLegend() {
  const legend = document.getElementById('legend'); legend.innerHTML = '';
  state.budget.categories.forEach(cat => {
    const row = document.createElement('div'); row.className = 'legend-row';
    row.innerHTML = `<div class="legend-left"><span class="swatch" style="background:${cat.color}"></span><span>${cat.name}</span></div><strong>${formatCurrency(cat.spent)}</strong>`;
    legend.appendChild(row);
  });
}
function renderTransactionFilters() {
  const accountSelect = document.getElementById('filterAccount'); const current = accountSelect.value || 'all';
  accountSelect.innerHTML = '<option value="all">All accounts</option>';
  [...new Set(state.transactions.map(t => t.account))].sort().forEach(acc => { const opt = document.createElement('option'); opt.value = acc; opt.textContent = acc; if (acc === current) opt.selected = true; accountSelect.appendChild(opt); });
}
function renderTransactions() {
  const type = document.getElementById('filterType').value; const account = document.getElementById('filterAccount').value; const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const rows = state.transactions.filter(t => type === 'all' || t.type === type).filter(t => account === 'all' || t.account === account).filter(t => !query || `${t.category} ${t.note}`.toLowerCase().includes(query)).sort((a, b) => new Date(b.date) - new Date(a.date));
  const table = document.getElementById('transactionsTable'); table.innerHTML = '';
  rows.forEach(tx => { const tr = document.createElement('tr'); tr.innerHTML = `<td>${formatDate(tx.date)}</td><td>${tx.category}</td><td>${tx.account}</td><td style="text-transform:capitalize">${tx.type}</td><td class="${tx.type === 'income' ? 'positive' : 'negative'}">${formatCurrency(tx.amount)}</td>`; table.appendChild(tr); });
  document.getElementById('txnCount').textContent = `${rows.length} items`;
}
function rerender() { saveData(state); renderSidebar(); renderHeader(); renderPlanner(); renderBudget(); renderLegend(); renderTransactionFilters(); renderTransactions(); }
document.getElementById('seedBtn').addEventListener('click', () => { state = structuredClone(demoData); rerender(); });
document.getElementById('addBtn').addEventListener('click', () => { document.getElementById('txDate').value = new Date().toISOString().slice(0, 10); document.getElementById('txDialog').showModal(); });
document.getElementById('saveTxBtn').addEventListener('click', event => {
  event.preventDefault();
  const tx = { date: document.getElementById('txDate').value, type: document.getElementById('txType').value, category: document.getElementById('txCategory').value.trim(), account: document.getElementById('txAccount').value.trim(), amount: Number(document.getElementById('txAmount').value), note: document.getElementById('txNote').value.trim() };
  if (!tx.date || !tx.category || !tx.account || !tx.amount) return;
  state.transactions.push(tx);
  const found = state.accounts.find(a => a.name.toLowerCase() === tx.account.toLowerCase());
  if (found) found.balance += tx.type === 'income' ? tx.amount : -tx.amount;
  else state.accounts.unshift({ name: tx.account, type: 'Payment', balance: tx.type === 'income' ? tx.amount : -tx.amount });
  document.getElementById('txDialog').close(); rerender();
});
['filterType', 'filterAccount', 'searchInput'].forEach(id => { document.getElementById(id).addEventListener('input', renderTransactions); document.getElementById(id).addEventListener('change', renderTransactions); });
rerender();
