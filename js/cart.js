/* ==========================================================================
   FoodiVerse Cart State & Drawer / Page Logic
   ========================================================================== */

const Cart = {
  items: JSON.parse(localStorage.getItem('foodiverse_cart')) || [],
  appliedPromo: JSON.parse(localStorage.getItem('foodiverse_promo')) || null,
  deliveryFee: 2.99,

  init() {
    this.renderCart();
    this.renderCartPage();
    this.bindEvents();
    this.updateBadge();
  },

  bindEvents() {
    // Open & close drawer triggers
    document.querySelectorAll('.cart-btn-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (window.location.pathname.endsWith('cart.html')) return;
        e.preventDefault();
        this.openDrawer();
      });
    });

    const closeBtn = document.getElementById('closeCartBtn');
    const overlay = document.getElementById('cartOverlay');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());
    if (overlay) overlay.addEventListener('click', () => this.closeDrawer());

    // Promo code apply
    const applyPromoBtn = document.getElementById('applyPromoBtn');
    const pageApplyPromoBtn = document.getElementById('pageApplyPromoBtn');
    if (applyPromoBtn) applyPromoBtn.addEventListener('click', () => this.applyPromoCode());
    if (pageApplyPromoBtn) pageApplyPromoBtn.addEventListener('click', () => this.applyPromoCode(true));

    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    const pageCheckoutBtn = document.getElementById('pageCheckoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
    if (pageCheckoutBtn) pageCheckoutBtn.addEventListener('click', () => this.proceedToCheckout());
  },

  openDrawer() {
    document.getElementById('cartDrawer')?.classList.add('active');
    document.getElementById('cartOverlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeDrawer() {
    document.getElementById('cartDrawer')?.classList.remove('active');
    document.getElementById('cartOverlay')?.classList.remove('active');
    document.body.style.overflow = '';
  },

  addItem(foodId, sizeIndex = 0, selectedToppingNames = []) {
    const food = FOOD_ITEMS.find(item => item.id === foodId);
    if (!food) return;

    const size = food.sizes ? food.sizes[sizeIndex] : null;
    const basePrice = food.price + (size ? size.priceOffset : 0);
    
    // Toppings total
    let toppingsTotal = 0;
    let toppingsList = [];
    if (food.toppings && selectedToppingNames.length > 0) {
      selectedToppingNames.forEach(tName => {
        const top = food.toppings.find(t => t.name === tName);
        if (top) {
          toppingsTotal += top.price;
          toppingsList.push(top.name);
        }
      });
    }

    const itemPrice = basePrice + toppingsTotal;
    // Clean key string without special characters or quotes
    const cleanSizeKey = size ? size.name.replace(/[^a-zA-Z0-9]/g, '') : 'std';
    const cleanToppingsKey = toppingsList.map(t => t.replace(/[^a-zA-Z0-9]/g, '')).sort().join('_');
    const itemKey = `${food.id}_${cleanSizeKey}_${cleanToppingsKey}`;

    const existingIndex = this.items.findIndex(item => item.cartKey === itemKey);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += 1;
    } else {
      this.items.push({
        cartKey: itemKey,
        id: food.id,
        name: food.name,
        image: food.image,
        sizeName: size ? size.name : '',
        toppingsText: toppingsList.join(', '),
        unitPrice: itemPrice,
        quantity: 1
      });
    }

    this.save();
    this.renderCart();
    this.renderCartPage();
    this.updateBadge();

    if (!window.location.pathname.endsWith('cart.html') && !window.location.pathname.endsWith('checkout.html')) {
      this.openDrawer();
    }
    
    if (window.showToast) {
      window.showToast(`Added ${food.name} to cart!`);
    }
  },

  removeItem(identifier) {
    if (typeof identifier === 'number') {
      this.items.splice(identifier, 1);
    } else {
      this.items = this.items.filter(item => item.cartKey !== identifier);
    }
    this.save();
    this.renderCart();
    this.renderCartPage();
    this.updateBadge();
    if (window.showToast) window.showToast('Item removed from cart');
  },

  clearCart() {
    if (this.items.length === 0) return;
    this.items = [];
    this.appliedPromo = null;
    this.save();
    this.renderCart();
    this.renderCartPage();
    this.updateBadge();
    if (window.showToast) window.showToast('Cart cleared!');
  },

  updateQty(identifier, delta) {
    let item = null;
    if (typeof identifier === 'number') {
      item = this.items[identifier];
    } else {
      item = this.items.find(i => i.cartKey === identifier);
    }

    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(identifier);
    } else {
      this.save();
      this.renderCart();
      this.renderCartPage();
      this.updateBadge();
    }
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  },

  getDiscount() {
    const subtotal = this.getSubtotal();
    if (!this.appliedPromo || subtotal === 0) return 0;
    
    if (this.appliedPromo.type === 'percent') {
      return subtotal * (this.appliedPromo.discount / 100);
    } else if (this.appliedPromo.type === 'shipping') {
      return this.deliveryFee;
    }
    return 0;
  },

  getTotal() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    const discount = this.getDiscount();
    const effectiveDelivery = (subtotal >= 35 || (this.appliedPromo && this.appliedPromo.type === 'shipping')) ? 0 : this.deliveryFee;
    const tax = (subtotal - discount) * 0.08;
    return Math.max(0, subtotal - discount + effectiveDelivery + tax);
  },

  applyPromoCode(isPage = false) {
    const inputId = isPage ? 'pagePromoCodeInput' : 'promoCodeInput';
    const input = document.getElementById(inputId);
    if (!input) return;
    const code = input.value.trim().toUpperCase();

    if (!code) {
      if (window.showToast) window.showToast('Please enter a promo code');
      return;
    }

    if (PROMO_CODES[code]) {
      const promo = PROMO_CODES[code];
      const subtotal = this.getSubtotal();
      if (subtotal < promo.minOrder) {
        if (window.showToast) window.showToast(`Minimum order for code ${code} is $${promo.minOrder}`);
        return;
      }
      this.appliedPromo = { code, ...promo };
      this.save();
      this.renderCart();
      this.renderCartPage();
      if (window.showToast) window.showToast(`Promo code ${code} applied!`);
    } else {
      if (window.showToast) window.showToast('Invalid promo code');
    }
  },

  save() {
    localStorage.setItem('foodiverse_cart', JSON.stringify(this.items));
    localStorage.setItem('foodiverse_promo', JSON.stringify(this.appliedPromo));
  },

  updateBadge() {
    const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  renderCart() {
    const cartContainer = document.getElementById('cartItemsList');
    if (!cartContainer) return;

    if (this.items.length === 0) {
      cartContainer.innerHTML = `
        <div class="cart-empty">
          <i class="fa-solid fa-basket-shopping"></i>
          <h4>Your cart is empty</h4>
          <p>Add some delicious meals to get started!</p>
        </div>
      `;
      document.getElementById('cartSubtotal').textContent = '$0.00';
      document.getElementById('cartDiscount').textContent = '-$0.00';
      document.getElementById('cartDelivery').textContent = '$0.00';
      document.getElementById('cartTax').textContent = '$0.00';
      document.getElementById('cartTotal').textContent = '$0.00';
      return;
    }

    let html = '';
    this.items.forEach((item, idx) => {
      html += `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            ${item.sizeName ? `<div style="font-size:0.75rem; color:var(--text-muted);">${item.sizeName}</div>` : ''}
            ${item.toppingsText ? `<div style="font-size:0.72rem; color:var(--primary-accent);">+ ${item.toppingsText}</div>` : ''}
            <div class="cart-item-price">$${(item.unitPrice * item.quantity).toFixed(2)}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="Cart.updateQty(${idx}, -1)"><i class="fa-solid fa-minus"></i></button>
              <span style="font-weight:700; font-size:0.85rem;">${item.quantity}</span>
              <button class="qty-btn" onclick="Cart.updateQty(${idx}, 1)"><i class="fa-solid fa-plus"></i></button>
            </div>
          </div>
          <button class="cart-item-remove" onclick="Cart.removeItem(${idx})" title="Remove Item">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    });

    cartContainer.innerHTML = html;

    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const effectiveDelivery = subtotal >= 35 ? 0 : (this.appliedPromo && this.appliedPromo.type === 'shipping' ? 0 : this.deliveryFee);
    const tax = (subtotal - discount) * 0.08;
    const total = Math.max(0, subtotal - discount + effectiveDelivery + tax);

    document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cartDiscount').textContent = `-$${discount.toFixed(2)}`;
    document.getElementById('cartDelivery').textContent = effectiveDelivery === 0 ? 'FREE' : `$${effectiveDelivery.toFixed(2)}`;
    document.getElementById('cartTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
  },

  renderCartPage() {
    const pageItemsList = document.getElementById('dedicatedCartItemsList');
    const pageSummaryCard = document.getElementById('dedicatedCartSummary');
    if (!pageItemsList) return;

    if (this.items.length === 0) {
      pageItemsList.innerHTML = `
        <div style="text-align:center; padding: 4rem 1.5rem; background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-color);">
          <i class="fa-solid fa-basket-shopping" style="font-size:3.5rem; color:var(--text-muted); margin-bottom:1rem;"></i>
          <h2 style="font-family:var(--font-heading); font-size:1.6rem; font-weight:800; margin-bottom:0.5rem;">Your Shopping Cart is Empty</h2>
          <p style="color:var(--text-muted); margin-bottom:1.5rem;">Looks like you haven't added any gourmet dishes yet.</p>
          <a href="menu.html" class="btn btn-primary btn-lg"><i class="fa-solid fa-utensils"></i> Explore Food Menu</a>
        </div>
      `;
      if (pageSummaryCard) pageSummaryCard.style.display = 'none';
      return;
    }

    if (pageSummaryCard) pageSummaryCard.style.display = 'block';

    let tableHtml = `
      <div style="background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-color); overflow:hidden; box-shadow:var(--shadow-sm);">
        <div style="padding:1.25rem 1.5rem; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-family:var(--font-heading); font-size:1.25rem; font-weight:800;">Selected Dishes (${this.items.length})</h3>
          <button onclick="Cart.clearCart()" class="btn btn-secondary btn-sm" style="color:var(--danger); border-color:#fecaca;"><i class="fa-solid fa-trash-can"></i> Empty Cart</button>
        </div>
        <div style="padding: 1rem 1.5rem;">
    `;

    this.items.forEach((item, idx) => {
      tableHtml += `
        <div style="display:flex; align-items:center; gap:1.25rem; padding:1rem 0; border-bottom:1px solid var(--border-color); flex-wrap:wrap;">
          <img src="${item.image}" alt="${item.name}" style="width:75px; height:75px; border-radius:var(--radius-md); object-fit:cover;">
          <div style="flex:1; min-width:180px;">
            <h4 style="font-family:var(--font-heading); font-size:1.05rem; font-weight:700;">${item.name}</h4>
            ${item.sizeName ? `<span style="font-size:0.8rem; color:var(--text-muted);">${item.sizeName}</span>` : ''}
            ${item.toppingsText ? `<div style="font-size:0.78rem; color:var(--primary-accent);">+ ${item.toppingsText}</div>` : ''}
            <div style="font-weight:800; color:var(--primary); font-size:0.95rem; margin-top:0.25rem;">$${item.unitPrice.toFixed(2)} each</div>
          </div>

          <div style="display:flex; align-items:center; gap:0.6rem; background:var(--bg-alt); padding:0.3rem 0.75rem; border-radius:var(--radius-full); border:1px solid var(--border-color);">
            <button class="qty-btn" onclick="Cart.updateQty(${idx}, -1)"><i class="fa-solid fa-minus"></i></button>
            <span style="font-weight:800; font-size:0.95rem; width:20px; text-align:center;">${item.quantity}</span>
            <button class="qty-btn" onclick="Cart.updateQty(${idx}, 1)"><i class="fa-solid fa-plus"></i></button>
          </div>

          <div style="font-family:var(--font-heading); font-weight:800; font-size:1.15rem; color:var(--primary); min-width:80px; text-align:right;">
            $${(item.unitPrice * item.quantity).toFixed(2)}
          </div>
          <button onclick="Cart.removeItem(${idx})" style="background:none; color:var(--text-muted); font-size:1.1rem; padding:0.4rem; cursor:pointer;" title="Remove Item">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    });

    tableHtml += `
        </div>
        <div style="padding:1rem 1.5rem; background:var(--bg-alt); display:flex; justify-content:space-between; align-items:center;">
          <a href="menu.html" class="btn btn-secondary btn-sm"><i class="fa-solid fa-arrow-left"></i> Continue Shopping</a>
        </div>
      </div>
    `;

    pageItemsList.innerHTML = tableHtml;

    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const effectiveDelivery = subtotal >= 35 ? 0 : (this.appliedPromo && this.appliedPromo.type === 'shipping' ? 0 : this.deliveryFee);
    const tax = (subtotal - discount) * 0.08;
    const total = Math.max(0, subtotal - discount + effectiveDelivery + tax);

    document.getElementById('pageSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('pageDiscount').textContent = `-$${discount.toFixed(2)}`;
    document.getElementById('pageDelivery').textContent = effectiveDelivery === 0 ? 'FREE' : `$${effectiveDelivery.toFixed(2)}`;
    document.getElementById('pageTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('pageTotal').textContent = `$${total.toFixed(2)}`;
  },

  proceedToCheckout() {
    if (this.items.length === 0) {
      if (window.showToast) window.showToast('Your cart is empty!');
      return;
    }
    this.closeDrawer();
    window.location.href = 'checkout.html';
  }
};

window.Cart = Cart;
document.addEventListener('DOMContentLoaded', () => Cart.init());
