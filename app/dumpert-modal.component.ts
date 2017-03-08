import { Component, ViewChild, Input, HostListener } from '@angular/core';

import { DumpertMediaComponent } from './dumpert-media.component';

import { IPost, IMedia } from './dumpert.service';

declare var SamsungAPI: any;

@Component({
  selector: 'dumpert-modal',
  template: `
    <div *ngIf="post" class="modal">
      <div id="sidebar">
        <header>{{post.title}}<span (click)="close()" id="close" [innerHTML]="closeSign"></span></header>
        <details id="stats" *ngIf="post.stats" open>
          <span class="extra" style="margin-top:4px;">{{getDateTime()}}</span>
          <p>Views: {{post.stats.views}}<span class="extra">(today: {{post.stats.viewsToday}})</span></p>
          <p>Kudos: {{post.stats.kudos}}<span class="extra">(today: {{post.stats.kudosToday}})</span></p>
        </details>
        <article [innerHTML]="post.description">{{post.description}}</article>
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
      top: -70px;
      left: 270px;
      cursor: pointer;
      font-size: 20px;
    }
    #sidebar details .extra {
      color: #888;
      font-size: 10px;
    }
    #sidebar footer {
      position: absolute;
      bottom: 0;
      border-top: 1px solid #474747;
    }
    #sidebar header, #sidebar footer {
      height: 56px;
      line-height: 56px;
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

  private active: boolean;

  private post: IPost;

  private mediaIndex: number = 0;

  private closeSign: string = SamsungAPI.isSamsungSmartTV() ? '&#8634;' : '&#935;'

  @ViewChild(DumpertMediaComponent)
  public readonly media: DumpertMediaComponent;

  public open(post: IPost): void {
    if (post !== undefined && post != null) {
      this.post = post;
      this.active = true;
    }
  }

  public close(): void {
    this.post = null;
    this.active = false;
  }

  public isActive(): boolean {
    return this.active;
  }

  private getDateTime(): string {
    let dateTime: string;

    if (this.post) {
      let dateSegments = this.post.date.substr(0, 10).split('-');

      let date = '';
      for (let i = dateSegments.length - 1; i >= 0; i--) {
        date += `${dateSegments[i]}${(i === 0) ? '' : '/'}`;
      }

      let time = this.post.date.substr(11, this.post.date.length).split('+')[0];

      dateTime = `${date} - ${time}`;
    }

    return dateTime
  }

  private getMedia(): IMedia {
    if (!this.hasPost()) {
      this.close();

      return;
    }

    let index = this.mediaIndex = (this.mediaIndex || 0);

    return this.post.media[index];
  }
  
  private hasPost(): boolean {
    return this.post !== undefined && this.post != null;
  }

  @HostListener(`window:${SamsungAPI.eventName}`, ['$event'])
  private handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.post) {
      return;
    }

    var key = event.keyCode;

    if (key === SamsungAPI.tvKey.KEY_RETURN) {
      this.close();
    } else if (key === SamsungAPI.tvKey.KEY_INFO) {
      var details = document.getElementById('stats');

      if (details) {
        if (details.hasAttribute('open')) {
          details.removeAttribute('open');
          // oldbrowser fallback
          details.style.display = 'hidden';
        } else {
          details.setAttribute('open', 'open');
          // oldbrowser fallback
          details.style.display = 'block';
        }
      }
    }
  }
}