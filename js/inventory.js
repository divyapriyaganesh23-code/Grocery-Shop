/**
 * FreshCart - Inventory, Suppliers, Purchases & Expenses Engine
 * Manages physical stock levels, stock movement audits, supplier master,
 * purchase orders, operating expenses, and accurate COGS calculations.
 */

const SUPPLIERS_KEY = 'freshcart_suppliers_v2';
const PURCHASES_KEY = 'freshcart_purchases_v2';
const EXPENSES_KEY = 'freshcart_expenses_v2';
const STOCK_AUDIT_KEY = 'freshcart_stock_movements_v2';

const InventoryEngine = {
  // --- STOCK MOVEMENTS AUDIT LOG ---
  getStockMovements() {
    try {
      const raw = localStorage.getItem(STOCK_AUDIT_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const initial = this.getSeedStockMovements();
    this.saveStockMovements(initial);
    return initial;
  },

  saveStockMovements(movements) {
    try {
      localStorage.setItem(STOCK_AUDIT_KEY, JSON.stringify(movements));
    } catch (e) {
      console.error('InventoryEngine: Error saving stock movements', e);
    }
  },

  recordStockDeduction(productId, quantity, referenceId, notes) {
    const products = typeof getProductsFromStorage === 'function' ? getProductsFromStorage() : [];
    const prod = products.find(p => Number(p.id) === Number(productId));
    if (!prod) return;

    prod.stock = Math.max(0, prod.stock - quantity);
    prod.inStock = prod.stock > 0;
    if (typeof saveProductsToStorage === 'function') saveProductsToStorage(products);

    const movements = this.getStockMovements();
    movements.unshift({
      id: 'mov_' + Date.now(),
      productId: Number(productId),
      productName: prod.name,
      type: 'Order Deduction',
      change: -quantity,
      stockAfter: prod.stock,
      referenceId: referenceId,
      notes: notes,
      timestamp: new Date().toISOString()
    });
    this.saveStockMovements(movements);
  },

  recordStockRestoration(productId, quantity, referenceId, notes) {
    const products = typeof getProductsFromStorage === 'function' ? getProductsFromStorage() : [];
    const prod = products.find(p => Number(p.id) === Number(productId));
    if (!prod) return;

    prod.stock += quantity;
    prod.inStock = prod.stock > 0;
    if (typeof saveProductsToStorage === 'function') saveProductsToStorage(products);

    const movements = this.getStockMovements();
    movements.unshift({
      id: 'mov_' + Date.now(),
      productId: Number(productId),
      productName: prod.name,
      type: 'Order Restocked',
      change: quantity,
      stockAfter: prod.stock,
      referenceId: referenceId,
      notes: notes,
      timestamp: new Date().toISOString()
    });
    this.saveStockMovements(movements);
  },

  manualStockAdjustment(productId, newStock, notes = 'Manual stock adjustment') {
    const products = typeof getProductsFromStorage === 'function' ? getProductsFromStorage() : [];
    const prod = products.find(p => Number(p.id) === Number(productId));
    if (!prod) return false;

    const diff = newStock - prod.stock;
    prod.stock = Math.max(0, newStock);
    prod.inStock = prod.stock > 0;
    if (typeof saveProductsToStorage === 'function') saveProductsToStorage(products);

    const movements = this.getStockMovements();
    movements.unshift({
      id: 'mov_' + Date.now(),
      productId: Number(productId),
      productName: prod.name,
      type: diff >= 0 ? 'Manual Restock' : 'Stock Write-off',
      change: diff,
      stockAfter: prod.stock,
      referenceId: 'MANUAL',
      notes: notes,
      timestamp: new Date().toISOString()
    });
    this.saveStockMovements(movements);
    return true;
  },

  // --- SUPPLIERS MANAGEMENT ---
  getSuppliers() {
    try {
      const raw = localStorage.getItem(SUPPLIERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const initial = this.getSeedSuppliers();
    this.saveSuppliers(initial);
    return initial;
  },

  saveSuppliers(suppliers) {
    try {
      localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
    } catch (e) {
      console.error('Error saving suppliers', e);
    }
  },

  addSupplier(data) {
    const list = this.getSuppliers();
    const newSup = {
      id: 'SUP-' + Math.floor(100 + Math.random() * 900),
      name: data.name.trim(),
      contactPerson: data.contactPerson.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      address: data.address.trim(),
      categories: data.categories || 'Fresh Produce',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    list.push(newSup);
    this.saveSuppliers(list);
    return newSup;
  },

  // --- PURCHASES (Incoming Inventory Orders) ---
  getPurchases() {
    try {
      const raw = localStorage.getItem(PURCHASES_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const initial = this.getSeedPurchases();
    this.savePurchases(initial);
    return initial;
  },

  savePurchases(purchases) {
    try {
      localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
    } catch (e) {
      console.error('Error saving purchases', e);
    }
  },

  recordPurchase(purchaseData) {
    const purchases = this.getPurchases();
    const newPurchase = {
      id: 'PO-2026-' + Math.floor(1000 + Math.random() * 9000),
      supplierId: purchaseData.supplierId,
      supplierName: purchaseData.supplierName,
      invoiceNumber: purchaseData.invoiceNumber || 'INV-SUP-' + Date.now().toString().slice(-4),
      purchaseDate: purchaseData.purchaseDate || new Date().toISOString().split('T')[0],
      items: purchaseData.items, // [{ productId, productName, quantity, unitCost, lineTotal }]
      totalAmount: purchaseData.totalAmount,
      paymentStatus: 'Paid',
      notes: purchaseData.notes || 'Inward stock consignment verified.',
      createdAt: new Date().toISOString()
    };

    // Increment physical stock in products catalog
    purchaseData.items.forEach(item => {
      this.manualStockAdjustment(item.productId, (this.getProductStock(item.productId) + item.quantity), `Purchase received from ${purchaseData.supplierName}`);
    });

    purchases.unshift(newPurchase);
    this.savePurchases(purchases);
    return newPurchase;
  },

  getProductStock(productId) {
    const products = typeof getProductsFromStorage === 'function' ? getProductsFromStorage() : [];
    const prod = products.find(p => Number(p.id) === Number(productId));
    return prod ? prod.stock : 0;
  },

  // --- EXPENSES (Operating Overheads) ---
  getExpenses() {
    try {
      const raw = localStorage.getItem(EXPENSES_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const initial = this.getSeedExpenses();
    this.saveExpenses(initial);
    return initial;
  },

  saveExpenses(expenses) {
    try {
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.error('Error saving expenses', e);
    }
  },

  addExpense(data) {
    const list = this.getExpenses();
    const newExp = {
      id: 'EXP-' + Math.floor(1000 + Math.random() * 9000),
      category: data.category, // Employee Wages, Electricity, Store Rent, Transportation, Packaging, Maintenance, Other
      title: data.title.trim(),
      amount: Number(data.amount),
      expenseDate: data.expenseDate || new Date().toISOString().split('T')[0],
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };
    list.unshift(newExp);
    this.saveExpenses(list);
    return newExp;
  },

  // --- SEED DATA ---
  getSeedSuppliers() {
    return [
      {
        id: 'SUP-101',
        name: 'Himachal Agro Orchards Ltd',
        contactPerson: 'Harish Mehta',
        phone: '9816012345',
        email: 'supply@himachalagro.com',
        address: 'Solan Fruit Terminal Market, Himachal Pradesh',
        categories: 'Fruits, Organic Berries',
        isActive: true,
        createdAt: '2025-01-10T00:00:00Z'
      },
      {
        id: 'SUP-102',
        name: 'Nilgiri Dairy & Artisanal Farms',
        contactPerson: 'C. Ramanathan',
        phone: '9443212345',
        email: 'sales@nilgiridairy.com',
        address: 'Ooty Road, Nilgiris District, Tamil Nadu',
        categories: 'Dairy Products, Artisanal Cheese, Butter',
        isActive: true,
        createdAt: '2025-02-14T00:00:00Z'
      },
      {
        id: 'SUP-103',
        name: 'Malnad Organic Spice Cooperatives',
        contactPerson: 'Girish Hegde',
        phone: '9845678901',
        email: 'contact@malnadspices.org',
        address: 'Sirsi, Uttara Kannada, Karnataka',
        categories: 'Spices, Whole Grains, Pulses',
        isActive: true,
        createdAt: '2025-03-01T00:00:00Z'
      }
    ];
  },

  getSeedPurchases() {
    return [
      {
        id: 'PO-2026-8812',
        supplierId: 'SUP-101',
        supplierName: 'Himachal Agro Orchards Ltd',
        invoiceNumber: 'INV-HAO-4491',
        purchaseDate: '2026-03-01',
        items: [
          { productId: 1, productName: 'Royal Shimla Red Apples', quantity: 50, unitCost: 130, lineTotal: 6500 },
          { productId: 3, productName: 'Nagpur Sweet Mandarin Oranges', quantity: 40, unitCost: 55, lineTotal: 2200 }
        ],
        totalAmount: 8700,
        paymentStatus: 'Paid',
        notes: 'Grading A+ quality verified upon delivery.',
        createdAt: '2026-03-01T10:00:00Z'
      },
      {
        id: 'PO-2026-8794',
        supplierId: 'SUP-102',
        supplierName: 'Nilgiri Dairy & Artisanal Farms',
        invoiceNumber: 'INV-NDA-1920',
        purchaseDate: '2026-03-05',
        items: [
          { productId: 9, productName: 'Pure A2 Gir Cow Fresh Milk', quantity: 60, unitCost: 60, lineTotal: 3600 },
          { productId: 10, productName: 'Traditional Cultured Salted Butter', quantity: 30, unitCost: 78, lineTotal: 2340 }
        ],
        totalAmount: 5940,
        paymentStatus: 'Paid',
        notes: 'Chilled delivery truck inspected at 4°C.',
        createdAt: '2026-03-05T08:00:00Z'
      }
    ];
  },

  getSeedExpenses() {
    return [
      { id: 'EXP-1001', category: 'Store Rent', title: 'HSR Layout Supermarket Facility Rent', amount: 35000, expenseDate: '2026-03-01', notes: 'Monthly lease payment' },
      { id: 'EXP-1002', category: 'Electricity', title: 'Walk-in Cold Storage & Retail Power Bill', amount: 8400, expenseDate: '2026-03-04', notes: 'BESCOM power charges' },
      { id: 'EXP-1003', category: 'Packaging', title: 'Eco-Friendly Paper Bags & Corrugated Boxes', amount: 3200, expenseDate: '2026-03-08', notes: '5,000 grocery bags' },
      { id: 'EXP-1004', category: 'Transportation', title: 'Delivery Fleet EV Charging & Maintenance', amount: 2600, expenseDate: '2026-03-10', notes: 'Local fulfillment van' }
    ];
  },

  getSeedStockMovements() {
    return [
      { id: 'mov_101', productId: 1, productName: 'Royal Shimla Red Apples', type: 'Purchase Inward', change: 50, stockAfter: 24, referenceId: 'PO-2026-8812', notes: 'Consignment received', timestamp: '2026-03-01T10:30:00Z' },
      { id: 'mov_102', productId: 9, productName: 'Pure A2 Gir Cow Fresh Milk', type: 'Purchase Inward', change: 60, stockAfter: 35, referenceId: 'PO-2026-8794', notes: 'Consignment received', timestamp: '2026-03-05T08:30:00Z' }
    ];
  }
};

window.InventoryEngine = InventoryEngine;
