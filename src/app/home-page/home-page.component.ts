import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  distinctUntilChanged,
  switchMap,
  map,
  take,
  filter,
} from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  faChevronRight,
  faUserSecret,
} from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { UserModel } from '../types/data-models';
import { Store } from '@ngrx/store';
import { resetBreadcrumb } from '../shared/actions/shared-actions';
import { AppState } from '../app-state';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  rightButton = faChevronRight;
  userAuth$ = this.afAuth.user.pipe(distinctUntilChanged());
  dbUser$ = this.userAuth$.pipe(
    filter((user) => Boolean(user)),
    switchMap((user) =>
      this.db
        .collection('users', (ref) => ref.where('email', '==', user.email))
        .valueChanges()
    )
  );

  username: string;

  org$ = this.dbUser$.pipe(
    switchMap(([userInfo]: any[]) =>
      this.db.collection('organization').doc(userInfo.organization).get()
    ),
    map((a) => ({ id: a.id, ...a.data() }))
  );

  blogPosts$;

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private store: Store<AppState>,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.store.dispatch(resetBreadcrumb());
    this.getUsername();
    this.fetchBlogPosts();
  }

  async goToOrg() {
    const organization = await this.org$.pipe(take(1)).toPromise();
    this.router.navigate(['/', 'organization', organization.id]);
  }

  async getUsername() {
    const userAuth = (await this.dbUser$
      .pipe(take(1))
      .toPromise()) as UserModel[];
    if (!userAuth.length) {
      return;
    }
    this.username = await this.db
      .collection('users', (ref) => ref.where('email', '==', userAuth[0].email))
      .get()
      .pipe(
        take(1),
        map((users) =>
          users.docs.map(
            (user) => ({ id: user.id, ...user.data() } as UserModel)
          )
        ),
        map(([user]) => {
          return user.firstname && user.lastname
            ? `${user.firstname} ${user.lastname}`
            : '';
        })
      )
      .toPromise();
  }

  fetchBlogPosts() {
    this.blogPosts$ = this.http
      .get(
        `https://www.googleapis.com/blogger/v3/blogs/3276881001512562819/posts?key=${environment.blogger}`
      )
      .pipe(map((a: { items: any }) => a.items));
  }
}
