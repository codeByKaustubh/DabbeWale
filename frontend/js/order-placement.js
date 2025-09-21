console.log("Order Placement JS loaded");

// Configuration
const API_BASE_URL = localStorage.getItem('API_BASE_URL') || 'http://localhost:5000';

// Global variables
let providers = [];
let cart = {};
let selectedProvider = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log("Order placement page loaded");
    loadProviders();
});

// Load providers from API
async function loadProviders() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/api/providers`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        providers = data.providers || data; // Handle both array and object response
        console.log("Loaded providers:", providers);
        
        displayProviders(providers);
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading providers:', error);
        showError('Failed to load providers. Please try again.');
        showLoading(false);
    }
}

// Display providers on the page
function displayProviders(providers) {
    const container = document.getElementById('providers-container');
    
    if (!providers || providers.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h3>No providers available</h3>
                <p>Check back later for tiffin services in your area</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = providers.map(provider => createProviderCard(provider)).join('');
}

// Create provider card HTML
function createProviderCard(provider) {
    const rating = provider.rating || 0;
    const totalRatings = provider.totalRatings || 0;
    const location = provider.address?.city || provider.location || 'Location not specified';
    
    // Create sample menu items (in real app, this would come from provider.menu)
    const sampleMenu = [
        { name: 'Veg Thali', price: 120, available: true },
        { name: 'Dal Rice', price: 80, available: true },
        { name: 'Roti Sabzi', price: 100, available: true },
        { name: 'Special Thali', price: 150, available: true }
    ];
    
    return `
        <div class="provider-card" data-provider-id="${provider._id}">
            <div class="provider-header">
                <h3 class="provider-name">${provider.providerName || provider.name}</h3>
                <div class="provider-rating">
                    ⭐ ${rating.toFixed(1)} (${totalRatings})
                </div>
            </div>
            <div class="provider-info">
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Description:</strong> ${provider.description || 'Fresh home-cooked meals'}</p>
            </div>
            <div class="menu-section">
                <h4 style="margin-bottom: 15px; color: #333;">Menu</h4>
                ${sampleMenu.map(item => createMenuItem(provider._id, item)).join('')}
            </div>
        </div>
    `;
}

// Create menu item HTML
function createMenuItem(providerId, item) {
    const itemId = `${providerId}-${item.name.replace(/\s+/g, '-').toLowerCase()}`;
    
    return `
        <div class="menu-item">
            <div>
                <div class="item-name">${item.name}</div>
                <div style="font-size: 0.9rem; color: #666;">Fresh and delicious</div>
            </div>
            <div class="quantity-controls">
                <button class="qty-btn" onclick="decreaseQuantity('${itemId}', '${providerId}')">-</button>
                <span class="qty-display" id="qty-${itemId}">0</span>
                <button class="qty-btn" onclick="increaseQuantity('${itemId}', '${providerId}', '${item.name}', ${item.price})">+</button>
            </div>
            <div class="item-price">₹${item.price}</div>
        </div>
    `;
}

// Increase item quantity
function increaseQuantity(itemId, providerId, itemName, price) {
    if (!cart[providerId]) {
        cart[providerId] = {};
    }
    
    if (!cart[providerId][itemId]) {
        cart[providerId][itemId] = {
            name: itemName,
            price: price,
            quantity: 0
        };
    }
    
    cart[providerId][itemId].quantity++;
    updateQuantityDisplay(itemId);
    updateOrderSummary();
}

// Decrease item quantity
function decreaseQuantity(itemId, providerId) {
    if (!cart[providerId] || !cart[providerId][itemId]) {
        return;
    }
    
    cart[providerId][itemId].quantity--;
    
    if (cart[providerId][itemId].quantity <= 0) {
        delete cart[providerId][itemId];
        if (Object.keys(cart[providerId]).length === 0) {
            delete cart[providerId];
        }
    }
    
    updateQuantityDisplay(itemId);
    updateOrderSummary();
}

// Update quantity display
function updateQuantityDisplay(itemId) {
    const display = document.getElementById(`qty-${itemId}`);
    if (display) {
        const providerId = itemId.split('-')[0];
        const quantity = cart[providerId]?.[itemId]?.quantity || 0;
        display.textContent = quantity;
    }
}

// Update order summary
function updateOrderSummary() {
    const orderSummary = document.getElementById('order-summary');
    const emptyCart = document.getElementById('empty-cart');
    const totalAmount = document.getElementById('total-amount');
    const itemCount = document.getElementById('item-count');
    
    let total = 0;
    let itemCountNum = 0;
    
    // Calculate total from all providers
    Object.keys(cart).forEach(providerId => {
        Object.values(cart[providerId]).forEach(item => {
            total += item.price * item.quantity;
            itemCountNum += item.quantity;
        });
    });
    
    if (itemCountNum === 0) {
        orderSummary.style.display = 'none';
        emptyCart.style.display = 'block';
    } else {
        orderSummary.style.display = 'block';
        emptyCart.style.display = 'none';
        totalAmount.textContent = `₹${total}`;
        itemCount.textContent = `${itemCountNum} item${itemCountNum !== 1 ? 's' : ''}`;
    }
}

// Place order
async function placeOrder() {
    const token = localStorage.getItem('token');
    if (!token) {
        showError('Please login to place an order');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Check if cart has items
    let hasItems = false;
    Object.keys(cart).forEach(providerId => {
        if (Object.keys(cart[providerId]).length > 0) {
            hasItems = true;
        }
    });
    
    if (!hasItems) {
        showError('Please add items to your cart');
        return;
    }
    
    // For now, place order with the first provider that has items
    const providerId = Object.keys(cart).find(id => Object.keys(cart[id]).length > 0);
    if (!providerId) {
        showError('No items in cart');
        return;
    }
    
    try {
        const placeOrderBtn = document.getElementById('place-order-btn');
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Placing Order...';
        
        // Prepare order items
        const items = Object.values(cart[providerId]).map(item => ({
            menuItemId: 'sample-id', // In real app, this would be the actual menu item ID
            name: item.name,
            quantity: item.quantity,
            specialInstructions: ''
        }));
        
        const paymentMethod = document.getElementById('payment-method').value;
        
        const orderData = {
            providerId: providerId,
            items: items,
            deliveryAddress: {
                street: 'Sample Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001'
            },
            deliveryInstructions: 'Please call when you arrive',
            paymentMethod: paymentMethod
        };
        
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showSuccess('Order placed successfully!');
            
            // Clear cart
            cart = {};
            updateOrderSummary();
            
            // Reset all quantity displays
            document.querySelectorAll('[id^="qty-"]').forEach(el => {
                el.textContent = '0';
            });
            
            // Redirect to order confirmation or dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
        } else {
            const error = await response.json();
            showError('Failed to place order: ' + (error.msg || 'Unknown error'));
        }
        
    } catch (error) {
        console.error('Error placing order:', error);
        showError('Failed to place order. Please try again.');
    } finally {
        const placeOrderBtn = document.getElementById('place-order-btn');
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = 'Place Order';
    }
}

// Show loading state
function showLoading(show) {
    const loading = document.getElementById('loading');
    const container = document.getElementById('providers-container');
    
    if (show) {
        loading.style.display = 'block';
        container.style.display = 'none';
    } else {
        loading.style.display = 'none';
        container.style.display = 'block';
    }
}

// Show error message
function showError(message) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.style.display = 'block';
        notification.style.background = '#f44336';
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
        notification.style.background = '#4caf50';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}
