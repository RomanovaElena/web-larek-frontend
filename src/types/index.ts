export type Category = 'софт-скил' | 'другое' | 'дополнительное' | 'кнопка' | 'хард-скил';

export type Payment = 'card' | 'cash';

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IWebLarekAPI {
  getProductList: () => Promise<IProduct[]>;
  getProductItem: (id: string) => Promise<IProduct>;
  orderProducts: (order: IOrder) => Promise<IOrderResult>;
}

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: Category;
  price: number | null;
  selected: boolean;
}

export interface IAppState {
  setCatalog(): void;
  getCatalog(): IProduct[];
  setPreview(): void;
  getPreview(): string;
  addToBasket(): void;
  setBasketItems(): void;
  getBasketItems(): IProduct[];
  getBaskettAmount(): number;
  getBasketTotal(): number;
  deleteFromBasket(): void;
  deleteAllFromBasket(): void;
  setOrderData(): void;
  resetOrderData(): void;
  getOrderData() : IOrder;
  setOrderField(): void;
  setContactsField(): void;
  validateOrder(): string;
  validateContacts(): string;
  getFormErrors(): FormErrors;
}

export interface IPage {
  counter: number;
  catalog: HTMLElement[];
  locked: boolean;
}

export interface ICard {
	id: string;
	description: string;
	image: string;
	title: string;
	category: Category;
	price: number | null;
	selected: boolean;
	index: number;
}

export interface IBasket {
  items: HTMLElement[];
  total: number;
}

export interface IOrder extends IOrderForm, IOrderContacts {
  items: string[];
  total: number;
}

export interface IOrderForm {
  payment: Payment;
  address: string;
  email: string;
  phone: string;
}

export interface IOrderContacts {
  email: string;
  phone: string;
}

export interface IOrderResult {
  id: string;
  total: number;
}

export interface IFormState {
  valid: boolean;
  errors: string[];
}

export interface IModalData {
	content: HTMLElement;
}

export interface ISuccess {
  total: number;
}
