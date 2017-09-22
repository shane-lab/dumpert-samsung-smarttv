import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'mention'
})
export class MentionPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }
    
    transform(text: string, color = '#66c221') {
        return this.sanitizer.bypassSecurityTrustHtml((text || '').replace(/\@(\w+)/, `<span style="color: ${color} !important">@$1</span>`));
    }
}