/* ============================================
   KEFFIROOMS - SEEKER PORTAL
   Listings, search, favorites, and contact
   ============================================ */

requireSeeker();

let allListings = [];
let filteredListings = [];
let currentListing = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    await loadListings();
    renderListings();
});

// Theme toggle
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.material-symbols-outlined');
    
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = 'light_mode';
    }
    
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
    });
}

// Load listings from database
async function loadListings() {
    try {
        allListings = await db.getAllListings();
        if (allListings.length === 0) {
            // Add sample listings if database is empty
            await addSampleListings();
            allListings = await db.getAllListings();
        }
        filteredListings = [...allListings];
    } catch (error) {
        console.error('Error loading listings:', error);
    }
}

// Add sample listings
async function addSampleListings() {
    const samples = [
        {
            title: 'Cozy Studio Near Campus',
            price: 45000,
            location: 'Barikin Ladi, Nasarawa',
            bedrooms: 1,
            bathrooms: 1,
            wifi: true,
            verified: true,
            agentName: 'Chidi Okonkwo',
            agentPhone: '+2348012345678',
            agentRating: 4.8,
            description: 'Beautiful studio apartment close to campus with modern amenities.',
            images: ['🏠'],
            gpsCoords: { lat: 8.7832, lng: 7.1339 },
            createdAt: new Date().toISOString()
        },
        {
            title: 'Modern 2-Bedroom Apartment',
            price: 75000,
            location: 'Keffi Town Center',
            bedrooms: 2,
            bathrooms: 1,
            wifi: true,
            verified: true,
            agentName: 'Amina Hassan',
            agentPhone: '+2348087654321',
            agentRating: 4.9,
            description: 'Spacious 2-bedroom apartment in the heart of Keffi with excellent facilities.',
            images: ['🏢'],
            gpsCoords: { lat: 8.7832, lng: 7.1339 },
            createdAt: new Date().toISOString()
        },
        {
            title: 'Spacious 3-Bedroom House',
            price: 120000,
            location: 'Barikin Ladi',
            bedrooms: 3,
            bathrooms: 2,
            wifi: true,
            verified: true,
            agentName: 'Tunde Adeyemi',
            agentPhone: '+2349012345678',
            agentRating: 4.7,
            description: 'Large family house with garden and parking space.',
            images: ['🏡'],
            gpsCoords: { lat: 8.7832, lng: 7.1339 },
            createdAt: new Date().toISOString()
        },
        {
            title: 'Budget-Friendly Single Room',
            price: 35000,
            location: 'Nasarawa GRA',
            bedrooms: 1,
            bathrooms: 1,
            wifi: false,
            verified: true,
            agentName: 'Grace Eze',
            agentPhone: '+2349087654321',
            agentRating: 4.6,
            description: 'Affordable single room perfect for students on a budget.',
            images: ['🛏️'],
            gpsCoords: { lat: 8.7832, lng: 7.1339 },
            createdAt: new Date().toISOString()
        }
    ];

    for (const listing of samples) {
        await db.addListing(listing);
    }
}

