document.addEventListener('DOMContentLoaded', function () {
  async function listJobs() {
    const res = await fetch('/api/convert-markdown/jobs');
    const data = await res.json();
    const tbody = document.getElementById('jobs');
    tbody.innerHTML = (data.items||[]).map(j => `<tr><td>${j.jobId}</td><td>${j.uploadId}</td><td>${j.status}</td><td>${j.progress}</td><td>${new Date(j.createdAt).toLocaleString()}</td></tr>`).join('');
  }
  async function listMarkdowns() {
    const res = await fetch('/api/convert-markdown/markdowns');
    const data = await res.json();
    const tbody = document.getElementById('markdowns');
    tbody.innerHTML = (data.items||[]).map(m => `<tr><td>${m.jobId}</td><td>${m.markdownId}</td><td>${m.path}</td><td>${new Date(m.createdAt).toLocaleString()}</td></tr>`).join('');
  }

  async function populateUploadDropdown() {
    const select = document.getElementById('uploadId');
    if (!select) return;
    try {
      const res = await fetch('/api/upload/');
      const data = await res.json();
      const items = data.items || [];
      // Remove all except the first option
      select.innerHTML = '<option value="">Select upload…</option>';
      for (const item of items) {
        const opt = document.createElement('option');
        opt.value = item.uploadId || item.id || item._id || item.filename;
        opt.textContent = `${item.uploadId || item.id || item._id || item.filename} (${item.filename || ''})`;
        select.appendChild(opt);
      }
    } catch (err) {
      // ignore
    }
  }

  document.getElementById('refresh-jobs').addEventListener('click', listJobs);
  // No refresh-md button in markup, so skip
  document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = { uploadId: fd.get('uploadId'), command: fd.get('command') || undefined };
    document.getElementById('status').textContent = 'Creating…';
    try {
      const res = await fetch('/api/convert-markdown/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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
  listJobs();
  listMarkdowns();
  populateUploadDropdown();
});
