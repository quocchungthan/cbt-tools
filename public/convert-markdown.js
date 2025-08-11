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
  document.getElementById('refresh-jobs').addEventListener('click', listJobs);
  document.getElementById('refresh-md').addEventListener('click', listMarkdowns);
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
});
