import { Component, ViewChild, Input, ElementRef, HostListener, SimpleChanges } from '@angular/core';

import { IMedia, IMediaVariant, MediaType } from './dumpert.service';

@Component({
  selector: 'dumpert-media',
  template: `
    <div #mediaContainer class="container" [ngClass]="{'replay': videoElement && showReplay}">
      <!-- Samsung SmartTV does not support invoking video/object media using Angular databinding, using the AfterViewInit interface instead -->
    </div>
  `,
  styles: [`
    :host {
      padding: 0;
      margin: 0;
      width: 100%;
      height: 100%;

      display: block;
    }

    .container {
      padding: 0;
      margin: 0 auto;
      width: 100%;
      height: 100%;
    }

    .replay::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 10px;
      background: #f7a846;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      text-indent: 40px;
      line-height: 20px;
      border: 2px solid #222;
      text-shadow: black 1px 2px 3px;
      z-index: 1;
    }
    .replay::after {
      content: "replay";

      position: absolute;
      top: 0;
      left: 0;
      /*bottom: 0;
      right: 0;
      margin: 316px auto 0;*/
      height: 40px;
      line-height: 40px;
      width: 160px;

      color: #fff;
      text-align: center;

      font-family: jw-icons;
      font-style: normal;
      font-weight: bold;
      text-transform: none;
      background-color: transparent;
      font-variant: normal;
      -webkit-font-smoothing: antialiased;

      background: #050708;
      border: 0;
      border-radius: 3px;
      box-shadow: 0.1em 0 1em 0em black;
    }   
  `]
})
export class DumpertMediaComponent {
  
  // secure unique id with datetime hash
  private static MEDIA_ELEMENT_ID = `${new Date().getTime()}_media`;

  @Input() media: IMedia;

  @ViewChild('mediaContainer')
  private readonly mediaContainer: ElementRef;

  private videoElement: ElementRef;

  private showReplay = false;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.media) {
      return;
    }

    const parent = this.mediaContainer.nativeElement as HTMLElement;

    if (!parent) {
      return;
    }

    if (this.isVideo()) {
      let uri = this.getMediaVariant().uri;
      if (this.isYouTube(uri)) {
        let key = uri.split(':')[1];
        parent.innerHTML = `<object id="${DumpertMediaComponent.MEDIA_ELEMENT_ID}" data="${this.embedAsYouTubeURI(key)}" controls="false">video playback is not supported</object>`;
      } else {
        // using either html5 video, flash or the native swfplayer to play video feed 
        // uri = 'https://www.w3schools.com/tags/mov_bbb.mp4';
        parent.innerHTML = `
          <video id="${DumpertMediaComponent.MEDIA_ELEMENT_ID}" autoplay><source src="${uri}" type="video/mp4"><source src="${uri}" type="video/mp4">
            <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0">
              <param name="SRC" value="player.swf?file=${uri}">
              <embed src="player.swf?file=${uri}" allowscriptaccess="always"></embed>
              <p>Please update your browser or install Flash</p>
            </object>
          </video>
        `;
      }
    } else {
      parent.innerHTML = `<img id="${DumpertMediaComponent.MEDIA_ELEMENT_ID}" src="${this.getMediaVariant().uri}" />`;
    }
    
    let child = document.getElementById(DumpertMediaComponent.MEDIA_ELEMENT_ID);
    if (!child) {
      return;
    }
    child.style.width = '100%';
    child.style.height = '100%';
    child.style.margin = 'auto';
    child.style.padding = '0';
    if (child instanceof HTMLImageElement) {
      child.style.width /*= child.style.height*/ ='initial';
      child.style.maxWidth = child.style.maxHeight = '100%';
      child.style.display = 'block';
    }
    else if (child instanceof HTMLVideoElement) {
      this.videoElement = new ElementRef(child);

      child.onplay = () => (this.showReplay = false, child.style.opacity = '1');
      child.onended = () => (this.showReplay = true, child.style.opacity = '0.3');
    }
  }

  public getMediaVariant(): IMediaVariant {
    if (!this.media) {
      return null;
    }

    return this.media.variants.reduce((a, b) => this.isBetterQuality(a.version, b.version) ? b : a);
  }

  private isVideo(): boolean {
    return this.media && this.media.mediaType === MediaType[MediaType.VIDEO];
  }

  private isYouTube(uri: string): boolean {
    return uri && uri.indexOf('youtube') >= 0;
  }

  private embedAsYouTubeURI(key: string): string {
    if (!key) {
      return null;
    }
    
    return `https://www.youtube.com/embed/${key}?autoplay=true&rel=0`; 
  }

  private isBetterQuality(a: string, b: string): boolean {
    let c = !1;
    return a !== b && (('mobile' === a && 'tablet' === b || 'mobile' === a && '720p' === b || 'tablet' === a && '720p' === b) && (c = !0), c);
  }

  public onKeyDown(keyCode: number) {
    if (!this.videoElement) {
      return;
    }

    const video = this.videoElement.nativeElement as HTMLVideoElement;

    switch(keyCode) {
      case SamsungAPI.tvKey.KEY_ENTER:
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
        video.controls = video.paused;
        video.hideFocus = !video.controls;
        break;
      case SamsungAPI.tvKey.KEY_0:
        video.pause();
        video.currentTime = 0;
        video.play().then(() => (video.controls = false, video.hideFocus = true));
    }
  }
}