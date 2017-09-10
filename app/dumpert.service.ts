import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/RX';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export interface IStats {
  views: number;
  viewsToday: number;
  kudos: number;
  kudosToday: number;
}

export enum MediaType {
  VIDEO,
  FOTO,
  AUDIO,
  TEMPLATE
}

export interface IMediaVariant {
  version: string;
  uri: string;
}

export interface IMedia {
  mediaType: string;
  variants: IMediaVariant[];
}

export interface IPost {
  id: string;
  title: string;
  thumbnail: string;
  still: string;
  description: string;
  date: string;
  tags: string;
  stats: IStats;
  media: IMedia[];
}

@Injectable()
export class DumpertService {

  // used to bypass cloudflare
  static URI: string = 'https://dumpert.shanelab.nl/api.php'; // 'http://www.dumpert.nl/mobile_api/json';

  static ROUTES = {
    LATEST: 'latest',
    TOP: 'top5/dag/', // rather top25
    POPULAR: 'hotshiz', // OK joris..
    DTV: 'dumperttv',
    CLASSICS: 'classics'
  };

  constructor(private http: Http) { }

  /**
   * getLatestPosts
   */
  public getLatestPosts(page?: number): Promise<IPost[]> {
    return this.requestQ(DumpertService.ROUTES.LATEST, page);
  }

  /**
   * getTop5
   */
  public getTop(page: number): Promise<IPost[]> {
    return this.requestQ(DumpertService.ROUTES.TOP, page);
  }

  /**
   * getPopularToday
   */
  public getPopularToday(): Promise<IPost[]> {
    return this.requestQ(DumpertService.ROUTES.POPULAR);
  }

  /**
   * getDumpertTV
   */
  public getDumpertTV(): Promise<IPost[]> {
    return this.requestQ(DumpertService.ROUTES.DTV);
  }

  /**
   * getClassics
   */
  public getClassics(page?: number): Promise<IPost[]> {
    return this.requestQ(DumpertService.ROUTES.CLASSICS, page);
  }

  /**
   * getByRoute
   */
  public getByRoute(route: string, page?: number): Promise<IPost[]> {
    let isTopRequest = false;
    return new Promise((resolve, reject) => {
      let keys = Object.keys(DumpertService.ROUTES);

      let value: string = null;
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        
        let tempValue = DumpertService.ROUTES[key];
        if (key.toLowerCase() === route.toLowerCase() ||
            (tempValue && tempValue.toLowerCase() === route.toLowerCase())) {
          value = tempValue;
          isTopRequest = value === DumpertService.ROUTES.TOP;
          break;
        }
      }
      if (value) {
        let data = !isTopRequest ? page : new Date(Date.now() - ((page || 0) * (24*60*60*1000))).toISOString().slice(0, 10);
        resolve(this.requestQ(value, data));
      } else {
        reject(new Error(`Request error, the given route '${route}' does not exist`));
      }
    });
  }

  private requestQ(route: string, page?: number | string): Promise<IPost[]> {
    let endpoint = `${DumpertService.URI}?route=${route.toLowerCase()}&page=${(page !== undefined) ? page : ''}`;

    return new Promise((resolve, reject) => {
      this.http.get(endpoint)
        .map((res: Response) => res.json())
        .catch((error: any) => Observable.throw(error || error.json().error || 'Server error'))
        .subscribe(response => {
          if (response !== undefined && response != null) {
            if (response.success === true) {
              let posts: IPost[] = [];

              let items: any[] = response.items || [];
              for (let i = 0; i < items.length; i++) {
                let item = items[i];

                posts.push(this.constructPost(item));
              }
              resolve(posts);
            } else {
              reject(new Error(response.errors ? response.errors[0] : 'Out of items'));
            }
          } else {
            reject(new Error('Server error while resolving, possible outdated api result'));
          }
        }, error => {
          reject(error || new Error('Server error, possible outdated api endpoint'));
        });
    });
  }

  private constructPost(item: object): IPost {
    let stats: any = item['stats'];
    let media: any = item['media'];

    let post: IPost = {
      id: item['id'],
      title: item['title'],
      thumbnail: item['thumbnail'],
      still: item['still'],
      description: item['description'],
      date: item['date'],
      tags: item['tags'],
      stats: {
        views: stats.views_total,
        viewsToday: stats.views_today,
        kudos: stats.kudos_total,
        kudosToday: stats.kudos_today
      },
      media: []
    };

    for (let j = 0; j < media.length; j++) {
      let mediaItem: any = media[j];
      post.media.push({
        mediaType: mediaItem.mediatype,
        variants: mediaItem.variants
      });
    }

    return post;
  }
}