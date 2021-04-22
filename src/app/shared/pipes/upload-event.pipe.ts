import { Pipe, PipeTransform } from '@angular/core';
import { AccessTitleType } from '../../types/access';
@Pipe({name: 'uploadEvent'})
export class UploadEventPipe implements PipeTransform {
  transform(value: number ): string {
    return AccessTitleType[value];
  }
}
