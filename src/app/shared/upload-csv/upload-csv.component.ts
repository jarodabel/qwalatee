import { Component, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'upload-csv',
  templateUrl: './upload-csv.component.html',
  styleUrls: [],
})
export class UploadCSVComponent {
  @Output()
  uploadData = new EventEmitter();
  filename= '';

  handleFileSelect(evt) {
    const onload = (event) => {
      const csv = event.target.result; // Content of CSV file
      this.extractData(csv);
    };
    onload.bind(this);

    const files = evt.target.files; // FileList object
    this.filename = evt.target.files[0].name;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = onload;
    reader.readAsText(file);
  }

  extractData(data) {
    // Input csv data to the function
    let csvData = data;
    let allTextLines = csvData.split(/\r\n|\n/);
    let headers = allTextLines[0].split(',');
    let lines = [];

    for (let i = 0; i < allTextLines.length; i++) {
      // split content based on comma
      let data = allTextLines[i].split(',');
      if (data.length == headers.length) {
        let tarr = [];
        for (let j = 0; j < headers.length; j++) {
          tarr.push(data[j]);
        }
        lines.push(tarr);
      }
    }
    this.uploadData.emit(lines);
  }
}
