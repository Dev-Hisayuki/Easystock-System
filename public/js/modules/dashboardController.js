class DashboardController {
  constructor() {
    this.currentUser = 'guest';
    this.activeTab = 'overview';
    this.init();
  }

  init() {
    document.addEventListener('tabChanged', (event) => {
      this.handleTabChange(event.detail.activeTab);
    });

    this.loadInitialData();
  }

  loadInitialData() {
    this.fetchOverviewMetrics();
  }

  handleTabChange(tabId) {
    this.activeTab = tabId;

    switch (tabId) {
      case 'overview':
        this.fetchOverviewMetrics();
        break;
      case 'analytics':
        this.fetchAnalyticsData();
        break;
      case 'settings':
        this.fetchSettingsData();
        break;
      default:
        break;
    }
  }

  fetchOverviewMetrics() {
    console.log(`[${this.currentUser}] Loading Overview metrics...`);
  }

  fetchAnalyticsData() {
    console.log(`[${this.currentUser}] Loading Analytics data...`);
  }

  fetchSettingsData() {
    console.log(`[${this.currentUser}] Loading Settings configurations...`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.dashboardController = new DashboardController();
});