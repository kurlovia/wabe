// Глобальные данные
window.products = [];

// Загрузка данных о товарах с сервера
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Не удалось загрузить товары');
    window.products = await response.json();
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
    window.products = [];
  }
}

// Функция для добавления товара в корзину
window.addToCart = function (productId) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    const product = window.products.find(p => p.id === productId);
    if (product) {
      cart.push({ id: productId, quantity: 1, price: product.price });
    }
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCounter();
};

// Функция для работы с избранным
window.toggleFavorite = function (productId) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const index = favorites.indexOf(productId);

  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(productId);
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
  return index === -1; // Возвращает true, если товар был добавлен
};

// Обновление счетчика корзины
function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-counter').forEach(el => {
    el.textContent = total > 0 ? `(${total})` : '';
  });
}

// === Уведомления ===
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// === Оформление заказа ===
window.placeOrder = function () {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    alert('Ваша корзина пуста.');
    return;
  }

  const order = {
    id: Math.floor(Math.random() * 1000000),
    date: new Date().toLocaleDateString('ru-RU'),
    status: 'new',
    items: [...cart],
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };

  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  localStorage.removeItem('cart');
  updateCartCounter();
  showNotification('Заказ оформлен!');
  window.location.href = 'order-success.html';
};

// === Загрузка истории заказов ===
function loadOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const container = document.getElementById('orders-list');

  if (!container) return;

  container.innerHTML = '';

  if (orders.length === 0) {
    container.innerHTML = '<p>У вас пока нет заказов</p>';
    return;
  }

  orders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card';

    card.innerHTML = `
      <div class="order-header">
        <div><strong>Заказ #${order.id}</strong> (${order.date})</div>
        <div class="order-status status-${order.status}">${getStatusText(order.status)}</div>
      </div>
      <div class="order-products">
        ${order.items.map(item => {
      const product = window.products.find(p => p.id === item.id);
      return `
            <div class="product-item">
              <img src="${product.img}" alt="${product.name}" class="product-image" />
              <div class="product-info">
                <div>${product.name}</div>
                <div>${item.quantity} × ${product.price.toLocaleString('ru-RU')} ₽</div>
              </div>
            </div>`;
    }).join('')}
      </div>
      <div class="order-footer">
        <div class="order-total">Итого: ${order.total.toLocaleString('ru-RU')} ₽</div>
      </div>
    `;
    container.appendChild(card);
  });
}

function getStatusText(status) {
  switch (status) {
    case 'new': return 'Новый';
    case 'completed': return 'Выполнен';
    case 'cancelled': return 'Отменён';
    default: return 'Неизвестный';
  }
}

// === Загрузка избранных товаров ===
function loadFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const container = document.getElementById('favorites-list');

  if (!container) return;

  container.innerHTML = '';

  if (favorites.length === 0) {
    container.innerHTML = '<p>В избранном пока нет товаров</p>';
    return;
  }

  // Создаем контейнер для сетки товаров
  const gridContainer = document.createElement('div');
  gridContainer.className = 'favorites-container';
  container.appendChild(gridContainer);

  favorites.forEach(productId => {
    const product = window.products.find(p => p.id === productId);
    if (!product) return;

    const card = document.createElement('div');
    card.className = 'favorite-product-card';
    card.innerHTML = `
      <a href="product.html?id=${product.id}" class="product-link">
        <img src="${product.img}" alt="${product.name}" class="favorite-product-image">
        <div class="favorite-product-info">
          <div class="product-name">${product.name}</div>
          <div class="product-price">${product.price.toLocaleString('ru-RU')} ₽</div>
        </div>
      </a>
      <button class="remove-favorite" data-id="${product.id}">Удалить из избранного</button>
    `;
    gridContainer.appendChild(card);
  });

  // Обработчики удаления из избранного
  document.querySelectorAll('.remove-favorite').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const productId = parseInt(this.dataset.id);
      let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      favorites = favorites.filter(id => id !== productId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      showNotification('Товар удален из избранного');
      loadFavorites();
    });
  });
}

// === Показать уведомление о сохранении данных ===
document.addEventListener('DOMContentLoaded', () => {
  const editForm = document.querySelector('.edit-form');
  const saveBtn = document.querySelector('.save-btn');

  if (saveBtn && editForm) {
    saveBtn.addEventListener('click', () => {
      showNotification('Данные успешно сохранены!');
    });
  }

  // Автоматическое обновление счетчиков при загрузке
  updateCartCounter();
  updateFavoritesCounter();

  // Если на странице есть вкладки — подгрузить данные при клике
  document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      if (tabId === 'favorites') loadFavorites();
      if (tabId === 'orders') loadOrders();
    });
  });

  // Подгрузка при открытии страницы account.html
  if (window.location.pathname.includes('account.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'favorites') loadFavorites();
    if (tab === 'orders') loadOrders();
  }
});