const API = {
  BASE: 'http://localhost:8080',
  PRODUCTS:      () => `${API.BASE}/products?t=${Date.now()}`,
  CART:          () => `${API.BASE}/cart`,
  CART_ADD:      () => `${API.BASE}/cart/add`,
  CART_REMOVE:   (id) => `${API.BASE}/cart/remove/${id}`,
  ORDER_PLACE:   () => `${API.BASE}/order/place`,
};

const state = {
  products: [],
  cart: [],
  loading: false,
};

const CATEGORY_ICONS = {
  electronics: '💻', phones: '📱', laptop: '💻',
  fashion: '👗', clothing: '👕', shoes: '👟',
  home: '🏠', furniture: '🪑', kitchen: '🍳',
  sports: '⚽', fitness: '🏋️', outdoor: '🏕️',
  books: '📚', toys: '🧸', beauty: '💄',
  food: '🍎', grocery: '🛒', health: '💊',
  default: '📦',
};

function getProductIcon(name = '', category = '') {
  const n = name || '';
  const c = category || '';
  const text = (n + ' ' + c).toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (text.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
}

function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  if (url.startsWith('uploads/')) return `${API.BASE}/${url}`;
  return url;
}

const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 3500) {
    if (!this.container) this.init();

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-msg">${message}</span>
      <span class="toast-close" role="button" aria-label="Close">✕</span>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => this.remove(toast));
    this.container.appendChild(toast);

    const timer = setTimeout(() => this.remove(toast), duration);
    toast._timer = timer;
    return toast;
  },

  remove(toast) {
    clearTimeout(toast._timer);
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  },

  success: (msg, d) => Toast.show(msg, 'success', d),
  error:   (msg, d) => Toast.show(msg, 'error', d),
  info:    (msg, d) => Toast.show(msg, 'info', d),
  warning: (msg, d) => Toast.show(msg, 'warning', d),
};

async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      cache: 'no-store',
      ...options,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${res.status}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;

  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Cannot reach server. Is the backend running?');
    }
    throw err;
  }
}

