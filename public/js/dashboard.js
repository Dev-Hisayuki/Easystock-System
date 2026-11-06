let inventory = [];
let logs = [];
let pollingInterval = null;

window.onload = function() {
    fetchAllData();
    pollingInterval = setInterval(fetchAllData, 3000);
};

async function fetchAllData() {
    try {
        const [prodRes, stockRes] = await Promise.all([
            fetch('http://localhost:5000/api/products'),
            fetch('http://localhost:5000/api/stock')
        ]);
        
        if (prodRes.ok && stockRes.ok) {
            inventory = await prodRes.json();
            logs = await stockRes.json();
            renderAll();
        }
    } catch (err) {
        console.error('Real-time sync connection error:', err);
    }
}

function renderAll() {
    renderDashboardStats();
    renderTopValueItems();
    renderRecentLogs();
    renderInventoryTable();
    renderTransactionTable();
    updateNavigationBadges();
}

function switchTab(tabId) {
    ['dashboard', 'inventory', 'transactions'].forEach(id => {
        const section = document.getElementById(`tab-${id}`);
        const btn = document.getElementById(`nav-${id}`);

        if (id === tabId) {
            section.classList.remove('hidden');
            btn.classList.add('bg-emerald-600/10', 'text-emerald-400');
            btn.classList.remove('hover:bg-slate-800', 'text-slate-400');
        } else {
            section.classList.add('hidden');
            btn.classList.remove('bg-emerald-600/10', 'text-emerald-400');
            btn.classList.add('hover:bg-slate-800', 'text-slate-400');
        }
    });

    const titleMap = {
        'dashboard': 'Dashboard Overview',
        'inventory': 'Inventory Directory',
        'transactions': 'Audit Logs & History'
    };
    document.getElementById('page-title').textContent = titleMap[tabId];
}

