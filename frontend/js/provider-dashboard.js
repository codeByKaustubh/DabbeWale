console.log("Provider Dashboard JS loaded");

// Configuration
const API_BASE_URL = localStorage.getItem('API_BASE_URL') || 'http://localhost:5000';

// Get provider ID from localStorage or JWT token
function getProviderId() {
  // First try to get from localStorage (set during login)
  const providerId = localStorage.getItem('providerId');
  if (providerId) {
    return providerId;
  }
  
  // Fallback to JWT token
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return null;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch (err) {
    console.error('Error decoding token:', err);
    return null;
  }
}

// Fetch provider dashboard stats
async function fetchDashboardStats() {
  const providerId = getProviderId();
  if (!providerId) {
    console.error('No provider ID found');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/providers/${providerId}/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const stats = await response.json();
    updateDashboardUI(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    showError('Failed to load dashboard data');
  }
}

// Update dashboard UI with real data
function updateDashboardUI(stats) {
  // Update metric cards
  const totalOrdersEl = document.querySelector('.metric .value');
  const pendingOrdersEl = document.querySelectorAll('.metric .value')[1];
  const todayRevenueEl = document.querySelectorAll('.metric .value')[2];
  const ratingEl = document.querySelectorAll('.metric .value')[3];
  
  if (totalOrdersEl) totalOrdersEl.textContent = stats.totalOrders || 0;
  if (pendingOrdersEl) pendingOrdersEl.textContent = stats.pendingOrders || 0;
  if (todayRevenueEl) todayRevenueEl.textContent = `₹${stats.todayRevenue || 0}`;
  if (ratingEl) ratingEl.textContent = (stats.rating || 0).toFixed(1);

  // Add click handlers to cards
  addCardClickHandlers();
}

// Add click handlers to metric cards
function addCardClickHandlers() {
  // Pending Orders card - go to orders page
  const pendingCard = document.querySelector('.pending-orders-card');
  if (pendingCard) {
    pendingCard.style.cursor = 'pointer';
    pendingCard.addEventListener('click', () => {
      window.location.href = 'orders.html?filter=pending';
    });
  }

  // Total Orders card - go to orders page
  const totalCard = document.querySelector('.total-orders-card');
  if (totalCard) {
    totalCard.style.cursor = 'pointer';
    totalCard.addEventListener('click', () => {
      window.location.href = 'orders.html';
    });
  }

  // Rating card - go to reviews page
  const ratingCard = document.querySelector('.rating-card');
  if (ratingCard) {
    ratingCard.style.cursor = 'pointer';
    ratingCard.addEventListener('click', () => {
      window.location.href = 'reviews.html';
    });
  }
}

// Show error message
function showError(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.background = '#f44336'; // Red color for error
    setTimeout(() => {
      notification.style.display = 'none';
    }, 5000);
  }
}

// Check authentication and load dashboard
function initializeDashboard() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }

  // Check if user is a provider
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'provider') {
      alert('Access denied. Provider login required.');
      window.location.href = 'login.html';
      return;
    }
    
    // Update provider name in header
    const providerNameEl = document.getElementById('providerName');
    if (providerNameEl) {
      providerNameEl.textContent = payload.name || 'Provider';
    }
  } catch (err) {
    console.error('Error checking token:', err);
    alert('Invalid token. Please login again.');
    window.location.href = 'login.html';
    return;
  }

  // Load dashboard data
  fetchDashboardStats();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Add logout functionality
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  localStorage.removeItem('providerId');
  window.location.href = 'index.html';
}

// Make logout function globally available
window.logout = logout;
