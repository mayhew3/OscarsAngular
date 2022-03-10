import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import _ from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class CeremonyStyleService {

  currStyle = 'oscars';
  styles = ['oscars', 'emmys'];

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.loadStyle(`${this.currStyle}.css`);
  }

  toggleStyle(): void {
    const others = _.without(this.styles, this.currStyle);
    this.currStyle = others[0];
    this.loadStyle(`${this.currStyle}.css`);
  }

  loadStyle(styleName: string): void {
    const head = this.document.getElementsByTagName('head')[0];

    const themeLink = this.document.getElementById(
      'client-theme'
    ) as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = styleName;
    } else {
      const style = this.document.createElement('link');
      style.id = 'client-theme';
      style.rel = 'stylesheet';
      style.href = `${styleName}`;

      head.appendChild(style);
    }
  }

}
