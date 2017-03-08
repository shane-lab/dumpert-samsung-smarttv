import { Component, Input } from '@angular/core';

import { IPost } from './dumpert.service';

@Component({
  selector: 'dumpert-post',
  template: `
    <div class="inner">
      <div class="thumbnail-wrapper">
        <img class="thumbnail" src="{{post.thumbnail}}" alt="{{post.id}} thumbnail" />
      </div>
      <div class="text-wrapper">
        <h4 class="title">{{post.title}}</h4>
        <p [innerHTML]="truncatedDescription()"></p>
      </div>
    </div>
  `,
  styles: [`
    .inner {
      display: table-cell;
      overflow: hidden;
      max-height: 100px;
    }

    .inner .thumbnail-wrapper {
      display: table-cell;
      vertical-align: middle;
      width: 100px;
      padding-right: 1em;
    }

    .inner .thumbnail-wrapper img.thumbnail {
      display: block;
      width: auto;
      height: 100px;
    }

    .inner .text-wrapper {
      display: table-cell;
      vertical-align: middle;

      padding-right: 1em;
      white-space: wrap;
      overflow: hidden;
      text-overflow: ellipsis;
      word-wrap: word-break;
    }

    .inner .text-wrapper .title {
      margin: 0;
    }

    .inner .text-wrapper .description {
      margin: 0;
    }
  `]
})
export class DumpertPostComponent {

  @Input() post: IPost;

  static MAX: number = 60;

  private truncatedDescription(): String {
    let description = this.post.description;
    
    return description.length > DumpertPostComponent.MAX ? 
      description.substring(0, DumpertPostComponent.MAX) + '...' :
      description; 
  }
}
