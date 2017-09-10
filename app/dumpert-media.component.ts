import { Component, ViewChild, Input, AfterViewInit, ElementRef, HostListener } from '@angular/core';

import { IMedia, IMediaVariant, MediaType } from './dumpert.service';

@Component({
  selector: 'dumpert-media',
  template: `
    <div #mediaContainer class="container">
      <!-- Samsung SmartTV does not support invoking video/object media using Angular databinding, using the AfterViewInit interface instead -->
      <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 0;
      margin: 0 auto;
      width: 100%;
      height: 100%;
    }
    
    .spinner {
      margin: 330px auto 0;
      width: 240px;
      text-align: center;
    }
    .spinner > div {
      width: 56px;
      height: 56px;
      background-color: #FFFFFF;
      
      border-radius: 100%;
      display: inline-block;
      -webkit-animation: bouncedelay 1.4s infinite ease-in-out;
      animation: bouncedelay 1.4s infinite ease-in-out;
      /* Prevent first frame from flickering when animation starts */
      -webkit-animation-fill-mode: both;
      animation-fill-mode: both;
    }
    .spinner .bounce1 {
      -webkit-animation-delay: -0.32s;
      animation-delay: -0.32s;
    }
    .spinner .bounce2 {
      -webkit-animation-delay: -0.16s;
      animation-delay: -0.16s;
    }
    @-webkit-keyframes bouncedelay {
      0%, 80%, 100% { -webkit-transform: scale(0.0) }
      40% { -webkit-transform: scale(1.0) }
    }
    @keyframes bouncedelay {
      0%, 80%, 100% { 
        transform: scale(0.0);
        -webkit-transform: scale(0.0);
      } 40% { 
        transform: scale(1.0);
        -webkit-transform: scale(1.0);
      }
    }   
  `]
})
export class DumpertMediaComponent implements AfterViewInit {
  
  // secure unique id with datetime hash
  private static MEDIA_ELEMENT_ID = `${new Date().getTime()}_media`;

  @Input() media: IMedia;

  @ViewChild('mediaContainer')
  private readonly mediaContainer: ElementRef;

  ngAfterViewInit() {
    if (!this.media) {
      return;
    }

    const parent = this.mediaContainer.nativeElement as HTMLElement;

    if (!parent) {
      return;
    }

    let innerHTML: string;

    if (this.isVideo()) {
      let uri = this.getMediaVariant().uri;
      if (this.isYouTube(uri)) {
        let key = uri.split(':')[1];
        innerHTML = `<object id="${DumpertMediaComponent.MEDIA_ELEMENT_ID}" data="${this.embedAsYouTubeURI(key)}" controls="false">video playback is not supported</object>`;
      } else {
        // using either html5 video, flash or the native swfplayer to play video feed 
        innerHTML = `
          <video id="${DumpertMediaComponent.MEDIA_ELEMENT_ID}" autoplay><source src="${uri}" type="video/mp4"><source src="${uri}" type="video/mp4">
            <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0">
              <param name="SRC" value="player.swf?file=${uri}">
              <embed src="player.swf?file=${uri}"></embed>
              <p>Please update your browser or install Flash</p>
            </object>
          </video>
        `;
      }
    } else {
      innerHTML = `<img id="${DumpertMediaComponent.MEDIA_ELEMENT_ID}" src="${this.getMediaVariant().uri}" />`;
    }
    
    let child = document.getElementById(DumpertMediaComponent.MEDIA_ELEMENT_ID);
    child.style.width = '100%';
    child.style.height = '100%';
    child.style.margin = 'auto';
    child.style.padding = '0';
    if (child instanceof HTMLImageElement) {
      child.style.width = 'initial';
      child.style.display = 'block';

      let img = new Image();

      img.onload = function() {
        if (img.width > img.height) {
          child.style.width = '100%';
          child.style.height = 'initial';
        }
      };
      img.src = child.src;
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
    
    return `https://www.youtube.com/embed/${key}?autoplay=true`; 
  }

  private isBetterQuality(a: string, b: string): boolean {
    let c = !1;
    return a !== b && (('mobile' === a && 'tablet' === b || 'mobile' === a && '720p' === b || 'tablet' === a && '720p' === b) && (c = !0), c);
  }
}