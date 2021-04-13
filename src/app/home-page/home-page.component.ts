import { Component, OnInit } from '@angular/core';
import { switchMap, map, take, tap } from 'rxjs/operators';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { resetBreadcrumb } from '../shared/actions/shared-actions';
import { AppState } from '../app-state';
import { HttpClient } from '@angular/common/http';
import { selectUser } from '../shared/selectors/user.selectors';
import { User } from '../shared/reducers/user.reducers';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  rightButton = faChevronRight;
  user$ = this.store.pipe(select(selectUser));

  username: string;
  org$ = this.user$.pipe(
    switchMap((user: User) =>
      this.db.collection('organization').doc(user.organization).get()
    ),
    map((a) => ({ id: a.id, ...a }))
  );

  blogPosts$;

  constructor(
    private db: AngularFirestore,
    private router: Router,
    private store: Store<AppState>,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.store.dispatch(resetBreadcrumb());
    this.fetchBlogPosts();
  }

  async goToOrg() {
    const organization = await this.org$.pipe(take(1)).toPromise();
    this.router.navigate(['/', 'organization', organization.id]);
  }

  fetchBlogPosts() {
    this.blogPosts$ = this.http
      .get(
        `https://www.googleapis.com/blogger/v3/blogs/3276881001512562819/posts?key=${environment.blogger}`
      )
      .pipe(
        map((a: { items: any }) => a.items)
      );
  }
}
