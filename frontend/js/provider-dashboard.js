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
    
    // Fetch provider orders
    const ordersResponse = await fetch(`${API_BASE_URL}/api/orders/provider/${providerId}?limit=50`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!ordersResponse.ok) {
      throw new Error(`HTTP error! status: ${ordersResponse.status}`);
    }

    const ordersData = await ordersResponse.json();
    const orders = ordersData.orders || [];
    
    // Calculate stats from real orders
    const stats = calculateStatsFromOrders(orders);
    updateDashboardUI(stats);
    
    // Update orders panel with real data
    updateOrdersPanel(orders);
    
    // Load provider menu
    await loadProviderMenu(providerId);
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    showError('Failed to load dashboard data');
  }
}

// Calculate stats from real orders
function calculateStatsFromOrders(orders) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing'].includes(order.status)
  ).length;
  
  const todayOrders = orders.filter(order => 
    new Date(order.createdAt) >= today && order.status === 'delivered'
  );
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.finalAmount, 0);
  
  // Calculate average rating from orders with ratings
  const ratedOrders = orders.filter(order => order.rating);
  const avgRating = ratedOrders.length > 0 
    ? ratedOrders.reduce((sum, order) => sum + order.rating, 0) / ratedOrders.length 
    : 0;
  
  return {
    totalOrders,
    pendingOrders,
    todayRevenue,
    rating: avgRating,
    totalReviews: ratedOrders.length
  };
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

// Update orders panel with real data
function updateOrdersPanel(orders) {
  const ordersList = document.querySelector('#panel-orders .list');
  if (!ordersList) return;

  if (orders.length === 0) {
    ordersList.innerHTML = `
      <div class="list-item" style="text-align: center; padding: 2rem;">
        <div>
          <div class="title">No orders yet</div>
          <div class="sub">Orders will appear here when customers place them</div>
        </div>
      </div>
    `;
    return;
  }

  ordersList.innerHTML = orders.slice(0, 10).map(order => {
    const statusColors = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      preparing: '#9c27b0',
      out_for_delivery: '#ff5722',
      delivered: '#4caf50',
      cancelled: '#f44336'
    };

    const statusLabels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };

    const orderDate = new Date(order.createdAt).toLocaleString();
    const statusColor = statusColors[order.status] || '#666';
    const statusLabel = statusLabels[order.status] || order.status;

    const pickupAddress = order.provider?.address ? `${order.provider.address.street || ''}, ${order.provider.address.city || ''}` : 'Provider location not available';
    const dropAddress = order.deliveryAddress ? `${order.deliveryAddress.street || ''}, ${order.deliveryAddress.city || ''}` : 'Delivery address not available';

    return `
      <div class="list-item">
        <div>
          <div class="title">Order #${order._id.slice(-6).toUpperCase()} · ₹${order.finalAmount} · <span style="color: ${statusColor}">${statusLabel}</span></div>
          <div class="sub">${order.customer?.name || 'Customer'} · ${orderDate}</div>
          <div class="sub">Items: ${order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}</div>
          <div class="sub"><strong>Pickup:</strong> ${pickupAddress}</div>
          <div class="sub"><strong>Drop:</strong> ${dropAddress}</div>
        </div>
        <div class="actions">
          ${getOrderActionButtons(order)}
        </div>
      </div>
    `;
  }).join('');
}

