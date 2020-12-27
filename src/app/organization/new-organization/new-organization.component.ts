import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

const defaultForm = {
  address: '',
  name: '',
  nameAbbr: '',
  phone: '',
  website: '',
};

@Component({
  selector: 'new-organization',
  templateUrl: './new-organization.component.html',
})
export class NewOrganizationComponent implements OnInit {
  newOrgForm;
  constructor(private formBuilder: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.newOrgForm = this.formBuilder.group({ ...defaultForm });
    console.log(this.newOrgForm);
  }
  goToHome() {
    this.router.navigate(['/']);
  }
  submit(){
    console.log('submit');
    // create org

    // add org id to user
  }
}
