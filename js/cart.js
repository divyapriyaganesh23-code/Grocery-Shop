/**
 * FreshCart - Shopping Cart, Order Workflow & Billing Engine
 * Manages Cart State with Stock Validation, Order Lifecycle Transitions,
 * Time Tracking, and LocalStorage Synchronization across Customer, Owner & Worker.
 */

const CART_STORAGE_KEY = 'freshcart_items';
const COUPON_STORAGE_KEY = 'freshcart_coupon';
const ORDERS_STORAGE_KEY = 'freshcart_orders';
const STORE_SETTINGS_KEY = 'freshcart_store_settings';

// Order Status Constants
const ORDER_STATUS = {
  NEW: 'New Order',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  PACKING: 'Packing',
  PACKED: 'Packed',
  READY: 'Ready for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

// Available Promo Codes
const VALID_COUPONS = {
  'FRESH50': { type: 'fixed', value: 50, minOrder: 299, desc: '₹50 flat discount on orders above ₹299' },
  'HEALTHY10': { type: 'percent', value: 10, minOrder: 499, desc: '10% discount on orders above ₹499' },
  'WELCOME100': { type: 'fixed', value: 100, minOrder: 799, desc: '₹100 flat discount on orders above ₹799' }
};

// Default Store Settings
const DEFAULT_SETTINGS = {
  defaultPrepMinutes: 25,
  storeOpen: true,
  taxRatePercent: 5
};

function getStoreSettings() {
  try {
    const raw = localStorage.getItem(STORE_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

function saveStoreSettings(settings) {
  try {
    localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving store settings', e);
  }
}

// Pre-seeded Active Orders for Realistic Academic Demonstration
function getInitialSeedOrders() {
  const now = Date.now();
  return [
    {
      id: 'FC-849201',
      invoiceNumber: 'INV-2026-849201',
      userId: 'usr_cust_1',
      customerName: 'Ananya Sharma',
      email: 'customer@freshcart.com',
      phone: '9876543210',
      address: 'Flat 402, Green Palm Residency, 14th Main Road, HSR Layout, Bengaluru - 560102',
      slot: '⚡ Express 2-Hour Delivery',
      specialInstructions: 'Ring doorbell twice. If not available, leave with building security.',
      paymentMethod: 'Cash on Delivery (COD)',
      paymentStatus: 'Pending (COD)',
      createdAt: new Date(now - 10 * 60 * 1000).toISOString(), // 10 mins ago
      prepTimeMinutes: 25,
      deadlineAt: new Date(now + 15 * 60 * 1000).toISOString(), // In 15 mins
      status: ORDER_STATUS.PREPARING,
      items: [
        { id: 1, name: 'Royal Shimla Red Apples', price: 180, quantity: 2, unit: '1 kg', lineTotal: 360, packed: true },
        { id: 9, name: 'Pure A2 Gir Cow Fresh Milk', price: 85, quantity: 2, unit: '1 Litre bottle', lineTotal: 170, packed: false }
      ],
      subtotal: 530,
      discount: 50,
      couponCode: 'FRESH50',
      deliveryFee: 0,
      tax: 24,
      grandTotal: 504
    },
    {
      id: 'FC-721940',
      invoiceNumber: 'INV-2026-721940',
      userId: 'usr_cust_guest1',
      customerName: 'Ramesh Patel',
      email: 'ramesh.patel@example.com',
      phone: '9845123456',
      address: '#18, 5th Cross, Koramangala 4th Block, Bengaluru - 560034',
      slot: '⚡ Express 2-Hour Delivery',
      specialInstructions: 'Please ensure avocados and tomatoes are ripe for today dinner.',
      paymentMethod: 'UPI / QR Code',
      paymentStatus: 'Paid (UPI)',
      createdAt: new Date(now - 3 * 60 * 1000).toISOString(), // 3 mins ago
      prepTimeMinutes: 20,
      deadlineAt: new Date(now + 17 * 60 * 1000).toISOString(),
      status: ORDER_STATUS.NEW,
      items: [
        { id: 5, name: 'Farm-Fresh Green Broccoli', price: 75, quantity: 2, unit: '500 g', lineTotal: 150, packed: false },
        { id: 6, name: 'Vine-Ripened Hybrid Tomatoes', price: 40, quantity: 3, unit: '1 kg', lineTotal: 120, packed: false },
        { id: 25, name: 'Royal Aged Long Grain Basmati', price: 340, quantity: 1, unit: '2 kg bag', lineTotal: 340, packed: false }
      ],
      subtotal: 610,
      discount: 61,
      couponCode: 'HEALTHY10',
      deliveryFee: 0,
      tax: 27,
      grandTotal: 576
    },
    {
      id: 'FC-618429',
      invoiceNumber: 'INV-2026-618429',
      userId: 'usr_cust_guest2',
      customerName: 'Sneha Mukherjee',
      email: 'sneha.m@example.com',
      phone: '9822334455',
      address: 'Villa 12, Palm Meadows, Whitefield, Bengaluru - 560066',
      slot: 'Morning Slot (7:00 AM - 9:00 AM)',
      specialInstructions: 'Delivered successfully at front porch.',
      paymentMethod: 'Credit / Debit Card',
      paymentStatus: 'Paid (Card)',
      createdAt: new Date(now - 120 * 60 * 1000).toISOString(), // 2 hours ago
      prepTimeMinutes: 30,
      deadlineAt: new Date(now - 90 * 60 * 1000).toISOString(),
      status: ORDER_STATUS.DELIVERED,
      items: [
        { id: 13, name: 'Artisan Whole Wheat Sourdough', price: 140, quantity: 1, unit: '450 g loaf', lineTotal: 140, packed: true },
        { id: 14, name: 'French Golden Butter Croissant', price: 120, quantity: 2, unit: 'Pack of 2 pcs', lineTotal: 240, packed: true },
        { id: 21, name: 'Cold-Pressed Valencia Orange Juice', price: 130, quantity: 2, unit: '500 ml bottle', lineTotal: 260, packed: true }
      ],
      subtotal: 640,
      discount: 0,
      couponCode: '',
      deliveryFee: 0,
      tax: 32,
      grandTotal: 672
    }
  ];
}

// --- Orders Storage & Query Engine ---
function getAllOrdersFromStorage() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading orders from localStorage', e);
  }
  const seeded = getInitialSeedOrders();
  saveAllOrdersToStorage(seeded);
  return seeded;
}

function saveAllOrdersToStorage(orders) {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('freshcart_orders_updated', { detail: orders }));
  } catch (e) {
    console.error('Error saving orders to localStorage', e);
  }
}

