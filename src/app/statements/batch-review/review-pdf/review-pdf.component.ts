import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AppState } from '../../../app-state';
import { selectUser } from '../../../shared/selectors/user.selectors';
import { LobService } from '../../../shared/services/lob.service';
import { StatementService } from '../../../shared/services/statement.service';
import { LOB_ENV } from '../../../types/lob';

@Component({
  selector: 'review-pdf',
  templateUrl: './review-pdf.component.html',
  styleUrls: ['./review-pdf.component.scss'],
})
export class ReviewPdfComponent implements OnInit, OnDestroy {
  ltrId: string;
  pdf: any;
  pageNumber: number;
  numPages: number;
  pageNumPending: number;
  loadingPagePending = false;
  canApprove = false;
  reloadAttempt = false;
  viewedPages: number[] = [];

  routeParams$ = this.route.params;
  routeParentParams$ = this.route.parent.params;
  currentUser = this.store.pipe(select(selectUser));
  destroy$ = new Subject();

  constructor(
    private lobService: LobService,
    private statementService: StatementService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.routeParams$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.init();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  init() {
    this.pageNumber = undefined;
    this.numPages = undefined;
    this.pageNumPending = undefined;
    this.loadingPagePending = true;
    this.canApprove = false;
    this.viewedPages.length = 0;
    this.reloadAttempt = false;
    this.clearCanvas();
    this.getLtrId();
  }

  clearCanvas() {
    const canvas = document.getElementById('the-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  async getLtrId() {
    const params = await this.routeParams$.pipe(take(1)).toPromise();
    this.ltrId = params.ltrId;
    this.getPdfUrl();
  }

  getPdfUrl() {
    this.lobService
      .getLetterObject(LOB_ENV.TEST, this.ltrId)
      .pipe(take(1))
      .toPromise()
      .then((res: any) => {
        this.loadingPagePending = true;

        setTimeout(() => {
          // doing this because sometimes the document in "lob land" hasn't been written, even though they gave us a url
          this.loadPdf(res.url);
        }, 4000);
      });
  }

  loadPdf(url) {
    // Loaded via <script> tag, create shortcut to access PDF.js exports.
    const pdfjsLib = window['pdfjs-dist/build/pdf'];

    // The workerSrc property shall be specified.
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.8.335/pdf.worker.min.js';

    // Asynchronous download of PDF
    const loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(
      (pdf) => {
        this.loadingPagePending = true;
        this.pdf = pdf;
        this.numPages = this.pdf.numPages;
        this.pageNumber = 1;
        this.viewedPages.push(1);
        this.renderPdfPage();
      },
      (reason) => {
        this.loadingPagePending = false;
        this.clearCanvas();
        if (!this.reloadAttempt) {
          this.loadingPagePending = true;
          this.reloadAttempt = true;
          setTimeout(() => {
            this.loadPdf(url);
          }, 4000);
          return;
        }
        // PDF loading error
        console.error(reason);
      }
    );
  }

  renderPdfPage() {
    // Fetch the first page
    this.loadingPagePending = true;

    this.pdf.getPage(this.pageNumber).then((page) => {
      const scale = 1.1;
      const viewport = page.getViewport({ scale });

      // Prepare canvas using PDF page dimensions
      const canvas = document.getElementById('the-canvas') as HTMLCanvasElement;
      if(!canvas) {
        return;
      }
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: context,
        viewport,
      };
      const renderTask = page.render(renderContext);
      renderTask.promise.then(() => {
        this.loadingPagePending = false;
        if (this.pageNumPending !== null) {
          // New page rendering is pending
          this.renderPdfPage();
          this.pageNumPending = null;
        }
      });
    });
  }

  queueRenderPage() {
    if (this.loadingPagePending) {
      this.pageNumPending = this.pageNumber;
    } else {
      this.renderPdfPage();
    }
  }

  nextPage() {
    if (this.pageNumber >= this.pdf.numPages) {
      return;
    }
    this.pageNumber++;
    this.pageViewed(this.pageNumber);
    this.queueRenderPage();
  }

  previousPage() {
    if (this.pageNumber <= 1) {
      return;
    }
    this.pageNumber--;
    this.queueRenderPage();
  }

  pageViewed(num) {
    if (this.viewedPages.includes(num)) {
      return;
    }
    this.viewedPages.push(num);
    if (this.viewedPages.length === this.numPages) {
      this.canApprove = true;
    }
  }

  async markAsApproved() {
    // update record object as approved
    // route to review-batch
    const params = await this.routeParams$.pipe(take(1)).toPromise();
    const parent = await this.routeParentParams$.pipe(take(1)).toPromise();
    const user = await this.currentUser.pipe(take(1)).toPromise();
    const uploadId = parent.uploadId;
    const reviewIdentifier = params.reviewNumber;
    const update = {
      [`reviewStatements.${reviewIdentifier}.approved`]: true,
      [`reviewStatements.${reviewIdentifier}.user`]: user.id,
    };

    this.statementService
      .updateUploadRecord(uploadId, update)
      .then((res) => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
