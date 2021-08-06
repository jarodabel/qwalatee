import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from './app-state';
import { UserService } from './shared/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('constructionNotification')
  constructionNotification: ElementRef;

  loaded = true;
  constructor(
    private userService: UserService,
  ) {
  }
  close() {
    this.constructionNotification.nativeElement.remove();
  }

  ngOnInit() {
    this.userService.getUser().subscribe((_user) => {
      this.loaded = true;
    });
  }
}