function getOrderById(orderId) {
  const orders = getAllOrdersFromStorage();
  return orders.find(o => o.id === orderId || o.invoiceNumber === orderId) || null;
}

function getCustomerOrders(emailOrUserId) {
  const orders = getAllOrdersFromStorage();
  const searchKey = (emailOrUserId || '').toLowerCase();
  return orders.filter(o => 
    (o.userId && o.userId.toLowerCase() === searchKey) ||
    (o.email && o.email.toLowerCase() === searchKey)
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Create new customer order with inventory deduction and deadline calculation
function createCustomerOrder(orderInput) {
  const cartCalculations = getCartCalculations();
  if (cartCalculations.itemsDetail.length === 0) {
    throw new Error('Your cart is empty. Please add grocery items first.');
  }

  // Stock verification check
  for (const item of cartCalculations.itemsDetail) {
    const currentProduct = typeof getProductById === 'function' ? getProductById(item.id) : null;
    if (!currentProduct || currentProduct.stock < item.quantity) {
      throw new Error(`Insufficient stock for "${item.name}". Only ${currentProduct ? currentProduct.stock : 0} left.`);
    }
  }

  // Deduct inventory
  if (typeof deductStockForOrder === 'function') {
    deductStockForOrder(cartCalculations.itemsDetail);
  }

  const settings = getStoreSettings();
  const prepMinutes = settings.defaultPrepMinutes || 25;
  const now = new Date();
  const deadline = new Date(now.getTime() + prepMinutes * 60 * 1000);

  const orderNum = Math.floor(100000 + Math.random() * 900000);
  const orderId = 'FC-' + orderNum;
  const invoiceNumber = `INV-${now.getFullYear()}-${orderNum}`;

  const newOrder = {
    id: orderId,
    invoiceNumber: invoiceNumber,
    userId: orderInput.userId || 'guest',
    customerName: orderInput.customerName.trim(),
    email: orderInput.email.trim(),
    phone: orderInput.phone.trim(),
    address: orderInput.address.trim(),
    slot: orderInput.slot || '⚡ Express 2-Hour Delivery',
    specialInstructions: orderInput.specialInstructions || 'Handle with care.',
    paymentMethod: orderInput.paymentMethod || 'Cash on Delivery (COD)',
    paymentStatus: orderInput.paymentMethod.includes('Cash') ? 'Pending (COD)' : 'Paid Online',
    createdAt: now.toISOString(),
    prepTimeMinutes: prepMinutes,
    deadlineAt: deadline.toISOString(),
    status: ORDER_STATUS.NEW,
    items: cartCalculations.itemsDetail.map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      unit: i.unit,
      lineTotal: i.lineTotal,
      packed: false
    })),
    subtotal: cartCalculations.subtotal,
    discount: cartCalculations.discountAmount,
    couponCode: cartCalculations.couponInfo ? cartCalculations.couponInfo.code : '',
    deliveryFee: cartCalculations.deliveryFee,
    tax: cartCalculations.tax,
    grandTotal: cartCalculations.grandTotal
  };

  const orders = getAllOrdersFromStorage();
  orders.unshift(newOrder);
  saveAllOrdersToStorage(orders);

  // Clear shopping cart
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(COUPON_STORAGE_KEY);
  updateCartBadge();

  return newOrder;
}

