import {
  NgModule,
  Component,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { take, delay } from 'rxjs/operators';

@Component({
  selector: 'messages',
  styleUrls: ['./messages.component.scss'],
  templateUrl: './messages.component.html',
})

export class MessagesComponent implements AfterViewInit {
  message = 'loading';
  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}
  ngAfterViewInit() {
    this.updateMessage();
  }
  updateMessage() {
    this.route.queryParams.pipe(delay(2000), take(1)).subscribe((a) => {
      this.message = a.m;
      this.cdr.detectChanges();
    });
  }
}

@NgModule({
  declarations: [MessagesComponent],
  imports: [CommonModule],
})
export class MessagesModudle {}
