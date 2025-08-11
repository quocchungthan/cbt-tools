document.addEventListener('DOMContentLoaded', function () {
  async function applyDropdowns() {
    try {
      const res = await fetch('/api/settings/');
      const data = await res.json();
      const opts = data.dropdownOptions && data.dropdownOptions.inputTypeOptions;
      if (Array.isArray(opts) && opts.length) {
        const sel = document.getElementById('input-type-select');
        sel.innerHTML = opts.map(o => `<option value="${o}">${o}</option>`).join('');
      }
    } catch {}
  }
  async function listJobs() {
    const res = await fetch('/api/convert-to-epub/jobs');
    const data = await res.json();
    document.getElementById('jobs').innerHTML = (data.items||[]).map(j => `<tr><td>${j.jobId}</td><td>${(j.inputs||[]).join(', ')}</td><td>${j.status}</td><td>${j.outputPath||''}</td><td>${new Date(j.createdAt).toLocaleString()}</td></tr>`).join('');
  }
  async function listEpubs() {
    const res = await fetch('/api/convert-to-epub/epubs');
    const data = await res.json();
    document.getElementById('epubs').innerHTML = (data.items||[]).map(e => `<tr><td>${e.jobId}</td><td>${e.path}</td><td>${new Date(e.createdAt).toLocaleString()}</td></tr>`).join('');
  }
  document.getElementById('refresh-jobs').addEventListener('click', listJobs);
  document.getElementById('refresh-epubs').addEventListener('click', listEpubs);
  document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = { inputMarkdownIds: fd.get('inputMarkdownIds'), inputType: fd.get('inputType') };
    document.getElementById('status').textContent = 'Creating…';
    try {
      const res = await fetch('/api/convert-to-epub/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Create failed');
      await res.json();
      document.getElementById('status').textContent = 'Created';
      await listJobs();
      await listEpubs();
    } catch (err) {
      document.getElementById('status').textContent = '';
      alert(err.message || 'Error creating');
    }
  });
  applyDropdowns();
  listJobs();
  listEpubs();
});
