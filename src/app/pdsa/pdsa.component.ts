import { Component, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PdsaTabsComponent } from './pdsa-tabs/pdsa-tabs.component';
import { PdsaPlanListComponent } from './pdsa-plan-list/pdsa-plan-list.component';
import { PdsaHomeComponent } from './pdsa-home/pdsa-home.component';
import { switchMap, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { AppState } from '../app-state';

@Component({
  selector: 'pdsa',
  styleUrls: ['./pdsa.component.scss'],
  templateUrl: './pdsa.component.html',
})
export class PdsaComponent implements OnInit {
  thisPdsa$;
  constructor(
    private route: ActivatedRoute,
    private db: AngularFirestore,
    private router: Router,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.thisPdsa$ = this.route.params.pipe(
      switchMap((params) =>
        this.db.collection('pdsa').doc(params.pdsaId).get()
      ),
      map((a) => ({ id: a.id, ...a.data() }))
    );
  }
}

@NgModule({
  declarations: [
    PdsaComponent,
    PdsaHomeComponent,
    PdsaTabsComponent,
    PdsaPlanListComponent,
  ],
  exports: [],
  imports: [CommonModule, SharedModule, ReactiveFormsModule],
})
export class PdsaModule {}
