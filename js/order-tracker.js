/* ==========================================================================
   FoodiVerse Order Tracker, History & Search Logic
   ========================================================================== */

const OrderTracker = {
  activeOrder: JSON.parse(localStorage.getItem('foodiverse_active_order')) || null,
  pastOrders: JSON.parse(localStorage.getItem('foodiverse_past_orders')) || [
    {
      id: 'ORD-98421',
      date: '05 Aug 2026, 7:45 PM',
      items: [
        { name: 'Artisanal Pepperoni Supreme', quantity: 1, unitPrice: 18.99, sizeName: 'Large (14")' },
        { name: 'Wild Berry Superfood Smoothie', quantity: 2, unitPrice: 6.99 }
      ],
      total: 32.97,
      status: 'Delivered',
      address: '124 Gourmet Boulevard',
      city: 'Metropolis'
    },
    {
      id: 'ORD-87120',
      date: '04 Aug 2026, 1:15 PM',
      items: [
        { name: 'Truffle Angus Beast Burger', quantity: 2, unitPrice: 15.49, sizeName: 'Double Patty' },
        { name: 'Molten Chocolate Lava Cake', quantity: 1, unitPrice: 8.99 }
      ],
      total: 39.97,
      status: 'Delivered',
      address: '88 Park Avenue',
      city: 'Metropolis'
    },
    {
      id: 'ORD-65410',
      date: '02 Aug 2026, 8:30 PM',
      items: [
        { name: 'Smoked Honey Glazed BBQ Ribs', quantity: 1, unitPrice: 22.99, sizeName: 'Full Rack' },
        { name: 'Iced Matcha Green Tea Latte', quantity: 2, unitPrice: 5.99 }
      ],
      total: 34.97,
      status: 'Delivered',
      address: '124 Gourmet Boulevard',
      city: 'Metropolis'
    }
  ],

  init() {
    this.renderTrackerPage();
    this.initCheckoutPage();
    this.initSuccessPage();
    this.initOrderSearch();
    this.bindEvents();
    
    // Auto-advance simulated active order status if active
    if (this.activeOrder && this.activeOrder.step < 4) {
      this.startSimulatedProgress();
    }
  },

  bindEvents() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.placeOrderModal();
      });
    }

    const cancelCheckoutBtn = document.getElementById('cancelCheckoutBtn');
    if (cancelCheckoutBtn) {
      cancelCheckoutBtn.addEventListener('click', () => {
        document.getElementById('checkoutModal')?.classList.remove('active');
      });
    }
  },

  /* Search Orders by Order ID */
  initOrderSearch() {
    const searchInput = document.getElementById('orderSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toUpperCase();
      this.renderOrdersPage(query);
    });
  },

  /* --------------------------------------------------------------------------
     Dedicated Checkout Page Logic (checkout.html)
     -------------------------------------------------------------------------- */
  initCheckoutPage() {
    const checkoutForm = document.getElementById('checkoutPageForm');
    const summaryContainer = document.getElementById('checkoutPageSummaryList');
    if (!checkoutForm && !summaryContainer) return;

    if (window.Cart && window.Cart.items.length === 0 && !window.location.pathname.endsWith('order-success.html')) {
      if (summaryContainer) {
        summaryContainer.innerHTML = `<p style="color:var(--text-muted); text-align:center;">Your cart is empty. <a href="menu.html">Explore Menu</a></p>`;
      }
    } else if (window.Cart) {
      this.renderCheckoutSummary();
    }

    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const cardFields = document.getElementById('cardDetailsFields');
        if (cardFields) {
          cardFields.style.display = (e.target.value === 'credit_card' || e.target.value === 'debit_card') ? 'block' : 'none';
        }
      });
    });

    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePageCheckout();
      });
    }
  },

  renderCheckoutSummary() {
    const summaryContainer = document.getElementById('checkoutPageSummaryList');
    if (!summaryContainer || !window.Cart) return;

    const items = window.Cart.items;
    let html = items.map(item => `
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.9rem; margin-bottom:0.6rem; padding-bottom:0.6rem; border-bottom:1px solid var(--border-color);">
        <div>
          <div style="font-weight:700;">${item.name} <span style="color:var(--text-muted);">x${item.quantity}</span></div>
          ${item.sizeName ? `<div style="font-size:0.75rem; color:var(--text-muted);">${item.sizeName}</div>` : ''}
          ${item.toppingsText ? `<div style="font-size:0.72rem; color:var(--primary-accent);">+ ${item.toppingsText}</div>` : ''}
        </div>
        <div style="font-weight:800; color:var(--primary);">$${(item.unitPrice * item.quantity).toFixed(2)}</div>
      </div>
    `).join('');

    const subtotal = window.Cart.getSubtotal();
    const discount = window.Cart.getDiscount();
    const effectiveDelivery = subtotal >= 35 ? 0 : (window.Cart.appliedPromo && window.Cart.appliedPromo.type === 'shipping' ? 0 : window.Cart.deliveryFee);
    const tax = (subtotal - discount) * 0.08;
    const total = Math.max(0, subtotal - discount + effectiveDelivery + tax);

    document.getElementById('chkSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('chkDiscount').textContent = `-$${discount.toFixed(2)}`;
    document.getElementById('chkDelivery').textContent = effectiveDelivery === 0 ? 'FREE' : `$${effectiveDelivery.toFixed(2)}`;
    document.getElementById('chkTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('chkTotal').textContent = `$${total.toFixed(2)}`;

    summaryContainer.innerHTML = html;
  },

  handlePageCheckout() {
    const name = document.getElementById('checkoutPageName')?.value.trim();
    const phone = document.getElementById('checkoutPagePhone')?.value.trim();
    const address = document.getElementById('checkoutPageAddress')?.value.trim();
    const city = document.getElementById('checkoutPageCity')?.value.trim();
    const notes = document.getElementById('checkoutPageNotes')?.value.trim();
    const paymentMethodVal = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cod';

    if (!name || !phone || !address || !city) {
      if (window.showToast) window.showToast('Please fill in all required delivery fields');
      return;
    }

    if (!window.Cart || window.Cart.items.length === 0) {
      if (window.showToast) window.showToast('Your cart is empty!');
      return;
    }

    const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    let paymentLabel = 'Cash on Delivery';
    if (paymentMethodVal === 'credit_card') paymentLabel = 'Credit Card';
    if (paymentMethodVal === 'debit_card') paymentLabel = 'Debit Card';

    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString() + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: name,
      phone: phone,
      address: address,
      city: city,
      notes: notes,
      paymentMethod: paymentLabel,
      items: [...window.Cart.items],
      subtotal: window.Cart.getSubtotal(),
      discount: window.Cart.getDiscount(),
      deliveryFee: window.Cart.getSubtotal() >= 35 ? 0 : window.Cart.deliveryFee,
      tax: (window.Cart.getSubtotal() - window.Cart.getDiscount()) * 0.08,
      total: window.Cart.getTotal(),
      step: 1,
      status: 'Preparing',
      estimatedTime: '25 - 35 mins'
    };

    this.activeOrder = newOrder;
    localStorage.setItem('foodiverse_active_order', JSON.stringify(newOrder));

    // Clear Cart
    window.Cart.items = [];
    window.Cart.appliedPromo = null;
    window.Cart.save();
    window.Cart.renderCart();
    window.Cart.updateBadge();

    if (window.showToast) window.showToast(`Order ${orderId} placed successfully!`);

    setTimeout(() => {
      window.location.href = `order-success.html?orderId=${orderId}`;
    }, 600);
  },

  /* --------------------------------------------------------------------------
     Dedicated Order Success Page Logic (order-success.html)
     -------------------------------------------------------------------------- */
  initSuccessPage() {
    const successCard = document.getElementById('successOrderDetails');
    if (!successCard) return;

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    const order = this.activeOrder || (this.pastOrders.find(o => o.id === orderId));

    if (!order) {
      successCard.innerHTML = `<p style="color:var(--text-muted); text-align:center;">No order details found.</p>`;
      return;
    }

    let itemsHtml = order.items.map(item => `
      <div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:0.4rem;">
        <span><strong>${item.quantity}x</strong> ${item.name}</span>
        <span style="font-weight:700;">$${(item.unitPrice * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    successCard.innerHTML = `
      <div style="background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-color); padding:2rem; box-shadow:var(--shadow-md); text-align:left;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom:1.25rem;">
          <div>
            <h3 style="font-family:var(--font-heading); font-size:1.3rem; font-weight:800;">Order #${order.id}</h3>
            <span style="font-size:0.8rem; color:var(--text-muted);">${order.date}</span>
          </div>
          <span style="background:var(--primary-light); color:var(--primary-accent); font-weight:800; font-size:0.82rem; padding:0.35rem 0.85rem; border-radius:var(--radius-full);">
            <i class="fa-solid fa-clock-rotate-left"></i> Est. 25-35 Mins
          </span>
        </div>

        <div style="margin-bottom:1.25rem;">
          <h4 style="font-family:var(--font-heading); font-size:0.95rem; font-weight:700; margin-bottom:0.5rem; color:var(--text-dark);">Delivery Information:</h4>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.2rem;"><i class="fa-solid fa-user" style="color:var(--primary); width:18px;"></i> ${order.customerName || 'Customer'}</p>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.2rem;"><i class="fa-solid fa-phone" style="color:var(--primary); width:18px;"></i> ${order.phone || 'N/A'}</p>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.2rem;"><i class="fa-solid fa-location-dot" style="color:var(--primary); width:18px;"></i> ${order.address}, ${order.city || ''}</p>
          <p style="font-size:0.85rem; color:var(--text-muted);"><i class="fa-solid fa-wallet" style="color:var(--primary); width:18px;"></i> Payment: ${order.paymentMethod}</p>
        </div>

        <div style="background:var(--bg-alt); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.25rem;">
          <h4 style="font-family:var(--font-heading); font-size:0.9rem; font-weight:700; margin-bottom:0.6rem; border-bottom:1px solid var(--border-color); padding-bottom:0.4rem;">Items Ordered:</h4>
          ${itemsHtml}
          <div style="border-top:1px dashed var(--border-color); margin-top:0.6rem; padding-top:0.6rem; display:flex; justify-content:space-between; font-weight:800; font-size:1.05rem; color:var(--primary);">
            <span>Total Paid</span>
            <span>$${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div style="display:flex; gap:1rem; flex-wrap:wrap;">
          <a href="orders.html" class="btn btn-primary" style="flex:1;"><i class="fa-solid fa-motorcycle"></i> Track Order Live</a>
          <a href="index.html" class="btn btn-secondary" style="flex:1;"><i class="fa-solid fa-house"></i> Back to Home</a>
        </div>
      </div>
    `;
  },

  startSimulatedProgress() {
    if (!this.activeOrder) return;
    if (this.activeOrder.step === 1) {
      setTimeout(() => {
        if (this.activeOrder) {
          this.activeOrder.step = 2;
          this.activeOrder.status = 'Preparing';
          this.saveActiveOrder();
          this.renderTrackerPage();
        }
      }, 5000);
    }
    if (this.activeOrder.step === 2) {
      setTimeout(() => {
        if (this.activeOrder) {
          this.activeOrder.step = 3;
          this.activeOrder.status = 'Out for Delivery';
          this.saveActiveOrder();
          this.renderTrackerPage();
        }
      }, 12000);
    }
    if (this.activeOrder.step === 3) {
      setTimeout(() => {
        if (this.activeOrder) {
          this.activeOrder.step = 4;
          this.activeOrder.status = 'Delivered';
          const completedOrder = {
            id: this.activeOrder.id,
            date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            items: this.activeOrder.items,
            total: this.activeOrder.total,
            status: 'Delivered',
            address: this.activeOrder.address,
            city: this.activeOrder.city
          };
          this.pastOrders.unshift(completedOrder);
          localStorage.setItem('foodiverse_past_orders', JSON.stringify(this.pastOrders));

          this.activeOrder = null;
          localStorage.removeItem('foodiverse_active_order');
          this.renderTrackerPage();

          if (window.showToast) window.showToast(`Order ${completedOrder.id} has been delivered! Enjoy your meal!`);
        }
      }, 20000);
    }
  },

  saveActiveOrder() {
    if (this.activeOrder) {
      localStorage.setItem('foodiverse_active_order', JSON.stringify(this.activeOrder));
    }
  },

  getStatusBadge(status) {
    if (status === 'Preparing') {
      return `<span style="background:#fef3c7; color:#d97706; font-weight:800; font-size:0.8rem; padding:0.35rem 0.85rem; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:0.35rem;"><i class="fa-solid fa-fire-burner"></i> Preparing</span>`;
    } else if (status === 'Out for Delivery') {
      return `<span style="background:#dbeafe; color:#2563eb; font-weight:800; font-size:0.8rem; padding:0.35rem 0.85rem; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:0.35rem;"><i class="fa-solid fa-motorcycle"></i> Out for Delivery</span>`;
    } else {
      return `<span style="background:#dcfce7; color:#16a34a; font-weight:800; font-size:0.8rem; padding:0.35rem 0.85rem; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:0.35rem;"><i class="fa-solid fa-circle-check"></i> Delivered</span>`;
    }
  },

  renderOrdersPage(searchQuery = '') {
    this.renderTrackerPage(searchQuery);
  },

  renderTrackerPage(searchQuery = '') {
    const activeSection = document.getElementById('activeOrderSection');
    const historySection = document.getElementById('orderHistorySection');
    if (!activeSection && !historySection) return;

    // Render Active Order
    if (activeSection) {
      if (!this.activeOrder) {
        activeSection.innerHTML = `
          <div class="order-tracker-card" style="text-align:center; padding:3rem 1.5rem;">
            <i class="fa-solid fa-utensils" style="font-size:3rem; color:var(--primary); margin-bottom:1rem;"></i>
            <h3 style="font-family:var(--font-heading); font-size:1.5rem; margin-bottom:0.5rem;">No Active Orders</h3>
            <p style="color:var(--text-muted); margin-bottom:1.5rem;">You don't have any food being prepared right now.</p>
            <a href="menu.html" class="btn btn-primary"><i class="fa-solid fa-burger"></i> Explore Menu</a>
          </div>
        `;
      } else {
        const order = this.activeOrder;
        const step = order.step;
        const currentStatus = step === 1 ? 'Preparing' : step === 2 ? 'Preparing' : step === 3 ? 'Out for Delivery' : 'Delivered';
        const progressWidth = step === 1 ? '0%' : step === 2 ? '33%' : step === 3 ? '66%' : '100%';

        let itemsHtml = order.items.map(item => `
          <div style="display:flex; justify-content:space-between; font-size:0.95rem; margin-bottom:0.4rem;">
            <span><strong>${item.quantity}x</strong> ${item.name} ${item.sizeName ? `(${item.sizeName})` : ''}</span>
            <span style="font-weight:700;">$${(item.unitPrice * item.quantity).toFixed(2)}</span>
          </div>
        `).join('');

        activeSection.innerHTML = `
          <div class="order-tracker-card">
            <div class="tracker-header">
              <div class="tracker-title">
                <h2>Active Order #${order.id}</h2>
                <p style="color:var(--text-muted); font-size:0.9rem;">Estimated Delivery: <strong>${order.estimatedTime}</strong></p>
              </div>
              <div>
                ${this.getStatusBadge(currentStatus)}
              </div>
            </div>

            <div class="stepper">
              <div class="stepper-progress" style="width: ${progressWidth};"></div>
              
              <div class="step ${step >= 1 ? (step === 1 ? 'active' : 'completed') : ''}">
                <div class="step-icon"><i class="fa-solid fa-receipt"></i></div>
                <div class="step-title">Order Received</div>
                <div class="step-time">Confirmed</div>
              </div>

              <div class="step ${step >= 2 ? (step === 2 ? 'active' : 'completed') : ''}">
                <div class="step-icon"><i class="fa-solid fa-fire-burner"></i></div>
                <div class="step-title">Preparing</div>
                <div class="step-time">In Kitchen</div>
              </div>

              <div class="step ${step >= 3 ? (step === 3 ? 'active' : 'completed') : ''}">
                <div class="step-icon"><i class="fa-solid fa-motorcycle"></i></div>
                <div class="step-title">Out for Delivery</div>
                <div class="step-time">Rider Assigned</div>
              </div>

              <div class="step ${step >= 4 ? 'completed' : ''}">
                <div class="step-icon"><i class="fa-solid fa-house-chimney-check"></i></div>
                <div class="step-title">Delivered</div>
                <div class="step-time">At Your Door</div>
              </div>
            </div>

            <div style="background:var(--bg-alt); border-radius:var(--radius-md); padding:1.5rem; margin-top:2rem;">
              <h4 style="font-family:var(--font-heading); margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">Order Items & Details</h4>
              ${itemsHtml}
              <div style="border-top:1px dashed var(--border-color); margin-top:0.75rem; padding-top:0.75rem; display:flex; justify-content:space-between; font-weight:800; font-size:1.1rem; color:var(--primary);">
                <span>Total Paid</span>
                <span>$${order.total.toFixed(2)}</span>
              </div>
              <div style="margin-top:0.75rem; font-size:0.85rem; color:var(--text-muted);">
                <i class="fa-solid fa-location-dot" style="color:var(--primary);"></i> Delivery to: ${order.address}, ${order.city || ''}
              </div>
            </div>
          </div>
        `;
      }
    }

    // Render Order History & Search
    if (historySection) {
      let filteredOrders = [...this.pastOrders];
      if (searchQuery) {
        filteredOrders = filteredOrders.filter(o => o.id.toUpperCase().includes(searchQuery));
      }

      if (filteredOrders.length === 0) {
        historySection.innerHTML = `
          <div style="text-align:center; padding:3rem 1rem; color:var(--text-muted);">
            <i class="fa-solid fa-magnifying-glass" style="font-size:2.5rem; margin-bottom:0.75rem;"></i>
            <p>No orders found matching "${searchQuery}".</p>
          </div>
        `;
      } else {
        let historyHtml = '';
        filteredOrders.forEach(order => {
          let itemsListHtml = '';
          if (order.items) {
            itemsListHtml = order.items.map(i => `
              <div style="font-size:0.85rem; color:var(--text-dark); margin-bottom:0.2rem;">
                <strong>${i.quantity}x</strong> ${i.name} ${i.sizeName ? `<span style="color:var(--text-muted);">(${i.sizeName})</span>` : ''}
              </div>
            `).join('');
          }

          historyHtml += `
            <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; margin-bottom:1.25rem; box-shadow:var(--shadow-sm); transition:var(--transition-normal);">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom:1rem;">
                <div>
                  <div style="font-family:var(--font-heading); font-weight:800; font-size:1.15rem; color:var(--text-dark);">Order #${order.id}</div>
                  <div style="font-size:0.82rem; color:var(--text-muted);"><i class="fa-regular fa-calendar" style="margin-right:0.3rem;"></i> ${order.date}</div>
                </div>
                <div style="display:flex; align-items:center; gap:1rem;">
                  ${this.getStatusBadge(order.status || 'Delivered')}
                  <button onclick="OrderTracker.reorder('${order.id}')" class="btn btn-outline btn-sm"><i class="fa-solid fa-rotate-left"></i> Reorder</button>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:1rem;">
                <div style="flex:1; min-width:220px;">
                  <div style="font-size:0.82rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.4rem;">Ordered Items:</div>
                  ${itemsListHtml || `<span style="font-size:0.85rem;">Standard Meal Package</span>`}
                </div>
                <div style="text-align:right;">
                  <div style="font-size:0.8rem; color:var(--text-muted);">Total Price</div>
                  <div style="font-family:var(--font-heading); font-weight:800; font-size:1.35rem; color:var(--primary);">$${order.total.toFixed(2)}</div>
                </div>
              </div>
            </div>
          `;
        });
        historySection.innerHTML = historyHtml;
      }
    }
  },

  reorder(orderId) {
    const past = this.pastOrders.find(o => o.id === orderId);
    if (!past) return;
    if (window.Cart) {
      if (past.items) {
        past.items.forEach(item => {
          window.Cart.addItem(item.id || 'p1');
        });
      }
      if (window.showToast) window.showToast('Readded past order items to cart!');
    }
  }
};

window.OrderTracker = OrderTracker;
document.addEventListener('DOMContentLoaded', () => OrderTracker.init());
