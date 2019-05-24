import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'HighlightSearch'
})

export class HighlightSearch implements PipeTransform {

  transform(value: string, highlightingWords: string[]): any {

    for(let i in highlightingWords){
      value = value.replace(new RegExp(highlightingWords[i], 'gi'), '<strong><em>'+highlightingWords[i]+'</em></strong>');
    }
    return  value.toLowerCase();
  }

}
