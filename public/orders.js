document.addEventListener('DOMContentLoaded', function () {
  async function listOrders() {
    const res = await fetch('/api/order-management/orders');
    const data = await res.json();
    document.getElementById('orders').innerHTML = (data.items||[]).map(o => `<tr><td>${o.orderId}</td><td>${o.bookName}</td><td>${o.author}</td><td>${o.format}</td><td>${o.userEmail||''}</td><td>${new Date(o.createdAt).toLocaleString()}</td><td><button data-id='${o.orderId}' class='del'>Delete</button></td></tr>`).join('');
    document.querySelectorAll('.del').forEach(btn => btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      if (!confirm('Delete order '+id+'?')) return;
      const res = await fetch(`/api/order-management/orders/${id}`, { method: 'DELETE' });
      if (res.ok) listOrders(); else alert('Delete failed');
    }));
  }
  document.getElementById('refresh').addEventListener('click', listOrders);
  document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    if (!body.userEmail) delete body.userEmail;
    if (!body.originalFileId) delete body.originalFileId;
    if (!body.translatedFileId) delete body.translatedFileId;
    document.getElementById('status').textContent = 'Creating…';
    try {
      const res = await fetch('/api/order-management/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Create failed');
      await res.json();
      document.getElementById('status').textContent = 'Created';
      await listOrders();
    } catch (err) {
      document.getElementById('status').textContent = '';
      alert(err.message || 'Error creating');
    }
  });
  listOrders();
});
