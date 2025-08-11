document.addEventListener('DOMContentLoaded', function () {
  async function listUploads() {
    const res = await fetch('/api/upload/');
    const data = await res.json();
    const rows = data.items || [];
    const tbody = document.getElementById('tbody');
    tbody.innerHTML = rows.map(r => `<tr><td>${r.filename}</td><td>${r.mime}</td><td>${r.size}</td><td>${new Date(r.createdAt).toLocaleString()}</td></tr>`).join('');
  }
  document.getElementById('refresh').addEventListener('click', listUploads);
  document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    document.getElementById('status').textContent = 'Uploading…';
    try {
      const res = await fetch('/api/upload/', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      await res.json();
      document.getElementById('status').textContent = 'Uploaded';
      await listUploads();
    } catch (err) {
      document.getElementById('status').textContent = '';
      alert(err.message || 'Error uploading');
    }
  });
  listUploads();
});
