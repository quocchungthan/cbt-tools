document.addEventListener('DOMContentLoaded', function () {
  // Populate translationId dropdown from /api/translate/jobs
  async function populateTranslationIdDropdown() {
    const select = document.getElementById('translationId');
    if (!select) return;
    try {
      const res = await fetch('/api/translate/jobs');
      if (!res.ok) return;
      const data = await res.json();
      const items = data.items || (Array.isArray(data) ? data : []);
      select.innerHTML = '<option value="">Select translation…</option>';
      for (const item of items) {
        const opt = document.createElement('option');
        opt.value = item.translationId || item.id || item._id;
        opt.textContent = item.originalFilename
          ? `${item.originalFilename} (${item.translationId || item.id || item._id})`
          : `${item.translationId || item.id || item._id} (${item.sourceMarkdownId || ''} → ${item.targetLang || ''})`;
        select.appendChild(opt);
      }
    } catch {}
  }
  populateTranslationIdDropdown();
  async function loadSentences(id) {
    const res = await fetch(`/api/translation-fine-tune/${id}`);
    if (!res.ok) { alert('Not found'); return; }
    const data = await res.json();
    const container = document.getElementById('sentences');
    container.innerHTML = (data.items||[]).map(s => `
      <div style='margin-bottom:.5rem;'>
        <div><strong>${s.sentenceId}</strong> — ${s.originalText || ''}</div>
        <textarea name="${s.sentenceId}" rows="2">${s.translatedText || ''}</textarea>
      </div>
    `).join('');
    const form = document.getElementById('update-form');
    form.style.display = 'block';
    form.dataset.translationId = id;
  }
  document.getElementById('load-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = new FormData(e.target).get('translationId');
    if (!id) return;
    await loadSentences(id);
  });
  document.getElementById('update-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.dataset.translationId;
    const fields = Array.from(e.target.querySelectorAll('textarea'));
    const updates = {};
    for (const f of fields) updates[f.name] = f.value;
    document.getElementById('status').textContent = 'Saving…';
    try {
      const res = await fetch(`/api/translation-fine-tune/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updates }) });
      if (!res.ok) throw new Error('Save failed');
      document.getElementById('status').textContent = 'Saved';
    } catch (err) {
      document.getElementById('status').textContent = '';
      alert(err.message || 'Error saving');
    }
  });
});
