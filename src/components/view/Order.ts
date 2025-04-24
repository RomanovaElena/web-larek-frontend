import { IOrderForm, Payment } from "../../types";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";
import { Form } from "./Form";

export class Order extends Form<IOrderForm> {
  protected _cardButton: HTMLButtonElement;
  protected _cashButton: HTMLButtonElement;
  protected _addressInput: HTMLInputElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this._cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
    this._cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
    this._cardButton.classList.add('button_alt-active');
    this._addressInput = this.container.elements.namedItem('address') as HTMLInputElement;

    this._cardButton.addEventListener('click', () => {
      this.payment = 'card';
      this.onInputChange('payment', 'card');
    });
    this._cashButton.addEventListener('click', () => {
      this.payment = 'cash';
      this.onInputChange('payment', 'cash');
    });
  }

  set payment(value: Payment) {
    this._cardButton.classList.toggle('button_alt-active', value === 'card');
    this._cashButton.classList.toggle('button_alt-active', value === 'cash');
  }

  set address(value: string) {
    this._addressInput.value = value;
  }
}