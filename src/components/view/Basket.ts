import { IBasket } from '../../types';
import { ensureElement, createElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

export class Basket extends Component<IBasket> {
  protected _list: HTMLElement;
  protected _total: HTMLElement;
  protected _button: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._list = ensureElement<HTMLElement>('.basket__list', this.container);
    this._total = this.container.querySelector('.basket__price');
    this._button = this.container.querySelector('.basket__button');
    this.setDisabled(this._button, true);
    if (this._button) {
      this._button.addEventListener('click', () => {
        events.emit('order:open');
      });
    }
  }

  set items(items: HTMLElement[]) {
    if (this._total) {
      this._list.replaceChildren(...items);
      this.setDisabled(this._button, false);
    } else {
      this._list.replaceChildren(
        createElement<HTMLParagraphElement>('p', {
          textContent: 'Корзина пуста',
        })
      );
      this.setDisabled(this._button, true);
    }
  }

  set total(total: number) {
    this.setText(this._total, total);
    if (total > 0) {
      this.setDisabled(this._button, false);
    } else {
      this.setDisabled(this._button, true);
    }
  }
}
