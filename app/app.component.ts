import { Component, ViewChild, HostListener } from '@angular/core';

import { DumpertListComponent } from './dumpert-list.component';

import { DumpertModalComponent } from './dumpert-modal.component';

import { DumpertService, IPost } from './dumpert.service';

enum Mode {
  NavMode = 0,
  ListMode = 1
};

enum ColorTheme {
  Classic = 0,
  Darken = 1
}

@Component({
  selector: 'my-app',
  template: `
    <nav [class]="mode === 0 ? 'selected' : ''">
      <ul>
        <li *ngFor="let route of routes; let i=index" [ngClass]="[(activeRoute.toLowerCase() === route.toLowerCase() ? 'active' : ''), (mode === 0 && linkIndex === i ? 'selected' : '')]">
            <span (click)="onRouteClick(route)">{{route}}</span><span *ngIf="activeRoute.toLowerCase() === route.toLowerCase()" style="color: #FF9800;">#{{(pageIndex || 0) + 1}}</span>
        </li>
      </ul>
    </nav>
    <dumpert-list [route]="activeRoute" [class]="mode === 1 ? 'selected' : ''"></dumpert-list>
    <dumpert-modal></dumpert-modal>
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
    nav ul li span:hover {
      color: #eaf7d6;
    }
    nav ul li.active > span {
      color: #ecffde;
      text-shadow: 2px 2px 5px #54b00f;
    }
    nav.selected ul li.selected > span {
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
  `]
})
export class AppComponent {

  private activeRoute: string = DumpertService.ROUTES.LATEST;

  private routes: string[] = Object.keys(DumpertService.ROUTES);

  private linkIndex: number = 0;

  private pageIndex: number;

  private mode: Mode = Mode.ListMode;

  private theme: ColorTheme = ColorTheme.Classic;

  @ViewChild(DumpertListComponent)
  public readonly list: DumpertListComponent;
  
  @ViewChild(DumpertModalComponent)
  private readonly modal: DumpertModalComponent;

  ngOnInit() {
    this.list.clickedPost.subscribe(this.openModal.bind(this));
    this.list.selectedElement.subscribe(this.scrollToElement);
  }

  public onRouteClick(route: string) {
    if (this.routes.indexOf(route) === -1) {
      return;
    }

    this.activeRoute = route;

    this.pageIndex = 0;

    this.list.loadPosts(route, this.pageIndex);
  }

  private openModal(post: IPost) {
    if (!post) {
      return;
    }

    this.modal.open(post);
  }
  
  private scrollToElement(elem: HTMLElement) {
    if (!elem) {
      return;
    }

    document.body.scrollTop = elem.offsetTop - 15;
  }

  @HostListener(`window:${SamsungAPI.eventName}`, ['$event'])
  public handleKeyboardEvent(event: any) {
    let keyCode = event.keyCode;

    if (this.modal.hasPost()) {
      this.modal.onKeyDown(keyCode);
    } else {
      if (this.mode === Mode.NavMode) {
        this.handleNavKeyboard(keyCode);
      } else if (this.mode === Mode.ListMode) {
        this.handleListKeyboard(keyCode);
      }
      if (keyCode === SamsungAPI.tvKey.KEY_0) {
        let themeIndex = this.theme + 1;

        if (themeIndex > (Object.keys(ColorTheme).length / 2) - 1) {
          themeIndex = 0;
        }

        document.body.classList.remove(ColorTheme[this.theme].toLowerCase());

        this.theme = themeIndex;

        document.body.classList.add(ColorTheme[this.theme].toLowerCase());
      }
    }
  }

  private handleNavKeyboard(keyCode: number) {
    switch(keyCode) {
      case SamsungAPI.tvKey.KEY_ENTER:
        this.onRouteClick(this.routes[this.linkIndex]);
        break;
      case SamsungAPI.tvKey.KEY_TOOLS:
        this.mode = Mode.ListMode;
        break;
      case SamsungAPI.tvKey.KEY_LEFT:
      case SamsungAPI.tvKey.KEY_RIGHT:
        let index = this.linkIndex + (keyCode === SamsungAPI.tvKey.KEY_LEFT ? -1 : 1);

        if (index < 0) {
          index = 0;
        }

        let max = this.routes.length - 1;
        this.linkIndex = index > max ? max : index;
        break;
    }
  }

  private handleListKeyboard(keyCode: number) {
    if (!SamsungAPI.isSamsungTv()) {
      return;
    }

    switch(keyCode) {
      case SamsungAPI.tvKey.KEY_ENTER:
        this.list.select();
        break;
      case SamsungAPI.tvKey.KEY_TOOLS:
        this.mode = Mode.NavMode;
        break;
      case SamsungAPI.tvKey.KEY_RIGHT:
        this.list.selectNext();
        break;
      case SamsungAPI.tvKey.KEY_LEFT:
        this.list.selectPrevious();
        break;
      case SamsungAPI.tvKey.KEY_UP:
        this.list.setRelativeIndex(-3)
        break;
      case SamsungAPI.tvKey.KEY_DOWN:
        this.list.setRelativeIndex(3)
        break;
      case SamsungAPI.tvKey.KEY_FF:
      case SamsungAPI.tvKey.KEY_RW:
        let index = (this.pageIndex || 0) + (keyCode === SamsungAPI.tvKey.KEY_FF ? 1 : -1);
        
        if (index >= 0) {
          this.list.loadPosts(this.activeRoute, index);

          this.pageIndex = index;
        }
        break;
    }
  }
}