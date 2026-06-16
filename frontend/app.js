let currentTab = 'students';
let countdown = 30;
let timer;

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
    page_open:            ['blue',  'Page Open'],
    scroll_update:        ['gray',  'Scrolling'],
    page_close:           ['amber', 'Page Close'],
    product_viewed:       ['blue',  'Viewed'],
    product_added_to_cart:['green', 'Added to Cart'],
    checkout_started:     ['amber', 'Checkout'],
    checkout_completed:   ['green', 'Purchased'],
  };
  const [color, label] = map[type] || ['gray', type];
  return `<span class="badge badge-${color}">${label}</span>`;
}

async function loadStudents() {
  const res = await fetch('/api/dashboard/students');
  const rows = await res.json();

  const stats = document.getElementById('stats');
  stats.innerHTML = `
    <div class="stat-card"><div class="label">Total Students</div><div class="value">${rows.length}</div></div>
    <div class="stat-card"><div class="label">Shared</div><div class="value">${rows.filter(r => r.shared).length}</div></div>
    <div class="stat-card"><div class="label">Avg Scroll Depth</div><div class="value">${rows.length ? Math.round(rows.reduce((a, r) => a + (r.scroll_depth_percent || 0), 0) / rows.length) : 0}%</div></div>
    <div class="stat-card"><div class="label">Avg Time Spent</div><div class="value">${rows.length ? formatTime(Math.round(rows.reduce((a, r) => a + (r.time_spent_seconds || 0), 0) / rows.length)) : '0m 0s'}</div></div>
  `;

  const tbody = document.getElementById('students-body');
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="9" class="empty">No data yet</td></tr>`; return; }

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
      <td>${formatDate(r.timestamp)}</td>
      <td><button class="del-btn" onclick="deleteRow('students', ${r.id})">Delete</button></td>
    </tr>
  `).join('');
}

async function loadShopify() {
  const res = await fetch('/api/dashboard/shopify');
  const rows = await res.json();

  const stats = document.getElementById('stats');
  stats.innerHTML = `
    <div class="stat-card"><div class="label">Total Customers</div><div class="value">${rows.length}</div></div>
    <div class="stat-card"><div class="label">Products Viewed</div><div class="value">${rows.filter(r => r.event_type === 'product_viewed').length}</div></div>
    <div class="stat-card"><div class="label">Added to Cart</div><div class="value">${rows.filter(r => r.event_type === 'product_added_to_cart').length}</div></div>
    <div class="stat-card"><div class="label">Purchased</div><div class="value">${rows.filter(r => r.event_type === 'checkout_completed').length}</div></div>
  `;

  const tbody = document.getElementById('shopify-body');
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="8" class="empty">No data yet</td></tr>`; return; }

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
