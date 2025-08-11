document.addEventListener('DOMContentLoaded', function () {
  async function listJobs() {
    const res = await fetch('/api/translate/jobs');
    const data = await res.json();
    document.getElementById('jobs').innerHTML = (data.items||[]).map(j => `<tr><td>${j.translationId}</td><td>${j.sourceMarkdownId}</td><td>${j.targetLang}</td><td>${j.strategy}</td><td>${j.status}</td><td>${new Date(j.createdAt).toLocaleString()}</td></tr>`).join('');
  }
  async function listMarkdowns() {
    const res = await fetch('/api/translate/markdowns');
    const data = await res.json();
    document.getElementById('markdowns').innerHTML = (data.items||[]).map(m => `<tr><td>${m.translationId}</td><td>${m.sourceMarkdownId}</td><td>${m.targetLang}</td><td>${m.path}</td><td>${new Date(m.createdAt).toLocaleString()}</td></tr>`).join('');
  }

  async function populateDropdowns() {
    // Source Markdown
    const sourceSelect = document.getElementById('sourceMarkdownId');
    if (sourceSelect) {
      try {
        const res = await fetch('/api/convert-markdown/markdowns');
        const data = await res.json();
        const items = data.items || [];
        sourceSelect.innerHTML = '<option value="">Select source markdown…</option>';
        for (const item of items) {
          const opt = document.createElement('option');
          opt.value = item.markdownId || item.id || item._id || item.path;
          opt.textContent = `${item.markdownId || item.id || item._id || item.path}`;
          sourceSelect.appendChild(opt);
        }
      } catch {}
    }
    // Fetch settings for languages and strategies
    let langs = ['en', 'vi'];
    let strategies = ['default', 'gpt-4', 'deepl', 'google', 'custom'];
    try {
      const res = await fetch('/api/settings/');
      if (res.ok) {
        const settings = await res.json();
        if (Array.isArray(settings.supportedLanguages)) langs = settings.supportedLanguages;
        if (Array.isArray(settings.translateStrategy)) strategies = settings.translateStrategy;
      }
    } catch {}
    // Target Language
    const langSelect = document.getElementById('targetLang');
    if (langSelect) {
      langSelect.innerHTML = '<option value="">Select language…</option>' + langs.map(l => `<option value="${l}">${l}</option>`).join('');
    }
    // Strategy
    const strategySelect = document.getElementById('strategy');
    if (strategySelect) {
      strategySelect.innerHTML = '<option value="">Select strategy…</option>' + strategies.map(s => `<option value="${s}">${s}</option>`).join('');
    }
  }

  document.getElementById('refresh-jobs').addEventListener('click', listJobs);
  document.getElementById('refresh-md').addEventListener('click', listMarkdowns);
  document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    document.getElementById('status').textContent = 'Creating…';
    try {
      const res = await fetch('/api/translate/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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
  populateDropdowns();
});
