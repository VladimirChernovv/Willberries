const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

// Делаем карзину

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
// Функционал для получения товаров с сервера (goods)

const viewAll = document.querySelectorAll('.view-all');
const navigationLink = document.querySelectorAll('.navigation-link:not(.view-all)');
const longGoodsList = document.querySelector('.long-goods-list');
const showAcsessories = document.querySelectorAll('.show-acsessories');
const showClothing = document.querySelectorAll('.show-clothing');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');

// Функция которая получает данные(товар) с сервера. Сервером является папка db
const getGoods = async () => {
  const result = await fetch('db/db.json');// Здесь можно подставить любой адрес и получать данные
  if (!result.ok) {
    throw 'Ошибка вышла: ' + result.status;
  };
  
  return await result.json();
};

// Создаём свой объект данных дя корзины
const cart = {
  cartGoods: [
    {
      id: '099',
      name: 'Watch Dior',
      price: 999,
      count: 2,
    },
    {
      id: '090',
      name: 'Gray hat',
      price: 99,
      count: 4,
    },
  ],
  renderCart() {
    cartTableGoods.textContent = '';
    // Перебераем товары cartGoods
    this.cartGoods.forEach(({ id, name, price, count }) => {
      const trGood = document.createElement('tr');
      trGood.className = 'cart-item';
      trGood.dataset.id = id;

      trGood.innerHTML = `
        <td>${name}</td>
        <td>${price}$</td>
        <td><button class="cart-btn-minus">-</button></td>
        <td>${count}</td>
        <td><button class="cart-btn-plus">+</button></td>
        <td>${price * count}$</td>
        <td><button class="cart-btn-delete">x</button></td>
      `;
      cartTableGoods.append(trGood);
    });
    const totalPrice = this.cartGoods.reduce((sum, item) => {
      return sum + item.price * item.count;
    }, 0);
    cardTableTotal.textContent = totalPrice + '$';
  },
  deleteGood(id) {
    this.cartGoods = this.cartGoods.filter(item => id !== item.id);
    this.renderCart();
  },
  minusGood(id) {
    for (const item of this.cartGoods) {
      if (item.id === id) {
        if (item.id <= 1) {
          this.deleteGood(id);
        } else {
          item.count--;
        };
        
        break;
      };
    };
    this.renderCart();
  },
  plusGood(id) {
    for(const item of this.cartGoods) {
      if (item.id === id) {
        item.count++;
        break;
      };
    };
    this.renderCart();
  },
  addCartGoods(id) {
    const goodItem = this.cartGoods.find(item => item.id === id);
    if (goodItem) {
      this.plusGood(id);
    } else {
      getGoods()
        .then(data => data.find(item => item.id === id))
        .then(({ id, name, price }) => {
          this.cartGoods.push({
            id,
            name,
            price,
            count: 1,
          })
        })
    }
  },
};

document.body.addEventListener('click', event => {
  const addToCart = event.target.closest('.add-to-cart');
  console.log(addToCart);

  if (addToCart) {
    cart.addCartGoods(addToCart.dataset.id);
  }
});

cartTableGoods.addEventListener('click', (event) => {
  // Мы сохранили элимент на который кликнули
  const target = event.target;

  if (target.tagName === 'BUTTON') {
    const id = target.closest('.cart-item').dataset.id;

    if (target.classList.contains('cart-btn-delete')) {
      cart.deleteGood(id);
    };

    if (target.classList.contains('cart-btn-minus')) {
      cart.minusGood(id);
    };

    if (target.classList.contains('cart-btn-plus')) {
      cart.plusGood(id);
    };
  };
});

const openModal = () => {
  cart.renderCart();
	modalCart.classList.add('show');
};

const closeModal = () => {
  modalCart.classList.remove('show');
};

buttonCart.addEventListener('click', openModal);

// Закрываем модальное окно(делаем делегирование) если клик сделан не на нём 
modalCart.addEventListener('click', (event) => {
  const target = event.target;
  if (target.classList.contains('overlay') || //Проверка на наличие класса
    target.classList.contains('modal-close')) {
    closeModal();
  };
});

// Плавная прокрутка(scroll smooth)

{
  const scrollLinks = document.querySelectorAll('a.scroll-link');

  for (const scrollLink of scrollLinks) {
    scrollLink.addEventListener('click', (event) => {
      event.preventDefault();
      const id = scrollLink.getAttribute('href');
      document.querySelector(id).scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };
};

// Функция создающая карточки, добавдяет классы, вёрстку и возращает карточку.
// Делаем деструкторизацию для парамитров функции
const createCard = function({ label, name, img, description, id, price }) {
  const card = document.createElement('div');
  card.className = 'col-lg-3 col-sm-6';

  card.innerHTML = `
    <div class="goods-card">
      ${label ? `<span class="label">${label}</span>` : ''}
      
      <img src="db/${img}" alt="${name}" class="goods-image">
      <h3 class="goods-title">${name}</h3>
      <p class="goods-description">${description}</p>
      <button class="button goods-card-btn add-to-cart" data-id="${id}">
        <span class="button-price">$${price}</span>
      </button>
    </div>
  `;

  return card;
};

// Функция(делает рэндэринг) показывающая карточки на странице
const renderCards = (data) => {
  longGoodsList.textContent = '';
  const cards = data.map(createCard);
  longGoodsList.append(...cards);
  document.body.classList.add('show-goods');
};

const showAll = (event) => {
  event.preventDefault();
  getGoods().then(renderCards);
};

viewAll.forEach(function(elem) {
  elem.addEventListener('click', showAll);
});


// Функция получает данные с сервера и фильтрует по параметрам (field, value)
const filterCards = function(field, value) {
  getGoods()
    .then((data) => data.filter((good) => good[field] === value))
    .then(renderCards);
};

navigationLink.forEach(function(link) {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const field = link.dataset.field;
    const value = link.textContent;
    filterCards(field, value);
  });
});

//

showAcsessories.forEach(item => {
  item.addEventListener('click', event => {
    event.preventDefault();
    filterCards('category', 'Accessories');
  });
});

showClothing.forEach((item) => {
  item.addEventListener('click', (event) => {
    event.preventDefault();
    filterCards('category', 'Clothing');
  });
});