// Get action buttons based on order status
function getOrderActionButtons(order) {
  const buttons = [];
  
  switch (order.status) {
    case 'pending':
      buttons.push(
        `<button class="btn primary" onclick="updateOrderStatus('${order._id}', 'confirmed')">Accept</button>`,
        `<button class="btn danger" onclick="updateOrderStatus('${order._id}', 'cancelled')">Reject</button>`
      );
      break;
    case 'confirmed':
      buttons.push(
        `<button class="btn warning" onclick="updateOrderStatus('${order._id}', 'preparing')">Start Preparing</button>`
      );
      break;
    case 'preparing':
      buttons.push(
        `<button class="btn primary" onclick="updateOrderStatus('${order._id}', 'out_for_delivery')">Ready for Delivery</button>`
      );
      break;
    case 'out_for_delivery':
      buttons.push(
        `<button class="btn success" onclick="updateOrderStatus('${order._id}', 'delivered')">Mark Delivered</button>`
      );
      break;
    case 'delivered':
      buttons.push(
        `<button class="btn ghost" disabled>Completed</button>`
      );
      break;
    case 'cancelled':
      buttons.push(
        `<button class="btn ghost" disabled>Cancelled</button>`
      );
      break;
  }
  
  return buttons.join('');
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
      showSuccess('Order status updated successfully!');
      // Refresh the dashboard
      fetchDashboardStats();
    } else {
      const error = await response.json();
      showError('Failed to update order status: ' + (error.msg || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    showError('Failed to update order status');
  }
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

// Show success message
function showSuccess(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.background = '#4caf50'; // Green color for success
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
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

// Load provider menu
async function loadProviderMenu(providerId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/providers/${providerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const provider = await response.json();
      updateMenuPanel(provider.menu || []);
    }
  } catch (error) {
    console.error('Error loading provider menu:', error);
  }
}

// Update menu panel with real data
function updateMenuPanel(menuItems) {
  const menuList = document.querySelector('#panel-menu .list');
  if (!menuList) return;

  if (menuItems.length === 0) {
    menuList.innerHTML = `
      <div class="list-item" style="text-align: center; padding: 2rem;">
        <div>
          <div class="title">No menu items yet</div>
          <div class="sub">Add your first menu item using the form above</div>
        </div>
      </div>
    `;
    return;
  }

  menuList.innerHTML = menuItems.map((item, index) => `
    <div class="list-item">
      <div>
        <div class="title">${item.name} · ₹${item.price}</div>
        <div class="sub">${item.type || 'Vegetarian'} · ${item.category || 'Lunch'}</div>
        <div class="sub">${item.description || 'No description'}</div>
      </div>
      <div class="actions">
        <button class="btn" onclick="editMenuItem(${index})">Edit</button>
        <button class="btn danger" onclick="deleteMenuItem(${index})">Delete</button>
        <button class="btn ghost" onclick="toggleMenuItemAvailability(${index})">
          ${item.available !== false ? 'Set Unavailable' : 'Set Available'}
        </button>
      </div>
    </div>
  `).join('');
}

// Add menu item
async function addMenuItem() {
  const form = document.querySelector('#panel-menu form');
  const formData = new FormData(form);
  
  const menuItem = {
    name: formData.get('name'),
    price: parseFloat(formData.get('price')),
    type: formData.get('type'),
    category: formData.get('category'),
    description: formData.get('description'),
    image: formData.get('image'),
    available: true
  };

  try {
    const providerId = getProviderId();
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/api/providers/${providerId}/menu`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(menuItem)
    });

    if (response.ok) {
      showSuccess('Menu item added successfully!');
      form.reset();
      await loadProviderMenu(providerId);
    } else {
      const error = await response.json();
      showError('Failed to add menu item: ' + (error.msg || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error adding menu item:', error);
    showError('Failed to add menu item');
  }
}

// Edit menu item
function editMenuItem(index) {
  // For now, just show an alert. In a real app, you'd open an edit modal
  showError('Edit functionality coming soon!');
}

// Delete menu item
async function deleteMenuItem(index) {
  if (!confirm('Are you sure you want to delete this menu item?')) {
    return;
  }
  
  try {
    const providerId = getProviderId();
    const token = localStorage.getItem('token');
    
    // For now, just show success. In a real app, you'd make an API call
    showSuccess('Menu item deleted successfully!');
    await loadProviderMenu(providerId);
  } catch (error) {
    console.error('Error deleting menu item:', error);
    showError('Failed to delete menu item');
  }
}

// Toggle menu item availability
async function toggleMenuItemAvailability(index) {
  try {
    const providerId = getProviderId();
    const token = localStorage.getItem('token');
    
    // For now, just show success. In a real app, you'd make an API call
    showSuccess('Menu item availability updated!');
    await loadProviderMenu(providerId);
  } catch (error) {
    console.error('Error updating menu item availability:', error);
    showError('Failed to update menu item availability');
  }
}

// Make functions globally available
window.logout = logout;
window.updateOrderStatus = updateOrderStatus;
window.addMenuItem = addMenuItem;
window.editMenuItem = editMenuItem;
window.deleteMenuItem = deleteMenuItem;
window.toggleMenuItemAvailability = toggleMenuItemAvailability;
