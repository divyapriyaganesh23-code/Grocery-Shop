/**
 * FreshCart - Owner Business Intelligence & Management Engine
 * Financial analytics, order dispatch, employee provisioning,
 * inventory management, and profit & loss auditing.
 */

const OwnerEngine = {
  // Validate owner session
  checkAuth() {
    if (window.AuthEngine) {
      return AuthEngine.requireRole(['owner'], 'owner-login.html');
    }
    return true;
  },

  // Calculate comprehensive business metrics with real accounting formulas
  getBusinessMetrics() {
    const orders = typeof OrdersEngine !== 'undefined' ? OrdersEngine.getAllOrders() : [];
    const expenses = typeof InventoryEngine !== 'undefined' ? InventoryEngine.getExpenses() : [];
    const products = typeof getProductsFromStorage === 'function' ? getProductsFromStorage() : [];
    const users = typeof AuthEngine !== 'undefined' ? AuthEngine.getAllUsers() : [];

    const todayIso = new Date().toISOString().split('T')[0];

    let totalRevenue = 0;
    let totalDiscount = 0;
    let totalCOGS = 0;
    let totalOrders = orders.length;
    let todayOrdersCount = 0;
    let pendingOrdersCount = 0;
    let completedOrdersCount = 0;
    let refundedAmount = 0;

    orders.forEach(order => {
      // Exclude cancelled from active revenue
      if (order.status !== 'Cancelled') {
        const subtotal = Number(order.subtotal || 0);
        const discount = Number(order.discount || 0);
        totalRevenue += subtotal;
        totalDiscount += discount;

        // Calculate Cost of Goods Sold for items
        order.items.forEach(item => {
          const cost = Number(item.costPrice || (item.price * 0.72));
          totalCOGS += (cost * item.quantity);
        });

        if (order.paymentStatus === 'Refunded') {
          refundedAmount += Number(order.grandTotal || 0);
        }
      }

      if (order.createdAt && order.createdAt.startsWith(todayIso)) {
        todayOrdersCount++;
      }

      if (['New Order', 'Confirmed', 'Preparing', 'Packing'].includes(order.status)) {
        pendingOrdersCount++;
      } else if (order.status === 'Delivered') {
        completedOrdersCount++;
      }
    });

    // Operating expenses
    let totalOperatingExpenses = 0;
    expenses.forEach(e => {
      totalOperatingExpenses += Number(e.amount || 0);
    });

    // Accurate Financial Formulas
    const netSales = Math.max(0, totalRevenue - totalDiscount - refundedAmount);
    const grossProfit = Math.max(0, netSales - totalCOGS);
    const netProfit = grossProfit - totalOperatingExpenses;

    // Workers count
    const workers = users.filter(u => u.role === 'worker');
    const activeWorkers = workers.filter(w => w.isActive !== false);

    // Low stock count
    const lowStockItems = products.filter(p => p.stock <= (p.lowStockThreshold || 5));

    return {
      totalOrders,
      todayOrdersCount,
      pendingOrdersCount,
      completedOrdersCount,
      totalRevenue,
      netSales,
      totalCOGS,
      grossProfit,
      totalOperatingExpenses,
      netProfit,
      totalEmployees: workers.length,
      activeEmployees: activeWorkers.length,
      lowStockCount: lowStockItems.length,
      lowStockItems
    };
  },

  // Quick Order Assignment to Worker
  assignOrder(orderId, workerId, prepMinutes = 40) {
    const users = typeof AuthEngine !== 'undefined' ? AuthEngine.getAllUsers() : [];
    const worker = users.find(u => u.id === workerId);
    if (!worker) return { success: false, message: 'Invalid worker selected' };

    if (typeof OrdersEngine !== 'undefined') {
      return OrdersEngine.assignWorker(orderId, worker.id, worker.name, prepMinutes);
    }
    return { success: false, message: 'OrdersEngine not loaded' };
  },

  // Add Product to Catalog
  createProduct(data) {
    const products = typeof getProductsFromStorage === 'function' ? getProductsFromStorage() : [];
    const nextId = products.length > 0 ? Math.max(...products.map(p => Number(p.id) || 0)) + 1 : 1;

    const newProd = {
      id: nextId,
      name: data.name.trim(),
      category: data.category,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : Number(data.price),
      costPrice: data.costPrice ? Number(data.costPrice) : Math.round(Number(data.price) * 0.72),
      discount: data.discount || '',
      unit: data.unit || '1 unit',
      rating: 4.8,
      reviewsCount: 1,
      stock: Number(data.stock),
      lowStockThreshold: data.lowStockThreshold ? Number(data.lowStockThreshold) : 5,
      inStock: Number(data.stock) > 0,
      description: data.description || '',
      highlights: data.highlights ? data.highlights.split(',').map(s => s.trim()) : [],
      nutrition: { calories: '50 kcal', carbs: '10g', protein: '1g', fat: '0g' },
      origin: 'Karnataka, India',
      storage: 'Keep in a cool dry place.',
      shelfLife: '5-7 days',
      image: data.image || 'images/categories/fruits.svg',
      localImage: data.image || 'images/categories/fruits.svg',
      featured: data.featured || false,
      popular: data.popular || false
    };

    products.push(newProd);
    if (typeof saveProductsToStorage === 'function') saveProductsToStorage(products);

    if (typeof InventoryEngine !== 'undefined') {
      InventoryEngine.manualStockAdjustment(newProd.id, newProd.stock, 'Initial product creation');
    }

    return newProd;
  },

  // Update Existing Product
  updateProduct(productId, updates) {
    const products = typeof getProductsFromStorage === 'function' ? getProductsFromStorage() : [];
    const idx = products.findIndex(p => Number(p.id) === Number(productId));
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...updates };
      products[idx].inStock = Number(products[idx].stock) > 0;
      if (typeof saveProductsToStorage === 'function') saveProductsToStorage(products);
      return products[idx];
    }
    return null;
  },

  // Delete Product
  deleteProduct(productId) {
    let products = typeof getProductsFromStorage === 'function' ? getProductsFromStorage() : [];
    products = products.filter(p => Number(p.id) !== Number(productId));
    if (typeof saveProductsToStorage === 'function') saveProductsToStorage(products);
    return true;
  }
};

window.OwnerEngine = OwnerEngine;
