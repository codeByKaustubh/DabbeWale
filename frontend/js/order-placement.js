console.log("Order Placement JS loaded");

// Configuration
const API_BASE_URL = localStorage.getItem('API_BASE_URL') || 'http://localhost:5000'; // Rely on main.js to set this

// Global variables
let providers = [];
let cart = {};
let selectedProvider = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log("Order placement page loaded");    
    // Check for city in URL query params to pre-fill search
    const urlParams = new URLSearchParams(window.location.search);
    const cityFromUrl = urlParams.get('city');
    const locationInput = document.getElementById('locationSearch');
    if (cityFromUrl && locationInput) {
        locationInput.value = cityFromUrl;
    }
    bindSearch();
    // loadProviders will now use the pre-filled city if it exists
    loadProviders();
    bindPaymentSelector();
    bindDrawerPaymentSelector();
    loadCartFromStorage();
    renderCartBadge();
    // Render items if we are on cart page
    renderCartDrawer();
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

        displayProviders(providers);
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading providers:', error);
        // API failed, so we show an empty list and an error message.
        // We no longer fall back to sample providers.
        displayProviders([]); // Display an empty state
        showLoading(false);
        showError("Could not load providers. Please check your connection and try again.");
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
    
    // Use a robust mapping that can handle errors in individual provider data
    container.innerHTML = providers.map(provider => {
        try {
            return createProviderCard(provider);
        } catch (e) {
            console.error(`Failed to render provider card for provider ID: ${provider?._id}. Error:`, e);
            return ''; // Return an empty string for the failed card, so others can still render
        }
    }).join('');
}

// Create provider card HTML
function createProviderCard(provider) {
    const rating = provider.rating || 0;
    const totalRatings = provider.totalRatings || 0;
    const location = provider.address?.city || provider.location || 'Location not specified';
    const menuItems = provider.menu || [];

    // Use the first image from the provider's images array as a cover.
    // If no image is available, a default placeholder is used.
    const coverImage = (provider.images && provider.images.length > 0)
        ? provider.images[0]
        : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80';

    // Create tags for each cuisine type.
    const cuisineTags = (provider.cuisine && provider.cuisine.length > 0)
        ? provider.cuisine.map(c => `<span class="cuisine-tag">${c}</span>`).join('')
        : '<span class="cuisine-tag">Home-style</span>';
    
    return `
        <div class="provider-card" data-provider-id="${provider._id}">
            <div class="provider-card-image" style="background-image: url('${coverImage}');"></div>
            <div class="provider-card-content">
                <div class="provider-header">
                    <h3 class="provider-name">${provider.providerName}</h3>
                    <div class="provider-rating">
                        ⭐ ${rating.toFixed(1)} <span>(${totalRatings})</span>
                    </div>
                </div>
                <div class="provider-details">
                    <div class="cuisine-tags">${cuisineTags}</div>
                    <div class="provider-location">${location}</div>
                </div>
                <p class="provider-description">${provider.description || 'Fresh and delicious home-cooked meals.'}</p>
            </div>
            <div class="menu-section">
                ${menuItems.length > 0 
                    ? menuItems.map(item => createMenuItem(provider._id, item)).join('')
                    : '<p class="no-menu-message">Menu not available at the moment.</p>'
                }
            </div>
        </div>
    `;
}

// Create menu item HTML
function createMenuItem(providerId, item) {
    // Use the unique _id from the database for a reliable ID.
    // Fallback to name for any older/sample data that might not have _id.
    const safeName = item.name || 'Unnamed Item';
    const itemId = `${providerId}-${(item._id || safeName.replace(/\s+/g, '-')).toLowerCase()}`;
    
    return `
        <div class="menu-item">
            <div style="flex-grow: 1;">
                <div class="item-name">${item.name || 'Unnamed Item'}</div>
                <div style="font-size: 0.9rem; color: #666;">
                    ${item.description || 'Fresh and delicious'} • ${item.type || 'Vegetarian'} • ${item.category || 'Lunch'}
                </div>
            </div>
            <div class="quantity-controls">
                <button class="qty-btn" onclick="decreaseQuantity('${itemId}', '${providerId}')">-</button>
                <span class="qty-display" id="qty-${itemId}">${cart[providerId]?.[itemId]?.quantity || 0}</span>
                <button class="qty-btn" onclick="increaseQuantity('${itemId}', '${providerId}', '${item.name || 'Unnamed Item'}', ${item.price || 0}, '${item._id}')">+</button>
            </div>
            <div class="item-price">₹${item.price || 'N/A'}</div>
        </div>
    `;
}

