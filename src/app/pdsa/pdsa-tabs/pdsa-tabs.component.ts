import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { take, map } from 'rxjs/operators';
import firebase from 'firebase/app';

const defaultForm = { plan: '', do: '', study: '', act: '' };
const documentFields = [
  ...Object.keys(defaultForm),
  'dateCreate',
  'dateModified',
  'pdsaId',
];

@Component({
  selector: 'pdsa-tabs',
  styleUrls: ['./pdsa-tabs.component.scss'],
  templateUrl: './pdsa-tabs.component.html',
})
export class PdsaTabsComponent implements OnInit {
  fs = firebase.firestore();
  list = ['Plan', 'Do', 'Study', 'Act'];
  clicked = 'Plan';
  currentPdsaCycle;
  routeParams$ = this.route.params;
  pdsa;
  canSave = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.currentPdsaCycle = this.formBuilder.group({ ...defaultForm });

    this.setCycles();
  }

  async setCycles() {
    const params = await this.routeParams$.pipe(take(1)).toPromise();
    this.fs
      .collection('pdsa-cycle')
      .where('pdsaId', '==', params.pdsaId)
      .get()
      .then((pdsas) => {
        this.pdsa = pdsas.docs.map((pdsa) => ({ id: pdsa.id, ...pdsa }))
      })
  }

  getFormData() {
    const keys = Object.keys(defaultForm);
    const values = this.currentPdsaCycle.value;
    return keys.reduce((acc, key) => {
      return { ...acc, [key]: values[key] };
    }, {});
  }

  async saveForm() {
    const params = await this.routeParams$.pipe(take(1)).toPromise();
    const newDate = firebase.firestore.FieldValue.serverTimestamp();
    this.fs
      .collection('pdsa-cycle')
      .add({
        ...this.getFormData(),
        pdsaId: params.pdsaId,
        dateCreated: newDate,
        dateModified: newDate,
      })
      .then(
        () => {
          this.currentPdsaCycle = this.formBuilder.group({ ...defaultForm });
          this.setCycles();
        },
        () => {
          console.error('failure');
        }
      );
  }
}
