/* ==========================================================================
   FoodiVerse Master Interactive Script - State-of-the-Art UI/UX Showcase
   Includes Hero Vicinity 3D Parallax Tilt, 3D Card Parallax, Flying Food Animation,
   Magnetic Buttons & Ripples, Scroll Reveal Observer, Global Command Palette (Ctrl+K),
   Heart Particle Bursts, and Scroll Progress Bar.
   ========================================================================== */

// Global Toast Notification Helper
window.showToast = function(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--primary-accent);"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
};

// Global Image Fallback Handler
window.handleImageError = function(imgElement) {
  imgElement.onerror = null;
  imgElement.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
};

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgressBar();
  initNavbar();
  initHomeFeatured();
  initMenuCatalog();
  initQuickViewModal();
  initContactAccordion();
  init3DCardParallax();
  initHeroVicinityTilt();
  initMagneticRipples();
  initScrollRevealObserver();
  initCommandPalette();
  initGlobalImageErrorHandling();
});

/* --------------------------------------------------------------------------
   1. Scroll Progress Bar
   -------------------------------------------------------------------------- */
function initScrollProgressBar() {
  let progressBar = document.getElementById('scrollProgressBar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'scrollProgressBar';
    document.body.appendChild(progressBar);
  }

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  });
}

/* --------------------------------------------------------------------------
   2. Hero Section Vicinity 3D Tilt (Tilts even when mouse is near the hero)
   -------------------------------------------------------------------------- */
