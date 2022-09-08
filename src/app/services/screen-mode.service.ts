import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScreenModeService {

  constructor() { }

  isMobile(): boolean {
    return window.innerWidth < 590;
  }

  isBigScreen(): boolean {
    return window.innerWidth >= 1760;
  }
}
