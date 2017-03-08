import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import { DumpertListComponent } from './dumpert-list.component';
import { DumpertPostComponent } from './dumpert-post.component';
import { DumpertModalComponent } from './dumpert-modal.component';
import { DumpertMediaComponent } from './dumpert-media.component';

import { SafeUrlPipe } from './safeurl.pipe';

@NgModule({
  imports:      [ CommonModule, BrowserModule, FormsModule, HttpModule ],
  declarations: [ AppComponent, DumpertListComponent, DumpertPostComponent, DumpertModalComponent, DumpertMediaComponent, SafeUrlPipe ],
  bootstrap:    [ AppComponent ]
})

export class AppModule { }