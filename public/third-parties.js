document.addEventListener('DOMContentLoaded', function () {
  async function listPartners() {
    const res = await fetch('/api/third-parites/partners');
    const data = await res.json();
    document.getElementById('partners').innerHTML = (data.items||[]).map(p => `<tr><td>${p.partnerId}</td><td>${p.type}</td><td>${p.name}</td><td>${p.endpoint||''}</td><td>${p.contact||''}</td><td>${new Date(p.createdAt).toLocaleString()}</td></tr>`).join('');
  }
  async function listShelves() {
    const res = await fetch('/api/third-parites/bookshelf');
    const data = await res.json();
    document.getElementById('shelves').innerHTML = (data.items||[]).map(s => `<tr><td>${s.shelfId}</td><td>${s.title}</td><td>${s.composedMarkdownPath}</td><td>${s.epubPath||''}</td><td>${s.orderId||''}</td><td>${new Date(s.createdAt).toLocaleString()}</td></tr>`).join('');
  }
  async function listShipments() {
    const res = await fetch('/api/third-parites/shipments');
    const data = await res.json();
    document.getElementById('shipments').innerHTML = (data.items||[]).map(sh => `<tr><td>${sh.shipmentId}</td><td>${sh.orderId}</td><td>${sh.partnerId}</td><td>${sh.status}</td><td>${sh.trackingNumber||''}</td><td>${new Date(sh.createdAt).toLocaleString()}</td></tr>`).join('');
  }
  document.getElementById('partners-refresh').addEventListener('click', listPartners);
  document.getElementById('shelf-refresh').addEventListener('click', listShelves);
  document.getElementById('ships-refresh').addEventListener('click', listShipments);
  document.getElementById('partner-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch('/api/third-parites/partners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) { alert('Create failed'); return; }
    await listPartners();
  });
  listPartners();
  listShelves();
  listShipments();
});
