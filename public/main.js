document.addEventListener('DOMContentLoaded', function () {
  const healthBtn = document.getElementById('health-check-btn');
  const healthResult = document.getElementById('health-result');
  if (healthBtn) {
    healthBtn.addEventListener('click', async function () {
      healthResult.textContent = 'Checking...';
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        healthResult.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        healthResult.textContent = 'Error: ' + err;
      }
    });
  }
});
