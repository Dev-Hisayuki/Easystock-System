export async function initInventory(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-slate-800">Inventory Management</h2>
                <button id="btn-add-item" class="bg-indigo-600 text-white px-4 py-2 rounded font-semibold hover:bg-indigo-700 transition">+ Add New Item</button>
            </div>
            <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b text-slate-500 font-semibold uppercase text-[11px]">
                        <tr><th class="p-4">ID</th><th class="p-4">Name</th><th class="p-4">Category</th><th class="p-4 text-right">Quantity</th><th class="p-4 text-right">Unit Price</th><th class="p-4 text-center">Actions</th></tr>
                    </thead>
                    <tbody id="inventory-list-table" class="divide-y divide-slate-100"></tbody>
                </table>
            </div>
        </div>
    `;
    await renderItems();
}

async function renderItems() {
    const res = await fetch('/api/inventory');
    const items = res.ok ? await res.json() : [];
    const tbody = document.getElementById('inventory-list-table');
    tbody.innerHTML = items.map(item => `
        <tr class="hover:bg-slate-50 transition">
            <td class="p-4 font-mono text-slate-400 text-xs">#${item.id}</td>
            <td class="p-4 font-semibold text-slate-800">${item.item_name}</td>
            <td class="p-4"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">${item.category}</span></td>
            <td class="p-4 text-right font-medium ${item.quantity < 10 ? 'text-amber-600 font-bold' : ''}">${item.quantity}</td>
            <td class="p-4 text-right">₱${Number(item.unit_price).toFixed(2)}</td>
            <td class="p-4 text-center space-x-2">
                <button onclick="deleteItem(${item.id})" class="text-red-600 hover:text-red-800 text-xs font-semibold">Delete</button>
            </td>
        </tr>
    `).join('');
}