import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chunk'
})
export class ChunkPipe implements PipeTransform {
  transform(array: any[], size: number): any[][] {
    const result = [];

    for (let i = 0; i < size; i++) {
      const column = [];
      for (let j = i; j < array.length; j += size) {
        column.push(array[j]);
      }
      result.push(column);
    }

    return result;
  }
}