// Render listings
function renderListings() {
    const container = document.getElementById('listingsContainer');
    
    if (filteredListings.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-state-icon">🔍</div>
                <h3>No listings found</h3>
                <p>Try adjusting your search filters</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredListings.map(listing => `
        <div class="listing-card animate-fade-in" onclick="viewListing(${listing.id})">
            <div class="listing-image">
                ${listing.images ? listing.images[0] : '🏠'}
                ${listing.verified ? '<div class="listing-badge"><span class="material-symbols-outlined">verified</span> Verified</div>' : ''}
            </div>
            <div class="listing-content">
                <h3 class="listing-title">${listing.title}</h3>
                <div class="listing-location">
                    <span class="material-symbols-outlined">location_on</span>
                    ${listing.location}
                </div>
                <div class="listing-details">
                    <div class="detail-item">
                        <span class="material-symbols-outlined">bed</span>
                        ${listing.bedrooms} bed
                    </div>
                    <div class="detail-item">
                        <span class="material-symbols-outlined">bathroom</span>
                        ${listing.bathrooms} bath
                    </div>
                    ${listing.wifi ? '<div class="detail-item"><span class="material-symbols-outlined">wifi</span> WiFi</div>' : ''}
                </div>
                <div class="listing-price">₦${listing.price.toLocaleString()}</div>
                <div class="listing-agent">
                    <div class="agent-avatar">${listing.agentName.charAt(0)}</div>
                    <div class="agent-info">
                        <div class="agent-name">${listing.agentName}</div>
                        <div class="agent-rating">
                            <span class="material-symbols-outlined">star</span>
                            ${listing.agentRating}
                        </div>
                    </div>
                    <button class="favorite-btn" onclick="toggleFavorite(event, ${listing.id})">
                        <span class="material-symbols-outlined">favorite</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// View listing details
async function viewListing(id) {
    currentListing = await db.getListing(id);
    const detailContainer = document.getElementById('listingDetail');
    
    detailContainer.innerHTML = `
        <div class="listing-detail-header">
            <div class="detail-images">
                <div class="detail-image">${currentListing.images ? currentListing.images[0] : '🏠'}</div>
            </div>
            <div class="detail-info">
                <h2>${currentListing.title}</h2>
                <div class="detail-price">₦${currentListing.price.toLocaleString()}</div>
                <div class="detail-specs">
                    <div class="spec-item">
                        <div class="spec-icon"><span class="material-symbols-outlined">bed</span></div>
                        <div class="spec-text">
                            <div class="spec-label">Bedrooms</div>
                            <div class="spec-value">${currentListing.bedrooms}</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-icon"><span class="material-symbols-outlined">bathroom</span></div>
                        <div class="spec-text">
                            <div class="spec-label">Bathrooms</div>
                            <div class="spec-value">${currentListing.bathrooms}</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-icon"><span class="material-symbols-outlined">location_on</span></div>
                        <div class="spec-text">
                            <div class="spec-label">Location</div>
                            <div class="spec-value">${currentListing.location}</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-icon"><span class="material-symbols-outlined">${currentListing.wifi ? 'wifi' : 'wifi_off'}</span></div>
                        <div class="spec-text">
                            <div class="spec-label">WiFi</div>
                            <div class="spec-value">${currentListing.wifi ? 'Available' : 'Not Available'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="detail-description">
            <h3>Description</h3>
            <p>${currentListing.description}</p>
        </div>

        <div class="detail-agent-card">
            <h3>Agent Information</h3>
            <div class="agent-details">
                <div class="agent-avatar-large">${currentListing.agentName.charAt(0)}</div>
                <div class="agent-info-large">
                    <p><strong>${currentListing.agentName}</strong></p>
                    <p>Phone: ${currentListing.agentPhone}</p>
                    <p>Rating: <span class="material-symbols-outlined">star</span> ${currentListing.agentRating}</p>
                </div>
            </div>
        </div>

        <div class="detail-actions">
            <button class="btn btn-primary" onclick="contactAgent()">
                <span class="material-symbols-outlined">message</span>
                Contact Agent
            </button>
            <button class="btn btn-secondary" onclick="saveFavorite()">
                <span class="material-symbols-outlined">favorite</span>
                Save Listing
            </button>
        </div>
    `;

    document.getElementById('listingModal').classList.remove('hidden');
}

// Contact agent via WhatsApp
function contactAgent() {
    if (!currentListing) return;

    const user = auth.getCurrentUser();
    const message = `Hi, I'm interested in your listing: "${currentListing.title}" in ${currentListing.location}. Price: ₦${currentListing.price.toLocaleString()}. Contact me at ${user.phone}. Thanks!`;
    const whatsappUrl = `https://wa.me/2347066068160?text=${encodeURIComponent(`SEEKER INQUIRY:\n\nListing: ${currentListing.title}\nLocation: ${currentListing.location}\nPrice: ₦${currentListing.price.toLocaleString()}\n\nSeeker: ${user.name}\nPhone: ${user.phone}\nEmail: ${user.email}\n\nAgent: ${currentListing.agentName}\nAgent Phone: ${currentListing.agentPhone}`)}`;
    
    window.open(whatsappUrl, '_blank');
}

// Save favorite
async function saveFavorite() {
    if (!currentListing) return;
    
    const user = auth.getCurrentUser();
    await db.addFavorite(user.id, currentListing.id);
    alert('Listing saved to favorites!');
}

// Toggle favorite
async function toggleFavorite(event, listingId) {
    event.stopPropagation();
    const user = auth.getCurrentUser();
    const btn = event.currentTarget;
    
    if (btn.classList.contains('active')) {
        await db.removeFavorite(user.id, listingId);
        btn.classList.remove('active');
    } else {
        await db.addFavorite(user.id, listingId);
        btn.classList.add('active');
    }
}

// Close listing modal
function closeListingModal() {
    document.getElementById('listingModal').classList.add('hidden');
}

// Apply filters
function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const priceFilter = document.getElementById('priceFilter').value;
    const bedroomFilter = document.getElementById('bedroomFilter').value;

    filteredListings = allListings.filter(listing => {
        // Location filter
        if (search && !listing.location.toLowerCase().includes(search)) {
            return false;
        }

        // Price filter
        if (priceFilter) {
            const [min, max] = priceFilter.split('-');
            const minPrice = parseInt(min);
            const maxPrice = max ? parseInt(max) : Infinity;
            if (listing.price < minPrice || listing.price > maxPrice) {
                return false;
            }
        }

        // Bedroom filter
        if (bedroomFilter && listing.bedrooms !== parseInt(bedroomFilter)) {
            return false;
        }

        return true;
    });

    renderListings();
}

// Show profile
function showProfile() {
    const user = auth.getCurrentUser();
    alert(`Profile:\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}\nRole: ${user.role}`);
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.logout();
        window.location.href = 'index.html';
    }
}
