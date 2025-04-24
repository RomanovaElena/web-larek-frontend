import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { WebLarekAPI } from './components/model/WebLarekAPI';
import { CDN_URL, API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { AppState } from './components/model/AppData';
import { Basket } from './components/view/Basket';
import { Contacts } from './components/view/Contacts';
import { Modal } from './components/view/Modal';
import { Order } from './components/view/Order';
import { Page } from './components/view/Page';
import { Success } from './components/view/Success';
import { Card } from './components/view/Card';
import { IOrderContacts, IOrderForm, IOrderResult, IProduct } from './types';

const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки-----------------------------------------------------
events.onAll(({ eventName, data }) => {
  console.log(eventName, data);
})

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {
  onClick: () => {modal.close()} 
})

// Бизнес-логика приложения на основе событийно-ориентированного подхода

// Изменились элементы каталога
events.on('items:changed', () => {
  page.catalog = appData.getCatalog().map(item => {
    const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit('card:select', item)
    });
    return card.render({
      id: item.id,
      title: item.title,
      image: item.image,
      category: item.category,
      price: item.price,
    });
  })
})

// Открыли карточку товара
events.on('card:select', ((item: IProduct) => {
  appData.setPreview(item);
}))

// Изменен открытый товар
events.on('preview:changed', (item: IProduct) => {
  if (item) {
    const card = new Card('card', cloneTemplate(cardPreviewTemplate), {
      onClick: () => {
        if (item.selected) {
          events.emit('product:delete', item);
          events.emit('preview:changed', item);
        } else {
          events.emit('product:add', item);
          events.emit('preview:changed', item);
        }
      }
    });
    modal.render({
      content: card.render({
        title: item.title,
        description: item.description,
        image: item.image,
        price: item.price,
        category: item.category,
        selected: item.selected,
      })
    });
  }
});

// Товар добавлен в корзину 
events.on('product:add', (item: IProduct) => {
  appData.addToBasket(item);
  // page.counter = appData.getBasketAmount();
})

// Открыта корзина
events.on('basket:open', () => {
  modal.render({
    content: basket.render({})
  })
})

// Изменилось содержимое корзины
events.on('basket:changed', () => {
  basket.items = appData.getBasketItems().map((item, index) => {
    const card = new Card('card', cloneTemplate(cardBasketTemplate), {
      onClick: () => {
        events.emit('product:delete', item);
      }
    });
    return card.render({
      index: index + 1 ,
      title: item.title,
      price: item.price,
    })
  })
  basket.render({
    total:appData.getBasketTotal(),
  })
  page.render({
    counter: appData.getBasketAmount(),
  })
  // basket.total = appData.getBasketTotal();
  // page.counter = appData.getBasketAmount();
})

// Товар удален из корзины
events.on('product:delete', (item: IProduct) => {
  appData.deleteFromBasket(item);
});

// Открыто оформление заказа 
events.on('order:open', () => {
  modal.render({
    content: order.render({
      payment: appData.getOrderData().payment, 
      address: appData.getOrderData().address,
      valid: appData.validateOrder(),
      errors:[],
    }),
  })
})

// Изменилось одно из полей формы заказа
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
  appData.setOrderField(data.field, data.value);
});

// Изменилось одно из полей формы контактов
events.on(/^contacts\..*:change/, (data: { field: keyof IOrderContacts, value: string }) => {
  appData.setContactsField(data.field, data.value);
});

// Изменилось состояние валидации форм
// events.on('formErrors:change', (errors: Partial<IOrderForm>) => { 
//   const { payment, address, email, phone } = errors;
//   order.valid = !payment && !address;
//   contacts.valid = !email && !phone;
//   order.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
//   contacts.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
// });

// Изменилось состояние валидации формы заказа
events.on('formErrors.order:change', (errors: Partial<IOrderForm>) => { 
  const { payment, address } = errors;
  order.valid = !payment && !address;
  order.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
});
// Изменилось состояние валидации формы контактов
events.on('formErrors.contacts:change', (errors: Partial<IOrderContacts>) => { 
  const { email, phone } = errors;
  contacts.valid = !email && !phone;
  contacts.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});

// Отправлена форма заказа с типом оплаты и адресом
events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			email: appData.getOrderData().email,
			phone: appData.getOrderData().phone,
			valid: appData.validateContacts(),
			errors: [],
		}),
	});
});

// Отправлена форма заказа с контактами
events.on('contacts:submit', () => {
  // appData.getOrderData().items = appData.getBasketItems()
  //   .filter((item) => item.price != null)
  //   .map((item) => item.id);
  // appData.getOrderData().total = appData.getBasketTotal();
  api.orderProducts(appData.createOrderToPost())
  .then(res => {
    events.emit('order:success', res)
    success.total = res.total;
    appData.deleteAllFromBasket();
    appData.resetOrderData();
  })
  .catch(err => {
    console.log(err);
  })
});

// Заказ отправлен на сервер
events.on('order:success', (res: IOrderResult) => {
  modal.render({
    content: success.render({
      total: success.total, 
    }),
  });
})

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
  page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
  page.locked = false;
});

// Получаем товары с сервера
api.getProductList()
  .then(data => {
    appData.setCatalog(data);
    console.log(data);
  })