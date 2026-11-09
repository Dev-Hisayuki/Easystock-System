import { apiFetch, showNotification } from '../dashboard.js';

export async function loadRequisitionTab() {
  const container = document.getElementById('tab-content');
  document.getElementById('page-title').textContent = 'Department Requisitions';
  container.innerHTML = '<p>Loading requisitions...</p>';
  try {
    const res = await apiFetch('/api/requisitions');
    const list = res.data || [];
    let html = `
      <div style="margin-bottom: 15px;">
        <button id="btn-new-req" class="badge badge-success" style="padding: 8px 16px; cursor: pointer;">+ New Requisition</button>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>ID</th><th>Department</th><th>Status</th><th>Created At</th></tr>
        </thead>
        <tbody>
    `;
    list.forEach(req => {
      html += `
        <tr>
          <td>#${req.id}</td>
          <td>${req.department_id}</td>
          <td><span class="badge badge-warning">${req.status}</span></td>
          <td>${new Date(req.created_at).toLocaleDateString()}</td>
        </tr>
      `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (err) {
    showNotification(err.message, 'error');
    container.innerHTML = '<p>Failed to load requisitions.</p>';
  }
}