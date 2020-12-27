import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sign-up',
  styleUrls: ['./sign-up.component.scss'],
  templateUrl: './sign-up.component.html',
})
export class SignUpComponent {}

@NgModule({
  declarations: [SignUpComponent],
  imports: [CommonModule],
})

export class SignUpModule {}
