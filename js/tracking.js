/**
 * FreshCart - Customer Live Order Tracking Engine
 * Visual 6-Stage Progress Stepper, Delivery Slot & Time Details,
 * and Customer-facing Demo Delivery OTP Display.
 */

const TrackingEngine = {
  STAGES: [
    { key: 'New Order', label: 'Order Placed', icon: 'fa-receipt', desc: 'We have received your grocery order.' },
    { key: 'Confirmed', label: 'Order Confirmed', icon: 'fa-clipboard-check', desc: 'Store owner confirmed and assigned fulfillment staff.' },
    { key: 'Preparing', label: 'Preparing', icon: 'fa-kitchen-set', desc: 'Fresh groceries are being gathered from store shelves.' },
    { key: 'Packed', label: 'Packed & Sealed', icon: 'fa-box-open', desc: 'Items safely packed in eco-friendly FreshCart bags.' },
    { key: 'Ready for Delivery', label: 'Out for Delivery', icon: 'fa-truck-fast', desc: 'Delivery partner is heading to your address.' },
    { key: 'Delivered', label: 'Delivered', icon: 'fa-house-circle-check', desc: 'Order verified and delivered to your doorstep.' }
  ],

  getStageIndex(status) {
    if (status === 'Cancelled') return -1;
    if (status === 'Packing') return 2; // Maps to Preparing/Packing
    const idx = this.STAGES.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  },

  renderTimeline(containerId, order) {
    const container = document.getElementById(containerId);
    if (!container || !order) return;

    if (order.status === 'Cancelled') {
      container.innerHTML = `
        <div class="tracking-cancelled-alert" style="background:#ffebee; border:1px solid #ef5350; border-radius:8px; padding:20px; text-align:center; color:#c62828;">
          <i class="fas fa-ban" style="font-size:2.5rem; margin-bottom:10px;"></i>
          <h3 style="margin:0 0 8px;">Order Cancelled</h3>
          <p style="margin:0; font-size:0.9rem;">This order was cancelled on ${order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : 'recently'}. Reserved inventory has been restored.</p>
        </div>
      `;
      return;
    }

    const currentIndex = this.getStageIndex(order.status);

    let html = `
      <div class="tracking-stepper-container">
        <div class="tracking-stepper">
    `;

    this.STAGES.forEach((stage, idx) => {
      const isCompleted = idx < currentIndex;
      const isCurrent = idx === currentIndex;
      const stepClass = isCompleted ? 'step-completed' : (isCurrent ? 'step-current' : 'step-pending');

      html += `
        <div class="stepper-node ${stepClass}">
          <div class="node-icon-circle">
            <i class="fas ${isCompleted ? 'fa-check' : stage.icon}"></i>
          </div>
          <div class="node-content">
            <span class="node-title">${stage.label}</span>
            <small class="node-desc">${isCurrent ? (stage.desc) : ''}</small>
          </div>
          ${idx < this.STAGES.length - 1 ? '<div class="stepper-connector"></div>' : ''}
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  renderDetailsCard(containerId, order) {
    const container = document.getElementById(containerId);
    if (!container || !order) return;

    const isDelivered = order.status === 'Delivered';
    const isReadyForOtp = ['Packed', 'Ready for Delivery', 'Out for Delivery'].includes(order.status);

    container.innerHTML = `
      <div class="tracking-info-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-top:24px;">
        <!-- Card 1: Delivery Slot & Address -->
        <div class="fresh-card" style="padding:20px;">
          <h4 style="margin:0 0 12px; color:var(--primary); display:flex; align-items:center; gap:8px;">
            <i class="fas fa-location-dot"></i> Delivery Destination
          </h4>
          <p style="margin:0 0 6px; font-weight:700;">${order.customerName}</p>
          <p style="margin:0 0 6px; color:var(--text-muted); font-size:0.9rem;">${order.deliveryAddress}</p>
          <p style="margin:0; font-size:0.85rem; color:#444;"><strong>Phone:</strong> ${order.phone}</p>
          <hr style="margin:12px 0; border:0; border-top:1px solid #eee;">
          <p style="margin:0; font-size:0.85rem;">
            <i class="far fa-clock" style="color:var(--primary);"></i> <strong>Slot:</strong> ${order.deliverySlotText || 'Standard Delivery'}
          </p>
          <p style="margin:4px 0 0; font-size:0.85rem;">
            <i class="far fa-calendar" style="color:var(--primary);"></i> <strong>Date:</strong> ${order.deliveryDate}
          </p>
        </div>

        <!-- Card 2: Fulfillment & Staff -->
        <div class="fresh-card" style="padding:20px;">
          <h4 style="margin:0 0 12px; color:var(--primary); display:flex; align-items:center; gap:8px;">
            <i class="fas fa-boxes-packing"></i> Order Fulfillment
          </h4>
          <p style="margin:0 0 6px; font-size:0.9rem;">
            <strong>Status:</strong> <span class="badge badge-info" style="font-size:0.85rem; padding:4px 10px;">${order.status}</span>
          </p>
          <p style="margin:0 0 6px; font-size:0.9rem;">
            <strong>Assigned Staff:</strong> ${order.assignedWorkerName || 'Pending Store Assignment'}
          </p>
          <p style="margin:0 0 6px; font-size:0.9rem;">
            <strong>Payment:</strong> ${order.paymentMethod} (${order.paymentStatus})
          </p>
          <p style="margin:0; font-size:0.9rem;">
            <strong>Grand Total:</strong> <span style="font-weight:700; color:var(--primary);">₹${Number(order.grandTotal).toFixed(2)}</span>
          </p>
        </div>

        <!-- Card 3: Delivery OTP Verification Box -->
        <div class="fresh-card otp-card" style="padding:20px; border:2px dashed ${isDelivered ? '#4CAF50' : '#FF9800'}; background:${isDelivered ? '#f1f8e9' : '#fff8e1'};">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h4 style="margin:0; color:#b78103; font-size:1rem; display:flex; align-items:center; gap:8px;">
              <i class="fas fa-key"></i> Doorstep Delivery OTP
            </h4>
            <span class="badge" style="background:#ffecb3; color:#795548; font-size:0.75rem;">DEMO MODE</span>
          </div>

          ${isDelivered ? `
            <div style="text-align:center; padding:10px 0;">
              <i class="fas fa-circle-check" style="font-size:2rem; color:#4CAF50;"></i>
              <p style="margin:8px 0 0; font-weight:700; color:#2e7d32;">OTP Verified & Delivered</p>
              <small style="color:#666;">Verified on ${new Date(order.deliveredAt).toLocaleTimeString()}</small>
            </div>
          ` : `
            <p style="margin:0 0 10px; font-size:0.85rem; color:#666;">
              Please share this 6-digit verification code with the delivery partner upon arrival at your doorstep:
            </p>
            <div style="text-align:center; padding:12px; background:white; border-radius:8px; border:1px solid #ffe082;">
              <span style="font-family:monospace; font-size:2rem; font-weight:800; letter-spacing:6px; color:#1B5E35;">
                ${order.deliveryOtp || '482915'}
              </span>
            </div>
            <small style="display:block; text-align:center; color:#8d6e63; margin-top:8px;">
              <i class="fas fa-shield-halved"></i> Valid for this delivery only. Never share with anyone else.
            </small>
          `}
        </div>
      </div>
    `;
  }
};

window.TrackingEngine = TrackingEngine;
