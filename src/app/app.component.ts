import {Component} from '@angular/core';
import {MatDialog, MatDialogConfig, MatSnackBar, MatTableDataSource} from '@angular/material';
import {DataService} from './DataService';
import * as _ from 'underscore';
import 'hammerjs';
import {ReviewDialogue} from './ReviewDialogue';
import { AngularFirestore } from '@angular/fire/firestore';


export interface RestaurantValues{
  retrievedPosition:number,
  name:string,
  location:string,
  stars:number,
  reviewCount:number,
  businessId:string,
  clicks:number;
}

export interface Restaurants {
  series: RestaurantValues[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  searchPageViewActive = true;
  resultsPageViewActive = false;
  finalRestaurantData: Restaurants[] = [];
  //columns must match the data structure that holds the data for the column, here the restaurantValues interface
  displayedColumns: String[] = ['retrievedPosition', 'name','location','stars','reviewCount','businessId','clicks'];
  //data source is connected to the html table
  selected = 'retrievalNumber';
  dataSource = new MatTableDataSource();
  boolOperators: string[];
  searchKeys: string[];
  keywords;
  clicksRetrieved;
  reviewsInfo: string[];
  progressBarActive: boolean = false;
  clicksMade: string[] = [];




  constructor(private _snackBar: MatSnackBar,
              private _dataService: DataService,
              public dialog:MatDialog,
              private _database: AngularFirestore) {
  }


  async search(searchType, searchQuery) {

    if (searchQuery < 1) {
      this._snackBar.open('Please enter a search query', 'Dismiss', {duration: 2000});

    } else if (searchType == undefined) {
      this._snackBar.open('Please select a search type', 'Dismiss', {duration: 2000});


    } else {
      this.progressBarActive = true;
      //if is a boolean combination of THE SAME TYPE OF QUESTIONS

      //make the lowercase so we can check every possible combination of boolean operators eg. And or aNd or oR
      searchQuery = searchQuery.toLowerCase();

      if((searchQuery.includes("and") || searchQuery.includes("or")||searchQuery.includes("not"))&& searchType!='boolean'){


        this.cleanQuestion(searchQuery);

        let notCounter=0;
        for(let i of this.boolOperators){
          if(i=='not'){
            notCounter=notCounter+1;
          }
        }

        //operators must always be one les than the search keys, consider that the not keyword is used to reverse a keyword
        if(this.boolOperators.length+1 - notCounter != this.searchKeys.length){
          this._snackBar.open('Please use the correct syntax', 'Dismiss', {duration: 2000});
          return;
        }

        //the operators will always be one less than the search keywords
        //assign the first keyword to the final question string and delete it
        //so we can with a simple loop concatenate the rest

        let finalString = '';

        //create the query
        let j = 0;
        let firstFlag=true;
        for(let i in this.searchKeys){
          if(firstFlag==true){
            if(this.boolOperators[0]=='not'){
              j=j+1;
              finalString=`-${searchType}:${this.searchKeys[i]}`;
            }else{
              finalString=`${searchType}:${this.searchKeys[i]}`;
            }
            firstFlag=false;
          }else{
            finalString=`${finalString}%20${this.boolOperators[j]}`;
            if(this.boolOperators[j+1]=='not'){
              j=j+1;
              finalString=`${finalString}%20-${searchType}:${this.searchKeys[i]}`
            }else{
              finalString=`${finalString}%20${searchType}:${this.searchKeys[i]}`
            }
            j=j+1;
          }
        }
        //console.log(finalString);

        await this._dataService.sameCategoryBooleanCombination(searchType,finalString).then(response => response.json())
          .then(data => {
            //clean and populate the datatable source

            this.cleanData(data,this.searchKeys);
          })
          .catch(error => console.error(error));

      //if is a boolean combination of DIFFERENT TYPE OF QUESTIONS
      }else if(searchType=='boolean'){

        this.cleanQuestion(searchQuery);

        let notCounter=0;
        for(let i of this.boolOperators){
          if(i=='not'){
            notCounter=notCounter+1;
          }
        }

        if(this.boolOperators.length + 1 - notCounter != this.searchKeys.length){
          this._snackBar.open('Please use the correct syntax', 'Dismiss', {duration: 2000});
          return;
        }

        //check if the input is correct
        let testExpression = /(name:|reviews:|categories:)[A-Za-z0-9]/;
        for(let i in this.searchKeys){
          if(!testExpression.exec(this.searchKeys[i])){
            this._snackBar.open('Please use the correct syntax', 'Dismiss', {duration: 2000});
            return;
          }
        }
        for(let j in this.boolOperators){
          if(this.boolOperators[j].toLowerCase()!='or'&&
            this.boolOperators[j].toLowerCase()!='and'&&
            this.boolOperators[j].toLowerCase()!='not'){
            this._snackBar.open('Please use the correct syntax', 'Dismiss', {duration: 2000});
            return;
          }
        }
        searchQuery = searchQuery.toLowerCase().replace(/not/g, '-');
        searchQuery = searchQuery.replace(/- /g, '-');
        searchQuery = searchQuery.replace(/ /g, '%20');

        //now the query has space after every dash character, i will find all dash characters index and then remove the next value of them

        //console.log(searchQuery);
        await this._dataService.queryByDifferentBooleanCombination(searchQuery).then(response => response.json())
          .then(data => {
            //clean and populate the datatable source
            this.cleanData(data,this.searchKeys);
          })
          .catch(error => console.error(error));
      }else{

        //to create keywords for highlighting
        this.cleanQuestion(searchQuery);

        let searchQuerySplitted = searchQuery.split(' ');

        //if search query has more than one elements it will be a boolean AND question.

        if(searchQuerySplitted.length>1){
          let searchQueryFinal = `${searchType}:${searchQuerySplitted[0]}`;
          //console.log(searchQueryFinal);
          searchQuerySplitted.shift();
          for(let i in searchQuerySplitted){
            searchQueryFinal = `${searchQueryFinal}%20and%20${searchType}:${searchQuerySplitted[i]}`
          }
         // console.log(searchQueryFinal);

          //search with multiple terms
          await this._dataService.sameCategoryBooleanCombination(searchType,searchQueryFinal).then(response => response.json())
            .then(data =>{
              this.cleanData(data,this.searchKeys);
            })
            .catch(error => console.error(error));

        }else{
          //search only with a single term

          //to create keywords for highlighting
          this.cleanQuestion(searchQuery);

          await this._dataService.query(searchType, searchQuery).then(response => response.json())
            .then(data => {
              //clean and populate the datatable source
              this.cleanData(data,this.searchKeys);
            })
            .catch(error => console.error(error));
        }
      }
    }
  }



  async cleanData(data, keywords) {


    //for highlighting
    this.keywords = keywords;

    //turn json response into a string
    let stringData = JSON.stringify(data);

    //remove all new line character
    let stringDataTrimmedLines = stringData.replace(/\\n/g, '');

    //remove the remaining backslash characters
    stringDataTrimmedLines = stringDataTrimmedLines.replace(/\\/g, '');

    //split to responseheader and info

    let splittedDataWithBracket = stringDataTrimmedLines.split('"docs":');

    //console.log(splittedDataWithBracket);

    //split with right curly bracket to find each document
    let splittedDataWithCurlyBracket = splittedDataWithBracket[1].split('business_id');

    //remove first element of the list
    splittedDataWithCurlyBracket = splittedDataWithCurlyBracket.slice(1);

    //console.log(splittedDataWithCurlyBracket);

    //temp list to gather all restaurants info
    let tempValues: RestaurantValues[] = [];

    let finalInterface: Restaurants;

    //data to pass on the dialogue component
    this.reviewsInfo = splittedDataWithCurlyBracket;

    for (let j in splittedDataWithCurlyBracket) {

      // split the fields and the reviews
      let splittedDocumentData = splittedDataWithCurlyBracket[j].split('reviews');

      //splittedDocumentData[0] are the restaurant info
      //splittedDocumentData[1] are the reviews info


      //split the restaurant info with commas
      let splittedCommaDocData = splittedDocumentData[0].split(',"');

      //console.log(splittedCommaDocData);

      //get the first json field value (id)
      let splittedFirstField = splittedCommaDocData[0].split('"');
      let id = splittedFirstField[2];

      //get the second json field value (name)
      let splittedSecondField = splittedCommaDocData[1].split('"');
      let restaurantName = splittedSecondField[2];

      //get the fourth json field value (city)
      let splittedFourthField = splittedCommaDocData[3].split('"');
      let location = splittedFourthField[2];

      //get the sixth json field value (stars)
      //console.log(splittedCommaDocData);
      let splittedSixthField = splittedCommaDocData[5].split('"');
      let stars = splittedSixthField[2];


      //get the seventh json field value (reviewCount)
      //console.log(splittedCommaDocData);
      let splittedSeventhField = splittedCommaDocData[6].split('"');
      let reviewCount = splittedSeventhField[2];

      //if no one has clicked it yet it will remain zero.

      // because the service returns an Obaservable object, i need to transform  it into a Promise with the toPromise() function
      //get the id of every business
      await this.getBusinessClicks(id);
      let clicks;
      if (this.clicksRetrieved == undefined) {
        clicks = 0;
      } else {
        clicks = parseInt(this.clicksRetrieved);
      }
      //interface to store the fields
      let tempData: RestaurantValues = ({
        retrievedPosition: parseInt(j) + 1,
        name: restaurantName,
        location: location,
        stars: parseFloat(stars),
        reviewCount: parseInt(reviewCount),
        businessId: id,
        clicks: clicks
      });

      //push to the temp list
      tempValues.push(tempData);
    }
    //when all restaurants are done push the final interface.
    finalInterface = ({series: tempValues});
    this.finalRestaurantData.push(finalInterface);
    this.dataSource = new MatTableDataSource(this.finalRestaurantData[0].series);
    //console.log(this.finalRestaurantData[0].series);

    //for the results view
    this.searchPageViewActive = false;
    this.resultsPageViewActive = true;
    this.progressBarActive = false;
  }


  returnToSearchPage() {

    this.searchPageViewActive = true;
    this.resultsPageViewActive = false;
    this.finalRestaurantData = [];
    this.dataSource = new MatTableDataSource();
    this.selected = 'retrievalNumber';
    this.keywords = [];
    this.clicksMade = [];

  }

  orderChanged() {
    if(this.selected=='retrievalNumber'){

      this.finalRestaurantData[0].series = _.sortBy( this.finalRestaurantData[0].series, 'retrievedPosition' );
      this.dataSource = new MatTableDataSource(this.finalRestaurantData[0].series);

    }else if(this.selected=='starRating'){

      //sorts by stars, if stars are zero then the second one of the boolean expression must be invoked and will be sorted with it
      this.finalRestaurantData[0].series.sort(function (a, b) {
        return a.stars - b.stars || a.reviewCount - b.reviewCount;
      });

      //new MatTableDataSource to update the view and .reverse() for descending order
      this.dataSource = new MatTableDataSource(this.finalRestaurantData[0].series.reverse());

    }else if(this.selected=='clicks') {
      //sorts by clickthrough.
      console.log(this.finalRestaurantData[0].series);
      //reverse so its in descending order
      this.finalRestaurantData[0].series = _.sortBy( this.finalRestaurantData[0].series, 'clicks' ).reverse();
      this.dataSource = new MatTableDataSource(this.finalRestaurantData[0].series);
    }
  }

  cleanQuestion(searchQuery) {
    let splittedQueryWithSpace = searchQuery.split(' ');

    //create a list with the boolean operators
    this.boolOperators = splittedQueryWithSpace.filter(function(val) {
      if( val == 'and' || val == 'or' || val == 'not'){
        return val;
      }
    });
    //create a list with the search keywords
    this.searchKeys = splittedQueryWithSpace.filter(function(val) {
      if(val != 'and' && val != 'or' && val !='not'){
        return val;
      }
    });
  }

  async openDialog(id,name) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      reviews: this.reviewsInfo,
      businessId: id,
      name:name,
      keywords:this.keywords
    };
    this.dialog.open(ReviewDialogue,dialogConfig);

