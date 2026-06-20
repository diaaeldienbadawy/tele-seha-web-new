import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionStateService {
  private sessionItem: any;

  setItem(item: any) {
    this.sessionItem = item;
  }

  getItem() {
    return this.sessionItem;
  }

  clear() {
    this.sessionItem = null;
  }
}
