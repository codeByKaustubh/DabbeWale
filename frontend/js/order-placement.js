console.log("Order Placement JS loaded");

// Configuration
const API_BASE_URL = (() => {
    const stored = localStorage.getItem('API_BASE_URL');
    if (stored) return stored;
    const host = (typeof window !== 'undefined' && window.location && window.location.host) ? window.location.host : '';
    const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1') || host === '';
    const prod = 'https://dabbewale.onrender.com';
    return isLocal ? 'http://localhost:5000' : prod;
})();

// Global variables
let providers = [];
let cart = {};
let selectedProvider = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log("Order placement page loaded");
    bindSearch();
    loadProviders();
});

// Load providers from API
async function loadProviders() {
    try {
        showLoading(true);
        const city = (document.getElementById('locationSearch')?.value || '').trim();
        const url = new URL(`${API_BASE_URL}/api/providers`);
        if (city) url.searchParams.set('city', city);
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        providers = data.providers || data; // Handle both array and object response
        console.log("Loaded providers:", providers);
        
        // If no providers from API, use sample providers
        if (!providers || providers.length === 0) {
            console.log("No providers from API, using sample providers");
            providers = getSampleProviders();
        }
        
        displayProviders(providers);
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading providers:', error);
        console.log("API failed, using sample providers");
        providers = getSampleProviders();
        displayProviders(providers);
        showLoading(false);
    }
}

// Bind search interactions
function bindSearch() {
    const input = document.getElementById('locationSearch');
    const btn = document.getElementById('searchBtn');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                loadProviders();
            }
        });
    }
    if (btn) {
        btn.addEventListener('click', () => loadProviders());
    }
}

