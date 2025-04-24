import { Category, ICardActions } from '../../types';
import { categoryMapping } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';

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

export class Card extends Component<ICard> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _image?: HTMLImageElement;
  protected _category?: HTMLElement;
  protected _description?: HTMLElement;
  protected _button?: HTMLButtonElement;
  protected _index?: HTMLElement;

  constructor(
    protected blockName: string,
    container: HTMLElement,
    actions?: ICardActions
  ) {
    super(container);

    this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
    this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
    this._image = container.querySelector(`.${blockName}__image`);
    this._category = container.querySelector(`.${blockName}__category`);
    this._description = container.querySelector(`.${blockName}__description`);
    this._button = container.querySelector(
      `.${blockName}__button`
    ) as HTMLButtonElement;
    this._index = container.querySelector(`.basket__item-index`);

    if (actions?.onClick) {
      if (this._button) {
        this._button.addEventListener('click', actions.onClick);
      } else {
        container.addEventListener('click', actions.onClick);
      }
    }
  }

  set id(value: string) {
    this.container.dataset.id = value;
  }

  set selected(value: boolean) {
    if (value) {
      this.setText(this._button, 'Убрать');
    }
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  set image(value: string) {
    this.setImage(this._image, value, this.title);
  }

  set price(value: number | null) {
    this.setText(
      this._price,
      value ? `${value.toString()} синапсов` : 'Бесценно'
    );
  }

  set category(value: Category) {
    this.setText(this._category, value);
    this._category.classList.add(categoryMapping[value]);
  }

  set description(value: string) {
    this.setText(this._description, value);
  }

  set index(value: number) {
    this.setText(this._index, value);
  }
}
