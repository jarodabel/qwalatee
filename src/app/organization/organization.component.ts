import { Component, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, map, tap, take } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { Store } from '@ngrx/store';
import { addBreadcrumb } from '../shared/actions/shared-actions';
import { AppState } from '../app-state';

@Component({
  selector: 'organization-page',
  styleUrls: ['./organization.component.scss'],
  templateUrl: './organization.component.html',
})
export class OrganizationComponent implements OnInit {
  locations$;
  orgId;

  constructor(
    private route: ActivatedRoute,
    private db: AngularFirestore,
    private router: Router,
    private store: Store<AppState>,
  ) {}
  ngOnInit() {
    this.locations$ = this.route.params.pipe(
      switchMap((params) =>
        this.db
          .collection('site', (ref) =>
            ref.where('organization', '==', params.orgId)
          )
          .get()
      ),
      map((locations) =>
        locations.docs.map((location) => ({
          id: location.id,
          ...location.data(),
        }))
      )
    );
    this.store.dispatch(addBreadcrumb({ home: '/' }));
  }

  async goToPdsaPage(id) {
    const params = await this.route.params.pipe(take(1)).toPromise();
    this.store.dispatch(
      addBreadcrumb({ organization: params.orgId })
    );
    this.router.navigate(['site', id, 'pdsa', 'list'], {
      relativeTo: this.route,
    });
  }
}

@NgModule({
  declarations: [OrganizationComponent],
  exports: [],
  imports: [CommonModule, SharedModule],
})
export class OrganizationModule {}
