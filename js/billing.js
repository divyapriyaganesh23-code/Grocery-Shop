/**
 * FreshCart - Billing & Tax Invoice Generation Engine
 * Generates GST-compliant itemized invoices with accurate calculations,
 * CGST/SGST tax breakdown, and print / PDF download features.
 */

const BillingEngine = {
  STORE_INFO: {
    name: 'FreshCart Supermarket Pvt Ltd',
    tagline: 'Fresh Groceries, Fresh Happiness.',
    address: 'Plot 104, 14th Main Road, Sector 4, HSR Layout, Bengaluru, Karnataka - 560102',
    phone: '+91 98765 43210',
    email: 'billing@freshcart.com',
    website: 'www.freshcart.com',
    gstin: '29AABCF9876Q1Z2',
    fssai: '11223344556677'
  },

  renderInvoice(containerId, order) {
    const container = document.getElementById(containerId);
    if (!container || !order) return;

    const cgst = Number(order.cgst || (order.subtotal * 0.025)).toFixed(2);
    const sgst = Number(order.sgst || (order.subtotal * 0.025)).toFixed(2);
    const subtotal = Number(order.subtotal).toFixed(2);
    const discount = Number(order.discount || 0).toFixed(2);
    const deliveryFee = Number(order.deliveryFee || 0).toFixed(2);
    const grandTotal = Number(order.grandTotal).toFixed(2);

    let itemsHtml = '';
    order.items.forEach((item, index) => {
      itemsHtml += `
        <tr>
          <td style="text-align:center; padding:10px 8px; border-bottom:1px solid #e0e0e0;">${index + 1}</td>
          <td style="padding:10px 8px; border-bottom:1px solid #e0e0e0;">
            <div style="font-weight:600; color:#252525;">${item.name}</div>
            <small style="color:#777;">Unit: ${item.unit || '1 unit'}</small>
          </td>
          <td style="text-align:center; padding:10px 8px; border-bottom:1px solid #e0e0e0;">${item.quantity}</td>
          <td style="text-align:right; padding:10px 8px; border-bottom:1px solid #e0e0e0;">₹${Number(item.price).toFixed(2)}</td>
          <td style="text-align:right; padding:10px 8px; border-bottom:1px solid #e0e0e0; font-weight:600;">₹${Number(item.lineTotal || item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="fresh-invoice-card" style="background:#ffffff; border-radius:12px; padding:36px; max-width:850px; margin:0 auto; box-shadow:0 4px 20px rgba(0,0,0,0.06); border:1px solid #e0e0e0;">
        
        <!-- Action Toolbar (Hidden during print) -->
        <div class="invoice-toolbar no-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid #eee;">
          <a href="my-orders.html" class="btn btn-outline" style="display:inline-flex; align-items:center; gap:8px;">
            <i class="fas fa-arrow-left"></i> Back to Orders
          </a>
          <div style="display:flex; gap:12px;">
            <button class="btn btn-outline" onclick="window.print()">
              <i class="fas fa-print"></i> Print Invoice
            </button>
            <button class="btn btn-primary" onclick="window.print()">
              <i class="fas fa-download"></i> Save as PDF
            </button>
          </div>
        </div>

        <!-- Invoice Header -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px;">
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
              <div style="width:36px; height:36px; background:linear-gradient(135deg, #1B5E35, #4CAF50); border-radius:8px; display:flex; align-items:center; justify-content:center; color:white; font-size:1.1rem;">
                <i class="fas fa-leaf"></i>
              </div>
              <span style="font-size:1.6rem; font-weight:800; color:#1B5E35; letter-spacing:-0.5px;">Fresh<span style="color:#4CAF50;">Cart</span></span>
            </div>
            <p style="margin:0; font-size:0.85rem; color:#666;">${this.STORE_INFO.tagline}</p>
            <p style="margin:4px 0 0; font-size:0.8rem; color:#777; max-width:320px;">${this.STORE_INFO.address}</p>
            <p style="margin:2px 0 0; font-size:0.8rem; color:#777;">GSTIN: <strong>${this.STORE_INFO.gstin}</strong> | FSSAI: ${this.STORE_INFO.fssai}</p>
          </div>

          <div style="text-align:right;">
            <h2 style="margin:0 0 6px; font-size:1.6rem; color:#1B5E35; text-transform:uppercase; letter-spacing:1px;">TAX INVOICE</h2>
            <div style="font-size:0.9rem; font-weight:700; color:#333;">Invoice #: ${order.invoiceNumber || 'INV-' + order.id}</div>
            <div style="font-size:0.85rem; color:#666; margin-top:2px;">Order ID: <strong>#${order.id}</strong></div>
            <div style="font-size:0.85rem; color:#666; margin-top:2px;">Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
            <div style="font-size:0.85rem; color:#666; margin-top:2px;">Time: ${new Date(order.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</div>
          </div>
        </div>

        <hr style="border:0; border-top:1px solid #e0e0e0; margin:20px 0;">

        <!-- Bill To / Ship To Grid -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px; margin-bottom:28px;">
          <div>
            <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:#888; letter-spacing:0.5px; margin-bottom:6px;">BILLED TO / CUSTOMER</div>
            <div style="font-size:1rem; font-weight:700; color:#252525;">${order.customerName}</div>
            <div style="font-size:0.85rem; color:#555; margin-top:4px;">Phone: ${order.phone}</div>
            <div style="font-size:0.85rem; color:#555;">Email: ${order.customerEmail || 'customer@freshcart.com'}</div>
          </div>

          <div>
            <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:#888; letter-spacing:0.5px; margin-bottom:6px;">DELIVERY ADDRESS & SLOT</div>
            <div style="font-size:0.85rem; color:#333; line-height:1.4;">${order.deliveryAddress}</div>
            <div style="font-size:0.85rem; color:#555; margin-top:4px;"><strong>Slot:</strong> ${order.deliverySlotText || 'Standard Delivery'}</div>
            <div style="font-size:0.85rem; color:#555;"><strong>Date:</strong> ${order.deliveryDate}</div>
          </div>
        </div>

        <!-- Itemized Table -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:24px; font-size:0.9rem;">
          <thead>
            <tr style="background:#f4f8f4; color:#1B5E35; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.5px;">
              <th style="padding:10px 8px; width:40px; text-align:center;">#</th>
              <th style="padding:10px 8px; text-align:left;">Product Description</th>
              <th style="padding:10px 8px; width:70px; text-align:center;">Qty</th>
              <th style="padding:10px 8px; width:100px; text-align:right;">Unit Price</th>
              <th style="padding:10px 8px; width:110px; text-align:right;">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Summary & Totals -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="max-width:360px;">
            <div style="font-size:0.85rem; font-weight:700; color:#444; margin-bottom:4px;">Payment Method:</div>
            <div style="font-size:0.9rem; color:#1B5E35; font-weight:600;">${order.paymentMethod}</div>
            <div style="font-size:0.8rem; color:#666; margin-top:2px;">Payment Status: <span class="badge badge-success" style="padding:2px 8px; font-size:0.75rem;">${order.paymentStatus}</span></div>

            <div style="background:#f9f9f9; border-radius:6px; padding:12px; margin-top:16px; font-size:0.8rem; color:#666;">
              <i class="fas fa-certificate" style="color:#4CAF50;"></i> This is a computer generated invoice and requires no physical signature. FreshCart guarantees 100% natural and safe products.
            </div>
          </div>

          <div style="width:280px;">
            <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:0.9rem; color:#555;">
              <span>Subtotal:</span>
              <span>₹${subtotal}</span>
            </div>
            ${discount > 0 ? `
              <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:0.9rem; color:#2e7d32;">
                <span>Discount:</span>
                <span>-₹${discount}</span>
              </div>
            ` : ''}
            <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:0.9rem; color:#555;">
              <span>Delivery Fee:</span>
              <span>${deliveryFee > 0 ? '₹' + deliveryFee : '<strong style="color:#2e7d32;">FREE</strong>'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:0.85rem; color:#777;">
              <span>CGST (2.5%):</span>
              <span>₹${cgst}</span>
            </div>
            <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:0.85rem; color:#777;">
              <span>SGST (2.5%):</span>
              <span>₹${sgst}</span>
            </div>
            <hr style="border:0; border-top:1px dashed #ccc; margin:8px 0;">
            <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:1.2rem; font-weight:800; color:#1B5E35;">
              <span>Grand Total:</span>
              <span>₹${grandTotal}</span>
            </div>
          </div>
        </div>

        <div style="text-align:center; margin-top:36px; padding-top:16px; border-top:1px solid #eee; font-size:0.8rem; color:#888;">
          Thank you for choosing FreshCart! For inquiries, reach us at support@freshcart.com or +91 98765 43210.
        </div>
      </div>
    `;
  }
};

window.BillingEngine = BillingEngine;
