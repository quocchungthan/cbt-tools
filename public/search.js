document.addEventListener('DOMContentLoaded', function () {
  async function listSearches() {
    const res = await fetch('/api/api-powered-search-file/searches');
    const data = await res.json();
    document.getElementById('searches').innerHTML = (data.items||[]).map(s => `<tr><td>${s.searchId}</td><td>${s.query}</td><td>${s.source}</td><td>${(s.requestedLangs||[]).join(', ')}</td><td>${s.status}</td><td>${new Date(s.createdAt).toLocaleString()}</td></tr>`).join('');
  }
  async function listResults(searchId) {
    const res = await fetch('/api/api-powered-search-file/results?searchId=' + encodeURIComponent(searchId));
    const data = await res.json();
    document.getElementById('results').innerHTML = (data.items||[]).map(r => `<tr><td>${r.resultId}</td><td>${r.title}</td><td><a href='${r.url}' target='_blank'>link</a></td><td>${r.fileType}</td><td>${r.language}</td><td>${r.isFree}</td><td>${r.priceCents||''}</td><td>${r.rank}</td><td><button class='dl' data-id='${r.resultId}'>Download</button></td></tr>`).join('');
    document.querySelectorAll('.dl').forEach(btn => btn.addEventListener('click', async (e) => {
      const resultId = e.target.getAttribute('data-id');
      const res = await fetch('/api/api-powered-search-file/downloads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resultId }) });
      if (!res.ok) { alert('Download create failed'); return; }
      await listDownloads();
    }));
  }
  async function listDownloads() {
    const res = await fetch('/api/api-powered-search-file/downloads');
    const data = await res.json();
    document.getElementById('downloads').innerHTML = (data.items||[]).map(d => `<tr><td>${d.downloadId}</td><td>${d.resultId}</td><td>${d.filename}</td><td>${d.path}</td><td>${new Date(d.createdAt).toLocaleString()}</td><td><a href='/api/api-powered-search-file/file/${d.downloadId}' target='_blank'>Download</a></td></tr>`).join('');
  }
  document.getElementById('refresh-searches').addEventListener('click', listSearches);
  document.getElementById('results-load').addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchId = new FormData(e.target).get('searchId');
    if (!searchId) return;
    await listResults(searchId);
  });
  document.getElementById('refresh-downloads').addEventListener('click', listDownloads);
  document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    document.getElementById('status').textContent = 'Creating…';
    try {
      const res = await fetch('/api/api-powered-search-file/searches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Create failed');
      await res.json();
      document.getElementById('status').textContent = 'Created';
      await listSearches();
    } catch (err) {
      document.getElementById('status').textContent = '';
      alert(err.message || 'Error creating');
    }
  });
  listSearches();
  listDownloads();
});
