class NetworkManager {
  constructor() {
    this.listeners = [];
    this.isOnline = navigator.onLine;

    this._handleOnline = this._handleOnline.bind(this);
    this._handleOffline = this._handleOffline.bind(this);

    window.addEventListener('online', this._handleOnline);
    window.addEventListener('offline', this._handleOffline);
  }

  _handleOnline() {
    this.isOnline = true;
    this._notifyListeners();
  }

  _handleOffline() {
    this.isOnline = false;
    this._notifyListeners();
  }

  addListener(callback) {
    this.listeners.push(callback);
    // Initial call
    callback(this.isOnline);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  _notifyListeners() {
    this.listeners.forEach(callback => callback(this.isOnline));
  }
}

const networkManager = new NetworkManager();
export default networkManager;
