/* ============================================
   KEFFIROOMS - DATABASE MANAGEMENT
   localStorage + IndexedDB for offline support
   ============================================ */

class KeffiRoomsDB {
    constructor() {
        this.dbName = 'KeffiRoomsDB';
        this.version = 1;
        this.db = null;
        this.initDB();
    }

    // Initialize IndexedDB
    initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Database failed to open');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                this.createObjectStores();
            };
        });
    }

    // Create object stores
    createObjectStores() {
        const stores = [
            { name: 'users', keyPath: 'id', indexes: [{ name: 'email', unique: true }, { name: 'phone', unique: false }] },
            { name: 'listings', keyPath: 'id', indexes: [{ name: 'agentId', unique: false }, { name: 'location', unique: false }, { name: 'createdAt', unique: false }] },
            { name: 'messages', keyPath: 'id', indexes: [{ name: 'conversationId', unique: false }, { name: 'timestamp', unique: false }] },
            { name: 'favorites', keyPath: 'id', indexes: [{ name: 'userId', unique: false }, { name: 'listingId', unique: false }] },
            { name: 'inquiries', keyPath: 'id', indexes: [{ name: 'seekerId', unique: false }, { name: 'agentId', unique: false }, { name: 'listingId', unique: false }] },
            { name: 'reports', keyPath: 'id', indexes: [{ name: 'reportedBy', unique: false }, { name: 'status', unique: false }] },
        ];

        stores.forEach(store => {
            if (!this.db.objectStoreNames.contains(store.name)) {
                const objectStore = this.db.createObjectStore(store.name, { keyPath: store.keyPath, autoIncrement: true });
                store.indexes.forEach(index => {
                    objectStore.createIndex(index.name, index.name, { unique: index.unique });
                });
            }
        });
    }

    // ============================================
    // USER OPERATIONS
    // ============================================

    async addUser(user) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const objectStore = transaction.objectStore('users');
            const request = objectStore.add(user);

            request.onsuccess = () => {
                localStorage.setItem('currentUser', JSON.stringify({ ...user, id: request.result }));
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getUser(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const objectStore = transaction.objectStore('users');
            const request = objectStore.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const objectStore = transaction.objectStore('users');
            const index = objectStore.index('email');
            const request = index.get(email);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateUser(user) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const objectStore = transaction.objectStore('users');
            const request = objectStore.put(user);

            request.onsuccess = () => {
                localStorage.setItem('currentUser', JSON.stringify(user));
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // ============================================
    // LISTING OPERATIONS
    // ============================================

    async addListing(listing) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['listings'], 'readwrite');
            const objectStore = transaction.objectStore('listings');
            const request = objectStore.add(listing);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getListing(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['listings'], 'readonly');
            const objectStore = transaction.objectStore('listings');
            const request = objectStore.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllListings() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['listings'], 'readonly');
            const objectStore = transaction.objectStore('listings');
            const request = objectStore.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getListingsByAgent(agentId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['listings'], 'readonly');
            const objectStore = transaction.objectStore('listings');
            const index = objectStore.index('agentId');
            const request = index.getAll(agentId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getListingsByLocation(location) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['listings'], 'readonly');
            const objectStore = transaction.objectStore('listings');
            const index = objectStore.index('location');
            const request = index.getAll(location);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateListing(listing) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['listings'], 'readwrite');
            const objectStore = transaction.objectStore('listings');
            const request = objectStore.put(listing);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteListing(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['listings'], 'readwrite');
            const objectStore = transaction.objectStore('listings');
            const request = objectStore.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // ============================================
    // FAVORITE OPERATIONS
    // ============================================

    async addFavorite(userId, listingId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['favorites'], 'readwrite');
            const objectStore = transaction.objectStore('favorites');
            const request = objectStore.add({ userId, listingId, createdAt: new Date() });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async removeFavorite(userId, listingId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['favorites'], 'readwrite');
            const objectStore = transaction.objectStore('favorites');
            const index = objectStore.index('userId');
            const range = IDBKeyRange.only(userId);
            const request = index.openCursor(range);

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.listingId === listingId) {
                        cursor.delete();
                    }
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getFavorites(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['favorites'], 'readonly');
            const objectStore = transaction.objectStore('favorites');
            const index = objectStore.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ============================================
    // MESSAGE OPERATIONS
    // ============================================

    async addMessage(message) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['messages'], 'readwrite');
            const objectStore = transaction.objectStore('messages');
            const request = objectStore.add(message);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getMessages(conversationId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['messages'], 'readonly');
            const objectStore = transaction.objectStore('messages');
            const index = objectStore.index('conversationId');
            const request = index.getAll(conversationId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ============================================
    // INQUIRY OPERATIONS
    // ============================================

    async addInquiry(inquiry) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['inquiries'], 'readwrite');
            const objectStore = transaction.objectStore('inquiries');
            const request = objectStore.add(inquiry);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getInquiries(agentId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['inquiries'], 'readonly');
            const objectStore = transaction.objectStore('inquiries');
            const index = objectStore.index('agentId');
            const request = index.getAll(agentId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ============================================
    // REPORT OPERATIONS
    // ============================================

    async addReport(report) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['reports'], 'readwrite');
            const objectStore = transaction.objectStore('reports');
            const request = objectStore.add(report);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getReports() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['reports'], 'readonly');
            const objectStore = transaction.objectStore('reports');
            const request = objectStore.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    clearCurrentUser() {
        localStorage.removeItem('currentUser');
    }

    isLoggedIn() {
        return !!this.getCurrentUser();
    }

    getUserRole() {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    }
}

// Initialize database
const db = new KeffiRoomsDB();
