import { Component, Input, AfterViewInit, HostListener } from '@angular/core';

import { IMedia, IMediaVariant, MediaType } from './dumpert.service';

declare var SamsungAPI: any;

@Component({
  selector: 'dumpert-media',
  template: `
    <div id="media-container">
      <!-- Samsung SmartTV does not support invoking video/object media using Angular databinding, using the AfterViewInit interface instead -->
      <h1 style="color: #fff">ihihihihii</h1>
    </div>
  `,
  styles: [`
    #media-container {
      padding: 0;
      margin: 0 auto;
      width: 100%;
      height: 100%;
    }
  `]
})
export class DumpertMediaComponent implements AfterViewInit {
  
  // hashed unique id
  private static MEDIA_ELEMENT_ID = `${new Date().getTime()}_media`;

  @Input() media: IMedia;

  ngAfterViewInit() {
    let parent = document.getElementById('media-container');
    if (parent && this.media) {
      let innerHTML: string;
      if (this.isVideo()) {
        let uri = this.getMediaVariant().uri;
        if (this.isYouTube(uri)) {
          innerHTML = `<object id="${DumpertMediaComponent.MEDIA_ELEMENT_ID}" data="${this.embedYouTubeURI(uri)}" controls="false">video playback is not supported</object>`;
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
      parent.innerHTML = innerHTML;
      
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
  }

  public getMediaVariant(): IMediaVariant {
    let variant = null;
    if (this.media) {
      for (let variants = this.media.variants, c = 0; c < variants.length; c++) {
        let d = variants[c];
        (null == variant || null != variant && this.isBetterQuality(variant.version, d.version)) && (variant = d);
      }
    }
    return variant;   
  }

  private isVideo(): boolean {
    return this.media && this.media.mediaType === MediaType[MediaType.VIDEO];
  }

  private isYouTube(uri: string): boolean {
    return uri && uri.indexOf('youtube') >= 0;
  }

  private embedYouTubeURI(uri: string): string {
    if (this.isYouTube(uri)) {
      let key = uri.split(':')[1];
      return `https://www.youtube.com/embed/${key}?autoplay=true`; 
    }

    return null;
  }

  private isBetterQuality(a: string, b: string): boolean {
    var c = !1;
    return a !== b && (('mobile' === a && 'tablet' === b || 'mobile' === a && '720p' === b || 'tablet' === a && '720p' === b) && (c = !0), c);
  }
  
  // TODO find some usefull key bindings 
  // @HostListener(`window:${SamsungAPI.eventName}`, ['$event'])
  private handleKeyboardEvent(event: KeyboardEvent) {
    var key = event.keyCode;
    
    if (this.isVideo()) {
      this.handleVideoKeyboard(key);
    } else {
      this.handleImageKeyboard(key);
    }
  }

  private handleVideoKeyboard(keyCode: number) {
    let child = document.getElementById(DumpertMediaComponent.MEDIA_ELEMENT_ID);
    if (child instanceof HTMLVideoElement) {

    }
  }

  private handleImageKeyboard(keyCode: number) {
    let child = document.getElementById(DumpertMediaComponent.MEDIA_ELEMENT_ID);
    if (child instanceof HTMLImageElement) {

    }
  }
}