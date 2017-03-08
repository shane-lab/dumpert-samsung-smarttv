import { Component, ViewChild, ViewChildren, Input, Output, HostListener, ElementRef, QueryList } from '@angular/core';

import { DumpertModalComponent } from './dumpert-modal.component';
import { DumpertPostComponent } from './dumpert-post.component';

import { DumpertService, IPost } from './dumpert.service';

declare var SamsungAPI: any;

@Component({
  selector: 'dumpert-list',
  template: `
    <ul class="posts" *ngIf="posts">
      <li class="post" *ngFor="let post of posts; let i = index">
        <dumpert-post id="{{i}}" [post]="post" (click)="onClick(post, i)" [class]="postIndex === i ? 'selected' : ''"></dumpert-post>
      </li>
    </ul>
    <div id="error" *ngIf="error">
      <h1>{{error}}</h1>
    </div>
    <dumpert-modal></dumpert-modal>
  `,
  styles: [`
    ul, ol {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    ul.posts li:first-child {
      margin-top: 10px;
    }
    ul.posts li {
      margin: 0 20px;
    }

    dumpert-post {
      background: #fff;
      border-bottom: 3px solid #1c3409;
      display: table;
      border-collapse: collapse;
      width: 100%;
      margin: 5px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    }
    dumpert-post.selected {
      border-color: #54b00f;
      color: #54b00f;
    }

    #error {
      display: table;
      width: 100%;
    }
    #error h1 {
      text-align: center;
      vertical-align: middle;
    }

  `],
  providers: [DumpertService]
})
export class DumpertListComponent {

  private posts: IPost[];

  private postIndex: number = 0;

  private error: any;

  private inAnimation: boolean;

  @Input() route: string;

  @ViewChild(DumpertModalComponent)
  private readonly modal: DumpertModalComponent;

  @ViewChildren(DumpertPostComponent) 
  private readonly postComponents: QueryList<DumpertPostComponent>;

  constructor(private dumpertService: DumpertService, private elRef: ElementRef) { }

  ngOnInit() {
    this.loadPosts(this.route);
  }
  
  public loadPosts(route: string, page?: number) {
    this.postIndex = -1;

    this.posts = null;
    this.error = null;

    this.dumpertService.getByRoute(route, page)
      .then((data: IPost[]) => {
        this.posts = data;
        
        this.selectFirst();
      })
      .catch((err: Error) => {
        console.warn('catch', err);

        this.error = err.message;
      });
  }

  private onClick(post: IPost, index?:number) {
    if (index && (index >= 0 && index < this.postComponents.length)) {
      this.postIndex = index;
    }

    if (this.modal !== undefined) {
      this.modal.open(post);
    }
  }
  
  @HostListener(`window:${SamsungAPI.eventName}`, ['$event'])
  public handleKeyboardEvent(event: any) {
    if (!this.isModalActive()) {
      return;
    }
    
    this.openSelectedIndex();
  }

  public isModalActive(): boolean {
    return this.modal && this.modal.isActive();
  }

  public selectFirst() {
    this.inAnimation = false;

    this.postIndex = 0;

    document.body.scrollTop = 0;
  }

  public selectNext() {
    if (this.inAnimation) {
      return;
    }
    let index = this.postIndex + 1;

    let max = this.postComponents.length;
    if (index >= max) {
      index = max - 1;
    }
    this.postIndex = index;
    this.scrollToElement(index);
  }

  public selectPrevious() {
    if (this.inAnimation) {
      return;
    }
    let index = this.postIndex - 1;

    if (index < 0) {
      index = 0
    }
    this.postIndex = index;
    this.scrollToElement(index);
  }

  public openSelectedIndex() {
    if (this.modal !== undefined) {
      // let element = this.elRef.nativeElement.querySelector('ul > li > dumpert-post[id="2"]');
      let that = this;
      this.postComponents.forEach(function(item: DumpertPostComponent, index: number, list: DumpertPostComponent[]) {
        if (that.postIndex === index) {
          that.modal.open(item.post);
          return;
        }
      });
    }
  }

  private scrollToElement(index: number) {
    let element = this.elRef.nativeElement.querySelector(`ul > li > dumpert-post[id="${index}"]`);

    // TODO: fix smooth scroll for Samsung device
    // this.inAnimation = true;
    // smoothScrollTo(element.offsetTop, 600, index === 0 ? 10 : 5, () => {
    //   this.inAnimation = false;

    //   alert('done');
    // });
    hardScrollTo(element.offsetTop, index === 0 ? 10 : 5);
  }
}

function smoothScrollTo(to: number, duration: number, add?: number, callback?: Function) {
    if (duration <= 0) {
      return;
    }

    var tickSpeed = 10;

    var difference = (to - (add || 0)) - document.body.scrollTop;
    var perTick = difference / duration * tickSpeed;

    // TODO: enable scroll back up after reaching the bottom of page
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
      if (callback) {
        callback();
      }
      return;
    }

    setTimeout(function() {
        document.body.scrollTop = document.body.scrollTop + perTick;
        if (document.body.scrollTop === (to - add)) {
          if (callback) {
            callback();
          }
          return;
        }
        smoothScrollTo(to, duration - tickSpeed, add || 0, callback);
    }, tickSpeed);
}

function hardScrollTo(to: number, add?: number) {
    document.body.scrollTop = to - (add || 0)
}