// Increase item quantity
function increaseQuantity(itemId, providerId, itemName, price, menuItemId) {
    if (!cart[providerId]) {
        cart[providerId] = {};
    }
    
    if (!cart[providerId][itemId]) {
        cart[providerId][itemId] = {
            menuItemId: menuItemId, // Store the real menu item ID
            name: itemName,
            price: price,
            quantity: 0
        };
    }
    
    cart[providerId][itemId].quantity++;
    updateQuantityDisplay(itemId);
    updateOrderSummary();
    renderCartBadge();
    renderCartDrawer();
    saveCartToStorage();
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
    renderCartBadge();
    renderCartDrawer();
    saveCartToStorage();
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
    const emptyCart = document.getElementById('empty-cart');
    const cartContainer = document.getElementById('cart-container'); // Get the main cart container
    const dQrAmount = document.querySelector('#d-qr-details #d-qr-amount span');
    
    let total = 0;
    let itemCountNum = 0;
    
    // Calculate total from all providers
    Object.values(cart).forEach(providerCart => {
        if (!providerCart) return;
        Object.values(providerCart).forEach(item => {
            if (!item || !item.price || !item.quantity) return;
            total += item.price * item.quantity;
            itemCountNum += item.quantity;
        });
    });
    
    if (itemCountNum === 0) {
        emptyCart.style.display = 'block';
        // Only hide the cart container if it exists (it's on the cart.html page)
        if (cartContainer) {
            cartContainer.style.display = 'none';
        }
    } else {
        emptyCart.style.display = 'none';
        if (dQrAmount) dQrAmount.textContent = `₹${total}`;
        // Ensure the cart container is visible if it exists and has items
        if (cartContainer) cartContainer.style.display = 'grid';
    }
}

// Compute total items and amount
function getCartTotals() {
    let items = 0; let amount = 0;
    Object.values(cart).forEach(providerCart => {
        Object.values(providerCart).forEach(i => {
            items += i.quantity;
            amount += i.quantity * i.price;
        });
    });
    return { items, amount };
}

// Badge
function renderCartBadge() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    const { items } = getCartTotals();
    if (items > 0) {
        badge.style.display = 'flex';
        badge.textContent = String(items);
    } else {
        badge.style.display = 'none';
    }
}

// Drawer open/close
function openCart() {
    // Navigate to dedicated cart page
    try { saveCartToStorage(); } catch (_) {}
    window.location.href = 'cart.html';
}

function closeCart() {
    // No drawer in dedicated cart page; noop
}

// Render drawer content
function renderCartDrawer() {
    const container = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('cart-subtotal');
    if (!container || !subtotalEl) return;
    const lines = [];
    Object.entries(cart).forEach(([providerId, items]) => {
        Object.entries(items).forEach(([itemId, it]) => {
            lines.push(`
                <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 0; border-bottom:1px solid #f0f0f0;">
                    <div style="min-width:0;">
                        <div style="font-weight:700; color:#333;">${it.name}</div>
                        <div style="color:#2e7d32; font-weight:700;">₹${it.price}</div>
                    </div>
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="decreaseQuantity('${itemId}', '${providerId}')">-</button>
                        <span class="qty-display">${it.quantity}</span>
                        <button class="qty-btn" onclick="increaseQuantity('${itemId}', '${providerId}', '${it.name}', ${it.price}, '${it.menuItemId}')">+</button>
                    </div>
                    <button onclick="removeItem('${itemId}', '${providerId}')" style="border:none; background:transparent; color:#f44336; cursor:pointer; font-weight:800;">✕</button>
                </div>
            `);
        });
    });
    container.innerHTML = lines.length ? lines.join('') : '<div style="color:#666; padding:20px; text-align:center;">Your cart is empty</div>';
    const { amount } = getCartTotals();
    subtotalEl.textContent = `₹${amount}`;
    const clearBtn = document.getElementById('clear-cart');
    if (clearBtn) clearBtn.onclick = () => clearCart();
}

