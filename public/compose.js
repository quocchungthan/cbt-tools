document.addEventListener('DOMContentLoaded', function () {
  // Populate markdown ID dropdowns from /api/translate/jobs
  async function populateMarkdownDropdowns() {
    try {
      const res = await fetch('/api/translate/jobs');
      if (!res.ok) return;
      const data = await res.json();
      const items = data.items || (Array.isArray(data) ? data : []);
      const opts = items.map(item => {
        const label = item.originalFilename
          ? `${item.originalFilename} (${item.translationId || item.id || item._id})`
          : `${item.translationId || item.id || item._id} (${item.sourceMarkdownId || ''} → ${item.targetLang || ''})`;
        return `<option value="${item.translationId || item.id || item._id}">${label}</option>`;
      }).join('');
      const sel1 = document.getElementById('inputMarkdownId1');
      const sel2 = document.getElementById('inputMarkdownId2');
      if (sel1) sel1.innerHTML = '<option value="">Select markdown…</option>' + opts;
      if (sel2) sel2.innerHTML = '<option value="">None</option>' + opts;
    } catch {}
  }
  async function applyFormatOptions() {
    try {
      const res = await fetch('/api/settings/');
      const data = await res.json();
      const opts = data.dropdownOptions && data.dropdownOptions.formatOptions;
      if (Array.isArray(opts) && opts.length) {
        const sel = document.getElementById('format-select');
        sel.innerHTML = opts.map(o => `<option value="${o}">${o}</option>`).join('');
      }
    } catch {}
  }
  async function listJobs() {
    const res = await fetch('/api/compose/jobs');
    const data = await res.json();
    document.getElementById('jobs').innerHTML = (data.items||[]).map(j => `<tr><td>${j.jobId}</td><td>${(j.inputs||[]).join(', ')}</td><td>${j.format}</td><td>${j.status}</td><td>${j.outputPath||''}</td><td>${new Date(j.createdAt).toLocaleString()}</td></tr>`).join('');
  }
  async function listMarkdowns() {
    const res = await fetch('/api/compose/markdowns');
    const data = await res.json();
    document.getElementById('markdowns').innerHTML = (data.items||[]).map(m => `<tr><td>${m.jobId}</td><td>${m.path}</td><td>${new Date(m.createdAt).toLocaleString()}</td></tr>`).join('');
  }
  document.getElementById('refresh-jobs').addEventListener('click', listJobs);
  document.getElementById('refresh-md').addEventListener('click', listMarkdowns);
  document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id1 = fd.get('inputMarkdownId1');
    const id2 = fd.get('inputMarkdownId2');
    const inputMarkdownIds = [];
    if (id1) inputMarkdownIds.push(id1);
    if (id2) inputMarkdownIds.push(id2);
    const body = { inputMarkdownIds, format: fd.get('format') };
    document.getElementById('status').textContent = 'Creating…';
    try {
      const res = await fetch('/api/compose/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Create failed');
      await res.json();
      document.getElementById('status').textContent = 'Created';
      await listJobs();
      await listMarkdowns();
    } catch (err) {
      document.getElementById('status').textContent = '';
      alert(err.message || 'Error creating');
    }
  });
  applyFormatOptions();
  populateMarkdownDropdowns();
  listJobs();
  listMarkdowns();
});
