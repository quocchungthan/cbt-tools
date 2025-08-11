document.addEventListener('DOMContentLoaded', function () {
  // Populate EPUB dropdown
  async function populateEpubDropdown() {
    try {
      const res = await fetch('/api/convert-to-epub/epubs');
      const data = await res.json();
      const items = data.items || [];
      const sel = document.getElementById('epubPath');
      if (sel) {
        sel.innerHTML = '<option value="">Select EPUB…</option>';
        for (const item of items) {
          const opt = document.createElement('option');
          opt.value = item.path;
          opt.textContent = item.path;
          sel.appendChild(opt);
        }
      }
    } catch {}
  }
  async function listJobs() {
    const res = await fetch('/api/send-mail/jobs');
    const data = await res.json();
    document.getElementById('jobs').innerHTML = (data.items||[]).map(j => `<tr><td>${j.jobId}</td><td>${j.email}</td><td>${j.template}</td><td>${j.status}</td><td>${new Date(j.createdAt).toLocaleString()}</td></tr>`).join('');
  }
  async function listEmails(q) {
    const res = await fetch('/api/send-mail/emails' + (q?`?q=${encodeURIComponent(q)}`:''));
    const data = await res.json();
    document.getElementById('emails').innerHTML = (data.items||[]).map(e => `<tr><td>${e.email}</td><td>${new Date(e.lastUsedAt).toLocaleString()}</td><td>${e.count}</td></tr>`).join('');
  }
  document.getElementById('refresh-jobs').addEventListener('click', listJobs);
  populateEpubDropdown();
  document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    if (!body.epubPath) delete body.epubPath;
    document.getElementById('status').textContent = 'Queuing…';
    try {
      const res = await fetch('/api/send-mail/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Queue failed');
      await res.json();
      document.getElementById('status').textContent = 'Queued';
      await listJobs();
    } catch (err) {
      document.getElementById('status').textContent = '';
      alert(err.message || 'Error queuing');
    }
  });
  document.getElementById('emails-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = new FormData(e.target).get('q');
    await listEmails(q);
  });
  listJobs();
  listEmails();
});
