// public/preorder.js
// Handles preorder form, search, pagination, sticky button, email cache, CSRF, and reCAPTCHA


let cachedEmail = localStorage.getItem('preorderEmail') || '';
let cachedPhone = localStorage.getItem('preorderPhone') || '';

document.addEventListener('DOMContentLoaded', function () {
  const preorderForm = document.getElementById('preorder-form');
  const emailInput = document.getElementById('preorder-email');

  const phoneInput = document.getElementById('preorder-phone');
  if (emailInput && cachedEmail) emailInput.value = cachedEmail;
  if (phoneInput && cachedPhone) phoneInput.value = cachedPhone;

  preorderForm && preorderForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(preorderForm);
    const body = Object.fromEntries(fd.entries());
  if (body.userEmail) localStorage.setItem('preorderEmail', body.userEmail);
  if (body.phone) localStorage.setItem('preorderPhone', body.phone);
    document.getElementById('preorder-status').textContent = 'Submitting…';
  // CSRF token
  const csrf = document.querySelector('input[name="_csrf"]')?.value;
    try {
      const res = await fetch('/api/order-management/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'CSRF-Token': csrf },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Preorder failed');
      document.getElementById('preorder-status').textContent = 'Preorder submitted!';
      // Clear all fields except email and phone after submit
      if (preorderForm) {
        Array.from(preorderForm.elements).forEach(el => {
          if (el.name && el.name !== 'userEmail' && el.name !== 'phone' && el.tagName === 'INPUT') {
            el.value = '';
          }
        });
      }
    } catch (err) {
      document.getElementById('preorder-status').textContent = '';
      alert(err.message || 'Error submitting preorder');
    }
  });

  // Sticky scroll-to-form button
  const stickyBtn = document.getElementById('scroll-to-preorder');
  stickyBtn && stickyBtn.addEventListener('click', () => {
	window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Product search & pagination
  let page = 1, q = '';
  const pageSize = 8;
  const searchInput = document.getElementById('product-search');
  const productList = document.getElementById('product-list');
  const pagination = document.getElementById('pagination');

  async function loadProducts() {
  const res = await fetch(`/api/third-parites/bookshelf?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`);
    const data = await res.json();
    productList.innerHTML = (data.items||[]).map(p => `
      <div class="product-card">
        <div class="product-image-wrap">
          <img class="product-image" src="${p.coverImage || 'https://via.placeholder.com/180x180?text=No+Image'}" alt="${p.title}" />
        </div>
        <div class="product-info">
          <div class="product-title">${p.title}</div>
          <div class="product-meta">${p.epubPath ? 'EPUB available' : ''}</div>
          <div class="product-date">${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</div>
        </div>
        <button class="buy-btn" disabled>Đặt trước</button>
      </div>
    `).join('');
    // Pagination
    let totalPages = Math.ceil((data.total||0)/pageSize);
    pagination.innerHTML = '';
    for (let i=1; i<=totalPages; i++) {
      let btn = document.createElement('button');
      btn.textContent = i;
      btn.className = (i===page ? 'active' : '');
      btn.onclick = () => { page = i; loadProducts(); };
      pagination.appendChild(btn);
    }
  }
  searchInput && searchInput.addEventListener('input', function () {
    q = this.value;
    page = 1;
    loadProducts();
  });
  loadProducts();
});
