import { Component, ViewChild, HostListener } from '@angular/core';

import { DumpertListComponent } from './dumpert-list.component';

import { DumpertService } from './dumpert.service';

declare var SamsungAPI: any;

enum Mode {
  NavMode = 0,
  ListMode = 1
};

enum ColorTheme {
  Dumpert = 0,
  Attic = 1
}

@Component({
  selector: 'my-app',
  template: `
    <nav [class]="mode === 0 ? 'selected' : ''">
      <ul>
        <li *ngFor="let route of routes; let i=index">
            <span (click)="onClick(route)" [ngClass]="[(activeRoute.toLowerCase() === route.toLowerCase() ? 'active' : ''), (mode === 0 && linkIndex === i ? 'selected' : '')]">{{route}}</span><span *ngIf="activeRoute.toLowerCase() === route.toLowerCase()" style="color: #FF9800;">#{{pageIndex || 0}}</span>
        </li>
      </ul>
    </nav>
    <dumpert-list [route]="activeRoute" [class]="mode === 1 ? 'selected' : ''"></dumpert-list>
  `,
  styles: [`
    nav {
      position: fixed;
      top: 0;
      left: 0;
      height: 100px;
      width: 100%;
      background-color: #212121;
      box-shadow: 0 8px 6px -6px #999;
      z-index: 1;
    }
    nav.selected {
      background-color: #111;
    }
    nav::before {
      content: '';
      position: absolute;
      top: 4px;
      left: 5px;
      width: 380px;
      height: 100px;
      background-image: url(http://gscdn.nl/dump/images/allsprites-s6c30d074dd.png);
      background-repeat: no-repeat;
      background-position: 0 -127px;
    }
    nav ul {
      margin-left: 415px;
      list-style: none;
      padding: 0;
    }
    nav ul li {
      text-align: center;
      color: #fff;
      padding-left: 20px;
      padding-right: 20px;
      padding-top: 24.5px !important;
      float: left;
      font-weight: 500;
    }
    nav ul li span {
      cursor: pointer;
    }
    nav ul li span.active {
      color: #ecffde;
      text-shadow: 2px 2px 5px #54b00f;
    }
    nav.selected ul li span.selected {
      color: #54b00f;
      text-shadow: 2px 2px 5px #54b00f;
    }

    dumpert-list {
      position: absolute;
      top: 100px;
      width: 100%;
      opacity: 0.5;
    }
    dumpert-list.selected {
      opacity: 1.0;
    }
    dumpert-list dumpert-post {
      color: red;
    }
  `]
})
export class AppComponent {

  private activeRoute: string = DumpertService.ROUTES.LATEST;

  private routes: string[] = Object.keys(DumpertService.ROUTES);

  private linkIndex: number = 0;

  private pageIndex: number;

  private mode: Mode = Mode.ListMode;

  @ViewChild(DumpertListComponent)
  public readonly list: DumpertListComponent;

  public onClick(route: any) {
    if (this.routes.indexOf(route) >= 0) {
      this.activeRoute = route;

      this.pageIndex = 0;

      this.list.loadPosts(route, this.pageIndex);
    }
  }

  @HostListener(`window:${SamsungAPI.eventName}`, ['$event'])
  public handleKeyboardEvent(event: any) {
    if (this.list.isModalActive()) {
      return;
    }

    var keyCode = event.keyCode;
    if (this.mode === Mode.NavMode) {
      this.handleNavKeyboard(keyCode);
    } else if (this.mode === Mode.ListMode) {
      this.handleListKeyboard(keyCode);
    }
  }

  private handleNavKeyboard(keyCode: number) {
    let linkIndex = this.linkIndex;
    if (keyCode === SamsungAPI.tvKey.KEY_ENTER) {
      this.onClick(this.routes[linkIndex]);
    } else if (keyCode === SamsungAPI.tvKey.KEY_LEFT) {
      let index = linkIndex - 1;

      if (index < 0) {
        index = 0;
      }
      
      this.linkIndex = index;
    } else if (keyCode === SamsungAPI.tvKey.KEY_RIGHT) {
      let index = linkIndex + 1;

      let max = this.routes.length - 1; 
      if (index > max) {
        index = max;
      }

      this.linkIndex = index;
    } else if (keyCode === SamsungAPI.tvKey.KEY_TOOLS) {
      this.mode = Mode.ListMode;
    }
  }

  private handleListKeyboard(keyCode: number) {
    let list = this.list;
    if (keyCode === 13 || keyCode === SamsungAPI.tvKey.KEY_ENTER) {
      list.openSelectedIndex();
    } else if (keyCode === SamsungAPI.tvKey.KEY_DOWN) {
      list.selectNext();
    } else if (keyCode === SamsungAPI.tvKey.KEY_UP) {
      list.selectPrevious();
    } else if (keyCode === SamsungAPI.tvKey.KEY_TOOLS) {
      this.mode = Mode.NavMode;
    } else if (keyCode === SamsungAPI.tvKey.KEY_FF) { // fastforward
      let index = (this.pageIndex || 0) + 1;

      if (index >= 0) {
        this.list.loadPosts(this.activeRoute, index);

        this.pageIndex = index; 
      }
    } else if (keyCode === SamsungAPI.tvKey.KEY_RW) { // rewind
      let index = (this.pageIndex || 0) - 1;

      if (index >= 0) {
        this.list.loadPosts(this.activeRoute, index);

        this.pageIndex = index; 
      } 
    }
  }
}