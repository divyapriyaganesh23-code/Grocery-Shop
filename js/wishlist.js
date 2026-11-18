/**
 * FreshCart - Wishlist Engine
 * Handles saving favorites, toggling items, moving items to the cart,
 * and maintaining user-specific wishlist across sessions.
 */

const WISHLIST_STORAGE_KEY = 'freshcart_wishlist_v2';

const WishlistEngine = {
  getStorageKey() {
    const user = window.AuthEngine ? AuthEngine.getCurrentUser() : null;
    return user ? `${WISHLIST_STORAGE_KEY}_${user.id}` : `${WISHLIST_STORAGE_KEY}_guest`;
  },

  getItems() {
    try {
      const raw = localStorage.getItem(this.getStorageKey());
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  saveItems(items) {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(items));
      this.updateBadges();
    } catch (e) {
      console.error('WishlistEngine: Error saving', e);
    }
  },

  isInWishlist(productId) {
    const items = this.getItems();
    return items.some(item => Number(item.id) === Number(productId));
  },

  toggle(product) {
    if (!product || !product.id) return false;
    let items = this.getItems();
    const existingIndex = items.findIndex(i => Number(i.id) === Number(product.id));

    if (existingIndex > -1) {
      items.splice(existingIndex, 1);
      this.saveItems(items);
      if (typeof showToast === 'function') {
        showToast('Removed from Wishlist', `"${product.name}" has been removed from your saved items.`, 'info');
      }
      this.updateAllHeartIcons(product.id, false);
      return false; // Removed
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        category: product.category,
        image: product.image || product.localImage || 'images/categories/fruits.svg',
        unit: product.unit || '1 unit',
        inStock: product.stock !== undefined ? product.stock > 0 : true,
        addedAt: new Date().toISOString()
      });
      this.saveItems(items);
      if (typeof showToast === 'function') {
        showToast('Saved to Wishlist', `"${product.name}" added to your wishlist!`, 'success');
      }
      this.updateAllHeartIcons(product.id, true);
      return true; // Added
    }
  },

  remove(productId) {
    let items = this.getItems();
    items = items.filter(i => Number(i.id) !== Number(productId));
    this.saveItems(items);
    this.updateAllHeartIcons(productId, false);
    if (typeof showToast === 'function') {
      showToast('Removed', 'Product removed from your wishlist.', 'info');
    }
  },

  moveToCart(productId) {
    const items = this.getItems();
    const item = items.find(i => Number(i.id) === Number(productId));
    if (!item) return;

    if (typeof addToCart === 'function') {
      addToCart(productId, 1);
      this.remove(productId);
    } else if (window.CartEngine) {
      window.CartEngine.addItem(item, 1);
      this.remove(productId);
    }
  },

  updateAllHeartIcons(productId, isWishlisted) {
    const buttons = document.querySelectorAll(`[data-wishlist-id="${productId}"]`);
    buttons.forEach(btn => {
      const icon = btn.querySelector('i');
      if (isWishlisted) {
        btn.classList.add('active');
        if (icon) {
          icon.classList.remove('far');
          icon.classList.add('fas');
          icon.style.color = '#e53935';
        }
      } else {
        btn.classList.remove('active');
        if (icon) {
          icon.classList.remove('fas');
          icon.classList.add('far');
          icon.style.color = '';
        }
      }
    });
  },

  updateBadges() {
    const items = this.getItems();
    const badges = document.querySelectorAll('.wishlist-count-badge');
    badges.forEach(b => {
      b.textContent = items.length;
      b.style.display = items.length > 0 ? 'inline-flex' : 'none';
    });
  }
};

window.WishlistEngine = WishlistEngine;
window.toggleWishlist = (productId) => {
  // If product details aren't provided, search catalog
  let product = null;
  if (typeof getProductById === 'function') {
    product = getProductById(productId);
  } else if (typeof INITIAL_PRODUCTS !== 'undefined') {
    product = INITIAL_PRODUCTS.find(p => Number(p.id) === Number(productId));
  }
  if (product) {
    WishlistEngine.toggle(product);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  WishlistEngine.updateBadges();
});
