import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'contact-us',
  styleUrls: ['./contact-us.component.scss'],
  templateUrl: './contact-us.component.html',
})
export class ContactUsComponent {
  contactForm = this.formBuilder.group({
    name: 'bill',
    email: 'bill@science.nye',
    message: 'hello world',
  });
  constructor(private formBuilder: FormBuilder) {}
  submit(){
    console.log(this.contactForm);
  }
}

@NgModule({
  declarations: [ContactUsComponent],
  exports: [],
  imports: [CommonModule, SharedModule, FormsModule, ReactiveFormsModule],
})
export class ContactUsModule {}
