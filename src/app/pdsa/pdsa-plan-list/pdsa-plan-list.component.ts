import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, map, take, tap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { Store } from '@ngrx/store';
import { AppState } from '../../app-state';
import { PdsaService } from '../../shared/services/pdsa.service';
import { addBreadcrumb } from '../../shared/actions/shared-actions';


const defaultPdsa = {
  aim: '',
  changeIdea: '',
  dataModifed: '',
  dateCreated: '',
  measures: '',
  objective: '',
  prediction: '',
  questions: '',
  site: '',
};

@Component({
  selector: 'pdsa-plan-list',
  styleUrls: ['./pdsa-plan-list.component.scss'],
  templateUrl: './pdsa-plan-list.component.html',
})
export class PdsaPlanListComponent implements OnInit {
  existingPdsas$;
  constructor(
    private route: ActivatedRoute,
    private db: AngularFirestore,
    private router: Router,
    private store: Store<AppState>,
    private pdsaService: PdsaService,
  ) {}

  ngOnInit() {
    this.getPdsas();
  }

  async edit(id) {
    this.store.dispatch(addBreadcrumb({ pdsaId: id }));
    this.router.navigate(['../', id], { relativeTo: this.route });
  }

  getPdsas() {
    this.existingPdsas$ = this.route.params.pipe(
      tap((params) => {
        this.pdsaService.setBreadcrumbs(params);
      }),
      switchMap((params) =>
        this.db
          .collection('pdsa', (ref) => ref.where('site', '==', params.siteId))
          .get()
      ),
      map((pdsas) =>
        pdsas.docs.map((pdsa) => ({ id: pdsa.id, ...pdsa }))
      )
    );
  }

  async createNewPdsa() {
    const params = await this.route.params.pipe(take(1)).toPromise();
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    const newPdsa = {
      ...defaultPdsa,
      dateCreated: timestamp,
      dataModifed: timestamp,
      site: params.siteId,
      aim: 'UNTITLED PDSA',
    };
    this.db.collection('pdsa').add(newPdsa);
    this.getPdsas();
  }
}
