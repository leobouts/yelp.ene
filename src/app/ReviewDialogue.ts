import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';


export interface ReviewValues{
  date:string,
  stars:string,
  text:string;
}

export interface Reviews {
  series: ReviewValues[];
  reviewCount:string;
}


@Component({
  selector: 'review-dialogue',
  templateUrl: 'dialogContent.html',
})
export class ReviewDialogue {

  info;
  businessId;
  finalReviewData: Reviews[] = [];
  businessName;
  keywords: string[];

  constructor(private dialogRef: MatDialogRef<ReviewDialogue>,
  @Inject(MAT_DIALOG_DATA) data) {

    this.info = data.reviews;
    this.businessId = data.businessId;
    this.businessName = data.name;
    this.keywords = data.keywords;

    //console.log(this.info);
    let reviewCounter = 0;

    let tempValues: ReviewValues[] = [];

    let finalInterface: Reviews;

    for (let j in this.info) {

      //console.log(this.info[j]);

      let splittedInfo = this.info[j].split('"reviews":["');

      //splittedInfo[0] has business info
      //splittedInfo[1] has the reviews

      let splittedBussinesInfo = splittedInfo[0].split(',"name":[');
      splittedBussinesInfo = splittedBussinesInfo[0].replace(/"/g,'');
      splittedBussinesInfo = splittedBussinesInfo.replace(/:/g,'');

      //console.log(splittedBussinesInfo);


      if(splittedBussinesInfo==this.businessId){

        let splittedReviewsInfo = splittedInfo[1].split('","');

        //now splittedReviewsInfo is a list with all the reviews

        //console.log(splittedReviewsInfo);


        for(let k in splittedReviewsInfo){
          console.log(splittedReviewsInfo);
          let splittedSingleReviewInfo = splittedReviewsInfo[k].split(', text=');

          //splittedSingleReviewInfo[0] has the date and stars
          //splittedSingleReviewInfo[1] has the text

          let text = splittedSingleReviewInfo[1].replace(/}/g,'');

          //clean for the last review
          text = text.replace(/"],{"/g,'');
          text = text.replace(/"]]/g,'');

          let cleanedText = text.split('"],"attributes"');


          let splittedDateAndStars = splittedSingleReviewInfo[0].split(', stars=');

          let stars = splittedDateAndStars[1];

          let ReviewDate = splittedDateAndStars[0].replace(/{date=/g,'');

          //interface to store the fields
          let tempData: ReviewValues = ({
            date: ReviewDate,
            stars: stars,
            text: cleanedText[0]});

          //console.log(tempData);
          //push to the temp list
          tempValues.push(tempData);
          reviewCounter = reviewCounter+1;
        }

      }
    }
    finalInterface = ({series: tempValues,reviewCount:reviewCounter.toString()});
    this.finalReviewData.push(finalInterface);

    //console.log(this.finalReviewData[0].series);
  }

}
