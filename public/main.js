const API_BASE = '/api';

let inventory = [];
let logs = [];

window.onload = function() {
    fetchInventory();
    fetchLogs();
};

async function fetchInventory() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        const json = await res.json();
        if (json.success) {
            inventory = json.data;
            renderAll();
        }
    } catch (err) {
        showToast('Failed to fetch inventory from server', 'error');
    }
}

async function fetchLogs() {
    try {
        const res = await fetch(`${API_BASE}/stock/logs`);
        const json = await res.json();
        if (json.success) {
            logs = json.data;
            renderAll();
        }
    } catch (err) {
        showToast('Failed to fetch transaction logs', 'error');
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
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const lowStockCount = inventory.filter(item => item.quantity > 0 && item.quantity < 10).length;
    const outOfStockCount = inventory.filter(item => item.quantity === 0).length;

    document.getElementById('stat-total-products').textContent = totalProducts;
    document.getElementById('stat-total-value').textContent = '$' + totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('stat-low-stock').textContent = lowStockCount;
    document.getElementById('stat-out-stock').textContent = outOfStockCount;

    const banner = document.getElementById('low-stock-banner');
    if (lowStockCount > 0 || outOfStockCount > 0) {
        banner.classList.remove('hidden');
        document.getElementById('low-stock-banner-text').textContent = 
            `Attention: ${lowStockCount} item(s) are low on stock, and ${outOfStockCount} item(s) are out of stock.`;
    } else {
        banner.classList.add('hidden');
    }
}

function renderTopValueItems() {
    const tbody = document.getElementById('top-value-table');
    const sorted = [...inventory].sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price)).slice(0, 4);

    tbody.innerHTML = sorted.map(item => `
        <tr class="hover:bg-slate-50 transition">
            <td class="py-2.5 font-medium text-slate-800">${item.name} <span class="text-[10px] text-slate-400 font-normal">(${item.sku})</span></td>
            <td class="py-2.5"><span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px]">${item.category}</span></td>
            <td class="py-2.5 text-right font-semibold">${item.quantity}</td>
            <td class="py-2.5 text-right">$${parseFloat(item.price).toFixed(2)}</td>
            <td class="py-2.5 text-right font-bold text-slate-900">$${(item.quantity * item.price).toFixed(2)}</td>
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
        const isPositive = log.type === 'IN';
        return `
            <div class="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition">
                <div class="w-7 h-7 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    <i class="fa-solid ${isPositive ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-slate-800 truncate">${log.product_name || 'Product'}</p>
                    <p class="text-[11px] text-slate-500">${log.notes || (isPositive ? 'Stock Added' : 'Stock Removed')}</p>
                </div>
                <div class="text-right flex-shrink-0">
                    <span class="text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}">
                        ${isPositive ? '+' : '-'}${log.quantity_changed}
                    </span>
                    <p class="text-[10px] text-slate-400">${new Date(log.created_at).toLocaleTimeString()}</p>
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
        const matchesSearch = item.name.toLowerCase().includes(searchVal) || item.sku.toLowerCase().includes(searchVal);
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
        const totalVal = (item.quantity * item.price).toFixed(2);

        return `
            <tr class="hover:bg-slate-50/80 transition">
                <td class="py-3 px-4 font-mono text-xs font-semibold text-slate-600">${item.sku}</td>
                <td class="py-3 px-4 font-semibold text-slate-800">${item.name}</td>
                <td class="py-3 px-4">
                    <span class="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200">${item.category}</span>
                </td>
                <td class="py-3 px-4 text-center">
                    <span class="font-bold text-sm ${item.quantity === 0 ? 'text-rose-600' : (item.quantity < 10 ? 'text-amber-600' : 'text-slate-800')}">${item.quantity}</span>
                </td>
                <td class="py-3 px-4 text-right font-medium">$${parseFloat(item.price).toFixed(2)}</td>
                <td class="py-3 px-4 text-right font-bold text-slate-900">$${totalVal}</td>
                <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.class}">
                        ${status.label}
                    </span>
                </td>
                <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-1.5">
                        <button onclick="quickAdjustStock(${item.id}, 'IN', 1)" title="Quick +1 Stock In" class="w-7 h-7 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 rounded-md text-slate-600 flex items-center justify-center transition">
                            <i class="fa-solid fa-plus text-xs"></i>
                        </button>
                        <button onclick="quickAdjustStock(${item.id}, 'OUT', 1)" title="Quick -1 Stock Out" class="w-7 h-7 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 rounded-md text-slate-600 flex items-center justify-center transition">
                            <i class="fa-solid fa-minus text-xs"></i>
                        </button>
                        <button onclick="openProductModal(${item.id})" title="Edit Item" class="w-7 h-7 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 rounded-md text-slate-600 flex items-center justify-center transition">
                            <i class="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button onclick="deleteProduct(${item.id})" title="Delete Item" class="w-7 h-7 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 rounded-md text-slate-600 flex items-center justify-center transition">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterInventory() {
    renderInventoryTable();
}

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
        const isPositive = log.type === 'IN';
        return `
            <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 text-xs text-slate-500 font-mono">${new Date(log.created_at).toLocaleString()}</td>
                <td class="py-3 px-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                        <i class="fa-solid ${isPositive ? 'fa-arrow-down' : 'fa-arrow-up'} text-[10px]"></i>
                        ${isPositive ? 'STOCK IN' : 'STOCK OUT'}
                    </span>
                </td>
                <td class="py-3 px-4 font-semibold text-slate-800">${log.product_name} (${log.sku})</td>
                <td class="py-3 px-4 text-center font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}">
                    ${isPositive ? '+' : '-'}${log.quantity_changed}
                </td>
                <td class="py-3 px-4 text-center font-semibold text-slate-700">${log.final_stock}</td>
                <td class="py-3 px-4 text-xs text-slate-600">${log.notes || '-'}</td>
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
        const item = inventory.find(i => i.id === id);
        if (item) {
            title.textContent = 'Edit Product Details';
            document.getElementById('edit-id').value = item.id;
            document.getElementById('form-name').value = item.name;
            document.getElementById('form-sku').value = item.sku;
            document.getElementById('form-category').value = item.category;
            document.getElementById('form-stock').value = item.quantity;
            document.getElementById('form-price').value = item.price;
        }
    } else {
        title.textContent = 'Add New Product';
        document.getElementById('form-sku').value = 'SKU-' + Math.floor(1000 + Math.random() * 9000);
    }

    modal.classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

async function handleProductSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('edit-id').value;
    const data = {
        name: document.getElementById('form-name').value.trim(),
        sku: document.getElementById('form-sku').value.trim(),
        category: document.getElementById('form-category').value,
        quantity: parseInt(document.getElementById('form-stock').value),
        price: parseFloat(document.getElementById('form-price').value)
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();

        if (json.success) {
            showToast(id ? 'Product updated successfully' : 'Product added to inventory', 'success');
            closeProductModal();
            fetchInventory();
            fetchLogs();
        } else {
            showToast(json.error || 'Operation failed', 'error');
        }
    } catch (err) {
        showToast('Server communication error', 'error');
    }
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                showToast('Product deleted from inventory', 'info');
                fetchInventory();
                fetchLogs();
            }
        } catch (err) {
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

    select.innerHTML = inventory.map(i => `<option value="${i.id}">${i.name} (Current Stock: ${i.quantity})</option>`).join('');
    document.getElementById('stock-modal').classList.remove('hidden');
}