// Remove or clear
function removeItem(itemId, providerId) {
    if (cart[providerId] && cart[providerId][itemId]) {
        delete cart[providerId][itemId];
        if (Object.keys(cart[providerId]).length === 0) delete cart[providerId];
        updateOrderSummary();
        renderCartBadge();
        renderCartDrawer();
        saveCartToStorage();
    }
}

function clearCart() {
    cart = {};
    updateOrderSummary();
    renderCartBadge();
    renderCartDrawer();
    saveCartToStorage();
}

// Place order
async function placeOrder() {
    console.log("placeOrder function called.");
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
        
    console.log("Collecting order data and handling payment.");
    let orderDetailsForPopup = {};

    // Prepare order items
        const items = Object.values(cart[providerId]).map(item => ({
            menuItemId: item.menuItemId, // Now sending the real ID
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            specialInstructions: ''
        }));
        
        const paymentMethod = (document.getElementById('d-payment-method')?.value) || document.getElementById('payment-method').value;
        const address = collectAddress();
        const allergyNotes = (document.getElementById('d-allergy-notes')?.value || document.getElementById('allergy-notes')?.value || '').trim();
        
        // Calculate total for payment
        let total = 0;
        Object.values(cart[providerId]).forEach(item => {
            total += item.price * item.quantity;
        });
        
        // Handle payment flows (demo)
        let paymentSuccess = false;
        if (paymentMethod === 'card') {
            const num = (document.getElementById('d-card-number')?.value || '').replace(/\s+/g,'');
            const exp = (document.getElementById('d-card-expiry')?.value || '');
            const cvv = (document.getElementById('d-card-cvv')?.value || '');
            if (!num || !exp || !cvv) {
                showError('Please fill card details');
                 resetPlaceButton(); return; // Correctly exit after resetting button
            }
            await new Promise(r => setTimeout(r, 900));
            showSuccess('Card charged (demo).');
            paymentSuccess = true;
        } else if (paymentMethod === 'upi') {
            const upiId = (document.getElementById('d-upi-id')?.value || document.getElementById('upi-id')?.value || '').trim();
            if (!upiId) {
                showError('Please enter a valid UPI ID');
                resetPlaceButton(); return; // Correctly exit after resetting button
            }
            // Simulate UPI collect request
            await new Promise(r => setTimeout(r, 1200));
            showSuccess('UPI request sent. Assuming success in demo.');
            paymentSuccess = true;
        } else if (paymentMethod === 'qr') {
            // Assume user scanned and paid after showing QR
            await new Promise(r => setTimeout(r, 1000));
            showSuccess('QR payment confirmed (demo).');
            paymentSuccess = true;
        } else if (paymentMethod === 'cod') {
            paymentSuccess = true;
        }
        
        const orderData = {
            providerId: providerId,
            items: items,
            deliveryAddress: address,
            deliveryInstructions: allergyNotes,
            paymentMethod: paymentMethod
        };
        
        console.log('Sending order data:', orderData);
        
        // If no token OR providerId is not a valid ObjectId (sample providers), create a mock order for demo
        if (!token || !isValidObjectId) {
            console.log('Running in demo mode (no token or sample provider). Creating mock order details.');
            orderDetailsForPopup = {
                orderId: `DEMO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                total: total
            };
            // The rest of the success logic will handle this.
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
            console.log("Real order API response OK.");
            const result = await response.json();
            orderDetailsForPopup.orderId = result.order?._id || 'N/A';
            orderDetailsForPopup.total = result.order?.finalAmount || total;
        } else {
            let errorMsg = 'Unknown error';
            try {
                const error = await response.json();
                console.error("Real order API error:", error);
                errorMsg = error && (error.msg || error.message || JSON.stringify(error));
                resetPlaceButton(); // Reset button on failure
            } catch (_) {}
            showError('Failed to place order: ' + errorMsg);
            return; // Stop execution on failure
        }

        // --- This block now runs for ALL successful orders (real or demo) ---
        // Clear cart
        cart = {};
        console.log("Order success: Clearing cart, updating UI.");
        updateOrderSummary();
        
        // Reset all quantity displays
        document.querySelectorAll('[id^="qty-"]').forEach(el => {
            el.textContent = '0';
        });
        console.log("Resetting form fields and saving cart.");
        resetFormFields();
        saveCartToStorage();
        // Use a timeout to ensure the popup appears after the UI has re-rendered
        setTimeout(() => togglePopup(true, orderDetailsForPopup), 0);
        resetPlaceButton(); // Reset button state on success
        
    } catch (error) {
        console.error('Error placing order:', error);
        showError('Failed to place order. Please try again.');
        resetPlaceButton(); // Also reset button on exception
    }
}

// Reset place button state helper
function resetPlaceButton() {
    const placeOrderBtn = document.getElementById('place-order-btn');
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = 'Place Order';
}

// Collect and validate address
function collectAddress() {
    const street = (document.getElementById('d-addr-street')?.value || document.getElementById('addr-street')?.value || '').trim();
    const city = (document.getElementById('d-addr-city')?.value || document.getElementById('addr-city')?.value || '').trim();
    const state = (document.getElementById('d-addr-state')?.value || document.getElementById('addr-state')?.value || '').trim();
    const pincode = (document.getElementById('d-addr-pincode')?.value || document.getElementById('addr-pincode')?.value || '').trim();
    if (!street || !city || !state || !pincode) {
        showError('Please fill complete delivery address');
        throw new Error('Invalid address');
    }
    return { street, city, state, pincode };
}

// Reset form fields after order
function resetFormFields() {
    // Reset all relevant input, textarea, and select fields to their default state.
    ['d-addr-street', 'd-addr-city', 'd-addr-state', 'd-addr-pincode', 'd-allergy-notes', 'd-upi-id', 'd-card-number', 'd-card-expiry', 'd-card-cvv'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const dPayment = document.getElementById('d-payment-method');
    if (dPayment) dPayment.value = 'cod';
}

// Cart persistence
function saveCartToStorage() {
    try {
        localStorage.setItem('dw_cart', JSON.stringify(cart));
    } catch (_) {}
}

function loadCartFromStorage() {
    try {
        const raw = localStorage.getItem('dw_cart');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                cart = parsed;
            }
        }
    } catch (_) {}
}

// Payment method UI binding
function bindPaymentSelector() {
    const select = document.getElementById('payment-method');
    if (!select) return;
    select.addEventListener('change', (e) => {
        const method = e.target.value;
        togglePaymentDetails(method);
    });
}

function togglePaymentDetails(method) {
    const wrapper = document.getElementById('payment-details');
    const upi = document.getElementById('upi-details');
    const qr = document.getElementById('qr-details');
    if (!wrapper || !upi || !qr) return;
    if (method === 'upi') {
        wrapper.style.display = 'block';
        upi.style.display = 'block';
        qr.style.display = 'none';
    } else if (method === 'qr') {
        wrapper.style.display = 'block';
        upi.style.display = 'none';
        qr.style.display = 'block';
    } else {
        wrapper.style.display = 'none';
        upi.style.display = 'none';
        qr.style.display = 'none';
    }
}

// Drawer payment binding and toggling
function bindDrawerPaymentSelector() {
    const select = document.getElementById('d-payment-method');
    if (!select) return;
    select.addEventListener('change', (e) => toggleDrawerPaymentDetails(e.target.value));
}

function toggleDrawerPaymentDetails(method) {
    const wrapper = document.getElementById('d-payment-details');
    const upi = document.getElementById('d-upi-details');
    const qr = document.getElementById('d-qr-details');
    const card = document.getElementById('d-card-details');
    if (!wrapper || !upi || !qr || !card) return;
    if (method === 'upi') {
        wrapper.style.display = 'block';
        upi.style.display = 'block';
        qr.style.display = 'none';
        card.style.display = 'none';
    } else if (method === 'qr') {
        wrapper.style.display = 'block';
        upi.style.display = 'none';
        qr.style.display = 'block';
        card.style.display = 'none';
    } else if (method === 'card') {
        wrapper.style.display = 'block';
        upi.style.display = 'none';
        qr.style.display = 'none';
        card.style.display = 'block';
    } else {
        wrapper.style.display = 'none';
        upi.style.display = 'none';
        qr.style.display = 'none';
        card.style.display = 'none';
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
function togglePopup(show = true) {
  const popup = document.getElementById("order-popup");
  if (popup) popup.style.display = show ? "flex" : "none";
  console.log(`togglePopup called for element #${popup ? 'order-popup' : 'NOT_FOUND'} with display=${show ? 'flex' : 'none'}`);
}
