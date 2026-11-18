/**
 * FreshCart - Worker Portal Fulfillment & Logistics Engine
 * Manages worker dashboard, packing checklists, product issue reporting,
 * delivery workflow with OTP verification, and daily attendance.
 */

const ATTENDANCE_KEY = 'freshcart_attendance_v2';

const WorkerEngine = {
  // Get currently logged-in worker profile
  getWorker() {
    const user = window.AuthEngine ? AuthEngine.getCurrentUser() : null;
    return (user && (user.role === 'worker' || user.role === 'owner')) ? user : null;
  },

  // Get orders assigned to the current worker
  getMyAssignedOrders() {
    const worker = this.getWorker();
    if (!worker) return [];
    const all = typeof OrdersEngine !== 'undefined' ? OrdersEngine.getAllOrders() : [];
    return all.filter(o => o.assignedWorkerId === worker.id || worker.role === 'owner');
  },

  // Worker Availability Toggle
  updateAvailability(newStatus) {
    if (window.AuthEngine) {
      AuthEngine.setWorkerStatus(newStatus);
      if (typeof showToast === 'function') {
        showToast('Status Updated', `Your availability is now set to "${newStatus.toUpperCase()}".`, 'info');
      }
    }
  },

  // Accept Order Assignment
  acceptOrder(orderId) {
    if (typeof OrdersEngine !== 'undefined') {
      const success = OrdersEngine.updateOrderStatus(orderId, 'Preparing', 'Order accepted by fulfillment specialist.');
      if (success && typeof showToast === 'function') {
        showToast('Order Accepted', `Order #${orderId} accepted. You may now begin packing.`, 'success');
      }
      return success;
    }
    return false;
  },

  // Start Packing
  startPacking(orderId) {
    if (typeof OrdersEngine !== 'undefined') {
      const success = OrdersEngine.updateOrderStatus(orderId, 'Packing', 'Fulfillment staff started packing products.');
      if (success && typeof showToast === 'function') {
        showToast('Packing Started', `Packing checklist initiated for #${orderId}.`, 'info');
      }
      return success;
    }
    return false;
  },

  // Toggle item packed status in checklist
  toggleItem(orderId, itemId, checked) {
    if (typeof OrdersEngine !== 'undefined') {
      return OrdersEngine.toggleItemPacked(orderId, itemId, checked);
    }
    return false;
  },

  // Mark Order as Fully Packed
  completePacking(orderId) {
    const order = typeof OrdersEngine !== 'undefined' ? OrdersEngine.getOrderById(orderId) : null;
    if (!order) return false;

    // Check if any unpacked items remain
    const unpacked = order.items.filter(i => !i.isPacked && !i.isMissing);
    if (unpacked.length > 0) {
      alert(`Cannot mark complete: ${unpacked.length} item(s) are not yet marked as packed or reported.`);
      return false;
    }

    const success = OrdersEngine.updateOrderStatus(orderId, 'Packed', 'All items packed and verified by fulfillment staff.');
    if (success && typeof showToast === 'function') {
      showToast('Packing Complete', `Order #${orderId} is packed and ready for dispatch!`, 'success');
    }
    return success;
  },

  // Start Out For Delivery
  startDelivery(orderId) {
    if (typeof OrdersEngine !== 'undefined') {
      const success = OrdersEngine.updateOrderStatus(orderId, 'Ready for Delivery', 'Order is out for doorstep delivery with staff.');
      if (success && typeof showToast === 'function') {
        showToast('Out for Delivery', `Order #${orderId} is now out for delivery.`, 'info');
      }
      return success;
    }
    return false;
  },

  // Verify Customer OTP and Mark Delivered
  verifyAndDeliver(orderId, otpInput) {
    if (!otpInput || otpInput.trim().length !== 6) {
      return { success: false, message: 'Please enter a valid 6-digit verification OTP.' };
    }

    if (typeof OrdersEngine !== 'undefined') {
      const result = OrdersEngine.verifyDeliveryOtp(orderId, otpInput.trim());
      if (result.success && typeof showToast === 'function') {
        showToast('Delivered Successfully!', `Order #${orderId} verified and marked as delivered.`, 'success');
      }
      return result;
    }
    return { success: false, message: 'OrdersEngine not loaded' };
  },

  // Report Damaged or Missing Product Modal
  promptItemIssueModal(orderId, itemId, itemName) {
    let modal = document.getElementById('item-issue-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'item-issue-modal';
      modal.className = 'fresh-modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="fresh-modal-dialog">
        <div class="fresh-modal-header" style="background:#c62828; color:white;">
          <h3 style="color:white; margin:0;"><i class="fas fa-triangle-exclamation"></i> Report Item Issue</h3>
          <button class="modal-close-btn" style="color:white;" onclick="document.getElementById('item-issue-modal').style.display='none'">&times;</button>
        </div>
        <div class="fresh-modal-body">
          <p style="margin-bottom:12px;">Reporting issue for: <strong>${itemName}</strong> (Order #${orderId})</p>
          <div class="form-group" style="margin-bottom:12px;">
            <label style="font-weight:600; display:block; margin-bottom:4px;">Issue Reason</label>
            <select id="issue-reason-select" class="form-control" style="width:100%; padding:8px 12px; border:1px solid #ccc; border-radius:6px;">
              <option value="Out of Stock on Store Shelves">Out of Stock on Store Shelves</option>
              <option value="Damaged / Freshness Defect">Damaged / Freshness Defect</option>
              <option value="Expired / Past Best Before Date">Expired / Past Best Before Date</option>
              <option value="Packaging Broken">Packaging Broken</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:16px;">
            <label style="font-weight:600; display:block; margin-bottom:4px;">Proposed Substitute Product (Requires Owner Approval)</label>
            <input type="text" id="issue-substitute-input" class="form-control" placeholder="e.g. Organic Shimla Apples 1kg instead of regular" style="width:100%; padding:8px 12px; border:1px solid #ccc; border-radius:6px;">
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn btn-outline" onclick="document.getElementById('item-issue-modal').style.display='none'">Cancel</button>
            <button class="btn btn-primary" style="background:#c62828; border-color:#c62828;" onclick="WorkerEngine.submitItemIssue('${orderId}', '${itemId}')">Submit to Owner</button>
          </div>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  },

  submitItemIssue(orderId, itemId) {
    const reason = document.getElementById('issue-reason-select')?.value;
    const substitute = document.getElementById('issue-substitute-input')?.value;
    
    if (typeof OrdersEngine !== 'undefined') {
      OrdersEngine.reportItemIssue(orderId, itemId, reason, substitute);
      document.getElementById('item-issue-modal').style.display = 'none';
      if (typeof showToast === 'function') {
        showToast('Issue Reported', 'Item flagged for owner review and customer approval.', 'warning');
      }
      setTimeout(() => window.location.reload(), 400);
    }
  },

  // --- ATTENDANCE SYSTEM ---
  getAllAttendance() {
    try {
      const raw = localStorage.getItem(ATTENDANCE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const initial = this.getSeedAttendance();
    this.saveAllAttendance(initial);
    return initial;
  },

  saveAllAttendance(records) {
    try {
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Error saving attendance', e);
    }
  },

  getTodayAttendance(workerId) {
    const all = this.getAllAttendance();
    const todayIso = new Date().toISOString().split('T')[0];
    return all.find(a => a.workerId === workerId && a.workDate === todayIso) || null;
  },

  checkIn() {
    const worker = this.getWorker();
    if (!worker) return { success: false, message: 'Please sign in first.' };

    const todayIso = new Date().toISOString().split('T')[0];
    const existing = this.getTodayAttendance(worker.id);

    if (existing && existing.checkIn) {
      return { success: false, message: `You have already checked in today at ${new Date(existing.checkIn).toLocaleTimeString()}.` };
    }

    const all = this.getAllAttendance();
    const newRecord = {
      id: 'att_' + Date.now(),
      workerId: worker.id,
      workerName: worker.name,
      employeeId: worker.employeeId || 'EMP-101',
      workDate: todayIso,
      checkIn: new Date().toISOString(),
      checkOut: null,
      workingHours: null,
      status: 'Present',
      notes: 'Morning shift on-time'
    };

    all.unshift(newRecord);
    this.saveAllAttendance(all);
    this.updateAvailability('available');

    return { success: true, record: newRecord };
  },

  checkOut() {
    const worker = this.getWorker();
    if (!worker) return { success: false, message: 'Please sign in first.' };

    const todayIso = new Date().toISOString().split('T')[0];
    const all = this.getAllAttendance();
    const record = all.find(a => a.workerId === worker.id && a.workDate === todayIso);

    if (!record || !record.checkIn) {
      return { success: false, message: 'No check-in record found for today. Please check in first.' };
    }

    if (record.checkOut) {
      return { success: false, message: `You have already checked out today at ${new Date(record.checkOut).toLocaleTimeString()}.` };
    }

    const now = new Date();
    const checkInTime = new Date(record.checkIn);
    const diffHours = Math.max(0.1, (now - checkInTime) / 3600000);

    record.checkOut = now.toISOString();
    record.workingHours = Number(diffHours.toFixed(2));
    this.saveAllAttendance(all);
    this.updateAvailability('offline');

    return { success: true, record: record };
  },

  getSeedAttendance() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    return [
      {
        id: 'att_01',
        workerId: 'usr_worker_001',
        workerName: 'Suresh Kumar',
        employeeId: 'EMP-101',
        workDate: today.toISOString().split('T')[0],
        checkIn: new Date(today.setHours(8, 0, 0, 0)).toISOString(),
        checkOut: null,
        workingHours: null,
        status: 'Present',
        notes: 'Active shift'
      },
      {
        id: 'att_02',
        workerId: 'usr_worker_001',
        workerName: 'Suresh Kumar',
        employeeId: 'EMP-101',
        workDate: yesterday.toISOString().split('T')[0],
        checkIn: new Date(yesterday.setHours(8, 15, 0, 0)).toISOString(),
        checkOut: new Date(yesterday.setHours(17, 30, 0, 0)).toISOString(),
        workingHours: 9.25,
        status: 'Present',
        notes: 'Full shift completed'
      },
      {
        id: 'att_03',
        workerId: 'usr_worker_002',
        workerName: 'Ramesh Patel',
        employeeId: 'EMP-102',
        workDate: today.toISOString().split('T')[0],
        checkIn: new Date(today.setHours(8, 30, 0, 0)).toISOString(),
        checkOut: null,
        workingHours: null,
        status: 'Present',
        notes: 'Packing station'
      }
    ];
  }
};

window.WorkerEngine = WorkerEngine;
