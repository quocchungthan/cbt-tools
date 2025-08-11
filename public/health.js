async function loadHealth() {
  const res = await fetch('/api/health');
  const data = await res.json();
  document.getElementById('output').textContent = JSON.stringify(data, null, 2);
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('refresh').addEventListener('click', loadHealth);
  loadHealth();
});
