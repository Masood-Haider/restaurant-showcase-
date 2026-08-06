/* ==========================================================================
   FoodiVerse Admin Panel Logic - Clean Real Data (No Dummy Fallbacks)
   ========================================================================== */

const Admin = {
  activeOrder: JSON.parse(localStorage.getItem('foodiverse_active_order')) || null,
  pastOrders: JSON.parse(localStorage.getItem('foodiverse_past_orders')) || [],
  users: JSON.parse(localStorage.getItem('foodiverse_users_db')) || [],

  init() {
    this.reloadFromStorage();
    this.ensureActiveOrderInList();
    this.renderStats();
    this.renderOrdersTable();
    this.renderCustomersTable();
    this.bindEvents();
  },

  reloadFromStorage() {
    this.activeOrder = JSON.parse(localStorage.getItem('foodiverse_active_order')) || null;
    this.pastOrders = JSON.parse(localStorage.getItem('foodiverse_past_orders')) || [];
    this.users = JSON.parse(localStorage.getItem('foodiverse_users_db')) || [];
  },

  ensureActiveOrderInList() {
    if (this.activeOrder) {
      const idx = this.pastOrders.findIndex(o => o.id === this.activeOrder.id);
      if (idx === -1) {
        this.pastOrders.unshift({
          ...this.activeOrder,
          status: this.activeOrder.status || 'Preparing'
        });
      } else {
        this.pastOrders[idx].status = this.activeOrder.status || this.pastOrders[idx].status;
      }
    }
  },

  bindEvents() {
    // Sidebar View Switcher
    document.querySelectorAll('.admin-nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const view = btn.dataset.view;

        if (view === 'logout') {
          if (window.showToast) window.showToast('Logging out of Admin Panel...');
          setTimeout(() => { window.location.href = 'index.html'; }, 500);
          return;
        }

        document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.admin-view').forEach(v => v.style.display = 'none');
        const targetView = document.getElementById(`view-${view}`);
        if (targetView) targetView.style.display = 'block';
      });
    });

    // Orders Filter Listener
    const filterSelect = document.getElementById('adminOrderFilter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.renderOrdersTable(e.target.value);
      });
    }

    // Search Orders Input
    const searchInput = document.getElementById('adminOrderSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderOrdersTable('all', e.target.value.trim().toUpperCase());
      });
    }
  },

  getAllOrders() {
    return this.pastOrders;
  },

  renderStats() {
    const orders = this.getAllOrders();
    const totalOrdersCount = orders.length;
    const preparingCount = orders.filter(o => o.status === 'Preparing').length;
    const deliveryCount = orders.filter(o => o.status === 'Out for Delivery').length;
    const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    const statTotal = document.getElementById('statTotalOrders');
    const statPrep = document.getElementById('statPreparing');
    const statDelivery = document.getElementById('statOutForDelivery');
    const statDelivered = document.getElementById('statDelivered');
    const statRev = document.getElementById('statTotalRevenue');

    if (statTotal) statTotal.textContent = totalOrdersCount;
    if (statPrep) statPrep.textContent = preparingCount;
    if (statDelivery) statDelivery.textContent = deliveryCount;
    if (statDelivered) statDelivered.textContent = deliveredCount;
    if (statRev) statRev.textContent = `$${totalRevenue.toFixed(2)}`;
  },

  getStatusBadge(status) {
    if (status === 'Preparing') {
      return `<span style="background:#fef3c7; color:#d97706; font-weight:800; font-size:0.78rem; padding:0.3rem 0.75rem; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:0.35rem;"><i class="fa-solid fa-fire-burner"></i> Preparing</span>`;
    } else if (status === 'Out for Delivery') {
      return `<span style="background:#dbeafe; color:#2563eb; font-weight:800; font-size:0.78rem; padding:0.3rem 0.75rem; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:0.35rem;"><i class="fa-solid fa-motorcycle"></i> Out for Delivery</span>`;
    } else {
      return `<span style="background:#dcfce7; color:#16a34a; font-weight:800; font-size:0.78rem; padding:0.3rem 0.75rem; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:0.35rem;"><i class="fa-solid fa-circle-check"></i> Delivered</span>`;
    }
  },

  renderOrdersTable(filterStatus = 'all', searchQuery = '') {
    const tableBody = document.getElementById('adminOrdersTableBody');
    if (!tableBody) return;

    let orders = [...this.pastOrders];

    if (filterStatus !== 'all') {
      orders = orders.filter(o => o.status === filterStatus);
    }

    if (searchQuery) {
      orders = orders.filter(o => o.id.toUpperCase().includes(searchQuery) || (o.customerName && o.customerName.toUpperCase().includes(searchQuery)));
    }

    if (orders.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:3.5rem 1rem; color:var(--text-muted);">
            <i class="fa-solid fa-inbox" style="font-size:3rem; color:var(--border-color); margin-bottom:0.75rem; display:block;"></i>
            <h4 style="font-family:var(--font-heading); font-size:1.2rem; font-weight:700; color:var(--text-dark); margin-bottom:0.25rem;">No Real Orders Placed Yet</h4>
            <p style="font-size:0.85rem;">Place an order from the food menu storefront to view live orders here.</p>
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    orders.forEach(order => {
      const isPreparingSelected = order.status === 'Preparing' ? 'selected' : '';
      const isDeliverySelected = order.status === 'Out for Delivery' ? 'selected' : '';
      const isDeliveredSelected = order.status === 'Delivered' ? 'selected' : '';

      rowsHtml += `
        <tr style="border-bottom:1px solid var(--border-color); transition:var(--transition-fast);">
          <td style="padding:1rem 1.25rem; font-weight:800; font-family:var(--font-heading); color:var(--primary);">${order.id}</td>
          <td style="padding:1rem 1.25rem; font-weight:700;">${order.customerName || 'Guest Customer'}</td>
          <td style="padding:1rem 1.25rem; color:var(--text-muted); font-size:0.88rem;">${order.phone || 'N/A'}</td>
          <td style="padding:1rem 1.25rem; font-size:0.85rem; color:var(--text-muted); max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${order.address}, ${order.city || ''}">
            ${order.address || 'N/A'}, ${order.city || ''}
          </td>
          <td style="padding:1rem 1.25rem; font-weight:800; font-family:var(--font-heading); font-size:1.05rem; color:var(--text-dark);">$${(order.total || 0).toFixed(2)}</td>
          <td style="padding:1rem 1.25rem;">${this.getStatusBadge(order.status)}</td>
          <td style="padding:1rem 1.25rem;">
            <select class="admin-status-select" onchange="Admin.updateOrderStatus('${order.id}', this.value)" style="padding:0.4rem 0.85rem; border-radius:var(--radius-full); border:1.5px solid var(--border-color); background:var(--bg-main); font-weight:700; font-size:0.82rem; cursor:pointer;">
              <option value="Preparing" ${isPreparingSelected}>Preparing</option>
              <option value="Out for Delivery" ${isDeliverySelected}>Out for Delivery</option>
              <option value="Delivered" ${isDeliveredSelected}>Delivered</option>
            </select>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = rowsHtml;
  },

  updateOrderStatus(orderId, newStatus) {
    const order = this.pastOrders.find(o => o.id === orderId);
    if (!order) return;

    order.status = newStatus;
    localStorage.setItem('foodiverse_past_orders', JSON.stringify(this.pastOrders));

    if (this.activeOrder && this.activeOrder.id === orderId) {
      this.activeOrder.status = newStatus;
      this.activeOrder.step = newStatus === 'Preparing' ? 2 : newStatus === 'Out for Delivery' ? 3 : 4;
      localStorage.setItem('foodiverse_active_order', JSON.stringify(this.activeOrder));
    }

    this.renderStats();
    this.renderOrdersTable();

    if (window.showToast) {
      window.showToast(`Updated Order ${orderId} status to "${newStatus}"!`);
    }
  },

  renderCustomersTable() {
    const tableBody = document.getElementById('adminCustomersTableBody');
    if (!tableBody) return;

    if (this.users.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; padding:3.5rem 1rem; color:var(--text-muted);">
            <i class="fa-solid fa-users-slash" style="font-size:3rem; color:var(--border-color); margin-bottom:0.75rem; display:block;"></i>
            <h4 style="font-family:var(--font-heading); font-size:1.2rem; font-weight:700; color:var(--text-dark); margin-bottom:0.25rem;">No Registered Customers</h4>
            <p style="font-size:0.85rem;">Register a user account on the Sign Up page to populate customer profiles here.</p>
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    this.users.forEach((user) => {
      rowsHtml += `
        <tr style="border-bottom:1px solid var(--border-color);">
          <td style="padding:1rem 1.25rem; font-weight:700;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:36px; height:36px; border-radius:50%; background:var(--primary); color:var(--primary-accent); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.9rem;">
                ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>${user.name || 'Registered Customer'}</div>
            </div>
          </td>
          <td style="padding:1rem 1.25rem; color:var(--text-muted); font-size:0.88rem;">${user.email || 'N/A'}</td>
          <td style="padding:1rem 1.25rem; color:var(--text-muted); font-size:0.88rem;">${user.phone || 'N/A'}</td>
          <td style="padding:1rem 1.25rem; font-size:0.85rem; color:var(--text-muted);">${user.registered || 'Recently Registered'}</td>
        </tr>
      `;
    });

    tableBody.innerHTML = rowsHtml;
  }
};

window.Admin = Admin;
document.addEventListener('DOMContentLoaded', () => Admin.init());
