import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { TruncatePipe } from 'angular2-truncate';
import { Ng2ImgFallbackModule } from 'ng2-img-fallback';

import { AppComponent } from './app.component';

import { DumpertListComponent } from './dumpert-list.component';
import { DumpertModalComponent } from './dumpert-modal.component';
import { DumpertMediaComponent } from './dumpert-media.component';

import { SafeUrlPipe } from './safeurl.pipe';
import { MentionPipe } from './mention.pipe';
import { HtmlTruncatePipe } from './html-truncate.pipe';

@NgModule({
  imports:      [ CommonModule, BrowserModule, FormsModule, HttpModule, Ng2ImgFallbackModule ],
  declarations: [ AppComponent, DumpertListComponent, DumpertModalComponent, DumpertMediaComponent, MentionPipe, SafeUrlPipe, TruncatePipe, HtmlTruncatePipe ],
  bootstrap:    [ AppComponent ],
  providers: [ TruncatePipe ]
})
export class AppModule { }