function initHeroVicinityTilt() {
  const heroSection = document.querySelector('.hero');
  const heroImg = document.querySelector('.hero-main-img');
  const glassBadge1 = document.querySelector('.glass-badge-1');
  const glassBadge2 = document.querySelector('.glass-badge-2');

  if (!heroSection || !heroImg) return;

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    heroImg.style.transform = `rotate(-2deg) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;

    if (glassBadge1) {
      glassBadge1.style.transform = `translate(${rotateY * 1.5}px, ${-rotateX * 1.5}px)`;
    }
    if (glassBadge2) {
      glassBadge2.style.transform = `translate(${-rotateY * 1.5}px, ${rotateX * 1.5}px)`;
    }
  });

  heroSection.addEventListener('mouseleave', () => {
    heroImg.style.transform = 'rotate(-2deg) perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    if (glassBadge1) glassBadge1.style.transform = 'translate(0px, 0px)';
    if (glassBadge2) glassBadge2.style.transform = 'translate(0px, 0px)';
  });
}

/* --------------------------------------------------------------------------
   3. 3D Card Parallax & Glare Effect (mousemove, mouseleave)
   -------------------------------------------------------------------------- */
function init3DCardParallax() {
  const cards = document.querySelectorAll('.food-card, .category-card, .review-card');
  
  cards.forEach(card => {
    if (!card.querySelector('.food-card-glare') && card.classList.contains('food-card')) {
      const glare = document.createElement('div');
      glare.className = 'food-card-glare';
      card.appendChild(glare);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

      const glare = card.querySelector('.food-card-glare');
      if (glare) {
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 75%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* --------------------------------------------------------------------------
   4. Flying Food Item Animation on Add-to-Cart
   -------------------------------------------------------------------------- */
window.animateFlyingFood = function(startElement) {
  if (!startElement) return;

  const cartTrigger = document.querySelector('.cart-btn-trigger');
  if (!cartTrigger) return;

  const startRect = startElement.getBoundingClientRect();
  const cartRect = cartTrigger.getBoundingClientRect();

  const flyer = document.createElement('img');
  flyer.src = startElement.getAttribute('src') || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80';
  flyer.className = 'flying-food-thumb';
  flyer.style.left = `${startRect.left + startRect.width / 2 - 30}px`;
  flyer.style.top = `${startRect.top + startRect.height / 2 - 30}px`;
  document.body.appendChild(flyer);

  setTimeout(() => {
    flyer.style.left = `${cartRect.left + cartRect.width / 2 - 15}px`;
    flyer.style.top = `${cartRect.top + cartRect.height / 2 - 15}px`;
    flyer.style.width = '24px';
    flyer.style.height = '24px';
    flyer.style.opacity = '0.3';
    flyer.style.transform = 'scale(0.3) rotate(360deg)';
  }, 30);

  setTimeout(() => {
    flyer.remove();
    const badge = cartTrigger.querySelector('.cart-badge');
    if (badge) {
      badge.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.6)' },
        { transform: 'scale(1)' }
      ], { duration: 350, easing: 'ease-out' });
    }
  }, 780);
};

/* --------------------------------------------------------------------------
   5. Magnetic & Ripple Buttons
   -------------------------------------------------------------------------- */
function initMagneticRipples() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });

    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('ripple-effect');

      const ripple = this.querySelector('.ripple-effect');
      if (ripple) ripple.remove();

      this.appendChild(circle);
    });
  });
}

/* --------------------------------------------------------------------------
   6. Scroll Reveal Observer (IntersectionObserver)
   -------------------------------------------------------------------------- */
function initScrollRevealObserver() {
  const elements = document.querySelectorAll('.food-card, .category-card, .review-card, .section-header, .stat-item, .banner-offer');
  
  elements.forEach(el => el.classList.add('reveal-on-scroll'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   7. Floating Heart Particle Burst on Favorites
   -------------------------------------------------------------------------- */
function toggleWishlist(btn, foodId) {
  btn.classList.toggle('active');
  const icon = btn.querySelector('i');
  
  if (btn.classList.contains('active')) {
    if (icon) icon.classList.replace('fa-regular', 'fa-solid');
    
    const rect = btn.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('i');
      particle.className = 'fa-solid fa-heart heart-particle';
      particle.style.left = `${rect.left + 10}px`;
      particle.style.top = `${rect.top + 10}px`;
      
      const dx = (Math.random() - 0.5) * 80;
      const dy = -(Math.random() * 60 + 20);
      const rot = (Math.random() - 0.5) * 60;
      
      particle.style.setProperty('--dx', `${dx}px`);
      particle.style.setProperty('--dy', `${dy}px`);
      particle.style.setProperty('--rot', `${rot}deg`);

      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 900);
    }

    if (window.showToast) window.showToast('Saved to your favorites!');
  } else {
    if (icon) icon.classList.replace('fa-solid', 'fa-regular');
  }
}

/* --------------------------------------------------------------------------
   8. Global Command Palette Modal (Ctrl + K or / keydown)
   -------------------------------------------------------------------------- */
function initCommandPalette() {
  let modal = document.getElementById('commandPaletteModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'commandPaletteModal';
    modal.className = 'cmd-palette-overlay';
    modal.innerHTML = `
      <div class="cmd-palette-card">
        <div class="cmd-search-input-box">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="cmdInput" placeholder="Type a dish, category, or command..." autocomplete="off">
          <span class="cmd-kbd">ESC</span>
        </div>
        <div class="cmd-results-list" id="cmdResultsList"></div>
        <div class="cmd-footer-hint">
          <span><span class="cmd-kbd">↑</span> <span class="cmd-kbd">↓</span> Navigate</span>
          <span><span class="cmd-kbd">↵</span> Select</span>
          <span><span class="cmd-kbd">Ctrl K</span> Toggle</span>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const cmdInput = document.getElementById('cmdInput');
  const cmdResults = document.getElementById('cmdResultsList');

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
      e.preventDefault();
      modal.classList.toggle('active');
      if (modal.classList.contains('active')) {
        cmdInput.focus();
        renderCmdResults('');
      }
    }
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  if (cmdInput) {
    cmdInput.addEventListener('input', (e) => {
      renderCmdResults(e.target.value.trim().toLowerCase());
    });
  }

  function renderCmdResults(query) {
    if (!cmdResults) return;

    const pages = [
      { title: 'Home Page', sub: 'Main storefront & featured selections', icon: 'fa-house', url: 'index.html' },
      { title: 'Food Menu', sub: 'Explore 12 gourmet dishes', icon: 'fa-utensils', url: 'menu.html' },
      { title: 'Shopping Cart', sub: 'View basket items & totals', icon: 'fa-bag-shopping', url: 'cart.html' },
      { title: 'Checkout Page', sub: 'Delivery details & payment', icon: 'fa-credit-card', url: 'checkout.html' },
      { title: 'Customer Orders', sub: 'Track active delivery & status', icon: 'fa-receipt', url: 'orders.html' },
      { title: 'Admin Dashboard', sub: 'Live store & kitchen management', icon: 'fa-user-gear', url: 'admin.html' }
    ];

    let matches = [];

    pages.forEach(p => {
      if (!query || p.title.toLowerCase().includes(query) || p.sub.toLowerCase().includes(query)) {
        matches.push({ type: 'page', ...p });
      }
    });

    if (typeof FOOD_ITEMS !== 'undefined' && query) {
      FOOD_ITEMS.forEach(f => {
        if (f.name.toLowerCase().includes(query) || f.category.toLowerCase().includes(query)) {
          matches.push({
            type: 'food',
            title: f.name,
            sub: `${f.category.toUpperCase()} • $${f.price.toFixed(2)} • ★ ${f.rating}`,
            icon: 'fa-burger',
            foodId: f.id,
            url: `menu.html?search=${encodeURIComponent(f.name)}`
          });
        }
      });
    }

    if (matches.length === 0) {
      cmdResults.innerHTML = `
        <div style="padding:2rem; text-align:center; color:#a1a1aa;">
          No matching command or dish found.
        </div>
      `;
      return;
    }

    cmdResults.innerHTML = matches.map((m, idx) => `
      <div class="cmd-item ${idx === 0 ? 'selected' : ''}" onclick="window.location.href='${m.url}'">
        <div class="cmd-item-icon"><i class="fa-solid ${m.icon}"></i></div>
        <div class="cmd-item-info">
          <div class="cmd-item-title">${m.title}</div>
          <div class="cmd-item-sub">${m.sub}</div>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size:0.8rem; color:#a1a1aa;"></i>
      </div>
    `).join('');
  }
}

