import { Component, ViewChild, ViewChildren, Input, Output, HostListener, ElementRef, EventEmitter } from '@angular/core';

import { DumpertService, IPost } from './dumpert.service';

@Component({
  selector: 'dumpert-list',
  template: `
    <ul class="posts" *ngIf="posts">
      <li id="post-{{i}}" class="post" *ngFor="let post of posts; let i = index" [ngClass]="[post.media[0].mediaType | lowercase, postIndex === i ? 'selected' : '']" (click)="onClick(post, i)" [style.width.px]="fixedPostWidth">
        <img class="thumbnail" src="{{post.thumbnail}}" [src-fallback]="'assets/img/default-thumbnail.png'" alt="{{post.id}} thumbnail" />
        <h3>{{post.title | truncate : 40 }}</h3>
        <p class="info">{{post.date}}</p>
        <p [innerHTML]="post.description | htmlTruncate : 100 : null : 'middle'"></p>
        <img *ngIf="post.media.length > 1" class="thumbnail multimedia" src="{{post.thumbnail}}" /> 
      </li>
    </ul>
    <div id="error" *ngIf="error">
      <h1>{{error}}</h1>
    </div>
  `,
  styles: [`
    ul, ol {
      list-style: none;
      padding: 0;
      margin: 10px 0;
    }

    ul.posts li {
      width: calc(100% / 3 - 20px - 15px);
      height: 110px;
      padding: 10px;
      background: #fff;
      border-bottom: 3px solid #1c3409;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
      margin: 5px 0 0 10px;
      float: left;
    }

    ul.posts li:hover {
      color: #4e4e4e;
      cursor: pointer;
    }

    ul.posts li.selected {
      border-color: #54b00f;
      color: #54b00f;
    }

    ul.posts li:before {
      content: '';
      position: absolute;
      display: block;
      margin-top: 92px;
      margin-left: 92px;
      width: 20px;
      height: 20px;
      opacity: 0.8;
      background-image: url(http://gscdn.nl/dump/images/allsprites-s6c30d074dd.png);
      background-repeat: no-repeat;

      /** fallback for undefined mediatype */
      background-position: -129px -34px;
      z-index: 2;
    }

    ul.posts li.img:before, ul.posts li.foto:before {
      background-position: -129px -34px;
      width: 18px;
    }

    ul.posts li.video:before {
      background-position: -184px -38px;
    }

    ul.posts li img {    
      position: relative;
      z-index: 1;
      float: left;
      margin-right: 16px;
      margin-top: 5px;
      box-shadow: 1px 2px 3px #313131;
    }

    ul.posts li img.multimedia {
      position: relative;
      top: -74px;
      left: -113px;
      opacity: 0.5;
      z-index: 0;
      box-shadow: 2px 3px 4px #000;
    }

    ul.posts li h3 {
      margin-top: 0;
      margin-bottom: 0;
      font-size: 20px
    }
    
    ul.posts li p {
      font-size: 12px
    }

    ul.posts li p.info {
      color: #888;
      margin-top: 2px;
    }

    #error {
      display: table;
      width: 100%;
    }
    #error h1 {
      text-align: center;
      vertical-align: middle;
    }

    @media screen and (max-width: 640px) {
      ul.posts li {
        width: calc(100% - 20px - 15px);
      }
    }

    @media only screen and (min-width : 640px) and (max-width : 1024px) {
      ul.posts li {
        width: calc(100% / 2 - 20px - 15px);
      }
    }
  `],
  providers: [DumpertService]
})
export class DumpertListComponent {

  private posts: IPost[];

  private postIndex: number = 0;

  private error: any;

  @Input() route: string;

  @Input() fixedPostWidth: number;

  @Output() clickedPost = new EventEmitter<IPost>(true);

  @Output() selectedElement = new EventEmitter<HTMLElement>(true);

  constructor(private dumpertService: DumpertService, private elRef: ElementRef) { }

  ngOnInit() {
    this.loadPosts(this.route);
  }
  
  public loadPosts(route: string, page?: number) {
    this.postIndex = 0;

    this.posts = null;
    this.error = null;

    this.dumpertService.getByRoute(route, page)
      .then(posts => this.posts = posts)
      .catch(err => this.error = err.message || err);
  }

  private onClick(post: IPost, index?: number) {
    this.setIndex(index);

    this.select();
  }

  public select() {
    let post = this.posts[this.postIndex];
    if (!post) {
      return;
    }

    this.clickedPost.emit(post);
  }

  public selectNext() {
    this.setRelativeIndex(1);
  }

  public selectPrevious() {
    this.setRelativeIndex(-1);
  }
  
  public setRelativeIndex(next: number) {
    this.setIndex(this.postIndex + next);
  }

  private setIndex(index: number) {
    if (!this.posts) {
      return;
    }
    
    if (!index || index < 0) {
      index = 0;
    }

    let max = this.posts.length - 1;
    if (index > max) {
      index = max;
    }

    if (index <= -1) {
      return;
    }

    this.postIndex = index;

    this.selectedElement.emit(this.getPostElement(index));
  }

  public getIndex() {
    return this.postIndex;
  }

  private getPostElement(index: number) {
    return this.elRef.nativeElement.querySelector(`ul > li[id="post-${index}"]`) as HTMLElement;
  }
}