// Update Order Status (Synchronized across all views)
function updateOrderStatus(orderId, newStatus) {
  const orders = getAllOrdersFromStorage();
  const order = orders.find(o => o.id === orderId);
  if (!order) return false;

  const previousStatus = order.status;
  order.status = newStatus;

  // If status changed to Delivered, mark payment as paid if it was COD
  if (newStatus === ORDER_STATUS.DELIVERED) {
    order.paymentStatus = 'Paid';
  }

  // If status changed to Cancelled, restock items
  if (newStatus === ORDER_STATUS.CANCELLED && previousStatus !== ORDER_STATUS.CANCELLED) {
    if (typeof restockCancelledOrder === 'function') {
      restockCancelledOrder(order.items);
    }
  }

  // If status is Packed, ensure all items marked packed
  if (newStatus === ORDER_STATUS.PACKED) {
    order.items.forEach(i => { i.packed = true; });
  }

  saveAllOrdersToStorage(orders);
  return true;
}

// Update packing checklist item for shop workers
function toggleOrderItemPacked(orderId, itemIndex, isPacked) {
  const orders = getAllOrdersFromStorage();
  const order = orders.find(o => o.id === orderId);
  if (!order || !order.items[itemIndex]) return false;

  order.items[itemIndex].packed = isPacked;

  // Auto update order status if all packed
  const allPacked = order.items.every(i => i.packed);
  if (allPacked && order.status === ORDER_STATUS.PACKING) {
    order.status = ORDER_STATUS.PACKED;
  } else if (!allPacked && order.status === ORDER_STATUS.PACKED) {
    order.status = ORDER_STATUS.PACKING;
  }

  saveAllOrdersToStorage(orders);
  return true;
}

// Update estimated preparation time (Owner capability)
function updateOrderPrepTime(orderId, newPrepMinutes) {
  const orders = getAllOrdersFromStorage();
  const order = orders.find(o => o.id === orderId);
  if (!order) return false;

  order.prepTimeMinutes = parseInt(newPrepMinutes, 10);
  const created = new Date(order.createdAt).getTime();
  order.deadlineAt = new Date(created + order.prepTimeMinutes * 60 * 1000).toISOString();

  saveAllOrdersToStorage(orders);
  return true;
}

// --- Shopping Cart State Engine ---
function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading cart from localStorage', e);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
  } catch (e) {
    console.error('Error saving cart to localStorage', e);
  }
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  const badges = document.querySelectorAll('.cart-count-badge');
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