function closeStockModal() {
    document.getElementById('stock-modal').classList.add('hidden');
}

async function handleStockAdjustment(e) {
    e.preventDefault();
    const productId = document.getElementById('stock-item-select').value;
    const type = document.getElementById('stock-action').value;
    const quantity = parseInt(document.getElementById('stock-qty').value);
    const notes = document.getElementById('stock-note').value.trim();

    try {
        const res = await fetch(`${API_BASE}/stock/adjust`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, type, quantity, notes })
        });
        const json = await res.json();

        if (json.success) {
            showToast('Stock adjusted successfully', 'success');
            closeStockModal();
            fetchInventory();
            fetchLogs();
        } else {
            showToast(json.error || 'Stock adjustment failed', 'error');
        }
    } catch (err) {
        showToast('Server error while adjusting stock', 'error');
    }
}

async function quickAdjustStock(productId, type, quantity) {
    try {
        const res = await fetch(`${API_BASE}/stock/adjust`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, type, quantity, notes: `Quick ${type} adjustment` })
        });
        const json = await res.json();
        if (json.success) {
            showToast(`Quick stock update completed`, 'info');
            fetchInventory();
            fetchLogs();
        }
    } catch (err) {
        showToast('Failed to perform quick adjustment', 'error');
    }
}

async function clearAuditLogs() {
    if (confirm('Clear all audit logs from the database?')) {
        try {
            const res = await fetch(`${API_BASE}/stock/logs`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                showToast('Audit trail cleared', 'info');
                fetchLogs();
            }
        } catch (err) {
            showToast('Failed to clear logs', 'error');
        }
    }
}

function exportToCSV() {
    if (inventory.length === 0) {
        showToast('No inventory data to export', 'error');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "SKU,Product Name,Category,Stock Level,Unit Price,Total Value\n";

    inventory.forEach(item => {
        const row = [
            `"${item.sku}"`,
            `"${item.name}"`,
            `"${item.category}"`,
            item.quantity,
            parseFloat(item.price).toFixed(2),
            (item.quantity * item.price).toFixed(2)
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

    showToast('Exported inventory list to CSV', 'success');
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