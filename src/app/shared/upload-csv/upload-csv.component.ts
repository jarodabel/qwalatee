import { Component, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'upload-csv',
  template:' <input type="file" (change)="handleFileSelect($event)"/>',
  styleUrls: []
})

export class UploadCSVComponent {
  @Output()
  uploadData = new EventEmitter();

  handleFileSelect(evt) {
    const onload = (event) => {
      const csv = event.target.result; // Content of CSV file
      this.extractData(csv); //Here you can call the above function.
    }
    onload.bind(this);

    const files = evt.target.files; // FileList object
    const file = files[0];
    const reader = new FileReader();
    reader.onload = onload;
    reader.readAsText(file);

  }

  extractData(data) { // Input csv data to the function
    let csvData = data;
    let allTextLines = csvData.split(/\r\n|\n/);
    let headers = allTextLines[0].split(',');
    let lines = [];

    for ( let i = 0; i < allTextLines.length; i++) {
        // split content based on comma
        let data = allTextLines[i].split(',');
        if (data.length == headers.length) {
            let tarr = [];
            for ( let j = 0; j < headers.length; j++) {
                tarr.push(data[j]);
            }
            lines.push(tarr);
        }
    }
    this.uploadData.emit(lines);
  }
}