function getStatusInfo(stock) {
    if (stock === 0) {
        return { label: 'Out of Stock', class: 'bg-rose-50 text-rose-700 border-rose-200' };
    } else if (stock < 10) {
        return { label: 'Low Stock', class: 'bg-amber-50 text-amber-700 border-amber-200' };
    } else {
        return { label: 'In Stock', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
}

function renderDashboardStats() {
    const totalProducts = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);
    const lowStockCount = inventory.filter(item => Number(item.quantity) > 0 && Number(item.quantity) < 10).length;
    const outOfStockCount = inventory.filter(item => Number(item.quantity) === 0).length;

    document.getElementById('stat-total-products').textContent = totalProducts;
    document.getElementById('stat-total-value').textContent = '₱' + totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('stat-low-stock').textContent = lowStockCount;
    document.getElementById('stat-out-stock').textContent = outOfStockCount;

    const banner = document.getElementById('low-stock-banner');
    if (lowStockCount > 0 || outOfStockCount > 0) {
        banner.classList.remove('hidden');
        document.getElementById('low-stock-banner-text').textContent = 
            `Attention: ${lowStockCount} item(s) are low on stock, and ${outOfStockCount} item(s) are currently completely out of stock.`;
    } else {
        banner.classList.add('hidden');
    }
}

function renderTopValueItems() {
    const tbody = document.getElementById('top-value-table');
    const sorted = [...inventory].sort((a, b) => (b.quantity * b.unit_price) - (a.quantity * a.unit_price)).slice(0, 4);

    tbody.innerHTML = sorted.map(item => `
        <tr class="hover:bg-slate-50 transition">
            <td class="py-2.5 font-medium text-slate-800">${item.item_name} <span class="text-[10px] text-slate-400 font-normal">(ID: ${item.item_id})</span></td>
            <td class="py-2.5"><span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px]">${item.category}</span></td>
            <td class="py-2.5 text-right font-semibold">${item.quantity}</td>
            <td class="py-2.5 text-right">₱${Number(item.unit_price).toFixed(2)}</td>
            <td class="py-2.5 text-right font-bold text-slate-900">₱${(item.quantity * item.unit_price).toFixed(2)}</td>
        </tr>
    `).join('');
}

function renderRecentLogs() {
    const container = document.getElementById('recent-logs-list');
    const recent = logs.slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No recent activity recorded.</p>`;
        return;
    }

    container.innerHTML = recent.map(log => {
        const isPositive = log.action_type === 'IN';
        return `
            <div class="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition">
                <div class="w-7 h-7 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    <i class="fa-solid ${isPositive ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-slate-800 truncate">${log.item_name || 'Product #' + log.item_id}</p>
                    <p class="text-[11px] text-slate-500">${log.remarks || log.action_type}</p>
                </div>
                <div class="text-right flex-shrink-0">
                    <span class="text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}">
                        ${isPositive ? '+' : '-'}${log.quantity_changed}
                    </span>
                    <p class="text-[10px] text-slate-400">${new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
            </div>
        `;
    }).join('');
}

function renderInventoryTable() {
    const tbody = document.getElementById('inventory-table-body');
    const emptyState = document.getElementById('empty-inventory-state');
    
    const searchVal = document.getElementById('inventory-search').value.toLowerCase();
    const categoryVal = document.getElementById('category-filter').value;
    const statusVal = document.getElementById('status-filter').value;

    const filtered = inventory.filter(item => {
        const matchesSearch = item.item_name.toLowerCase().includes(searchVal) || String(item.item_id).includes(searchVal);
        const matchesCategory = categoryVal === 'ALL' || item.category === categoryVal;
        
        let matchesStatus = true;
        if (statusVal === 'In Stock') matchesStatus = item.quantity >= 10;
        else if (statusVal === 'Low Stock') matchesStatus = item.quantity > 0 && item.quantity < 10;
        else if (statusVal === 'Out of Stock') matchesStatus = item.quantity === 0;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    tbody.innerHTML = filtered.map(item => {
        const status = getStatusInfo(item.quantity);
        const totalVal = (item.quantity * item.unit_price).toFixed(2);
        const formattedDate = item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A';

        return `
            <tr class="hover:bg-slate-50/80 transition">
                <td class="py-3 px-4 font-mono text-xs font-semibold text-slate-600">ID-${item.item_id}</td>
                <td class="py-3 px-4 font-semibold text-slate-800">${item.item_name}</td>
                <td class="py-3 px-4">
                    <span class="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200">${item.category}</span>
                </td>
                <td class="py-3 px-4 text-xs text-slate-500">${formattedDate}</td>
                <td class="py-3 px-4 text-center">
                    <span class="font-bold text-sm ${item.quantity === 0 ? 'text-rose-600' : (item.quantity < 10 ? 'text-amber-600' : 'text-slate-800')}">${item.quantity}</span>
                </td>
                <td class="py-3 px-4 text-right font-medium">₱${Number(item.unit_price).toFixed(2)}</td>
                <td class="py-3 px-4 text-right font-bold text-slate-900">₱${totalVal}</td>
                <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.class}">
                        ${status.label}
                    </span>
                </td>
                <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-1.5">
                        <button onclick="quickTableAdjust(${item.item_id}, 'IN', 1)" title="Quick +1 Stock In" class="w-7 h-7 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 rounded-md text-slate-600 flex items-center justify-center transition">
                            <i class="fa-solid fa-plus text-xs"></i>
                        </button>
                        <button onclick="quickTableAdjust(${item.item_id}, 'OUT', 1)" title="Quick -1 Stock Out" class="w-7 h-7 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 rounded-md text-slate-600 flex items-center justify-center transition">
                            <i class="fa-solid fa-minus text-xs"></i>
                        </button>
                        <button onclick="openProductModal(${item.item_id})" title="Edit Item" class="w-7 h-7 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 rounded-md text-slate-600 flex items-center justify-center transition">
                            <i class="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button onclick="deleteProduct(${item.item_id})" title="Delete Item" class="w-7 h-7 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 rounded-md text-slate-600 flex items-center justify-center transition">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterInventory() { renderInventoryTable(); }
function filterByStatus(status) {
    document.getElementById('status-filter').value = status;
    renderInventoryTable();
}
function resetFilters() {
    document.getElementById('inventory-search').value = '';
    document.getElementById('category-filter').value = 'ALL';
    document.getElementById('status-filter').value = 'ALL';
    renderInventoryTable();
}

function renderTransactionTable() {
    const tbody = document.getElementById('transaction-table-body');
    const emptyState = document.getElementById('empty-logs-state');

    if (logs.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    tbody.innerHTML = logs.map(log => {
        const isPositive = log.action_type === 'IN';
        return `
            <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 text-xs text-slate-500 font-mono">${new Date(log.created_at).toLocaleString()}</td>
                <td class="py-3 px-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                        <i class="fa-solid ${isPositive ? 'fa-arrow-down' : 'fa-arrow-up'} text-[10px]"></i>
                        ${log.action_type}
                    </span>
                </td>
                <td class="py-3 px-4 font-semibold text-slate-800">${log.item_name || 'Product ID #' + log.item_id}</td>
                <td class="py-3 px-4 text-center font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}">
                    ${isPositive ? '+' : '-'}${log.quantity_changed}
                </td>
                <td class="py-3 px-4 text-center font-semibold text-slate-700">-</td>
                <td class="py-3 px-4 text-xs text-slate-600">${log.remarks || '-'} (By User ID: ${log.performed_by || 'System'})</td>
            </tr>
        `;
    }).join('');
}

function updateNavigationBadges() {
    document.getElementById('nav-total-badge').textContent = inventory.length;
}

function openProductModal(id = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form');

    form.reset();
    document.getElementById('edit-id').value = '';

    if (id) {
        const item = inventory.find(i => i.item_id === id);
        if (item) {
            title.textContent = 'Edit Product Details';
            document.getElementById('edit-id').value = item.item_id;
            document.getElementById('form-name').value = item.item_name;
            document.getElementById('form-sku').value = 'ID-' + item.item_id;
            document.getElementById('form-category').value = item.category;
            document.getElementById('form-stock').value = item.quantity;
            document.getElementById('form-price').value = item.unit_price;
        }
    } else {
        title.textContent = 'Add New Product';
        document.getElementById('form-sku').value = 'AUTO-GENERATE';
    }

    modal.classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

async function handleProductSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('edit-id').value;
    const item_name = document.getElementById('form-name').value.trim();
    const category = document.getElementById('form-category').value;
    const quantity = parseInt(document.getElementById('form-stock').value);
    const unit_price = parseFloat(document.getElementById('form-price').value);

    const url = id ? `http://localhost:5000/api/products/${id}` : 'http://localhost:5000/api/products';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_name, category, quantity, unit_price })
        });

        if (res.ok) {
            showToast(id ? 'Product updated successfully' : 'Product added successfully', 'success');
            closeProductModal();
            fetchAllData();
        } else {
            const errData = await res.json().catch(() => ({}));
            console.error('Server error response:', errData);
            showToast(errData.error || errData.message || 'Error saving product', 'error');
        }
    } catch (err) {
        console.error('Network/Client error:', err);
        showToast('Network connection failed', 'error');
    }
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        const res = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Product deleted from system', 'info');
            fetchAllData();
        } else {
            showToast('Failed to delete product', 'error');
        }
    }
}

