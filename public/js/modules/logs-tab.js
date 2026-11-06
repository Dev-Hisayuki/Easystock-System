export async function initLogs(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <h2 class="text-2xl font-bold text-slate-800">Audit Activity Logs</h2>
            <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b text-slate-500 font-semibold uppercase text-[11px]">
                        <tr><th class="p-4">Timestamp</th><th class="p-4">User</th><th class="p-4">Action</th><th class="p-4">Details</th></tr>
                    </thead>
                    <tbody id="logs-list-table" class="divide-y divide-slate-100"></tbody>
                </table>
            </div>
        </div>
    `;
    const res = await fetch('/api/logs');
    const logs = res.ok ? await res.json() : [];
    document.getElementById('logs-list-table').innerHTML = logs.map(log => `
        <tr class="hover:bg-slate-50 transition">
            <td class="p-4 text-xs font-mono text-slate-400">${new Date(log.timestamp).toLocaleString()}</td>
            <td class="p-4 font-semibold text-slate-700">${log.username || 'System'}</td>
            <td class="p-4"><span class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-semibold">${log.action}</span></td>
            <td class="p-4 text-slate-600">${log.details}</td>
        </tr>
    `).join('');
}