    if(this.clicksMade.includes(id)){
      return;
    }

    this.clicksMade.push(id);

    //updated this.clicksRetrieved
    this.getBusinessClicks(id);
    // because the service returns an Obaservable object, i need to transform  it into a Promise with the toPromise() function

    await this._database.collection("clickthroughRate").doc(id).get().toPromise().then(async (doc) => {
      if (doc.exists) {
        await this._database.collection("clickthroughRate").doc(id).update({
          clicks: this.clicksRetrieved  + 1
        })
          .then(function() {
            console.log("Click-through rate successfully updated!");
          })
          .catch(function(error) {
            console.error("Error updating click-through rate: ", error);
          });
      } else {
        //else create a doc
        await this._database.collection("clickthroughRate").doc(id).set({
          businessId: id,
          clicks: 1
        })
          .then(function() {
            console.log("New document for business created, now clicks will be stored");
          })
          .catch(function(error) {
            console.error("Error creating new business doc ", error);
          });
      }
    }).catch(function(error) {
      console.log("Error getting Click-through rate:", error);
    });
  }



  async getBusinessClicks(id) {
    //use fat arrow functions to get stuff references inside nested callbacks.
    await this._database.collection("clickthroughRate").doc(id).get().toPromise().then((doc)=> {
      if (doc.exists) {
        console.log(doc.data().clicks);
        this.setClicks(doc.data().clicks);
      } else {
        // doc.data() will be undefined in this case
        this.setClicks(0);
      }
    }).catch(function(error) {
      console.log("Error getting Click-through rate:", error);
    });
  }

  setClicks(clicks){
    this.clicksRetrieved=clicks;
  }
}


