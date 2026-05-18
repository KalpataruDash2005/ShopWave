const API_BASE = 'http://localhost:8080';

function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  if (url.startsWith('uploads/')) return `${API_BASE}/${url}`;
  return url;
}

const CATEGORY_ICONS = {
  electronics: '📻', phones: '📱', laptop: '💻',
  fashion: '👗', clothing: '👕', shoes: '👟',
  home: '🏠', furniture: '🛋️', kitchen: '🍳',
  sports: '⚽', fitness: '🏋️‍♀️', outdoor: '🏕️',
  books: '📚', toys: '🧸', beauty: '💄',
  food: '🍦', grocery: '🥒', health: '💊',
  default: '🛍️',
};

function getProductIcon(name = '', category = '') {
  const text = `${name} ${category}`.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (text.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
}

const DB = {
  orders: [],
  users: [],
  salesData: { months: [], revenue: [], orders: [] },
  categories: [],
};

const Toast = {
  show(msg, type = 'info', duration = 3200) {
    const stack = document.getElementById('toastStack');
    if (!stack) return;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-msg">${msg}</span>
      <span class="toast-x" onclick="this.parentElement.remove()">✕</span>
    `;
    stack.appendChild(t);
    const timer = setTimeout(() => {
      t.classList.add('leaving');
      setTimeout(() => t.remove(), 300);
    }, duration);
    t.querySelector('.toast-x').onclick = () => { clearTimeout(timer); t.remove(); };
  },
  success: (m, d) => Toast.show(m, 'success', d),
  error: (m, d) => Toast.show(m, 'error', d),
  info: (m, d) => Toast.show(m, 'info', d),
  warning: (m, d) => Toast.show(m, 'warning', d),
};

const ProductStore = {
  loaded: false,
  items: [],
  async fetch() {
    const res = await fetch(`${API_BASE}/products?t=${Date.now()}`);
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
    const data = await res.json();
    this.items = Array.isArray(data) ? data : (data.products || data.items || []);
    this.loaded = true;
    return this.items;
  },
  find(id) {
    return this.items.find(p => (p.id ?? p.productId) == id);
  },
};

const Pages = {
  async products(searchQuery = '') {
    if (!ProductStore.loaded) await ProductStore.fetch();

    const q = searchQuery.trim().toLowerCase();
    const prods = q
      ? ProductStore.items.filter(p =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
        )
      : ProductStore.items;

    const container = document.getElementById('pageContent');
    container.innerHTML = `
      <div class="page-title-row">
        <div>
          <h1 class="page-title">Products</h1>
          <p class="page-subtitle" id="productSubtitle">${ProductStore.items.length} products</p>
        </div>
      </div>

      <div class="page-toolbar">
        <div class="toolbar-left">
          <div class="search-inline">
            <input type="text" placeholder="Search products" id="prodSearch" value="${searchQuery}"/>
          </div>
        </div>
        <button class="btn-primary-sm" type="button" onclick="App.openProductModal()">Add Product</button>
      </div>

      <div class="section-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>IMG</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${prods.map(p => {
              const pid = p.id ?? p.productId;
              const imgSrc = resolveImageUrl(p.image) || '';
              const lowStock = (p.stock ?? 0) < 20;
              return `
                <tr data-id="${pid}">
                  <td>
                    <img src="${imgSrc}" alt="${p.name}" class="tbl-product-img" onerror="this.style.display='none'" />
                  </td>
                  <td><span class="tbl-product-name">${p.name}</span></td>
                  <td style="color:var(--text-muted);font-size:.78rem">${p.category || ''}</td>
                  <td class="mono">₹${Number(p.price || 0).toLocaleString('en-IN')}</td>
                  <td class="mono" style="color:${lowStock ? 'var(--rose)' : 'var(--text-secondary)'}">${p.stock}</td>
                  <td><span class="badge ${lowStock ? 'badge-low' : 'badge-ok'}">${lowStock ? 'Low Stock' : 'In Stock'}</span></td>
                  <td>
                    <div class="tbl-actions">
                      <button class="btn-icon edit" onclick="App.openProductModal(${pid})" type="button" title="Edit">✎</button>
                      <button class="btn-icon danger" onclick="App.deleteProduct(${pid})" type="button" title="Delete">🗑</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    const searchInput = document.getElementById('prodSearch');
    if (searchInput) {
      searchInput.addEventListener('input', () => Pages.products(searchInput.value));
    }
  },
};

const App = {
  editingProductId: null,

  init() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') App.closeModal();
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        App.navigate(item.dataset.page);
      });
    });

    this.navigate('dashboard');
  },

  navigate(page) {
    if (page === 'products') Pages.products();
    if (page === 'dashboard') {
      document.getElementById('pageContent').innerHTML = '<div class="page-title-row"><h1 class="page-title">Dashboard</h1><p class="page-subtitle">Admin console loaded.</p></div>';
    }
    const breadcrumb = document.getElementById('breadcrumbCurrent');
    if (breadcrumb) breadcrumb.textContent = page;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
  },

  openProductModal(id = null) {
    this.editingProductId = id;
    const title = document.getElementById('productModalTitle');
    if (title) title.textContent = id ? 'Edit Product' : 'Add New Product';

    const form = document.getElementById('productForm');
    if (form) form.reset();

    if (id !== null) {
      const p = ProductStore.find(id);
      if (p) {
        document.getElementById('pName').value = p.name || '';
        document.getElementById('pPrice').value = p.price ?? '';
        document.getElementById('pStock').value = p.stock ?? '';
        document.getElementById('pCategory').value = p.category || '';
        document.getElementById('pDesc').value = p.description || '';
        document.getElementById('pImageUrl').value = p.image || '';
      }
    }

    this.openModal('productModal');
  },

  async saveProduct(e) {
    e.preventDefault();

    const name = document.getElementById('pName').value.trim();
    const price = document.getElementById('pPrice').value.trim();
    const stock = document.getElementById('pStock').value.trim();
    const category = document.getElementById('pCategory').value;
    const desc = document.getElementById('pDesc').value.trim();
    const image = document.getElementById('pImageUrl').value.trim();

    if (!name || !price || !stock) {
      Toast.warning('Please fill in Name, Price and Stock.');
      return;
    }

    const productData = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      category,
      description: desc,
      image,
    };

    try {
      const isEdit = this.editingProductId !== null;
      const url = isEdit ? `${API_BASE}/products/${this.editingProductId}` : `${API_BASE}/products`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(t || `Server returned ${res.status}`);
      }

      Toast.success(`Product ${isEdit ? 'updated' : 'added'} successfully! 🎉`);
      this.closeModal();

      ProductStore.loaded = false;
      await Pages.products();
    } catch (err) {
      console.error(err);
      Toast.error(`Save failed: ${err.message}`);
    }
  },

  async handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      document.getElementById('pImageUrl').value = data.url;
      Toast.success('Image uploaded successfully! ✅');
    } catch (err) {
      Toast.error(`Upload failed: ${err.message}`);
    }
  },

  async deleteProduct(id) {
    const p = ProductStore.find(id);
    const label = p ? p.name : `product #${id}`;
    if (!confirm(`Delete ${label}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      Toast.success(`${label} deleted`);
      ProductStore.loaded = false;
      await Pages.products();
    } catch (err) {
      Toast.error(`Delete failed: ${err.message}`);
    }
  },

  openModal(id) {
    document.getElementById('modalOverlay')?.classList.add('open');
    document.getElementById(id)?.classList.add('open');
  },

  closeModal() {
    document.getElementById('modalOverlay')?.classList.remove('open');
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());

