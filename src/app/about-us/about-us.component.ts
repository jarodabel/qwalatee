import { Component, NgModule } from '@angular/core';
import { Title } from '@angular/platform-browser';

const PAGE_TITLE = 'About Us - Qwalatee - Patient Statements';
@Component({
  selector: 'about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
})
export class AboutUsComponent {
  constructor(private titleService: Title ){
    this.titleService.setTitle(PAGE_TITLE);
  }
}

@NgModule({
  declarations: [AboutUsComponent],
})
export class AboutUsModule {

}
