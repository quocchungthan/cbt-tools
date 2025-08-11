document.addEventListener('DOMContentLoaded', function () {
  async function applyDropdowns() {
    // Populate markdown dropdown
    try {
      const [mdRes, jobsRes, uploadsRes] = await Promise.all([
        fetch('/api/convert-markdown/markdowns'),
        fetch('/api/convert-markdown/jobs'),
        fetch('/api/upload')
      ]);
      const mdData = await mdRes.json();
      const jobsData = await jobsRes.json();
      const uploadsData = await uploadsRes.json();
      const mdItems = mdData.items || [];
      const jobs = jobsData.items || [];
      const uploads = uploadsData.items || [];
      const jobMap = {};
      for (const job of jobs) jobMap[job.jobId] = job.uploadId;
      const uploadMap = {};
      for (const up of uploads) uploadMap[up.id] = up.filename;
      const sel = document.getElementById('inputMarkdownId');
      if (sel) {
        sel.innerHTML = '<option value="">Select markdown…</option>';
        for (const item of mdItems) {
          const jobId = item.jobId;
          const uploadId = jobMap[jobId];
          const filename = uploadMap[uploadId];
          const label = filename ? `${filename} (${item.markdownId || jobId})` : (item.markdownId || jobId);
          const opt = document.createElement('option');
          opt.value = item.markdownId || jobId;
          opt.textContent = label;
          sel.appendChild(opt);
        }
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
  // Get single selected markdown ID and send as array
  const select = document.getElementById('inputMarkdownId');
  const inputMarkdownId = select.value;
  const inputMarkdownIds = inputMarkdownId ? [inputMarkdownId] : [];
  const body = { inputMarkdownIds, inputType: fd.get('inputType') };
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
