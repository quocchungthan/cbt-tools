
async function loadHealth() {
  const output = document.getElementById('output');
  output.textContent = 'Loading…';
  try {
    const [healthRes, pingRes] = await Promise.all([
      fetch('/api/health'),
      fetch('/api/convert-markdown/ping')
    ]);
    const health = await healthRes.json();
    let ping;
    try {
      ping = await pingRes.json();
    } catch {
      ping = await pingRes.text();
    }
    output.textContent =
      'API Health:\n' + JSON.stringify(health, null, 2) +
      '\n\n/convert-markdown/ping:\n' + (typeof ping === 'string' ? ping : JSON.stringify(ping, null, 2));
  } catch (err) {
    output.textContent = 'Error: ' + err;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('refresh').addEventListener('click', loadHealth);
  loadHealth();
});
