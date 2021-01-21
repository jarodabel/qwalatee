import {
  Component,
  NgModule,
  OnInit,
  AfterViewInit,
  SecurityContext,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ContactUsService } from '../shared/services/contact-us.service';

@Component({
  selector: 'contact-us',
  styleUrls: ['./contact-us.component.scss'],
  templateUrl: './contact-us.component.html',
})
export class ContactUsComponent implements AfterViewInit {
  contactForm = this.formBuilder.group({
    name: '',
    email: '',
    message: '',
  });
  disabled = true;
  loading = false;
  constructor(
    private formBuilder: FormBuilder,
    private contactService: ContactUsService,
    private _sanitizer: DomSanitizer,
    private router: Router,
  ) {}

  ngAfterViewInit() {
    this.onloadCallback();
  }

  verifyCallback(res) {
    this.disabled = res ? false : true;
  }

  onloadCallback() {
    const callback = (a) => {
      this.verifyCallback(a);
    };
    callback.bind(this);
    window.grecaptcha.render('recaptcha', {
      callback: callback,
      'expired-callback': callback,
      sitekey: '6LcE29AZAAAAANSH7g2cJBagXamRVWlGeyT3hkDY',
    });
  }

  submit() {
    this.loading = true;
    const message = {
      from: this._sanitizer.sanitize(
        SecurityContext.HTML,
        this.contactForm.value.email
      ),
      name: this._sanitizer.sanitize(
        SecurityContext.HTML,
        this.contactForm.value.name
      ),
      text: this._sanitizer.sanitize(
        SecurityContext.HTML,
        this.contactForm.value.message
      ),
    };

    this.contactService.sendMessage(message).subscribe(
      () => {
        this.router.navigate(['/','messages'],{queryParams:{m :'contact-thank-you'}})
      },
      () => {
        this.router.navigate(['/','messages'],{queryParams:{m :'contact-error'}})
      }
    );
  }
}

@NgModule({
  declarations: [ContactUsComponent],
  exports: [],
  imports: [CommonModule, SharedModule, FormsModule, ReactiveFormsModule],
  providers: [ContactUsService],
})
export class ContactUsModule {}
