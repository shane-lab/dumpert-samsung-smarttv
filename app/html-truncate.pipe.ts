import { Pipe, PipeTransform } from '@angular/core';

import { TruncatePipe } from 'angular2-truncate';

@Pipe({
    name: 'htmlTruncate'
})
export class HtmlTruncatePipe implements PipeTransform {
    
    constructor(private truncatePipe: TruncatePipe) { }

    transform(text: string, limit: number, trail: string, position: 'left' | 'right' | 'middle') {
        return this.truncatePipe.transform((text || '').replace(/<\/?[^>]+(>|$)/g, ""), limit, trail, position);
    }
}