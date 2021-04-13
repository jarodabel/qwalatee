import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ResourcePipe } from '../shared/pipes/resouce-pipe.pipe';
import { BaseResourceComponent } from './base-resouce/base-resource.component';

@Component({
  selector: 'resources',
  templateUrl: './resources.component.html',
  styleUrls: [],
})
export class ResourcesComponent {
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
