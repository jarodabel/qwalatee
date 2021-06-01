import { Component, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, map, tap, take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { Store } from '@ngrx/store';
import { addBreadcrumb } from '../shared/actions/shared-actions';
import { AppState } from '../app-state';
import { ReactiveFormsModule } from '@angular/forms';
import firebase from 'firebase/app';

@Component({
  selector: 'organization-page',
  styleUrls: ['./organization.component.scss'],
  templateUrl: './organization.component.html',
})
export class OrganizationComponent implements OnInit {
  locations$;
  orgId;
  fs = firebase.firestore()

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {}
  ngOnInit() {
    this.locations$ = this.route.params.pipe(
      switchMap((params) =>
        this.fs
          .collection('site')
          .where('organization', '==', params.orgId)
          .get()
      ),
      map((locations) =>
        locations.docs.map((location) => {
          return {
          id: location.id,
          ...location.data(),
        }})
      ), tap((a)=>{console.log(a)})
    );
    this.store.dispatch(addBreadcrumb({ home: '/' }));
  }

  async goToPdsaPage(id) {
    console.log(id)
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
  imports: [CommonModule, SharedModule, ReactiveFormsModule],
})
export class OrganizationModule {}