// Add Item to Cart with Stock Boundary Checking
function addToCart(productId, quantity = 1) {
  const cart = getCart();
  const prodId = parseInt(productId, 10);
  const product = typeof getProductById === 'function' ? getProductById(prodId) : null;

  if (!product) {
    if (typeof showToast === 'function') showToast('Error', 'Product not found.', 'error');
    return false;
  }

  if (product.stock <= 0) {
    if (typeof showToast === 'function') showToast('Out of Stock', `${product.name} is currently out of stock.`, 'error');
    return false;
  }

  const existingIndex = cart.findIndex(item => item.id === prodId);
  const currentInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;
  const newTotalQty = currentInCart + quantity;

  if (newTotalQty > product.stock) {
    if (typeof showToast === 'function') {
      showToast('Stock Limit', `Cannot add more. Only ${product.stock} units available.`, 'warning');
    }
    return false;
  }

  if (existingIndex > -1) {
    cart[existingIndex].quantity = newTotalQty;
  } else {
    cart.push({ id: prodId, quantity: quantity });
  }

  saveCart(cart);

  if (typeof showToast === 'function') {
    showToast('Added to Cart', `${product.name} (${quantity} added)`, 'success');
  }

  if (document.getElementById('cart-items-container')) renderCart();
  if (document.getElementById('checkout-items-summary')) renderCheckoutSummary();
  return true;
}

// Update Item Quantity
function updateQuantity(productId, newQty) {
  let cart = getCart();
  const prodId = parseInt(productId, 10);
  const qty = parseInt(newQty, 10);
  const product = typeof getProductById === 'function' ? getProductById(prodId) : null;

  if (qty <= 0) {
    removeFromCart(prodId);
    return;
  }

  if (product && qty > product.stock) {
    if (typeof showToast === 'function') {
      showToast('Stock Exceeded', `Only ${product.stock} units available in inventory.`, 'warning');
    }
    return;
  }

  const item = cart.find(i => i.id === prodId);
  if (item) {
    item.quantity = qty;
    saveCart(cart);
    renderCart();
  }
}

// Remove Item from Cart
function removeFromCart(productId) {
  let cart = getCart();
  const prodId = parseInt(productId, 10);
  const product = typeof getProductById === 'function' ? getProductById(prodId) : null;

  cart = cart.filter(item => item.id !== prodId);
  saveCart(cart);

  if (typeof showToast === 'function') {
    showToast('Removed Item', `${product ? product.name : 'Item'} removed from cart.`, 'info');
  }

  renderCart();
  if (document.getElementById('checkout-items-summary')) renderCheckoutSummary();
}

function clearCart() {
  if (confirm('Are you sure you want to clear your shopping cart?')) {
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(COUPON_STORAGE_KEY);
    updateCartBadge();
    if (typeof showToast === 'function') {
      showToast('Cart Cleared', 'All items have been removed.', 'info');
    }
    renderCart();
  }
}

function getAppliedCoupon() {
  return localStorage.getItem(COUPON_STORAGE_KEY);
}

function applyCoupon(code) {
  const cleanCode = (code || '').trim().toUpperCase();
  const coupon = VALID_COUPONS[cleanCode];

  if (!coupon) {
    if (typeof showToast === 'function') {
      showToast('Invalid Coupon', 'Please enter a valid promo code like FRESH50 or HEALTHY10', 'error');
    }
    return false;
  }

  const calculations = getCartCalculations();
  if (calculations.subtotal < coupon.minOrder) {
    if (typeof showToast === 'function') {
      showToast('Order Minimum Not Met', `Minimum order for code ${cleanCode} is ₹${coupon.minOrder}`, 'error');
    }
    return false;
  }

  localStorage.setItem(COUPON_STORAGE_KEY, cleanCode);
  if (typeof showToast === 'function') {
    showToast('Coupon Applied!', `Coupon code ${cleanCode} applied successfully.`, 'success');
  }

  renderCart();
  return true;
}

function removeCoupon() {
  localStorage.removeItem(COUPON_STORAGE_KEY);
  if (typeof showToast === 'function') {
    showToast('Coupon Removed', 'Promo code removed from your order.', 'info');
  }
  renderCart();
}

