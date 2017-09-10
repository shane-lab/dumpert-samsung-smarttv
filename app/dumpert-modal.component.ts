import { Component, ViewChild, ElementRef, Input, HostListener } from '@angular/core';

import { DumpertMediaComponent } from './dumpert-media.component';

import { IPost, IMedia } from './dumpert.service';

@Component({
  selector: 'dumpert-modal',
  template: `
    <div *ngIf="post" class="modal">
      <div #sidebar id="sidebar">
        <header>
          <span (click)="close()" id="close" [innerHTML]="closeSign"></span>
          <p class="title">{{post.title}}</p>
        </header>
        <details id="stats" *ngIf="post.stats" open>
          <span class="extra" style="margin-top:4px;">{{getDateTime()}}</span>
          <p>Views: {{post.stats.views}}<span class="extra">(today: {{post.stats.viewsToday}})</span></p>
          <p>Kudos: {{post.stats.kudos}}<span class="extra">(today: {{post.stats.kudosToday}})</span></p>
        </details>
        <article>{{post.description}}</article>
        <footer>{{post.tags}}</footer>
      </div>
      <div id="content">
        <dumpert-media [media]="getMedia()"></dumpert-media>
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
    #sidebar details .extra {
      color: #888;
      font-size: 12px;
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
    
    #content {
      float: none;
      width: auto;
      overflow: hidden;
      background-color: #000;
    }
  `]
})
export class DumpertModalComponent {

  private post: IPost;

  private mediaIndex: number = 0;

  private closeSign: string = SamsungAPI.isSamsungTv() ? '&#8634;' : '&#935;'

  @ViewChild(DumpertMediaComponent)
  public readonly media: DumpertMediaComponent;

  @ViewChild('sidebar')
  private readonly sidebarEl: ElementRef;
  
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
    this.post = null;
  }

  private getDateTime(): string {
    if (!this.post) {
      return null;
    }

    let dateSegments = this.post.date.substr(0, 10).split('-');

    let date = dateSegments.reduceRight((a, b, i) => `${a}/${b}`);

    let time = this.post.date.substr(11, this.post.date.length).split('+')[0];

    return `${date} - ${time}`
  }

  private getMedia(): IMedia {
    if (!this.hasPost()) {
      this.close();

      return null;
    }

    let index = this.mediaIndex = (this.mediaIndex || 0);

    return this.post.media[index];
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
    }

    // this.media.onKeyDown(keyCode);
  }
}