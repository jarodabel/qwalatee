import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('constructionNotification', {static: false}) constructionNotification: ElementRef;
  close() {
    this.constructionNotification.nativeElement.remove();
  }
}