function updateCartBadge(count) {
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

async function refreshCartCount() {
  try {
    const cart = await apiFetch(API.CART());
    const items = Array.isArray(cart) ? cart : (cart?.items || []);
    const total = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    updateCartBadge(total);
    state.cart = items;
  } catch {

  }
}

const KEYWORD_IMAGE_MAP = [

  { keywords: ['gaming laptop', 'gaming notebook'],  url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&q=80&fit=crop' },
  { keywords: ['laptop', 'notebook', 'macbook'],     url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80&fit=crop' },
  { keywords: ['desktop', 'pc', 'computer', 'imac'], url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=500&q=80&fit=crop' },
  { keywords: ['monitor', 'screen', 'display'],      url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80&fit=crop' },
  { keywords: ['keyboard'],                          url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&q=80&fit=crop' },
  { keywords: ['mouse'],                             url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80&fit=crop' },

  { keywords: ['iphone', 'iphone 14', 'iphone 15'],        url: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=500&q=80&fit=crop' },
  { keywords: ['samsung', 'galaxy', 'android phone'],      url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80&fit=crop' },
  { keywords: ['phone', 'smartphone', 'mobile'],           url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80&fit=crop' },
  { keywords: ['tablet', 'ipad'],                          url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80&fit=crop' },

  { keywords: ['wireless headphone', 'headphone', 'headset', 'over-ear'], url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80&fit=crop' },
  { keywords: ['earphone', 'earbud', 'airpod', 'tws', 'in-ear'],         url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80&fit=crop' },
  { keywords: ['speaker', 'bluetooth speaker', 'soundbar'],               url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80&fit=crop' },

  { keywords: ['camera', 'dslr', 'mirrorless', 'polaroid', 'lens'],  url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80&fit=crop' },

  { keywords: ['smart watch', 'smartwatch', 'apple watch', 'fitness band', 'band'], url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80&fit=crop' },

  { keywords: ['tv', 'television', 'smart tv', 'led tv', 'oled'],    url: 'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=500&q=80&fit=crop' },

  { keywords: ['running shoe', 'running shoes', 'sneaker', 'sports shoe', 'nike', 'adidas'], url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80&fit=crop' },
  { keywords: ['boot', 'ankle boot', 'hiking boot'],                   url: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500&q=80&fit=crop' },
  { keywords: ['sandal', 'slipper', 'flip flop'],                      url: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500&q=80&fit=crop' },
  { keywords: ['heel', 'pump', 'wedge', "women's shoe"],               url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80&fit=crop' },

  { keywords: ['t-shirt', 'tshirt', 'shirt', 'polo'],         url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80&fit=crop' },
  { keywords: ['jeans', 'denim', 'trouser', 'pant'],          url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80&fit=crop' },
  { keywords: ['jacket', 'hoodie', 'sweatshirt', 'coat'],     url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80&fit=crop' },
  { keywords: ['dress', 'gown', 'kurta', 'saree'],            url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80&fit=crop' },

  { keywords: ['backpack', 'bag', 'handbag', 'purse', 'wallet'], url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80&fit=crop' },
  { keywords: ['sunglasses', 'spectacle', 'glasses'],             url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80&fit=crop' },
  { keywords: ['watch', 'analog watch', 'luxury watch'],          url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80&fit=crop' },

  { keywords: ['sofa', 'couch', 'sectional'],                      url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80&fit=crop' },
  { keywords: ['office chair', 'chair', 'gaming chair', 'stool'],  url: 'https://images.unsplash.com/photo-1589364222628-4551c4c5a0fe?w=500&q=80&fit=crop' },
  { keywords: ['table', 'desk', 'dining table', 'coffee table'],   url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80&fit=crop' },
  { keywords: ['bed', 'mattress', 'pillow', 'bedsheet'],           url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80&fit=crop' },
  { keywords: ['lamp', 'light', 'bulb', 'chandelier'],             url: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=500&q=80&fit=crop' },
  { keywords: ['curtain', 'blind', 'drape'],                       url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80&fit=crop' },
  { keywords: ['plant', 'flower pot', 'indoor plant'],             url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80&fit=crop' },

  { keywords: ['refrigerator', 'fridge'],        url: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500&q=80&fit=crop' },
  { keywords: ['washing machine', 'washer'],     url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&q=80&fit=crop' },
  { keywords: ['microwave', 'oven'],             url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&q=80&fit=crop' },
  { keywords: ['air conditioner', 'ac', 'fan'],  url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&q=80&fit=crop' },
  { keywords: ['mixer', 'blender', 'juicer'],    url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&q=80&fit=crop' },
  { keywords: ['kettle', 'coffee maker', 'toaster'], url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80&fit=crop' },

  { keywords: ['perfume', 'cologne', 'fragrance'],   url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&q=80&fit=crop' },
  { keywords: ['lipstick', 'makeup', 'cosmetic'],    url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80&fit=crop' },
  { keywords: ['shampoo', 'conditioner', 'hair'],    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80&fit=crop' },
  { keywords: ['face wash', 'moisturizer', 'cream', 'serum', 'skincare'], url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80&fit=crop' },

  { keywords: ['gym', 'dumbbell', 'barbell', 'weight'],  url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80&fit=crop' },
  { keywords: ['yoga mat', 'yoga'],                       url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80&fit=crop' },
  { keywords: ['cricket', 'bat', 'ball'],                 url: 'https://images.unsplash.com/photo-1540747913346-19212a4b1349?w=500&q=80&fit=crop' },
  { keywords: ['football', 'soccer'],                     url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&q=80&fit=crop' },
  { keywords: ['bicycle', 'cycle', 'bike'],               url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&q=80&fit=crop' },

  { keywords: ['book', 'novel', 'textbook', 'comic'],   url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80&fit=crop' },
  { keywords: ['notebook', 'diary', 'journal'],          url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&q=80&fit=crop' },
  { keywords: ['pen', 'pencil', 'stationery'],           url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&q=80&fit=crop' },

  { keywords: ['toy', 'doll', 'lego', 'puzzle', 'board game'], url: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=500&q=80&fit=crop' },

  { keywords: ['chocolate', 'candy', 'sweet'],    url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&q=80&fit=crop' },
  { keywords: ['fruit', 'apple', 'mango'],        url: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=500&q=80&fit=crop' },
  { keywords: ['coffee', 'tea'],                  url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80&fit=crop' },
];

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80&fit=crop', 
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80&fit=crop', 
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80&fit=crop', 
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80&fit=crop', 
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80&fit=crop', 
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80&fit=crop',    
];

function getDemoImage(name = '', category = '', id = 0) {
  const n = name || '';
  const c = category || '';
  const productText  = n.toLowerCase().trim();
  const categoryText = c.toLowerCase().trim();

  for (const entry of KEYWORD_IMAGE_MAP) {
    for (const kw of entry.keywords) {
      if (productText.includes(kw)) return entry.url;
    }
  }

  for (const entry of KEYWORD_IMAGE_MAP) {
    for (const kw of entry.keywords) {
      if (categoryText.includes(kw)) return entry.url;
    }
  }

  return FALLBACK_IMAGES[(Number(id) || 0) % FALLBACK_IMAGES.length];
}

function buildProductCard(product) {
  const { id, productId, name, price, image, category, originalPrice, badge } = product;
  const actualId = id !== undefined ? id : productId;

  let imgSrc = (image && image.length > 4 && !image.includes('undefined'))
    ? image
    : getDemoImage(name, category, actualId);

  imgSrc = resolveImageUrl(imgSrc);

  const discount = originalPrice && originalPrice > price
    ? Math.round((1 - price / originalPrice) * 100)
    : null;

  const badgeHtml = badge
    ? `<span class="product-badge badge-${badge.toLowerCase()}">${badge}</span>`
    : '';

  const ratingVal = 3.5 + ((Number(actualId) * 7 + 13) % 15) / 10;
  const stars = '★'.repeat(Math.round(ratingVal)) + '☆'.repeat(5 - Math.round(ratingVal));
  const reviewCount = 50 + ((Number(actualId) * 37 + 200) % 1950);

  return `
    <article class="product-card" data-id="${actualId}" data-name="${name}" data-price="${price}">
      <div class="product-image-wrap">
        <img
          src="${imgSrc}"
          alt="${name}"
          class="product-img"
          loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        >
        <div class="product-image-placeholder" style="display:none">
          <span class="placeholder-icon">${getProductIcon(name, category)}</span>
          <span class="placeholder-text">${category || 'Product'}</span>
        </div>
        ${badgeHtml}
        <button class="btn-wishlist" title="Add to Wishlist" aria-label="Wishlist">♡</button>
      </div>
      <div class="product-body">
        ${category ? `<div class="product-category">${category}</div>` : ''}
        <h3 class="product-name">${name}</h3>
        <div class="product-rating">
          <span class="stars">${stars}</span>
          <span class="rating-count">(${reviewCount.toLocaleString()})</span>
        </div>
        <div class="product-footer">
          <div class="product-price-group">
            <span class="price-current">₹${Number(price).toLocaleString('en-IN')}</span>
            ${originalPrice ? `<span class="price-original">₹${Number(originalPrice).toLocaleString('en-IN')}</span>` : ''}
            ${discount ? `<span class="price-discount">${discount}% off</span>` : ''}
          </div>
          <button class="btn-add-cart" data-id="${actualId}" aria-label="Add to cart">
            <span>🛒</span> Add
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderSkeletons(container, count = 8) {
  container.innerHTML = Array(count).fill('').map(() => `
    <div class="skeleton-card">
      <div class="skeleton skel-img"></div>
      <div class="skeleton skel-p w70" style="margin-top:16px"></div>
      <div class="skeleton skel-p w90"></div>
      <div class="skeleton skel-p w45"></div>
      <div class="skeleton skel-p w70" style="margin-bottom:18px"></div>
    </div>
  `).join('');
}

async function initHomePage() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  renderSkeletons(grid);

  try {
    const data = await apiFetch(API.PRODUCTS());
    state.products = Array.isArray(data) ? data : (data?.products || data?.items || []);

    renderProducts(state.products, grid);
    setupSearch();
    setupCategoryFilter();

  } catch (err) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Could not load products</h3>
        <p>${err.message}</p>
      </div>
    `;
    Toast.error('Failed to load products: ' + err.message);
  }

  grid.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-add-cart');
    if (!btn) return;

    const productId = btn.dataset.id;
    const card = btn.closest('.product-card');
    const name = card?.dataset.name || 'Product';

    btn.classList.add('adding');
    btn.innerHTML = '<span>✔</span> Added!';

    try {
      await apiFetch(API.CART_ADD(), {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      Toast.success(`"${name}" added to cart 🛒`);
      refreshCartCount();

    } catch (err) {
      Toast.error('Could not add to cart: ' + err.message);
    } finally {
      setTimeout(() => {
        btn.classList.remove('adding');
        btn.innerHTML = '<span>🛒</span> Add';
      }, 1800);
    }
  });
}

function renderProducts(products, grid) {
  if (!products.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try a different search or category.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(buildProductCard).join('');
}

function setupSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = input.value.trim().toLowerCase();
      const grid = document.getElementById('products-grid');

      const filtered = query
        ? state.products.filter(p =>
            p.name?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)
          )
        : state.products;

      renderProducts(filtered, grid);
    }, 280);
  });

  document.querySelector('.search-btn')?.addEventListener('click', () => {
    input.dispatchEvent(new Event('input'));
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.dispatchEvent(new Event('input'));
  });
}

function setupCategoryFilter() {
  const chips = document.querySelectorAll('.cat-chip');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const category = chip.dataset.category;
      const grid = document.getElementById('products-grid');

      const filtered = category === 'all'
        ? state.products
        : state.products.filter(p =>
            p.category?.toLowerCase().includes(category.toLowerCase())
          );

      renderProducts(filtered, grid);
    });
  });
}

async function initCartPage() {
  const cartContainer = document.getElementById('cart-items-container');
  if (!cartContainer) return;

  await loadCart();
}

async function loadCart() {
  const cartContainer = document.getElementById('cart-items-container');
  const summaryPanel = document.getElementById('cart-summary-panel');

  cartContainer.innerHTML = '<div style="padding:40px;text-align:center;color:var(--gray-400)">Loading cart…</div>';

  try {
    const data = await apiFetch(API.CART());
    const items = Array.isArray(data) ? data : (data?.items || data?.cart || []);
    state.cart = items;

    renderCartItems(items, cartContainer);
    renderCartSummary(items, summaryPanel);
    updateCartBadge(items.reduce((s, i) => s + (i.quantity || 1), 0));

  } catch (err) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">⚠️</div>
        <h2>Could not load cart</h2>
        <p>${err.message}</p>
        <a href="index.html" class="btn-primary" style="display:inline-flex;margin-top:8px">
          ← Back to Shop
        </a>
      </div>
    `;
    Toast.error('Failed to load cart: ' + err.message);
  }
}

function renderCartItems(items, container) {
  if (!items.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet. Start shopping!</p>
        <a href="index.html" class="btn-primary" style="display:inline-flex;margin-top:8px">
          ← Continue Shopping
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map((item, i) => buildCartItemHtml(item, i)).join('');

  container.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id, btn.dataset.name));
  });
}

function buildCartItemHtml(item, index) {
  const { id, productId, name, price, image, category, quantity = 1 } = item;
  const itemId = id || productId;
  const animDelay = index * 60;

  let imgSrc = (image && image.length > 4 && !image.includes('undefined'))
    ? image
    : getDemoImage(name, category, itemId);

  imgSrc = resolveImageUrl(imgSrc);

  return `
    <div class="cart-item" style="animation-delay:${animDelay}ms" data-id="${itemId}">
      <div class="cart-item-img">
        <img
          src="${imgSrc}"
          alt="${name}"
          style="width:100%;height:100%;object-fit:cover;object-position:center top;border-radius:var(--radius-sm)"
          onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span style=font-size:2rem;display:flex;align-items:center;justify-content:center;width:100%;height:100%>${getProductIcon(name, category)}</span>')"
        >
      </div>
      <div class="cart-item-info">
        ${category ? `<div class="cart-item-category">${category}</div>` : ''}
        <div class="cart-item-name">${name}</div>
        <div class="cart-item-meta">
          <div class="cart-item-qty">
            <button class="qty-btn" disabled title="Qty">−</button>
            <span class="qty-value">${quantity}</span>
            <button class="qty-btn" disabled title="Qty">+</button>
          </div>
          <button class="btn-remove" data-id="${itemId}" data-name="${name}">
            🗑 Remove
          </button>
        </div>
      </div>
      <div class="cart-item-price">
        ₹${(Number(price) * quantity).toLocaleString('en-IN')}
      </div>
    </div>
  `;
}

function renderCartSummary(items, panel) {
  if (!panel) return;

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * (item.quantity || 1), 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;
  const hasItems = items.length > 0;

  panel.innerHTML = `
    <div class="summary-title">Order Summary</div>

    <div class="summary-row subtotal">
      <span>Subtotal (${items.length} item${items.length !== 1 ? 's' : ''})</span>
      <span>₹${subtotal.toLocaleString('en-IN')}</span>
    </div>
    <div class="summary-row">
      <span>Shipping</span>
      <span>${shipping === 0 ? '<span style="color:var(--success);font-weight:600">FREE</span>' : '₹' + shipping}</span>
    </div>
    <div class="summary-row">
      <span>GST (18%)</span>
      <span>₹${tax.toLocaleString('en-IN')}</span>
    </div>

    <hr class="summary-divider">

    <div class="summary-row total">
      <span>Total</span>
      <span class="total-price">₹${total.toLocaleString('en-IN')}</span>
    </div>

    <div class="promo-wrap">
      <input type="text" class="promo-input" placeholder="Promo code" id="promo-code">
      <button class="btn-promo" onclick="applyPromo()">Apply</button>
    </div>

    ${shipping > 0 ? `
    <div style="font-size:0.78rem;color:var(--success);background:rgba(16,185,129,.08);border-radius:8px;padding:8px 12px;margin-bottom:12px">
      🎁 Add ₹${(499 - subtotal + 1).toLocaleString('en-IN')} more for FREE shipping!
    </div>` : `
    <div style="font-size:0.78rem;color:var(--success);background:rgba(16,185,129,.08);border-radius:8px;padding:8px 12px;margin-bottom:12px">
      ✅ You've got FREE shipping!
    </div>`}

    <button class="btn-place-order" id="btn-place-order"
      ${!hasItems ? 'disabled' : ''}
      onclick="placeOrder()">
      <span>🎉</span> Place Order
    </button>

    <div class="security-note">
      🔒 Secure checkout · SSL encrypted
    </div>
  `;
}

async function removeFromCart(itemId, itemName) {
  try {
    await apiFetch(API.CART_REMOVE(itemId), { method: 'DELETE' });
    Toast.success(`"${itemName}" removed from cart`);
    await loadCart();
  } catch (err) {
    Toast.error('Could not remove item: ' + err.message);
  }
}

function applyPromo() {
  const code = document.getElementById('promo-code')?.value.trim().toUpperCase();
  if (!code) { Toast.warning('Enter a promo code first'); return; }

  const codes = { 'SAVE10': '10% off', 'FIRST50': '₹50 off', 'SHOPWAVE': 'Free shipping' };
  if (codes[code]) {
    Toast.success(`Promo "${code}" applied: ${codes[code]} 🎉`);
  } else {
    Toast.error(`Promo code "${code}" is invalid`);
  }
}

async function placeOrder() {
  const btn = document.getElementById('btn-place-order');
  if (!btn || btn.disabled) return;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="display:inline-block;width:18px;height:18px;border:2px solid white;border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite"></span> Placing…';

  if (!document.getElementById('spin-style')) {
    const s = document.createElement('style');
    s.id = 'spin-style';
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }

  try {
    const result = await apiFetch(API.ORDER_PLACE(), { method: 'POST' });

    const orderId = result?.orderId || result?.id || `SW${Date.now().toString(36).toUpperCase()}`;

    Toast.success('Order placed successfully! 🎉', 4000);
    setTimeout(() => {
      window.location.href = `order-success.html?orderId=${orderId}`;
    }, 800);

  } catch (err) {
    Toast.error('Order failed: ' + err.message);
    btn.disabled = false;
    btn.innerHTML = '<span>🎉</span> Place Order';
  }
}

function initSuccessPage() {
  const orderIdEl = document.getElementById('order-id-display');
  if (!orderIdEl) return;

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId') || `SW${Date.now().toString(36).toUpperCase()}`;
  orderIdEl.textContent = `#${orderId}`;
}

document.addEventListener('click', (e) => {
  if (e.target.closest('.btn-wishlist')) {
    const btn = e.target.closest('.btn-wishlist');
    const isLiked = btn.classList.toggle('liked');
    btn.textContent = isLiked ? '♥' : '♡';
    if (isLiked) btn.style.color = '#ef4444';
    else btn.style.color = '';
    const name = btn.closest('.product-card')?.dataset.name || 'Product';
    if (isLiked) Toast.info(`"${name}" saved to wishlist ♥`);
  }
});

function handleScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

function setupAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card, .section-header, .hero-content').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  refreshCartCount();

  window.addEventListener('scroll', handleScroll);
  setupAnimations();

  const page = document.body.dataset.page;

  if (page === 'home')    initHomePage();
  if (page === 'cart')    initCartPage();
  if (page === 'success') initSuccessPage();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && document.body.dataset.page === 'home') {
        initHomePage();
    }
  });
});
