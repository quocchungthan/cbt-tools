document.addEventListener('DOMContentLoaded', function () {
  function safeParse(json){ try { return JSON.parse(json); } catch { return undefined; } }
  async function load() {
    const res = await fetch('/api/settings/');
    const data = await res.json();
    for (const [k, v] of Object.entries(data)) {
      const el = document.querySelector(`[name="${k}"]`);
      if (!el) continue;
      if (k === 'dropdownOptions') el.value = JSON.stringify(v || {}, null, 2);
      else el.value = v ?? '';
    }
    document.getElementById('raw').textContent = JSON.stringify(data, null, 2);
  }
  document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {};
    for (const [k, v] of fd.entries()) {
      if (!v) continue;
      if (k === 'dropdownOptions') {
        const parsed = safeParse(String(v));
        if (parsed) body[k] = parsed;
      } else {
        body[k] = v;
      }
    }
    document.getElementById('save').disabled = true;
    document.getElementById('status').textContent = 'Saving…';
    try {
      const res = await fetch('/api/settings/', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Save failed');
      const saved = await res.json();
      document.getElementById('status').textContent = 'Saved';
      document.getElementById('raw').textContent = JSON.stringify(saved, null, 2);
    } catch (err) {
      document.getElementById('status').textContent = '';
      alert(err.message || 'Error saving');
    } finally {
      document.getElementById('save').disabled = false;
    }
  });
  load();
});
