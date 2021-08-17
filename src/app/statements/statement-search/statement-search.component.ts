import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { SearchService } from '../../shared/services/search.service';
import { UserService } from '../../shared/services/user.service';
import { LobService } from '../../shared/services/lob.service';
import { AccessType } from '../../types/access';
import { LOB_ENV } from '../../types/lob';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-statement-search',
  templateUrl: './statement-search.component.html',
  styleUrls: ['./statement-search.component.scss'],
})
export class StatementSearchComponent implements OnInit {
  searchTerm = '';
  searchResults = [];
  headings = ['', 'Date', 'First Name', 'Last Name', 'Amount Due'];
  fieldNames = ['date', 'first', 'last', 'amtDue'];
  env = LOB_ENV.TEST;
  constructor(
    private searchService: SearchService,
    private userService: UserService,
    private lobService: LobService
  ) {}

  ngOnInit(): void {}

  searchFn() {
    this.searchResults.length = 0;
    let res = [];
    this.searchService
      .searchByPatientId(this.searchTerm)
      .then((snapshot) => {
        snapshot.forEach((_doc) => {
          const doc = { ..._doc.data() };
          res.push(doc);
        });
      })
      .catch((err) => {
        console.log(err);
        res = [];
      })
      .finally(() => {
        this.searchResults = [...res];
      });
  }

  clearSearch() {
    this.searchResults.length = 0;
  }

  openUrl(id) {
    const currentEnv =
      environment.production === 'true' ? LOB_ENV.LIVE : LOB_ENV.TEST;
    const accessType =
      currentEnv === LOB_ENV.LIVE
        ? AccessType.STATEMENTS_VIEW_STATEMENT_LIVE
        : AccessType.STATEMENTS_VIEW_STATEMENT_TEST;
    this.userService.postAccessLog(accessType, id);
    this.lobService
      .getLetterObject(currentEnv, id)
      .pipe(take(1))
      .toPromise()
      .then((res: any) => {
        window.open(res.url, '_blank');
      });
  }
}
