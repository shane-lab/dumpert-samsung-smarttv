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
  isYouTube?: boolean;
}

export interface IMedia {
  mediaType: string;
  variants: IMediaVariant[];
  duration?: number;
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

export const ROUTES = {    
  LATEST: 'latest',
  TOP: 'top5/dag/', // rather top25
  POPULAR: 'hotshiz', // OK joris..
  DTV: 'dumperttv',
  CLASSICS: 'classics'
}

type DumpertRoute = {[K in keyof typeof ROUTES]: typeof ROUTES[K]};

@Injectable()
export class DumpertService {

  // used to bypass cloudflare
  static URI: string = 'https://dumpert.shanelab.nl/api.php'; // 'http://www.dumpert.nl/mobile_api/json';

  constructor(private http: Http) { }

  /**
   * getLatestPosts
   */
  public getLatestPosts(page?: number): Promise<IPost[]> {
    return this.requestQ(ROUTES.LATEST, page);
  }

  /**
   * getTop5
   */
  public getTop(page: number): Promise<IPost[]> {
    return this.requestQ(ROUTES.TOP, page);
  }

  /**
   * getPopularToday
   */
  public getPopularToday(): Promise<IPost[]> {
    return this.requestQ(ROUTES.POPULAR);
  }

  /**
   * getDumpertTV
   */
  public getDumpertTV(): Promise<IPost[]> {
    return this.requestQ(ROUTES.DTV);
  }

  /**
   * getClassics
   */
  public getClassics(page?: number): Promise<IPost[]> {
    return this.requestQ(ROUTES.CLASSICS, page);
  }

  /**
   * getByRoute
   */
  public getByRoute(route: string, page?: number): Promise<IPost[]> {
    return new Promise((resolve, reject) => {
      if (!route) {
        return reject(new Error(`Request error, the given route '${route}' does not exist`));
      }

      route = (route in ROUTES ? ROUTES[route] : route || '').toLowerCase();

      let data = ROUTES.TOP.toLowerCase() === route ? new Date(Date.now() - ((page || 0) * (24*60*60*1000))).toISOString().slice(0, 10) : page;
      resolve(this.requestQ(route, data));
    });
  }

  private requestQ(route: string, page?: number | string): Promise<IPost[]> {
    const endpoint = `${DumpertService.URI}?route=${route.toLowerCase()}&page=${(page !== undefined) ? page : ''}`;

    return new Promise((resolve, reject) => {
      this.http.get(endpoint)
        .map((res: Response) => res.json())
        .catch(error => Observable.throw((error && 'json' in error) ? error.json().error : error || 'Server error'))
        .subscribe((response: {errors?: string[], items: {}[]}) => {
          if (!response) {
            return reject(new Error('Server error while resolving, possible outdated api result'));
          }
          if (response.errors) {
            return reject(new Error(response.errors ? response.errors[0] : 'Out of items'));
          }

          let posts: IPost[] = [];
          for (let item of response.items) {
            posts.push(this.constructPost(item));
          }
          resolve(posts.filter(post => !!post && post.media.length > 0));
        }, error => {
          reject(error || new Error('Server error, possible outdated api endpoint'));
        });
    });
  }

  private constructPost(item: object): IPost {
    const stats: any = item['stats'] || {};
    const media: any = item['media'] || [];

    let post: IPost = {
      id: item['id'],
      title: item['title'],
      thumbnail: item['thumbnail'],
      still: item['still'],
      description: item['description'],
      date: this.parseDateTime(item['date']),
      tags: item['tags'],
      stats: {
        views: stats.views_total || 0,
        viewsToday: stats.views_today || 0,
        kudos: stats.kudos_total || 0,
        kudosToday: stats.kudos_today || 0
      },
      media: []
    };

    for (let mediaItem of media) {
      let postMedia: IMedia = {
        mediaType: mediaItem.mediatype,
        variants: mediaItem.variants,
      };
      if ('duration' in mediaItem) {
        postMedia.duration = mediaItem.duration;
      }
      if (postMedia.variants && postMedia.variants.length > 0) {
        // fixes undefined or filters humanfactor for the mediatype selector.
        if (!postMedia.mediaType || postMedia.mediaType.trim().length <= 0) {
          postMedia.mediaType = MediaType[postMedia.variants[0].uri.indexOf('mp4') ? MediaType.VIDEO : MediaType.TEMPLATE];
        }
        for (let variant of postMedia.variants) {
          variant.isYouTube = variant.uri.indexOf('youtube') >= 0;
        }
        
        post.media.push(postMedia);
      }
    }

    return post.media.length ? post : null;
  }

  private parseDateTime(dateTime: string): string {
    let dateSegments = dateTime.substr(0, 10).split('-');

    let date = dateSegments.reduceRight((a, b, i) => `${a}/${b}`);

    let time = dateTime.substr(11, dateTime.length).split('+')[0];

    return `${date} - ${time}`
  }
}