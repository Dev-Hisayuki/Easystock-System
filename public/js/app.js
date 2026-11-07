import { checkAuth, logoutUser } from './modules/auth-tab.js';
import { initDashboard } from './modules/dashboard-tab.js';
import { initInventory } from './modules/inventory-tab.js';
import { initStockOps } from './modules/stock-tab.js';
import { initLogs } from './modules/logs-tab.js';

const state = {
    currentUser: null,
    activeTab: 'dashboard'
};

document.addEventListener('DOMContentLoaded', async () => {
    const authUser = await checkAuth();
    if (authUser) {
        state.currentUser = authUser;
        showAppLayout();
    }
    setupNavigation();
});

export function showAppLayout() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('user-display').textContent = state.currentUser ? state.currentUser.username : 'User';
    loadTab('dashboard');
}

function setupNavigation() {
    document.getElementById('nav-dashboard').addEventListener('click', () => loadTab('dashboard'));
    document.getElementById('nav-inventory').addEventListener('click', () => loadTab('inventory'));
    document.getElementById('nav-stock').addEventListener('click', () => loadTab('stock'));
    document.getElementById('nav-logs').addEventListener('click', () => loadTab('logs'));
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await logoutUser();
        window.location.reload();
    });
}

export async function loadTab(tabName) {
    state.activeTab = tabName;
    const container = document.getElementById('tab-content');
    container.innerHTML = '';
    switch (tabName) {
        case 'dashboard':
            await initDashboard(container);
            break;
        case 'inventory':
            await initInventory(container);
            break;
        case 'stock':
            await initStockOps(container);
            break;
        case 'logs':
            await initLogs(container);
            break;
    }
}
