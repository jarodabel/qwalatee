import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { ResourcePipe } from '../shared/pipes/resouce-pipe.pipe';
import { BaseResourceComponent } from './base-resouce/base-resource.component';

const PAGE_TITLE = 'Resources - Qwalatee - Patient Statements';
@Component({
  selector: 'resources',
  templateUrl: './resources.component.html',
  styleUrls: [],
})
export class ResourcesComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle(PAGE_TITLE);
  }
  tabNames = {
    Resources: 'resources',
  };
  selectedTab = this.tabNames.Resources;
  tabClicked(tab) {
    this.selectedTab = tab;
  }
}

@NgModule({
  declarations: [ResourcesComponent, BaseResourceComponent, ResourcePipe],
  exports: [ResourcePipe],
  imports: [BrowserModule, CommonModule],
})
export class ResourcesModule {}
