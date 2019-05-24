import { Injectable } from '@angular/core';


@Injectable()
export class DataService {

  baseUrl = 'http://localhost:8000/api/';

  query(keyword,type){
    const url = `${this.baseUrl}query:${type}+${keyword}`;
    console.log(`Query done from the app: ${url}`);
    return fetch(url);
  }

  sameCategoryBooleanCombination(type,booleanQuery){
    const url = `${this.baseUrl}sameCategoryBoolean:${booleanQuery}+${type}`;
    console.log(`Query done from the app: ${url}`);
    return fetch(url);
  }

  queryByDifferentBooleanCombination(booleanQuery){
    const url = `${this.baseUrl}differentCategoryBoolean:${booleanQuery}`;
    console.log(`Query done from the app: ${url}`);
    return fetch(url);
  }
}
