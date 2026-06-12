/* ============================================
   KEFFIROOMS - AUTHENTICATION
   User registration, login, and session management
   ============================================ */

class AuthManager {
    constructor() {
        this.currentUser = db.getCurrentUser();
    }

    // Simple password hashing (in production, use bcrypt on backend)
    hashPassword(password) {
        return btoa(password); // Base64 encoding for demo
    }

    verifyPassword(password, hash) {
        return btoa(password) === hash;
    }

    // Generate unique ID
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Register new user
    async register(userData) {
        try {
            // Validate input
            if (!userData.email || !userData.password || !userData.name) {
                throw new Error('Missing required fields');
            }

            // Check if email already exists
            const existingUser = await db.getUserByEmail(userData.email);
            if (existingUser) {
                throw new Error('Email already registered');
            }

            // Create user object
            const user = {
                id: this.generateId(),
                name: userData.name,
                email: userData.email,
                phone: userData.phone || '',
                password: this.hashPassword(userData.password),
                role: userData.role || 'seeker',
                verified: false,
                createdAt: new Date().toISOString(),
                profileImage: null,
                bio: '',
                location: userData.location || '',
                ...userData
            };

            // Remove password from stored user object
            const userToStore = { ...user };
            delete userToStore.password;

            // Add to database
            const userId = await db.addUser(userToStore);
            user.id = userId;

            // Set as current user
            this.currentUser = userToStore;
            db.setCurrentUser(userToStore);

            return { success: true, user: userToStore };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Login user
    async login(email, password) {
        try {
            const user = await db.getUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }

            // For demo, we'll skip password verification
            // In production, verify password hash
            this.currentUser = user;
            db.setCurrentUser(user);

            return { success: true, user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Logout user
    logout() {
        this.currentUser = null;
        db.clearCurrentUser();
        localStorage.removeItem('userRole');
        return { success: true };
    }

    // Update user profile
    async updateProfile(updates) {
        try {
            if (!this.currentUser) {
                throw new Error('Not logged in');
            }

            const updatedUser = { ...this.currentUser, ...updates };
            await db.updateUser(updatedUser);
            this.currentUser = updatedUser;
            db.setCurrentUser(updatedUser);

            return { success: true, user: updatedUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Verify user (admin only)
    async verifyUser(userId) {
        try {
            const user = await db.getUser(userId);
            if (!user) {
                throw new Error('User not found');
            }

            user.verified = true;
            await db.updateUser(user);

            return { success: true, user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!this.currentUser;
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Check if user is agent
    isAgent() {
        return this.currentUser && this.currentUser.role === 'agent';
    }

    // Check if user is seeker
    isSeeker() {
        return this.currentUser && this.currentUser.role === 'seeker';
    }
}

// Initialize auth manager
const auth = new AuthManager();

// Redirect if not logged in
function requireLogin() {
    if (!auth.isLoggedIn()) {
        window.location.href = 'index.html';
    }
}

// Redirect if not admin
function requireAdmin() {
    if (!auth.isAdmin()) {
        window.location.href = 'index.html';
    }
}

// Redirect if not agent
function requireAgent() {
    if (!auth.isAgent()) {
        window.location.href = 'index.html';
    }
}

// Redirect if not seeker
function requireSeeker() {
    if (!auth.isSeeker()) {
        window.location.href = 'index.html';
    }
}