function initGlobalImageErrorHandling() {
  document.querySelectorAll('img').forEach(img => {
    if (!img.getAttribute('onerror')) {
      img.setAttribute('onerror', "handleImageError(this)");
    }
  });
}

function initNavbar() {
  const header = document.querySelector('.header');
  const toggleBtn = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 30);
    });
  }

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('active');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('active')) {
          icon.classList.replace('fa-bars', 'fa-xmark');
        } else {
          icon.classList.replace('fa-xmark', 'fa-bars');
        }
      }
    });

    // Close mobile nav when clicking a nav link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = toggleBtn.querySelector('i');
        if (icon) icon.classList.replace('fa-xmark', 'fa-bars');
      });
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        navMenu.classList.remove('active');
        const icon = toggleBtn.querySelector('i');
        if (icon) icon.classList.replace('fa-xmark', 'fa-bars');
      }
    });
  }
}

function initHomeFeatured() {
  const categoriesContainer = document.getElementById('homeCategoriesGrid');
  const featuredContainer = document.getElementById('homeFeaturedFoodGrid');

  if (categoriesContainer && typeof FOOD_CATEGORIES !== 'undefined') {
    let catHtml = '';
    FOOD_CATEGORIES.forEach(cat => {
      catHtml += `
        <div class="category-card" onclick="window.location.href='menu.html?cat=${cat.id}'">
          <div class="category-icon"><i class="fa-solid ${cat.icon}"></i></div>
          <div class="category-name">${cat.name}</div>
          <div class="category-count">${cat.count} Items</div>
        </div>
      `;
    });
    categoriesContainer.innerHTML = catHtml;
  }

  if (featuredContainer && typeof FOOD_ITEMS !== 'undefined') {
    const featuredDishes = FOOD_ITEMS.slice(0, 4);
    featuredContainer.innerHTML = renderFoodGridHtml(featuredDishes);
  }
  
  init3DCardParallax();
}

