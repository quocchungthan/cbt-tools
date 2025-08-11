document.addEventListener('DOMContentLoaded', function () {
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
    const body = { inputMarkdownIds: fd.get('inputMarkdownIds'), format: fd.get('format') };
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
  listJobs();
  listMarkdowns();
});