// Sample providers for demonstration
function getSampleProviders() {
    return [
        {
            _id: 'sample-provider-1',
            providerName: "Priya's Home Kitchen",
            location: "Andheri West, Mumbai",
            address: { city: "Mumbai" },
            description: "Authentic North Indian home-cooked meals",
            rating: 4.5,
            totalRatings: 25,
            menu: [
                {
                    name: "North Indian Thali",
                    price: 120,
                    type: "Vegetarian",
                    category: "Lunch",
                    description: "Dal, Rice, 2 Roti, Sabzi, Salad, Pickle",
                    available: true
                },
                {
                    name: "Punjabi Special",
                    price: 150,
                    type: "Vegetarian",
                    category: "Dinner",
                    description: "Rajma, Rice, Naan, Paneer, Raita",
                    available: true
                }
            ]
        },
        {
            _id: 'sample-provider-2',
            providerName: "Gujarati Tiffin Service",
            location: "Navrangpura, Ahmedabad",
            address: { city: "Ahmedabad" },
            description: "Traditional Gujarati cuisine",
            rating: 4.8,
            totalRatings: 18,
            menu: [
                {
                    name: "Gujarati Thali",
                    price: 100,
                    type: "Vegetarian",
                    category: "Lunch",
                    description: "Thepla, Dal, Khichdi, Shrikhand",
                    available: true
                },
                {
                    name: "Dhokla & Fafda",
                    price: 80,
                    type: "Vegetarian",
                    category: "Breakfast",
                    description: "Fresh dhokla with chutney and fafda",
                    available: true
                }
            ]
        },
        {
            _id: 'sample-provider-3',
            providerName: "South Indian Delights",
            location: "Koramangala, Bangalore",
            address: { city: "Bangalore" },
            description: "Authentic South Indian flavors",
            rating: 4.6,
            totalRatings: 32,
            menu: [
                {
                    name: "South Indian Meal",
                    price: 110,
                    type: "Vegetarian",
                    category: "Lunch",
                    description: "Idli, Sambar, Coconut Chutney, Lemon Rice",
                    available: true
                },
                {
                    name: "Dosa Combo",
                    price: 90,
                    type: "Vegetarian",
                    category: "Breakfast",
                    description: "Masala Dosa with sambar and chutney",
                    available: true
                }
            ]
        },
        {
            _id: 'sample-provider-4',
            providerName: "Bengali Home Kitchen",
            location: "Salt Lake, Kolkata",
            address: { city: "Kolkata" },
            description: "Traditional Bengali cuisine",
            rating: 4.7,
            totalRatings: 28,
            menu: [
                {
                    name: "Bengali Thali",
                    price: 130,
                    type: "Non-Vegetarian",
                    category: "Lunch",
                    description: "Fish Curry, Rice, Dal, Vegetables, Mishti",
                    available: true
                },
                {
                    name: "Vegetarian Bengali",
                    price: 110,
                    type: "Vegetarian",
                    category: "Lunch",
                    description: "Aloo Posto, Rice, Dal, Vegetables",
                    available: true
                }
            ]
        },
        {
            _id: 'sample-provider-5',
            providerName: "Rajasthani Kitchen",
            location: "Pink City, Jaipur",
            address: { city: "Jaipur" },
            description: "Royal Rajasthani flavors",
            rating: 4.4,
            totalRatings: 22,
            menu: [
                {
                    name: "Rajasthani Thali",
                    price: 140,
                    type: "Vegetarian",
                    category: "Lunch",
                    description: "Dal Baati, Churma, Gatte ki Sabzi, Rice",
                    available: true
                },
                {
                    name: "Rajasthani Snacks",
                    price: 70,
                    type: "Vegetarian",
                    category: "Snack",
                    description: "Kachori, Samosa, Mirchi Vada",
                    available: true
                }
            ]
        },
        {
            _id: 'sample-provider-6',
            providerName: "Kerala Spice Kitchen",
            location: "Kochi, Kerala",
            address: { city: "Kochi" },
            description: "Authentic Kerala cuisine",
            rating: 4.9,
            totalRatings: 35,
            menu: [
                {
                    name: "Kerala Sadya",
                    price: 160,
                    type: "Vegetarian",
                    category: "Lunch",
                    description: "Rice, Sambar, Avial, Thoran, Payasam",
                    available: true
                },
                {
                    name: "Kerala Breakfast",
                    price: 85,
                    type: "Vegetarian",
                    category: "Breakfast",
                    description: "Puttu, Kadala Curry, Appam",
                    available: true
                }
            ]
        }
    ];
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
    
    // Use real menu items from provider.menu
    const menuItems = provider.menu || [];
    
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
                ${menuItems.length > 0 
                    ? menuItems.map(item => createMenuItem(provider._id, item)).join('')
                    : '<p style="color: #666; font-style: italic;">No menu items available</p>'
                }
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
                <div style="font-size: 0.9rem; color: #666;">
                    ${item.description || 'Fresh and delicious'} • ${item.type || 'Vegetarian'} • ${item.category || 'Lunch'}
                </div>
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
        // For demo purposes, create a mock token
        console.log('No token found, using demo mode');
        // Don't redirect, just continue with demo
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
    
    // If providerId is a demo/sample (not a valid Mongo ObjectId), stay in demo mode even if logged in
    const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(providerId);
    
    try {
        const placeOrderBtn = document.getElementById('place-order-btn');
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Placing Order...';
        
        // Prepare order items
        const items = Object.values(cart[providerId]).map(item => ({
            menuItemId: 'sample-id', // In real app, this would be the actual menu item ID
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            specialInstructions: ''
        }));
        
        const paymentMethod = document.getElementById('payment-method').value;
        
        // Calculate total for payment
        let total = 0;
        Object.values(cart[providerId]).forEach(item => {
            total += item.price * item.quantity;
        });
        
        // Handle online payment
        if (paymentMethod === 'online') {
            const paymentSuccess = await handleOnlinePayment(total);
            if (!paymentSuccess) {
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = 'Place Order';
                return;
            }
        }
        
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
        
        console.log('Sending order data:', orderData);
        
        // If no token OR providerId is not a valid ObjectId (sample providers), create a mock order for demo
        if (!token || !isValidObjectId) {
            console.log('Creating mock order for demo');
            showSuccess('Order placed successfully! (Demo Mode)');
            
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
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        console.log('Order response status:', response.status);
        
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
            let errorMsg = 'Unknown error';
            try {
                const error = await response.json();
                errorMsg = error && (error.msg || error.message || JSON.stringify(error));
            } catch (_) {}
            showError('Failed to place order: ' + errorMsg);
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

// Handle online payment (mock implementation)
async function handleOnlinePayment(amount) {
    return new Promise((resolve) => {
        // Create payment modal
        const paymentModal = document.createElement('div');
        paymentModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        paymentModal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 400px; width: 90%; text-align: center;">
                <h3 style="margin-bottom: 20px; color: #333;">Payment Gateway</h3>
                <p style="margin-bottom: 20px; color: #666;">Amount to pay: <strong>₹${amount}</strong></p>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; text-align: left;">Card Number:</label>
                    <input type="text" id="card-number" placeholder="1234 5678 9012 3456" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px;">
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <div style="flex: 1;">
                        <label style="display: block; margin-bottom: 8px; text-align: left;">Expiry:</label>
                        <input type="text" id="card-expiry" placeholder="MM/YY" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; margin-bottom: 8px; text-align: left;">CVV:</label>
                        <input type="text" id="card-cvv" placeholder="123" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button id="cancel-payment" style="flex: 1; padding: 12px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
                    <button id="process-payment" style="flex: 1; padding: 12px; background: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer;">Pay ₹${amount}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(paymentModal);
        
        // Handle payment buttons
        document.getElementById('cancel-payment').onclick = () => {
            document.body.removeChild(paymentModal);
            resolve(false);
        };
        
        document.getElementById('process-payment').onclick = () => {
            const cardNumber = document.getElementById('card-number').value;
            const cardExpiry = document.getElementById('card-expiry').value;
            const cardCvv = document.getElementById('card-cvv').value;
            
            if (!cardNumber || !cardExpiry || !cardCvv) {
                alert('Please fill in all payment details');
                return;
            }
            
            // Simulate payment processing
            const processBtn = document.getElementById('process-payment');
            processBtn.textContent = 'Processing...';
            processBtn.disabled = true;
            
            setTimeout(() => {
                document.body.removeChild(paymentModal);
                showSuccess('Payment successful! Processing your order...');
                resolve(true);
            }, 2000);
        };
    });
}
