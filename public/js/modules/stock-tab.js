export async function initStockOps(container) {
    container.innerHTML = `
        <div class="max-w-xl mx-auto bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h2 class="text-xl font-bold text-slate-800">Stock Adjustment Operation</h2>
            <form id="stock-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">Item ID</label>
                    <input type="number" id="stock-item-id" required class="w-full border p-2 rounded outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">Transaction Type</label>
                    <select id="stock-type" class="w-full border p-2 rounded outline-none">
                        <option value="IN">Stock In (+)</option>
                        <option value="OUT">Stock Out (-)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">Quantity Amount</label>
                    <input type="number" id="stock-amount" min="1" required class="w-full border p-2 rounded outline-none">
                </div>
                <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 transition">Submit Transaction</button>
            </form>
        </div>
    `;
    document.getElementById('stock-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            item_id: document.getElementById('stock-item-id').value,
            type: document.getElementById('stock-type').value,
            amount: document.getElementById('stock-amount').value
        };
        const res = await fetch('/api/stock/adjust', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) alert('Stock updated!');
    });
}
