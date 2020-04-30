import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { FormBuilder } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';

const defaultForm = {
  aim: '',
  changeIdea: '',
  objective: '',
  prediction: '',
  questions: '',
  measures: '',
};

const nonFormFields = ['site'];

@Component({
  selector: 'pdsa-home',
  styleUrls: ['./pdsa-home.component.scss'],
  templateUrl: './pdsa-home.component.html',
})
export class PdsaHomeComponent implements OnInit, OnChanges {
  @Input()
  data;

  checkoutForm;

  routeParams$ = this.route.params;

  constructor(
    private formBuilder: FormBuilder,
    private db: AngularFirestore,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    if (!this.data) {
      this.checkoutForm = this.formBuilder.group({ ...defaultForm });
    }
  }

  ngOnChanges({ data }: SimpleChanges) {
    if (data) {
      this.checkoutForm = this.formBuilder.group({
        ...defaultForm,
        ...this.checkoutForm,
        ...data.currentValue,
      });
    }
  }

  getFormData() {
    const keys = Object.keys(defaultForm);
    const values = this.checkoutForm.value;
    return keys.reduce((acc, key) => {
      return { ...acc, [key]: values[key] };
    }, {});
  }

  async saveForm() {
    const params = await this.routeParams$.pipe(take(1)).toPromise();

    this.db
      .collection('pdsa')
      .doc(params.pdsaId)
      .set({ ...this.getFormData(), site: params.siteId }, { merge: true });
  }

  goBack(){
    this.router.navigate(['../', 'list'], { relativeTo: this.route });
  }
}
