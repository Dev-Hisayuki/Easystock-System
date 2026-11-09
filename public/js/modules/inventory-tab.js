import { apiFetch, showNotification } from '../dashboard.js';

export async function loadInventoryTab() {
  const container = document.getElementById('tab-content');
  document.getElementById('page-title').textContent = 'Inventory Management';
  container.innerHTML = '<p>Loading inventory data...</p>';
  try {
    const res = await apiFetch('/api/inventory');
    const rows = res.data || [];
    let html = `
      <table class="data-table">
        <thead>
          <tr><th>Product</th><th>Warehouse</th><th>Quantity</th><th>Status</th></tr>
        </thead>
        <tbody>
    `;
    rows.forEach(item => {
      const isLow = item.quantity < 10;
      html += `
        <tr>
          <td>${item.product_name || item.product_id}</td>
          <td>${item.warehouse_name || item.warehouse_id}</td>
          <td>${item.quantity}</td>
          <td><span class="badge badge-${isLow ? 'danger' : 'success'}">${isLow ? 'Low Stock' : 'In Stock'}</span></td>
        </tr>
      `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (err) {
    showNotification(err.message, 'error');
    container.innerHTML = '<p>Failed to load inventory data.</p>';
  }
}