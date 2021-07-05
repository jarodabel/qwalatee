import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShellComponent } from './shell/shell.component';
import { RouterModule } from '@angular/router';
import { DeleteButtonComponent } from './delete-button/delete-button.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { UploadCSVComponent } from './upload-csv/upload-csv.component';
import { CheckboxComponent } from './checkbox/checkbox.component';

const components = [ShellComponent, DeleteButtonComponent, BreadcrumbsComponent, UploadCSVComponent, CheckboxComponent];

const modules = [
  CommonModule,
  RouterModule,
];

@NgModule({
  declarations: [...components],
  imports: [...modules],
  exports: [...components, ...modules],
})
export class SharedModule {}
