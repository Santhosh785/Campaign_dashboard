let currentTab = 'students';
let countdown = 30;
let timer;
let allStudents = [];
let allShopify = [];

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.querySelectorAll('.nav-btn')[tab === 'students' ? 0 : 1].classList.add('active');
  loadData();
}

function formatTime(seconds) {
  if (!seconds) return '0m 0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
}

function eventBadge(type) {
  const map = {
    page_open:                   ['blue',  'Page Open'],
    scroll_update:               ['gray',  'Scrolling'],
    page_close:                  ['amber', 'Page Close'],
    product_viewed:              ['blue',  'Viewed'],
    product_added_to_cart:       ['green', 'Added to Cart'],
    product_removed_from_cart:   ['red',   'Removed from Cart'],
    checkout_started:            ['amber', 'Checkout'],
    checkout_completed:          ['green', 'Purchased'],
  };
  const [color, label] = map[type] || ['gray', type];
  return `<span class="badge badge-${color}">${label}</span>`;
}

function renderStudents(rows) {
  const tbody = document.getElementById('students-body');
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="11" class="empty">No results found</td></tr>`; return; }

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.name || '—'}</td>
      <td>${r.phone || '—'}</td>
      <td>${eventBadge(r.event_type)}</td>
      <td>${formatTime(r.time_spent_seconds)}</td>
      <td>${r.scroll_depth_percent ?? '—'}%</td>
      <td>${r.scroll_count ?? '—'}</td>
      <td>${r.refresh_count ?? '—'}</td>
      <td>${r.shared ? '<span class="badge badge-green">YES</span>' : '<span class="badge badge-gray">No</span>'}</td>
      <td>${r.shared_views || 0}</td>
      <td>${formatDate(r.timestamp)}</td>
      <td><button class="del-btn" onclick="deleteRow('students', ${r.id})">Delete</button></td>
    </tr>
  `).join('');
}

function renderShopify(rows) {
  const tbody = document.getElementById('shopify-body');
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="9" class="empty">No results found</td></tr>`; return; }

  tbody.innerHTML = rows.map(r => {
    const cartItems = Array.isArray(r.cart_items) && r.cart_items.length
      ? `<div class="cart-pills">${r.cart_items.map(i => `<span class="cart-pill">${i.product_name} (₹${i.price})</span>`).join('')}</div>`
      : '—';

    const pageUrl = r.page_url
      ? `<a href="${r.page_url}" target="_blank" style="color:#a5b4fc">${new URL(r.page_url).pathname}</a>`
      : '—';

    return `
      <tr>
        <td>${r.name || '—'}</td>
        <td>${r.phone || '—'}</td>
        <td>${eventBadge(r.event_type)}</td>
        <td>${r.product_name || '—'}</td>
        <td>${r.price ? `₹${r.price}` : '—'}</td>
        <td style="max-width:300px;white-space:normal">${cartItems}</td>
        <td>${pageUrl}</td>
        <td>${formatDate(r.created_at)}</td>
        <td><button class="del-btn" onclick="deleteRow('shopify', ${r.id})">Delete</button></td>
      </tr>
    `;
  }).join('');
}

function applyStudentFilters() {
  const search = document.getElementById('students-search').value.toLowerCase();
  const event  = document.getElementById('students-event-filter').value;
  const shared = document.getElementById('students-shared-filter').value;

  const filtered = allStudents.filter(r => {
    const matchSearch = !search ||
      (r.name || '').toLowerCase().includes(search) ||
      (r.phone || '').toLowerCase().includes(search);
    const matchEvent  = !event  || r.event_type === event;
    const matchShared = !shared ||
      (shared === 'yes' ? r.shared === true : r.shared !== true);
    return matchSearch && matchEvent && matchShared;
  });

  renderStudents(filtered);
}

function applyShopifyFilters() {
  const search = document.getElementById('shopify-search').value.toLowerCase();
  const event  = document.getElementById('shopify-event-filter').value;

  const filtered = allShopify.filter(r => {
    const matchSearch = !search ||
      (r.name || '').toLowerCase().includes(search) ||
      (r.phone || '').toLowerCase().includes(search) ||
      (r.product_name || '').toLowerCase().includes(search);
    const matchEvent = !event || r.event_type === event;
    return matchSearch && matchEvent;
  });

  renderShopify(filtered);
}

async function loadStudents() {
  const res = await fetch('/api/dashboard/students');
  allStudents = await res.json();

  const stats = document.getElementById('stats');
  stats.innerHTML = `
    <div class="stat-card"><div class="label">Total Students</div><div class="value">${allStudents.length}</div></div>
    <div class="stat-card"><div class="label">Shared</div><div class="value">${allStudents.filter(r => r.shared).length}</div></div>
    <div class="stat-card"><div class="label">Avg Scroll Depth</div><div class="value">${allStudents.length ? Math.round(allStudents.reduce((a, r) => a + (r.scroll_depth_percent || 0), 0) / allStudents.length) : 0}%</div></div>
    <div class="stat-card"><div class="label">Avg Time Spent</div><div class="value">${allStudents.length ? formatTime(Math.round(allStudents.reduce((a, r) => a + (r.time_spent_seconds || 0), 0) / allStudents.length)) : '0m 0s'}</div></div>
  `;

  applyStudentFilters();
}

async function loadShopify() {
  const res = await fetch('/api/dashboard/shopify');
  allShopify = await res.json();

  const stats = document.getElementById('stats');
  stats.innerHTML = `
    <div class="stat-card"><div class="label">Total Customers</div><div class="value">${allShopify.length}</div></div>
    <div class="stat-card"><div class="label">Products Viewed</div><div class="value">${allShopify.filter(r => r.event_type === 'product_viewed').length}</div></div>
    <div class="stat-card"><div class="label">Added to Cart</div><div class="value">${allShopify.filter(r => r.event_type === 'product_added_to_cart').length}</div></div>
    <div class="stat-card"><div class="label">Purchased</div><div class="value">${allShopify.filter(r => r.event_type === 'checkout_completed').length}</div></div>
  `;

  applyShopifyFilters();
}

async function deleteRow(table, id) {
  if (!confirm('Delete this row?')) return;
  await fetch(`/api/dashboard/${table}/${id}`, { method: 'DELETE' });
  loadData();
}

async function loadData() {
  currentTab === 'students' ? await loadStudents() : await loadShopify();
}

function startTimer() {
  clearInterval(timer);
  countdown = 30;
  document.getElementById('countdown').textContent = countdown;
  timer = setInterval(() => {
    countdown--;
    document.getElementById('countdown').textContent = countdown;
    if (countdown <= 0) {
      loadData();
      countdown = 30;
    }
  }, 1000);
}

loadData();
startTimer();
