/**
 * FreshCart - Unified Orders & Fulfillment Engine
 * Manages 8-stage order lifecycle, worker assignment, delivery OTP verification,
 * stock reservation/restoration, and cancellation/return workflows.
 */

const ORDERS_KEY = 'freshcart_orders_v2';
const RETURNS_KEY = 'freshcart_returns_v2';

const ORDER_STAGES = {
  NEW: 'New Order',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  PACKING: 'Packing',
  PACKED: 'Packed',
  READY_FOR_DELIVERY: 'Ready for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

const OrdersEngine = {
  getAllOrders() {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('OrdersEngine: Error loading orders', e);
    }
    const initial = this.getSeedOrders();
    this.saveAllOrders(initial);
    return initial;
  },

  saveAllOrders(orders) {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('OrdersEngine: Error saving orders', e);
    }
  },

  getOrderById(orderId) {
    const orders = this.getAllOrders();
    return orders.find(o => o.id === orderId || o.invoiceNumber === orderId) || null;
  },

  getOrdersByCustomer(customerId) {
    const orders = this.getAllOrders();
    return orders.filter(o => o.customerId === customerId);
  },

  getOrdersByWorker(workerId) {
    const orders = this.getAllOrders();
    return orders.filter(o => o.assignedWorkerId === workerId);
  },

  // Create New Customer Order
  createOrder(payload) {
    const orders = this.getAllOrders();
    const orderNumber = Math.floor(100000 + Math.random() * 900000);
    const orderId = 'FC-' + orderNumber;
    const invoiceNumber = 'INV-2026-' + orderNumber;
    
    // Generate secure 6-digit delivery verification OTP
    const deliveryOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const newOrder = {
      id: orderId,
      invoiceNumber: invoiceNumber,
      customerId: payload.customerId || 'usr_cust_001',
      customerName: payload.recipientName,
      customerEmail: payload.customerEmail || 'customer@freshcart.com',
      phone: payload.phone,
      deliveryAddress: payload.deliveryAddress,
      landmark: payload.landmark || '',
      city: payload.city || 'Bengaluru',
      postalCode: payload.postalCode || '560102',
      deliveryDate: payload.deliveryDate,
      deliverySlotId: payload.deliverySlotId,
      deliverySlotText: payload.deliverySlotText,
      specialInstructions: payload.specialInstructions || '',
      
      // Items & Pricing
      items: payload.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        costPrice: item.costPrice || Math.round(item.price * 0.72), // Default 72% cost for COGS
        quantity: item.quantity,
        unit: item.unit || '1 unit',
        lineTotal: item.price * item.quantity,
        isPacked: false,
        packedAt: null,
        isMissing: false,
        substituteRequested: null
      })),
      subtotal: payload.subtotal,
      discount: payload.discount || 0,
      deliveryFee: payload.deliveryFee || 0,
      cgst: payload.cgst || 0,
      sgst: payload.sgst || 0,
      grandTotal: payload.grandTotal,

      // Workflow & Status
      status: ORDER_STAGES.NEW,
      paymentMethod: payload.paymentMethod || 'Cash on Delivery',
      paymentStatus: payload.paymentMethod === 'Cash on Delivery' ? 'Pending (COD)' : 'Paid (Online Demo)',
      
      // OTP & Verification
      deliveryOtp: deliveryOtp,
      otpAttempts: 0,
      isOtpVerified: false,

      // Fulfillment Tracking
      assignedWorkerId: null,
      assignedWorkerName: null,
      estimatedPrepMinutes: 45,
      packingDeadline: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusTimeline: [
        { stage: ORDER_STAGES.NEW, time: new Date().toISOString(), note: 'Order placed by customer.' }
      ]
    };

    // Deduct stock for all items
    if (typeof InventoryEngine !== 'undefined') {
      newOrder.items.forEach(item => {
        InventoryEngine.recordStockDeduction(item.id, item.quantity, newOrder.id, `Order placed by ${payload.recipientName}`);
      });
    }

    orders.unshift(newOrder);
    this.saveAllOrders(orders);

    // Create In-App Notification for Owner
    if (typeof NotificationEngine !== 'undefined') {
      NotificationEngine.notifyOwner(`New Order #${orderId}`, `Order for ₹${newOrder.grandTotal} received from ${newOrder.customerName}`, 'order');
    }

    return newOrder;
  },

  // Owner Confirms Order and Assigns Worker
  assignWorker(orderId, workerId, workerName, prepMinutes = 40) {
    const orders = this.getAllOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    order.assignedWorkerId = workerId;
    order.assignedWorkerName = workerName;
    order.estimatedPrepMinutes = prepMinutes;
    order.packingDeadline = new Date(Date.now() + prepMinutes * 60 * 1000).toISOString();
    
    if (order.status === ORDER_STAGES.NEW) {
      order.status = ORDER_STAGES.CONFIRMED;
      order.statusTimeline.push({
        stage: ORDER_STAGES.CONFIRMED,
        time: new Date().toISOString(),
        note: `Order confirmed and assigned to fulfillment specialist: ${workerName}.`
      });
    }

    order.updatedAt = new Date().toISOString();
    this.saveAllOrders(orders);

    return { success: true, order };
  },

  // Transition Order Status
  updateOrderStatus(orderId, newStatus, note = '') {
    const orders = this.getAllOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    
    if (!order.statusTimeline) order.statusTimeline = [];
    order.statusTimeline.push({
      stage: newStatus,
      time: new Date().toISOString(),
      note: note || `Status updated to ${newStatus}`
    });

    if (newStatus === ORDER_STAGES.DELIVERED) {
      order.deliveredAt = new Date().toISOString();
      if (order.paymentMethod.includes('Cash')) {
        order.paymentStatus = 'Paid (Cash Collected)';
      }
    } else if (newStatus === ORDER_STAGES.CANCELLED) {
      order.cancelledAt = new Date().toISOString();
      // Restore inventory
      if (typeof InventoryEngine !== 'undefined') {
        order.items.forEach(item => {
          InventoryEngine.recordStockRestoration(item.id, item.quantity, order.id, 'Order cancelled');
        });
      }
    }

    this.saveAllOrders(orders);
    return true;
  },

  // Worker Marks Single Item as Packed
  toggleItemPacked(orderId, itemId, isPacked = true) {
    const orders = this.getAllOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    const item = order.items.find(i => Number(i.id) === Number(itemId));
    if (item) {
      item.isPacked = isPacked;
      item.packedAt = isPacked ? new Date().toISOString() : null;
      
      // Auto-update order to PACKING if in PREPARING or CONFIRMED
      if (order.status === ORDER_STAGES.CONFIRMED || order.status === ORDER_STAGES.PREPARING) {
        order.status = ORDER_STAGES.PACKING;
      }

      // Check if all packed
      const allPacked = order.items.every(i => i.isPacked);
      if (allPacked && order.status === ORDER_STAGES.PACKING) {
        order.status = ORDER_STAGES.PACKED;
        order.statusTimeline.push({
          stage: ORDER_STAGES.PACKED,
          time: new Date().toISOString(),
          note: 'All grocery items safely packed by worker.'
        });
      }

      order.updatedAt = new Date().toISOString();
      this.saveAllOrders(orders);
      return true;
    }
    return false;
  },

  // Worker Reports Damaged / Missing Item
  reportItemIssue(orderId, itemId, reason, proposedSubstitute = null) {
    const orders = this.getAllOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    const item = order.items.find(i => Number(i.id) === Number(itemId));
    if (item) {
      item.isMissing = true;
      item.issueReason = reason;
      item.substituteRequested = proposedSubstitute;
      order.hasItemIssue = true;
      order.updatedAt = new Date().toISOString();
      this.saveAllOrders(orders);
      return true;
    }
    return false;
  },

  // Worker Verifies Delivery OTP
  verifyDeliveryOtp(orderId, enteredOtp) {
    const orders = this.getAllOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    if (order.status === ORDER_STAGES.DELIVERED) {
      return { success: false, message: 'Order has already been marked as Delivered.' };
    }

    if (order.otpAttempts >= 5) {
      return { success: false, message: 'Maximum OTP verification attempts (5) exceeded. Please contact store owner.' };
    }

    if (enteredOtp.trim() !== order.deliveryOtp) {
      order.otpAttempts = (order.otpAttempts || 0) + 1;
      this.saveAllOrders(orders);
      const remaining = 5 - order.otpAttempts;
      return { success: false, message: `Invalid OTP code. ${remaining} attempts remaining.` };
    }

    // Success: Mark as delivered
    order.isOtpVerified = true;
    order.status = ORDER_STAGES.DELIVERED;
    order.deliveredAt = new Date().toISOString();
    if (order.paymentMethod.includes('Cash')) {
      order.paymentStatus = 'Paid (Cash Collected by Delivery Staff)';
    }

    order.statusTimeline.push({
      stage: ORDER_STAGES.DELIVERED,
      time: new Date().toISOString(),
      note: 'OTP successfully verified on customer doorstep. Order completed.'
    });

    order.updatedAt = new Date().toISOString();
    this.saveAllOrders(orders);

    return { success: true, message: 'Delivery OTP verified successfully! Order marked as Delivered.' };
  },

  // Return & Cancellation Requests Management
  getAllReturnRequests() {
    try {
      const raw = localStorage.getItem(RETURNS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const initial = this.getSeedReturnRequests();
    this.saveAllReturnRequests(initial);
    return initial;
  },

  saveAllReturnRequests(reqs) {
    try {
      localStorage.setItem(RETURNS_KEY, JSON.stringify(reqs));
    } catch (e) {
      console.error('Error saving return requests', e);
    }
  },

  submitReturnOrCancel(orderId, customerId, type, reason, details = '') {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, message: 'Order not found' };

    // Eligibility check
    if (type === 'cancellation') {
      if ([ORDER_STAGES.OUT_FOR_DELIVERY, ORDER_STAGES.DELIVERED, ORDER_STAGES.CANCELLED].includes(order.status)) {
        return { success: false, message: `Orders in "${order.status}" status cannot be cancelled directly. Please submit a Return Request after delivery.` };
      }
    } else if (type === 'return') {
      if (order.status !== ORDER_STAGES.DELIVERED) {
        return { success: false, message: 'Return requests can only be submitted for delivered orders.' };
      }
    }

    const reqs = this.getAllReturnRequests();
    const newReq = {
      id: (type === 'cancellation' ? 'CAN-' : 'RET-') + Math.floor(10000 + Math.random() * 90000),
      orderId: order.id,
      customerId: customerId,
      customerName: order.customerName,
      customerPhone: order.phone,
      type: type, // 'cancellation' or 'return'
      reason: reason,
      details: details,
      status: 'Submitted', // Submitted, Under Review, Approved, Rejected, Refund Pending, Refunded
      refundAmount: order.grandTotal,
      submittedAt: new Date().toISOString(),
      resolvedAt: null,
      ownerNotes: ''
    };

    reqs.unshift(newReq);
    this.saveAllReturnRequests(reqs);

    return { success: true, request: newReq };
  },

  resolveReturnRequest(requestId, newStatus, ownerNotes = '') {
    const reqs = this.getAllReturnRequests();
    const req = reqs.find(r => r.id === requestId);
    if (!req) return false;

    req.status = newStatus;
    req.ownerNotes = ownerNotes;
    req.resolvedAt = new Date().toISOString();
    this.saveAllReturnRequests(reqs);

    // If cancellation was approved, update order to Cancelled and restock
    if (newStatus === 'Approved') {
      if (req.type === 'cancellation') {
        this.updateOrderStatus(req.orderId, ORDER_STAGES.CANCELLED, `Cancellation approved by store owner: ${ownerNotes}`);
      } else if (req.type === 'return') {
        // Mark order refunded
        const orders = this.getAllOrders();
        const o = orders.find(ord => ord.id === req.orderId);
        if (o) {
          o.paymentStatus = 'Refunded';
          this.saveAllOrders(orders);
          // Restock good products
          if (typeof InventoryEngine !== 'undefined') {
            o.items.forEach(item => {
              InventoryEngine.recordStockRestoration(item.id, item.quantity, o.id, 'Return processed');
            });
          }
        }
      }
    }

    return true;
  },

  // Seed Initial Orders
  getSeedOrders() {
    const now = Date.now();
    return [
      {
        id: 'FC-849201',
        invoiceNumber: 'INV-2026-849201',
        customerId: 'usr_cust_001',
        customerName: 'Ananya Sharma',
        customerEmail: 'customer@freshcart.com',
        phone: '9876543210',
        deliveryAddress: 'Flat 402, Green Palm Residency, 14th Main Road, HSR Layout Sector 2, Bengaluru - 560102',
        landmark: 'Near BDA Complex',
        city: 'Bengaluru',
        postalCode: '560102',
        deliveryDate: new Date(now).toISOString().split('T')[0],
        deliverySlotId: 2,
        deliverySlotText: '09:00 AM - 11:00 AM (Morning Slot)',
        specialInstructions: 'Ring doorbell twice. Please leave at front door if not answered.',
        items: [
          { id: 1, name: 'Royal Shimla Red Apples', price: 180, costPrice: 130, quantity: 2, unit: '1 kg', lineTotal: 360, isPacked: true, packedAt: new Date(now - 8 * 60000).toISOString() },
          { id: 9, name: 'Pure A2 Gir Cow Fresh Milk', price: 85, costPrice: 60, quantity: 2, unit: '1 Litre bottle', lineTotal: 170, isPacked: true, packedAt: new Date(now - 6 * 60000).toISOString() }
        ],
        subtotal: 530,
        discount: 50,
        deliveryFee: 0,
        cgst: 12,
        sgst: 12,
        grandTotal: 504,
        status: ORDER_STAGES.PACKED,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Pending (COD)',
        deliveryOtp: '482915',
        otpAttempts: 0,
        isOtpVerified: false,
        assignedWorkerId: 'usr_worker_001',
        assignedWorkerName: 'Suresh Kumar',
        estimatedPrepMinutes: 30,
        packingDeadline: new Date(now + 15 * 60000).toISOString(),
        createdAt: new Date(now - 25 * 60000).toISOString(),
        updatedAt: new Date(now - 5 * 60000).toISOString(),
        statusTimeline: [
          { stage: ORDER_STAGES.NEW, time: new Date(now - 25 * 60000).toISOString(), note: 'Order placed by customer.' },
          { stage: ORDER_STAGES.CONFIRMED, time: new Date(now - 20 * 60000).toISOString(), note: 'Confirmed by store owner.' },
          { stage: ORDER_STAGES.PACKING, time: new Date(now - 15 * 60000).toISOString(), note: 'Suresh Kumar started packing.' },
          { stage: ORDER_STAGES.PACKED, time: new Date(now - 5 * 60000).toISOString(), note: 'All items checked and sealed.' }
        ]
      },
      {
        id: 'FC-721940',
        invoiceNumber: 'INV-2026-721940',
        customerId: 'usr_cust_001',
        customerName: 'Ananya Sharma',
        customerEmail: 'customer@freshcart.com',
        phone: '9876543210',
        deliveryAddress: 'Flat 402, Green Palm Residency, 14th Main Road, HSR Layout Sector 2, Bengaluru - 560102',
        landmark: '',
        city: 'Bengaluru',
        postalCode: '560102',
        deliveryDate: new Date(now).toISOString().split('T')[0],
        deliverySlotId: 4,
        deliverySlotText: '04:00 PM - 06:00 PM (Evening Slot)',
        specialInstructions: 'Please ensure fresh vegetables are crisp.',
        items: [
          { id: 5, name: 'Farm-Fresh Green Broccoli', price: 75, costPrice: 50, quantity: 2, unit: '500 g', lineTotal: 150, isPacked: false },
          { id: 6, name: 'Vine-Ripened Hybrid Tomatoes', price: 40, costPrice: 28, quantity: 3, unit: '1 kg', lineTotal: 120, isPacked: false },
          { id: 25, name: 'Royal Aged Long Grain Basmati', price: 340, costPrice: 245, quantity: 1, unit: '2 kg bag', lineTotal: 340, isPacked: false }
        ],
        subtotal: 610,
        discount: 61,
        deliveryFee: 0,
        cgst: 13.72,
        sgst: 13.72,
        grandTotal: 576.44,
        status: ORDER_STAGES.NEW,
        paymentMethod: 'Online Payment (Demo)',
        paymentStatus: 'Paid (Online Demo)',
        deliveryOtp: '739201',
        otpAttempts: 0,
        isOtpVerified: false,
        assignedWorkerId: null,
        assignedWorkerName: null,
        estimatedPrepMinutes: 45,
        packingDeadline: new Date(now + 45 * 60000).toISOString(),
        createdAt: new Date(now - 5 * 60000).toISOString(),
        updatedAt: new Date(now - 5 * 60000).toISOString(),
        statusTimeline: [
          { stage: ORDER_STAGES.NEW, time: new Date(now - 5 * 60000).toISOString(), note: 'Order placed with Demo Online Payment.' }
        ]
      },
      {
        id: 'FC-510923',
        invoiceNumber: 'INV-2026-510923',
        customerId: 'usr_cust_001',
        customerName: 'Ananya Sharma',
        customerEmail: 'customer@freshcart.com',
        phone: '9876543210',
        deliveryAddress: 'Flat 402, Green Palm Residency, 14th Main Road, HSR Layout Sector 2, Bengaluru - 560102',
        landmark: '',
        city: 'Bengaluru',
        postalCode: '560102',
        deliveryDate: new Date(now - 24 * 3600000).toISOString().split('T')[0],
        deliverySlotId: 1,
        deliverySlotText: '07:00 AM - 09:00 AM (Morning Express)',
        items: [
          { id: 13, name: 'Artisanal Sourdough Country Loaf', price: 120, costPrice: 80, quantity: 1, unit: '400 g', lineTotal: 120, isPacked: true },
          { id: 10, name: 'Traditional Cultured Salted Butter', price: 110, costPrice: 78, quantity: 2, unit: '200 g block', lineTotal: 220, isPacked: true }
        ],
        subtotal: 340,
        discount: 0,
        deliveryFee: 40,
        cgst: 8.5,
        sgst: 8.5,
        grandTotal: 397,
        status: ORDER_STAGES.DELIVERED,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Paid (Cash Collected by Delivery Staff)',
        deliveryOtp: '629144',
        otpAttempts: 1,
        isOtpVerified: true,
        deliveredAt: new Date(now - 22 * 3600000).toISOString(),
        assignedWorkerId: 'usr_worker_001',
        assignedWorkerName: 'Suresh Kumar',
        createdAt: new Date(now - 25 * 3600000).toISOString(),
        updatedAt: new Date(now - 22 * 3600000).toISOString(),
        statusTimeline: [
          { stage: ORDER_STAGES.DELIVERED, time: new Date(now - 22 * 3600000).toISOString(), note: 'Delivery OTP verified. Order completed.' }
        ]
      }
    ];
  },

  getSeedReturnRequests() {
    return [
      {
        id: 'RET-10924',
        orderId: 'FC-510923',
        customerId: 'usr_cust_001',
        customerName: 'Ananya Sharma',
        customerPhone: '9876543210',
        type: 'return',
        reason: 'Packaging damaged during delivery',
        details: 'One butter block was dented and package seal was loose on delivery.',
        status: 'Submitted',
        refundAmount: 110,
        submittedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        resolvedAt: null,
        ownerNotes: ''
      }
    ];
  }
};

window.OrdersEngine = OrdersEngine;
