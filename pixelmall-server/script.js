async function loadProducts() {
  const response = await fetch('http://localhost:3000/api/products');
  window.products = await response.json();
}

// Функция рендеринга каталога
function renderCatalog() {
  const container = document.getElementById('catalog');
  if (!container) return;

  container.innerHTML = window.products?.length 
    ? '<div class="no-products">Загрузка товаров...</div>' 
    : '<div class="no-products">Не удалось загрузить товары</div>';

  if (!window.products || !window.products.length) return;

  const category = document.getElementById('category-filter')?.value || 'all';
  const searchTerm = (document.getElementById('search-box')?.value || '').toLowerCase();

  const filteredProducts = window.products.filter(product => {
    const matchesCategory = category === 'all' || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                         (product.description?.toLowerCase().includes(searchTerm));
    return matchesCategory && matchesSearch;
  });

  renderProductList(filteredProducts, container);
}

// Рендер списка товаров
function renderProductList(products, container) {
  if (!products.length) {
    container.innerHTML = '<div class="no-products">Товары не найдены</div>';
    return;
  }

  container.innerHTML = '';
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  products.forEach(product => {
    const card = createProductCard(product, favorites.includes(product.id));
    container.appendChild(card);
  });

  setupProductCardEvents();
}

// Создание карточки товара
function createProductCard(product, isFavorite) {
  const rating = (Math.random() * 0.5 + 4.5).toFixed(1);
  const reviewsCount = Math.floor(Math.random() * 5000) + 100;
  const oldPrice = Math.round(product.price * (1 + Math.random() * 0.3));
  const discount = Math.round((1 - product.price / oldPrice) * 100);

  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <a href="product.html?id=${product.id}" class="product-link">
      <div class="product-image-container">
        <img src="${product.img}" alt="${product.name}" loading="lazy">
        <div class="product-badge">${Math.random() > 0.5 ? 'Хит' : 'Акция'}</div>
      </div>
      <div class="product-info">
        <div class="product-title">${product.name}</div>
        <div class="product-rating">
          ★★★★★ <span>${rating} (${reviewsCount})</span>
        </div>
        <div class="product-price-container">
          <span class="product-price">${product.price.toLocaleString('ru-RU')} ₽</span>
          <span class="product-old-price">${oldPrice.toLocaleString('ru-RU')} ₽</span>
          <span class="product-sale">-${discount}%</span>
        </div>
      </div>
    </a>
    <div class="product-actions">
      <button class="btn-favorite ${isFavorite ? 'active' : ''}" data-id="${product.id}">♥</button>
      <button class="btn-cart" data-id="${product.id}">В корзину</button>
    </div>
  `;
  return card;
}

// Настройка обработчиков событий
function setupProductCardEvents() {
  document.querySelectorAll('.btn-favorite').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = parseInt(this.dataset.id);
      const isFavorite = toggleFavorite(productId);
      this.classList.toggle('active', isFavorite);
      showNotification(isFavorite ? 'Добавлено в избранное' : 'Удалено из избранного');
    });
  });

  document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = parseInt(this.dataset.id);
      addToCart(productId);
      showNotification('Товар добавлен в корзину');
    });
  });
}

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  renderCatalog();

  document.getElementById('category-filter')?.addEventListener('change', renderCatalog);
  document.getElementById('search-box')?.addEventListener('input', renderCatalog);
});