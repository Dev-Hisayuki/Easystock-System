class DashboardTabManager {
  constructor() {
    this.tabButtons = document.querySelectorAll('.tab-btn');
    this.tabPanes = document.querySelectorAll('.tab-pane');
    this.pageTitle = document.getElementById('page-title');
    
    this.init();
  }

  init() {
    this.tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });
  }

  switchTab(tabId) {
    this.tabPanes.forEach(pane => pane.classList.add('hidden'));

    this.tabButtons.forEach(btn => {
      btn.classList.remove('bg-indigo-800', 'text-white');
      btn.classList.add('hover:bg-indigo-800');
    });

    const selectedPane = document.getElementById(`view-${tabId}`);
    if (selectedPane) {
      selectedPane.classList.remove('hidden');
    }

    const selectedButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (selectedButton) {
      selectedButton.classList.add('bg-indigo-800', 'text-white');
      selectedButton.classList.remove('hover:bg-indigo-800');
    }

    if (this.pageTitle) {
      this.pageTitle.textContent = `Dashboard ${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`;
    }

    document.dispatchEvent(new CustomEvent('tabChanged', {
      detail: { activeTab: tabId }
    }));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.tabManager = new DashboardTabManager();
});