// Calculate Cart Totals
function getCartCalculations() {
  const cart = getCart();
  let subtotal = 0;
  let itemsDetail = [];

  cart.forEach(item => {
    const product = typeof getProductById === 'function' ? getProductById(item.id) : null;
    if (product) {
      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      itemsDetail.push({
        ...product,
        quantity: item.quantity,
        lineTotal
      });
    }
  });

  // Delivery Fee: Free above ₹500, else ₹40
  const deliveryFee = subtotal === 0 ? 0 : (subtotal >= 500 ? 0 : 40);

  // Discount Calculation
  let discountAmount = 0;
  const appliedCode = getAppliedCoupon();
  let couponInfo = null;

  if (appliedCode && VALID_COUPONS[appliedCode]) {
    const c = VALID_COUPONS[appliedCode];
    if (subtotal >= c.minOrder) {
      couponInfo = { code: appliedCode, ...c };
      if (c.type === 'fixed') {
        discountAmount = c.value;
      } else if (c.type === 'percent') {
        discountAmount = Math.round((subtotal * c.value) / 100);
      }
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }

  // 5% GST
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxableAmount * 0.05);
  const grandTotal = Math.max(0, taxableAmount + deliveryFee + tax);

  return {
    cart,
    itemsDetail,
    subtotal,
    deliveryFee,
    discountAmount,
    couponInfo,
    tax,
    grandTotal
  };
}

