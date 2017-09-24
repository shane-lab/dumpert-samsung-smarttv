import { Component, ViewChild, OnChanges, ElementRef, Input, HostListener, SimpleChanges } from '@angular/core';

import { DumpertMediaComponent } from './dumpert-media.component';

import { IPost, IMedia } from './dumpert.service';

@Component({
  selector: 'dumpert-modal',
  template: `
    <div *ngIf="post" class="modal">
      <div #sidebar id="sidebar">
        <header>
          <span (click)="close()" id="close" [innerHTML]="'&#935;'"></span>
          <p class="title">{{post.title}} <span *ngIf="post.media.length > 1">({{mediaIndex + 1}}/{{post.media.length}})</span></p>
        </header>
        <details id="stats" *ngIf="post.stats" open>
          <span class="extra" style="margin-top:6px;">uploaded: <span>{{post.date}}</span></span>
          <span *ngIf="duration" class="extra" style="margin-top:6px;">duration: <span>{{getFormattedDuration(duration)}}</span></span>
          <p>Views: {{post.stats.views}}<span class="extra">(today: <span>{{post.stats.viewsToday}}</span>)</span></p>
          <p>Kudos: {{post.stats.kudos}}<span class="extra">(today: <span>{{post.stats.kudosToday}}</span>)</span></p>
        </details>
        <article [innerHTML]="post.description | mention"></article>
        <footer>{{post.tags}}</footer>
      </div>
      <div id="content">
        <dumpert-media [media]="getMedia(mediaIndex)"></dumpert-media>
      </div>
    </div>
  `,
  styles: [`
    .modal {
      background: rgba(0, 0, 0, .6);
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 9999;
    }
    .modal > * {
      height: 100%;
    }

    #sidebar {
      float: right;
      width: 320px;
      background-color: #090909;
      color: #fff;
    }
    #sidebar * {
      display: block;
      padding: 0 16px;
      background-color: #090909;
    }
    #sidebar header, #sidebar details {
      border-bottom: 1px solid #474747;
    }
    #sidebar header #close {
      position: relative;
      top: 6px;
      left: 282px;
      padding: 0;
      cursor: pointer;
      font-size: 20px;
    }
    #sidebar header p.title {
      margin-top: 0;
    }
    #sidebar header p.title span {
      display: initial;
      padding: 0;
      margin: 0;
      color: #a4a4a4;
    }
    #sidebar details .extra {
      color: #888;
      font-size: 12px;
    }
    #sidebar details .extra > span {
      color: #bbb;
      display: initial;
      padding: 0;
    }
    #sidebar footer {
      position: absolute;
      bottom: 0;
      border-top: 1px solid #474747;
    }
    #sidebar footer {
      height: 56px;
      line-height: 56px;
      width: 100%;
    }
    #sidebar article {
      position: relative;
      line-height: 20px;
      color: #a4a4a4;
      margin-top: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      /*white-space: nowrap;*/
    }
    #sidebar article > a {
      color: #aaa !important;
      background: #ccc;
    }
    
    #content {
      float: none;
      width: auto;
      overflow: hidden;
      background-color: #000;
    }
  `]
})
export class DumpertModalComponent implements OnChanges {

  private post: IPost;

  private duration: number;

  private mediaIndex: number = 0;

  @ViewChild(DumpertMediaComponent)
  public readonly media: DumpertMediaComponent;

  @ViewChild('sidebar')
  private readonly sidebarEl: ElementRef;
  
  ngOnChanges(changes: SimpleChanges) {
    if (!this.hasPost()) {
      this.close();
    }
  }
  
  public hasPost(): boolean {
    return !!this.post;
  }

  public open(post: IPost): void {
    if (!post) {
      return;
    }

    this.post = post;
  }

  public close(): void {
    this.mediaIndex = 0;
    this.duration = null;
    this.post = null;
  }

  private getMedia(index?: number): IMedia {
    if (!this.hasPost()) {
      this.close();

      return null;
    }

    this.mediaIndex = (index || 0);

    let media = this.post.media[this.mediaIndex];
    if (!media) {
      this.close();

      return null;
    }
    
    this.duration = media.duration;

    return media;
  }

  private getFormattedDuration(seconds: number) {
    let date = new Date(1970,0,1);
    date.setSeconds(seconds);
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") 
  }

  public onKeyDown(keyCode: number) {
    if (!this.post) {
      return;
    }

    switch(keyCode) {
      case SamsungAPI.tvKey.KEY_RETURN:
        this.close();
        break;
      case SamsungAPI.tvKey.KEY_INFO: {
        let sidebar = this.sidebarEl.nativeElement as HTMLElement;

        if (sidebar) {
          sidebar.style.display = !sidebar.style.display ? 'none' : null;
        }
        break;
      }
      case SamsungAPI.tvKey.KEY_UP:
      case SamsungAPI.tvKey.KEY_DOWN:
        let index = this.mediaIndex + (keyCode === SamsungAPI.tvKey.KEY_UP ? -1 : 1 );

        if (index >= 0 && index < this.post.media.length) {
          this.mediaIndex = index;
        }
        break;
    }
  }
}