function openStockAdjustmentModal() {
    const select = document.getElementById('stock-item-select');
    if (inventory.length === 0) {
        showToast('No products available for adjustment', 'error');
        return;
    }

    select.innerHTML = inventory.map(i => `<option value="${i.item_id}">${i.item_name} (Current Stock: ${i.quantity})</option>`).join('');
    document.getElementById('stock-modal').classList.remove('hidden');
}

function closeStockModal() {
    document.getElementById('stock-modal').classList.add('hidden');
}

async function handleStockAdjustment(e) {
    e.preventDefault();
    const item_id = document.getElementById('stock-item-select').value;
    const action_type = document.getElementById('stock-action').value;
    const quantity_changed = parseInt(document.getElementById('stock-qty').value);
    const remarks = document.getElementById('stock-note').value.trim() || 'Manual Quick Adjustment';

    const res = await fetch('http://localhost:5000/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id, action_type, quantity_changed, remarks, performed_by: 1 })
    });

    if (res.ok) {
        showToast('Stock adjusted successfully', 'success');
        closeStockModal();
        fetchAllData();
    } else {
        const errData = await res.json();
        showToast(errData.error || 'Stock adjustment failed', 'error');
    }
}

async function quickTableAdjust(item_id, action_type, quantity_changed) {
  const item = inventory.find(i => i.item_id === item_id);
  if (!item) return;

  if (action_type === 'OUT' && item.quantity < quantity_changed) {
    showToast('Insufficient stock quantity', 'error');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        item_id: Number(item_id), 
        action_type: action_type, 
        quantity_changed: Number(quantity_changed), 
        remarks: `Quick Table ${action_type}`, 
        performed_by: null // Set to null if user foreign key constraint fails
      })
    });

    const data = await res.json();

    if (res.ok) {
      showToast('Stock updated successfully', 'success');
      fetchAllData();
    } else {
      console.error('Server error:', data.error);
      showToast(data.error || 'Quick adjustment failed', 'error');
    }
  } catch (err) {
    console.error('Connection error:', err);
    showToast('Could not connect to server', 'error');
  }
}

async function clearAuditLogs() {
    if (!confirm('Are you sure you want to clear all audit logs?')) return;
    
    try {
        const response = await fetch('http://localhost:5000/api/stock', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            document.getElementById('transaction-table-body').innerHTML = '';
            document.getElementById('empty-logs-state').classList.remove('hidden');
            showToast('Audit logs cleared successfully', 'success');
        } else {
            showToast('Failed to clear logs', 'error');
        }
    } catch (err) {
        console.error('Error clearing logs:', err);
        showToast('Server error while clearing logs', 'error');
    }
}

function exportToCSV() {
    if (inventory.length === 0) {
        showToast('No inventory data to export', 'error');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Item ID,Product Name,Category,Stock Level,Unit Price (PHP),Total Value (PHP)\n";

    inventory.forEach(item => {
        const row = [
            `"ID-${item.item_id}"`,
            `"${item.item_name}"`,
            `"${item.category}"`,
            item.quantity,
            Number(item.unit_price).toFixed(2),
            (item.quantity * item.unit_price).toFixed(2)
        ];
        csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EasyStock_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported inventory to CSV successfully', 'success');
}

function handleLogout() {
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const bgClass = type === 'success' ? 'bg-emerald-800 text-emerald-100 border-emerald-700' :
                    type === 'error' ? 'bg-rose-800 text-rose-100 border-rose-700' : 
                    'bg-slate-800 text-slate-100 border-slate-700';

    const icon = type === 'success' ? 'fa-circle-check' :
                 type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';

    toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-xl text-xs font-semibold transform transition-all duration-300 pointer-events-auto ${bgClass}`;
    toast.innerHTML = `
        <i class="fa-solid ${icon} text-sm"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-[-10px]');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}