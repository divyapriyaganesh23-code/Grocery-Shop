/**
 * FreshCart - Checkout & Delivery Scheduling Engine
 * Manages delivery date & time slot selection with capacity limits,
 * Cash on Delivery, and simulated Demo Online Payment modal.
 */

const SLOTS_CONFIG_KEY = 'freshcart_delivery_slots';

const DEFAULT_SLOTS = [
  { id: 1, label: '07:00 AM - 09:00 AM', period: 'Morning Express', maxCapacity: 15 },
  { id: 2, label: '09:00 AM - 11:00 AM', period: 'Morning Slot', maxCapacity: 20 },
  { id: 3, label: '01:00 PM - 03:00 PM', period: 'Afternoon Slot', maxCapacity: 15 },
  { id: 4, label: '04:00 PM - 06:00 PM', period: 'Evening Slot', maxCapacity: 25 },
  { id: 5, label: '07:00 PM - 09:00 PM', period: 'Night Express', maxCapacity: 20 }
];

const CheckoutEngine = {
  getDeliverySlots() {
    try {
      const raw = localStorage.getItem(SLOTS_CONFIG_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_SLOTS;
    } catch (e) {
      return DEFAULT_SLOTS;
    }
  },

  saveDeliverySlots(slots) {
    try {
      localStorage.setItem(SLOTS_CONFIG_KEY, JSON.stringify(slots));
    } catch (e) {
      console.error('CheckoutEngine: Error saving slots', e);
    }
  },

  // Generate available delivery dates (Today, Tomorrow, and next 3 days)
  getAvailableDates() {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }));
      const display = `${dayName}, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      dates.push({ isoDate: iso, label: display, isToday: i === 0 });
    }
    return dates;
  },

  // Calculate booked slots for a given date from existing orders
  getSlotAvailability(selectedIsoDate) {
    const slots = this.getDeliverySlots();
    const allOrders = typeof OrdersEngine !== 'undefined' ? OrdersEngine.getAllOrders() : [];
    
    // Count orders per slot on selected date that are active (not cancelled)
    const bookings = {};
    allOrders.forEach(order => {
      if (order.deliveryDate === selectedIsoDate && order.status !== 'Cancelled') {
        const sId = order.deliverySlotId;
        if (sId) bookings[sId] = (bookings[sId] || 0) + 1;
      }
    });

    return slots.map(slot => {
      const bookedCount = bookings[slot.id] || 0;
      const remaining = Math.max(0, slot.maxCapacity - bookedCount);
      return {
        ...slot,
        bookedCount,
        remaining,
        isAvailable: remaining > 0
      };
    });
  },

  // Trigger Online Demo Payment Simulation Modal
  promptDemoPaymentModal(orderDetails, onSuccess, onFailure) {
    let modal = document.getElementById('demo-payment-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'demo-payment-modal';
      modal.className = 'fresh-modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="fresh-modal-dialog payment-modal-content">
        <div class="fresh-modal-header" style="background: linear-gradient(135deg, #1B5E35, #2E7D32); color:white;">
          <div>
            <h3 style="color:white; margin:0;"><i class="fas fa-shield-halved"></i> FreshCart Secure Gateway</h3>
            <span class="badge badge-warning" style="background:#FFF3CD; color:#856404; font-size:0.75rem; padding:2px 8px; border-radius:4px; font-weight:700;">DEMO MODE</span>
          </div>
          <button class="modal-close-btn" style="color:white;" onclick="CheckoutEngine.closePaymentModal(false)">&times;</button>
        </div>
        
        <div class="fresh-modal-body" style="padding: 24px;">
          <div style="background: #e8f5e9; border: 1px dashed #4CAF50; border-radius: 8px; padding: 14px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 0.85rem; color: #2e7d32; font-weight: 600;">SIMULATED PAYMENT TRANSACTION</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: #1B5E35; margin: 4px 0;">₹${orderDetails.grandTotal.toFixed(2)}</div>
            <div style="font-size: 0.8rem; color: #666;">No real credit card or bank details are required.</div>
          </div>

          <div class="payment-tabs" style="display:flex; gap:10px; margin-bottom:16px;">
            <button type="button" class="btn btn-outline pay-tab-btn active" onclick="CheckoutEngine.switchPayTab('upi')" style="flex:1;">
              <i class="fas fa-mobile-screen-button"></i> UPI / QR
            </button>
            <button type="button" class="btn btn-outline pay-tab-btn" onclick="CheckoutEngine.switchPayTab('card')" style="flex:1;">
              <i class="fas fa-credit-card"></i> Card (Demo)
            </button>
          </div>

          <!-- UPI Tab -->
          <div id="pay-tab-upi" class="pay-subtab">
            <div style="text-align: center; margin-bottom: 15px;">
              <div style="display:inline-block; padding:12px; background:white; border:1px solid #ddd; border-radius:8px;">
                <i class="fas fa-qrcode" style="font-size: 90px; color:#1B5E35;"></i>
              </div>
              <p style="font-size: 0.85rem; color: #555; margin-top: 8px;">Scan with Google Pay, PhonePe, or Paytm (Simulated)</p>
            </div>
            <div class="form-group">
              <label style="font-size:0.85rem; font-weight:600;">Or Enter Demo UPI ID</label>
              <input type="text" class="form-control" value="customer@okfreshcart" readonly style="background:#f9f9f9;">
            </div>
          </div>

          <!-- Card Tab -->
          <div id="pay-tab-card" class="pay-subtab" style="display:none;">
            <div class="form-group" style="margin-bottom:12px;">
              <label style="font-size:0.85rem; font-weight:600;">Demo Card Number</label>
              <input type="text" class="form-control" value="4532 •••• •••• 8899" readonly style="background:#f9f9f9;">
            </div>
            <div style="display:flex; gap:12px;">
              <div class="form-group" style="flex:1;">
                <label style="font-size:0.85rem; font-weight:600;">Expires</label>
                <input type="text" class="form-control" value="12/28" readonly style="background:#f9f9f9;">
              </div>
              <div class="form-group" style="flex:1;">
                <label style="font-size:0.85rem; font-weight:600;">CVV</label>
                <input type="password" class="form-control" value="•••" readonly style="background:#f9f9f9;">
              </div>
            </div>
          </div>

          <div id="pay-processing-state" style="display:none; text-align:center; padding:20px 0;">
            <i class="fas fa-circle-notch fa-spin" style="font-size: 2rem; color: #1B5E35;"></i>
            <p style="margin-top:10px; font-weight:600; color:#333;">Simulating Secure Bank Authorization...</p>
          </div>

          <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button type="button" class="btn btn-outline" style="flex: 1;" onclick="CheckoutEngine.triggerPaymentOutcome(false, '${orderDetails.id}')">
              <i class="fas fa-times-circle"></i> Simulate Fail
            </button>
            <button type="button" class="btn btn-primary" style="flex: 2;" onclick="CheckoutEngine.triggerPaymentOutcome(true, '${orderDetails.id}')">
              <i class="fas fa-check-circle"></i> Authorize & Pay ₹${orderDetails.grandTotal.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    this._onPaymentSuccess = onSuccess;
    this._onPaymentFailure = onFailure;
  },

  switchPayTab(tab) {
    document.querySelectorAll('.pay-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.pay-subtab').forEach(t => t.style.display = 'none');
    
    if (tab === 'upi') {
      document.querySelector('.pay-tab-btn:first-child')?.classList.add('active');
      document.getElementById('pay-tab-upi').style.display = 'block';
    } else {
      document.querySelector('.pay-tab-btn:last-child')?.classList.add('active');
      document.getElementById('pay-tab-card').style.display = 'block';
    }
  },

  closePaymentModal() {
    const modal = document.getElementById('demo-payment-modal');
    if (modal) modal.style.display = 'none';
  },

  triggerPaymentOutcome(isSuccess, orderId) {
    const proc = document.getElementById('pay-processing-state');
    if (proc) proc.style.display = 'block';

    setTimeout(() => {
      this.closePaymentModal();
      if (isSuccess) {
        if (typeof this._onPaymentSuccess === 'function') {
          this._onPaymentSuccess({
            status: 'paid',
            transactionId: 'TXN-DEMO-' + Date.now(),
            paidAt: new Date().toISOString()
          });
        }
      } else {
        if (typeof this._onPaymentFailure === 'function') {
          this._onPaymentFailure('Customer simulated a payment failure or cancellation.');
        }
      }
    }, 1200);
  }
};

window.CheckoutEngine = CheckoutEngine;