function initMenuCatalog() {
  const menuContainer = document.getElementById('menuFoodGrid');
  const pillsContainer = document.getElementById('filterPillsContainer');
  const searchInput = document.getElementById('menuSearchInput');
  const sortSelect = document.getElementById('menuSortSelect');

  if (!menuContainer || typeof FOOD_ITEMS === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  let activeCat = urlParams.get('cat') || 'all';
  let searchQuery = urlParams.get('search') || '';
  let currentSort = 'popular';

  if (searchInput && searchQuery) searchInput.value = searchQuery;

  function renderFilteredMenu() {
    let list = [...FOOD_ITEMS];

    if (activeCat !== 'all') {
      list = list.filter(item => item.category === activeCat);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (currentSort === 'price-low') list.sort((a, b) => a.price - b.price);
    else if (currentSort === 'price-high') list.sort((a, b) => b.price - a.price);
    else if (currentSort === 'rating') list.sort((a, b) => b.rating - a.rating);

    if (list.length === 0) {
      menuContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:4rem 1rem;">
          <i class="fa-solid fa-magnifying-glass" style="font-size:3rem; color:var(--text-muted); margin-bottom:1rem;"></i>
          <h3 style="font-family:var(--font-heading); font-size:1.4rem;">No matching dishes found</h3>
          <p style="color:var(--text-muted);">Try adjusting your search query or category filter.</p>
        </div>
      `;
    } else {
      menuContainer.innerHTML = renderFoodGridHtml(list);
      init3DCardParallax();
    }
  }

  if (pillsContainer && typeof FOOD_CATEGORIES !== 'undefined') {
    let pillsHtml = '';
    FOOD_CATEGORIES.forEach(cat => {
      const isActive = cat.id === activeCat ? 'active' : '';
      pillsHtml += `<button class="filter-pill ${isActive}" data-cat="${cat.id}">${cat.name}</button>`;
    });
    pillsContainer.innerHTML = pillsHtml;

    pillsContainer.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        pillsContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeCat = pill.dataset.cat;
        renderFilteredMenu();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderFilteredMenu();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderFilteredMenu();
    });
  }

  renderFilteredMenu();
}

function renderFoodGridHtml(items) {
  return items.map(item => `
    <div class="food-card">
      <div class="food-img-wrapper">
        <img src="${item.image}" alt="${item.name}" class="food-img" onerror="handleImageError(this)">
        ${item.tags && item.tags.length > 0 ? `<span class="food-tag">${item.tags[0]}</span>` : ''}
        <button class="food-wishlist" onclick="toggleWishlist(this, '${item.id}')" title="Save Dish">
          <i class="fa-regular fa-heart"></i>
        </button>
      </div>
      <div class="food-body">
        <div class="food-header">
          <h3 class="food-title">${item.name}</h3>
          <div class="food-rating">
            <i class="fa-solid fa-star"></i>
            <span>${item.rating}</span>
          </div>
        </div>
        <p class="food-desc">${item.description}</p>
        <div class="food-footer">
          <div class="food-price">$${item.price.toFixed(2)} <span>/ portion</span></div>
          <button class="add-cart-btn" onclick="triggerAddToCart(this, '${item.id}')" title="Customise & Add">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

window.triggerAddToCart = function(btnElement, foodId) {
  const cardImg = btnElement.closest('.food-card')?.querySelector('.food-img');
  if (cardImg) window.animateFlyingFood(cardImg);
  openQuickView(foodId);
};

let currentCustomizingFood = null;

function openQuickView(foodId) {
  if (typeof FOOD_ITEMS === 'undefined') return;
  const food = FOOD_ITEMS.find(item => item.id === foodId);
  if (!food) return;

  currentCustomizingFood = food;
  const modal = document.getElementById('quickViewModalOverlay');
  if (!modal) {
    if (window.Cart) window.Cart.addItem(foodId);
    return;
  }

  document.getElementById('qvImage').src = food.image;
  document.getElementById('qvImage').onerror = function() { handleImageError(this); };
  document.getElementById('qvTitle').textContent = food.name;
  document.getElementById('qvRating').textContent = `${food.rating} (${food.reviewsCount} reviews)`;
  document.getElementById('qvDesc').textContent = food.description;
  document.getElementById('qvBasePrice').textContent = `$${food.price.toFixed(2)}`;

  const sizeContainer = document.getElementById('qvSizeContainer');
  if (sizeContainer && food.sizes) {
    let sizeHtml = food.sizes.map((s, idx) => `
      <label style="display:flex; align-items:center; gap:0.5rem; margin-right:1rem; cursor:pointer; font-size:0.9rem;">
        <input type="radio" name="qvSize" value="${idx}" ${idx === 0 ? 'checked' : ''} onchange="updateQvTotalPrice()">
        <span>${s.name} ${s.priceOffset > 0 ? `(+$${s.priceOffset.toFixed(2)})` : ''}</span>
      </label>
    `).join('');
    sizeContainer.innerHTML = sizeHtml;
  }

  const toppingContainer = document.getElementById('qvToppingContainer');
  if (toppingContainer && food.toppings) {
    let topHtml = food.toppings.map(t => `
      <label style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem; cursor:pointer; font-size:0.88rem;">
        <input type="checkbox" name="qvTopping" value="${t.name}" onchange="updateQvTotalPrice()">
        <span>${t.name} (+$${t.price.toFixed(2)})</span>
      </label>
    `).join('');
    toppingContainer.innerHTML = topHtml;
  } else if (toppingContainer) {
    toppingContainer.innerHTML = `<span style="font-size:0.85rem; color:var(--text-muted);">No extra toppings for this item.</span>`;
  }

  updateQvTotalPrice();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function updateQvTotalPrice() {
  if (!currentCustomizingFood) return;
  const sizeIndex = parseInt(document.querySelector('input[name="qvSize"]:checked')?.value || 0);
  const sizeOffset = currentCustomizingFood.sizes ? (currentCustomizingFood.sizes[sizeIndex]?.priceOffset || 0) : 0;

  let toppingsTotal = 0;
  document.querySelectorAll('input[name="qvTopping"]:checked').forEach(cb => {
    const t = currentCustomizingFood.toppings?.find(top => top.name === cb.value);
    if (t) toppingsTotal += t.price;
  });

  const total = currentCustomizingFood.price + sizeOffset + toppingsTotal;
  const btnPrice = document.getElementById('qvFinalPriceBtn');
  if (btnPrice) btnPrice.textContent = `$${total.toFixed(2)}`;
}

function initQuickViewModal() {
  const closeBtn = document.getElementById('closeQuickViewBtn');
  const modalOverlay = document.getElementById('quickViewModalOverlay');
  const addBtn = document.getElementById('qvAddToCartBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modalOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (!currentCustomizingFood) return;
      const sizeIndex = parseInt(document.querySelector('input[name="qvSize"]:checked')?.value || 0);
      const selectedToppings = Array.from(document.querySelectorAll('input[name="qvTopping"]:checked')).map(cb => cb.value);

      if (window.Cart) {
        window.Cart.addItem(currentCustomizingFood.id, sizeIndex, selectedToppings);
      }

      modalOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
}

function initContactAccordion() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      item.classList.toggle('active');
    });
  });

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (window.showToast) window.showToast('Thank you! Your message has been sent to our customer care team.');
      contactForm.reset();
    });
  }
}

window.openQuickView = openQuickView;
window.updateQvTotalPrice = updateQvTotalPrice;
window.toggleWishlist = toggleWishlist;
window.initWishlistToggle = function() {};
