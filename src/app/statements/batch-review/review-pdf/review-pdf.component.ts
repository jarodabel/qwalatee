import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { take } from 'rxjs/operators';
import { LobService } from '../../../shared/services/lob.service';
// import * as pdfjsLib from 'pdfjs-dist';

@Component({
  selector: 'review-pdf',
  templateUrl: './review-pdf.component.html',
  styleUrls: ['./review-pdf.component.scss'],
})
export class ReviewPdfComponent implements OnInit, OnChanges {
  @Input()
  ltrId: string;
  pdf: any;
  pageNumber: number;
  loadingPagePending = false;
  pageNumPending: number;

  constructor(private lobService: LobService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    if (changes.ltrId.currentValue !== changes.ltrId.previousValue) {
      this.getPdfUrl();
    }
  }

  getPdfUrl() {
    this.lobService
      // TODO: need to update function to accept Test or Live, not test or live
      .getLetterObject('test', this.ltrId)
      .pipe(take(1))
      .toPromise()
      .then((res: any) => {
        console.log(res.url);
        this.loadPdf(res.url);
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
        this.pdf = pdf;
        this.pageNumber = 1;
        this.renderPdfPage();
      },
      (reason) => {
        // PDF loading error
        console.error(reason);
      }
    );
  }
  renderPdfPage() {
    // Fetch the first page
    this.loadingPagePending = true;
    this.pdf.getPage(this.pageNumber).then((page) => {
      console.log('Page loaded');

      const scale = 1.1;
      const viewport = page.getViewport({ scale });

      // Prepare canvas using PDF page dimensions
      const canvas = document.getElementById('the-canvas') as HTMLCanvasElement;
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
        console.log('Page rendered');

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
    this.queueRenderPage();
  }
  previousPage() {
    if (this.pageNumber <= 1) {
      return;
    }
    this.pageNumber--;
    this.queueRenderPage();
  }
}