// --- Cart Page Rendering (cart.html) ---
function renderCart() {
  const itemsContainer = document.getElementById('cart-items-container');
  const summaryContainer = document.getElementById('cart-summary-container');
  const emptyWrap = document.getElementById('empty-cart-state');
  const fullWrap = document.getElementById('full-cart-layout');

  if (!itemsContainer || !fullWrap) return;

  const data = getCartCalculations();

  if (data.itemsDetail.length === 0) {
    fullWrap.style.display = 'none';
    if (emptyWrap) emptyWrap.style.display = 'block';
    return;
  }

  if (emptyWrap) emptyWrap.style.display = 'none';
  fullWrap.style.display = 'grid';

  // Render Table Rows
  const rowsHtml = data.itemsDetail.map(item => `
    <tr>
      <td data-label="Product">
        <div class="cart-product-cell">
          <div class="cart-thumb">
            <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='${item.localImage}';">
          </div>
          <div>
            <h4 class="cart-item-name"><a href="product-details.html?id=${item.id}">${item.name}</a></h4>
            <span class="cart-item-unit">${item.unit} | ${item.category}</span>
            <div style="font-size: 0.72rem; color: ${item.stock <= 5 ? '#E65100' : 'var(--text-muted)'}; margin-top: 2px;">
              ${item.stock <= 5 ? `⚠️ Only ${item.stock} left in stock` : `In Stock (${item.stock} available)`}
            </div>
          </div>
        </div>
      </td>
      <td data-label="Price">
        <span class="cart-item-price">₹${item.price}</span>
      </td>
      <td data-label="Quantity">
        <div class="qty-control">
          <button type="button" class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
          <input type="text" class="qty-input" value="${item.quantity}" readonly>
          <button type="button" class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
        </div>
      </td>
      <td data-label="Total">
        <span class="cart-item-total">₹${item.lineTotal}</span>
      </td>
      <td data-label="Remove">
        <button class="btn-remove-item" onclick="removeFromCart(${item.id})" title="Remove item">
          <i class="far fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `).join('');

  itemsContainer.innerHTML = rowsHtml;

  // Render Summary Sidebar
  if (summaryContainer) {
    const freeDeliveryNotice = data.subtotal >= 500 
      ? `<div style="font-size: 0.8rem; color: var(--success); font-weight: 600; margin-bottom: 12px;"><i class="fas fa-check-circle"></i> Congratulations! You unlocked Free Delivery.</div>`
      : `<div style="font-size: 0.8rem; color: #E65100; font-weight: 600; margin-bottom: 12px;"><i class="fas fa-truck"></i> Add ₹${500 - data.subtotal} more to qualify for FREE Delivery!</div>`;

    const couponTagHtml = data.couponInfo
      ? `
        <div class="applied-coupon-tag">
          <span>🏷️ ${data.couponInfo.code} applied (-₹${data.discountAmount})</span>
          <i class="fas fa-times remove-coupon-btn" onclick="removeCoupon()" title="Remove coupon"></i>
        </div>
      `
      : '';

    summaryContainer.innerHTML = `
      <h3 class="summary-title">Order Summary</h3>
      
      ${freeDeliveryNotice}

      <div class="summary-row">
        <span>Cart Subtotal</span>
        <span>₹${data.subtotal}</span>
      </div>

      <div class="summary-row">
        <span>Estimated Delivery Fee</span>
        <span>${data.deliveryFee === 0 ? '<span style="color: var(--success);">FREE</span>' : `₹${data.deliveryFee}`}</span>
      </div>

      ${data.discountAmount > 0 ? `
        <div class="summary-row discount-row">
          <span>Promo Discount (${data.couponInfo.code})</span>
          <span>- ₹${data.discountAmount}</span>
        </div>
      ` : ''}

      <div class="summary-row">
        <span>Standard GST (5%)</span>
        <span>₹${data.tax}</span>
      </div>

      <!-- Coupon Form -->
      <div style="margin-top: 18px; margin-bottom: 18px; border-top: 1px solid var(--border-light); padding-top: 14px;">
        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-dark); display: block; margin-bottom: 6px;">Have a Promo Code?</label>
        <div class="coupon-box">
          <input type="text" id="coupon-input" placeholder="e.g. FRESH50" value="${data.couponInfo ? data.couponInfo.code : ''}">
          <button type="button" id="btn-apply-coupon">Apply</button>
        </div>
        ${couponTagHtml}
        <div style="font-size: 0.75rem; color: var(--text-muted);">Try: <strong>FRESH50</strong> (₹50 off) or <strong>HEALTHY10</strong> (10% off)</div>
      </div>

      <div class="summary-row summary-total">
        <span>Grand Total</span>
        <span>₹${data.grandTotal}</span>
      </div>

      <a href="checkout.html" class="btn btn-primary btn-block btn-lg" style="margin-top: 24px;">
        Proceed to Checkout <i class="fas fa-arrow-right"></i>
      </a>

      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; font-size: 0.8rem; color: var(--text-muted);">
        <i class="fas fa-lock" style="color: var(--primary);"></i> 256-Bit SSL Encrypted &amp; Secure Checkout
      </div>
    `;

    // Bind Coupon Button
    const applyBtn = document.getElementById('btn-apply-coupon');
    const couponInput = document.getElementById('coupon-input');
    if (applyBtn && couponInput) {
      applyBtn.addEventListener('click', () => {
        applyCoupon(couponInput.value);
      });
      couponInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyCoupon(couponInput.value);
        }
      });
    }
  }
}

// --- Checkout Page Rendering & Real-Time Form Submission (checkout.html) ---
function renderCheckoutSummary() {
  const summaryList = document.getElementById('checkout-items-summary');
  const totalsContainer = document.getElementById('checkout-totals-summary');
  if (!summaryList || !totalsContainer) return;

  const data = getCartCalculations();

  if (data.itemsDetail.length === 0) {
    summaryList.innerHTML = `
      <div style="text-align: center; padding: 24px;">
        <p style="color: var(--text-muted); margin-bottom: 12px;">Your shopping cart is currently empty.</p>
        <a href="products.html" class="btn btn-sm btn-primary">Browse Products</a>
      </div>
    `;
    totalsContainer.innerHTML = '';
    return;
  }

  summaryList.innerHTML = data.itemsDetail.map(item => `
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border-light);">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 44px; height: 44px; background: var(--bg-cream); border-radius: 6px; padding: 4px; display: flex; align-items: center; justify-content: center;">
          <img src="${item.image}" alt="${item.name}" style="max-height: 100%; max-width: 100%; object-fit: contain;" onerror="this.onerror=null; this.src='${item.localImage}';">
        </div>
        <div>
          <h5 style="font-size: 0.85rem; font-weight: 700; margin: 0;">${item.name}</h5>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${item.quantity} × ₹${item.price}</span>
        </div>
      </div>
      <strong style="font-size: 0.9rem; color: var(--primary);">₹${item.lineTotal}</strong>
    </div>
  `).join('');

  totalsContainer.innerHTML = `
    <div class="summary-row" style="margin-top: 14px;">
      <span>Subtotal</span>
      <span>₹${data.subtotal}</span>
    </div>
    <div class="summary-row">
      <span>Delivery</span>
      <span>${data.deliveryFee === 0 ? '<span style="color: var(--success);">FREE</span>' : `₹${data.deliveryFee}`}</span>
    </div>
    ${data.discountAmount > 0 ? `
      <div class="summary-row discount-row">
        <span>Discount (${data.couponInfo.code})</span>
        <span>- ₹${data.discountAmount}</span>
      </div>
    ` : ''}
    <div class="summary-row">
      <span>Tax (5% GST)</span>
      <span>₹${data.tax}</span>
    </div>
    <div class="summary-row summary-total">
      <span>Grand Total</span>
      <span>₹${data.grandTotal}</span>
    </div>
  `;
}

function initCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  renderCheckoutSummary();

  // Pre-fill user profile if logged in
  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (currentUser) {
    const nameInput = document.getElementById('chk-name');
    const emailInput = document.getElementById('chk-email');
    const phoneInput = document.getElementById('chk-phone');
    const addressInput = document.getElementById('chk-address');

    if (nameInput && currentUser.name) nameInput.value = currentUser.name;
    if (emailInput && currentUser.email) emailInput.value = currentUser.email;
    if (phoneInput && currentUser.phone) phoneInput.value = currentUser.phone;
    if (addressInput && currentUser.address) addressInput.value = currentUser.address;
  }

  // Real-time input listeners
  const nameEl = document.getElementById('chk-name');
  const emailEl = document.getElementById('chk-email');
  const phoneEl = document.getElementById('chk-phone');
  const addressEl = document.getElementById('chk-address');
  const cityEl = document.getElementById('chk-city');
  const stateEl = document.getElementById('chk-state');
  const pincodeEl = document.getElementById('chk-pincode');
  const slotEl = document.getElementById('chk-slot');
  const instructionsEl = document.getElementById('chk-instructions');

  if (nameEl) nameEl.addEventListener('input', () => setFieldValidation(nameEl, nameEl.value.trim().length >= 3, 'Full name must be at least 3 characters.'));
  if (emailEl) emailEl.addEventListener('input', () => setFieldValidation(emailEl, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim()), 'Enter a valid email address.'));
  if (phoneEl) phoneEl.addEventListener('input', () => setFieldValidation(phoneEl, /^[6-9]\d{9}$/.test(phoneEl.value.trim()), 'Enter a valid 10-digit mobile number.'));
  if (addressEl) addressEl.addEventListener('input', () => setFieldValidation(addressEl, addressEl.value.trim().length >= 5, 'Complete delivery address is required.'));
  if (cityEl) cityEl.addEventListener('input', () => setFieldValidation(cityEl, cityEl.value.trim().length >= 2, 'City is required.'));
  if (stateEl) stateEl.addEventListener('input', () => setFieldValidation(stateEl, stateEl.value.trim().length >= 2, 'State is required.'));
  if (pincodeEl) pincodeEl.addEventListener('input', () => setFieldValidation(pincodeEl, /^\d{6}$/.test(pincodeEl.value.trim()), 'Enter a valid 6-digit PIN code.'));

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
      if (typeof showToast === 'function') {
        showToast('Cart is Empty', 'Please add items to your cart before checking out.', 'error');
      }
      return;
    }

    const isNameValid = nameEl.value.trim().length >= 3;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim());
    const isPhoneValid = /^[6-9]\d{9}$/.test(phoneEl.value.trim());
    const isAddressValid = addressEl.value.trim().length >= 5;
    const isCityValid = cityEl.value.trim().length >= 2;
    const isStateValid = stateEl.value.trim().length >= 2;
    const isPinValid = /^\d{6}$/.test(pincodeEl.value.trim());

    setFieldValidation(nameEl, isNameValid, 'Full name must be at least 3 characters.');
    setFieldValidation(emailEl, isEmailValid, 'Enter a valid email address.');
    setFieldValidation(phoneEl, isPhoneValid, 'Enter a valid 10-digit mobile number.');
    setFieldValidation(addressEl, isAddressValid, 'Complete delivery address is required.');
    setFieldValidation(cityEl, isCityValid, 'City is required.');
    setFieldValidation(stateEl, isStateValid, 'State is required.');
    setFieldValidation(pincodeEl, isPinValid, 'Enter a valid 6-digit PIN code.');

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isAddressValid || !isCityValid || !isStateValid || !isPinValid) {
      if (typeof showToast === 'function') {
        showToast('Incomplete Form', 'Please correct all highlighted fields.', 'error');
      }
      return;
    }

    const paymentMethodEl = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethodVal = paymentMethodEl ? paymentMethodEl.value : 'Cash on Delivery (COD)';
    const slotText = slotEl ? slotEl.options[slotEl.selectedIndex].text : '2-Hour Express Delivery';
    const specialInstText = instructionsEl ? instructionsEl.value.trim() : '';

    const submitBtn = document.getElementById('btn-place-order');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing &amp; Reserving Inventory...`;

    setTimeout(() => {
      try {
        const order = createCustomerOrder({
          userId: currentUser ? currentUser.id : 'guest',
          customerName: nameEl.value.trim(),
          email: emailEl.value.trim(),
          phone: phoneEl.value.trim(),
          address: `${addressEl.value.trim()}, ${cityEl.value.trim()} - ${pincodeEl.value.trim()}`,
          slot: slotText,
          specialInstructions: specialInstText,
          paymentMethod: paymentMethodVal
        });

        // Show confirmation modal with direct link to invoice and tracking
        showOrderConfirmationModal(order);

      } catch (err) {
        if (typeof showToast === 'function') {
          showToast('Order Placement Error', err.message, 'error');
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    }, 1000);
  });
}

function showOrderConfirmationModal(order) {
  const modal = document.getElementById('order-confirmation-modal');
  if (!modal) {
    window.location.href = `invoice.html?orderId=${order.id}`;
    return;
  }

  const orderIdSpan = document.getElementById('modal-order-id');
  const detailsBox = document.getElementById('modal-order-details');

  if (orderIdSpan) orderIdSpan.textContent = order.id;
  if (detailsBox) {
    detailsBox.innerHTML = `
      <div class="ms-row"><span>Customer Name:</span><strong>${order.customerName}</strong></div>
      <div class="ms-row"><span>Contact Phone:</span><strong>${order.phone}</strong></div>
      <div class="ms-row"><span>Delivery Address:</span><strong>${order.address}</strong></div>
      <div class="ms-row"><span>Scheduled Slot:</span><strong>${order.slot}</strong></div>
      <div class="ms-row"><span>Payment Method:</span><strong>${order.paymentMethod}</strong></div>
      <div class="ms-row" style="border-top: 1px solid var(--border-color); padding-top: 8px; margin-top: 8px; font-size: 1.05rem; color: var(--primary);">
        <span>Total Amount:</span><strong>₹${order.grandTotal}</strong>
      </div>
    `;
  }

  // Update actions in modal
  const modalActions = modal.querySelector('.modal-actions');
  if (modalActions) {
    modalActions.innerHTML = `
      <a href="invoice.html?orderId=${order.id}" class="btn btn-primary">
        <i class="fas fa-file-invoice"></i> View Official Invoice
      </a>
      <a href="profile.html#orders" class="btn btn-secondary">
        <i class="fas fa-truck-ramp-box"></i> Live Order Tracking
      </a>
      <a href="index.html" class="btn btn-outline">
        <i class="fas fa-home"></i> Home
      </a>
    `;
  }

  modal.classList.add('active');
}

function closeOrderModal() {
  const modal = document.getElementById('order-confirmation-modal');
  if (modal) modal.classList.remove('active');
  window.location.href = 'index.html';
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  getAllOrdersFromStorage();
  updateCartBadge();
  if (document.getElementById('cart-items-container')) {
    renderCart();
  }
  if (document.getElementById('checkout-form')) {
    initCheckoutForm();
  }
});
