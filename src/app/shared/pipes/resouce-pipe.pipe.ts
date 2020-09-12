import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'resourcefilter',
  pure: false,
})
export class ResourcePipe implements PipeTransform {
  transform(items: any[], filter: string): any {
    if (!items || !filter) {
      return items;
    }

    return items.filter((item) =>
      item.find((a) => {
        const aLower = a.toLowerCase();
        return aLower.includes(filter.toLowerCase());
      })
    );
  }
}
