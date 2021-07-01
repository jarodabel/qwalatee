import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../shared/services/search.service';

@Component({
  selector: 'app-statement-search',
  templateUrl: './statement-search.component.html',
  styleUrls: ['./statement-search.component.scss'],
})
export class StatementSearchComponent implements OnInit {
  searchTerm = '328106';
  searchResults = [];
  headings = ['', 'Date', 'First Name', 'Last Name', 'Amount Due'];
  fieldNames = ['date', 'first', 'last', 'amtDue'];
  constructor(private searchService: SearchService) {}

  ngOnInit(): void {}

  searchFn() {
    this.searchResults.length = 0;
    let res = [];
    this.searchService
      .searchByPatientId(this.searchTerm)
      .then((snapshot) => {
        snapshot.forEach((_doc) => {
          const doc = { ..._doc.data() };
          console.log(doc);
          res.push(doc);
        });
      })
      .catch((err) => {
        console.log(err);
        res = [];
      })
      .finally(() => {
        this.searchResults = [...res];
        console.log(this.searchResults);
      });
  }

  clearSearch() {
    this.searchResults.length = 0;
  }
}
