import {
  FormErrors,
  IAppState,
  IOrder,
  IOrderContacts,
  IOrderForm,
  IProduct,
  Payment,
} from '../../types';
import { Model } from '../base/Model';

export class AppState extends Model<IAppState> {
  protected _catalog: IProduct[];
  protected _preview: string | null;
  protected _basket: IProduct[] = [];
  protected _order: Partial<IOrder> = {
    payment: '' as Payment,
    address: '',
    email: '',
    phone: '',
  };
  protected _formErrors: FormErrors = {};

  // Установить каталог товаров
  setCatalog(items: IProduct[]) {
    this._catalog = items;
    this.emitChanges('items:changed', { catalog: this._catalog });
  }

  // Получить каталог товаров
  getCatalog() {
    return this._catalog;
  }

  // Установить просматриваемый товар
  setPreview(item: IProduct) {
    this._preview = item.id;
    this.emitChanges('preview:changed', item);
  }

  // Получить просматриваемый товар
  getPreview() {
    return this._preview;
  }

  // Добавить товар в корзину
  addToBasket(item: IProduct) {
    item.selected = true;
    this._basket.push(item);
    this.events.emit('basket:changed', this._basket);
  }

  // Получить массив товаров в корзине
  getBasketItems() {
    return this._basket;
  }

  // Получить количество товаров в корзине
  getBasketAmount() {
    return this._basket.length;
  }

  // Получить общую стоимость товаров в корзине
  getBasketTotal() {
    return this._basket.reduce((total, item) => total + item.price, 0);
  }

  // Удалить один товар из корзины
  deleteFromBasket(item: IProduct) {
    item.selected = false;
    this._basket = this._basket.filter((i) => i !== item);
    this.events.emit('basket:changed', this._basket);
  }

  // Удалить все товары из корзины
  deleteAllFromBasket() {
    this._basket = [];
    this.events.emit('basket:changed', this._basket);
  }

  // Установить данные заказа
  setOrderData(order: IOrder) {
    this._order = order;
  }

  // Сбросить данные заказа
  resetOrderData() {
    this._order = {
      payment: '' as Payment,
      address: '',
      email: '',
      phone: '',
    };
  }

  // Получить частичные данные заказа
  getOrderData() {
    return this._order;
  }

  // Сформировать полные данные заказа для отправки на сервер
  createOrderToPost(): IOrder {
    const orderToPost = this.getOrderData();
    orderToPost.items = this.getBasketItems()
      .filter((item) => item.price != null)
      .map((item) => item.id);
    orderToPost.total = this.getBasketTotal();
    return orderToPost as IOrder;
  }

  // Установить способ оплаты и адрес
  setOrderField(field: keyof IOrderForm, value: string) {
    if (field === 'payment') {
      this._order.payment = value as Payment;
    } else {
      this._order[field] = value;
    }
    this.validateOrder();
  }

  // Установить почту и телефон
  setContactsField(field: keyof IOrderContacts, value: string) {
    this._order[field] = value;
    this.validateContacts();
  }

  // Отвалидировать данные формы с адресом и оплатой
  validateOrder() {
    const errors: typeof this._formErrors = {};
    if (!this._order.payment) {
      errors.payment = 'Необходимо выбрать способ оплаты';
    }
    if (!this._order.address) {
      errors.address = 'Необходимо указать адрес';
    }
    this._formErrors = errors;
    this.events.emit('formErrors.order:change', this._formErrors);
    return Object.keys(errors).length === 0;
  }

  // Отвалидировать данные формы с контактами
  validateContacts() {
    const errors: typeof this._formErrors = {};
    if (!this._order.email) {
      errors.email = 'Необходимо указать email';
    }
    if (!this._order.phone) {
      errors.phone = 'Необходимо указать телефон';
    }
    this._formErrors = errors;
    this.events.emit('formErrors.contacts:change', this._formErrors);
    return Object.keys(errors).length === 0;
  }

  // Получить ошибки валидации форм
  getFormErrors() {
    return this._formErrors;
  }
}
