import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import {DataService} from './DataService';
import {HighlightSearch} from './highlightSearch';
import {
  MatFormFieldModule,
  MatInputModule,
  MatButtonToggleModule,
  MatIconModule,
  MatSnackBarModule,
  MatListModule,
  MatCardModule,
  MatTableModule,
  MatSelectModule,
  MatDialogModule,
  MatDialogConfig,
  MatProgressBarModule,
} from '@angular/material';
import {ReviewDialogue} from './ReviewDialogue';
//firebase modules
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';

const config = {
  apiKey: "apikey",
  authDomain: "auth",
  databaseURL: "data",
  projectId: "yelpene-id",
  storageBucket: "yelpene",
  messagingSenderId: "idmess",
  appId: "appid"
};

@NgModule({
  declarations: [
    AppComponent,
    HighlightSearch,
    ReviewDialogue
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatIconModule,
    MatSnackBarModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatListModule,
    MatCardModule,
    MatTableModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressBarModule,
    AngularFireModule.initializeApp(config),
    AngularFirestoreModule, // firestore
    AngularFireAuthModule, // auth
    AngularFireStorageModule // storage
  ],
  entryComponents: [
    ReviewDialogue
],
  providers: [DataService,MatDialogConfig],
  bootstrap: [AppComponent]
})
export class AppModule { }
