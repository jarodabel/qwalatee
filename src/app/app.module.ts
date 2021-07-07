import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// App Modules
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomePageComponent } from './home-page/home-page.component';
import { SharedModule } from './shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Firebase imports
import { PdsaModule } from './pdsa/pdsa.component';
import { StoreModule } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { OrganizationModule } from './organization/organization.component';
import { breadcrumbReducerFn } from './shared/reducers/shared-reducers';
import { HttpClientModule } from '@angular/common/http';
import { AboutUsModule } from './about-us/about-us.component';
import { ContactUsModule } from './contact-us/contact-us.component';
import { PrivacyModule } from './privacy/privacy.component';
import { BreadcrumbService } from './shared/breadcrumbs/breadcrumbs.service';
import { EffectsModule } from '@ngrx/effects';
import { MessagesModudle } from './messages/messages.component';
import { StatementsModule } from './statements/statements.component';
import { CanActivateService } from './statements/statements.route.guard';
import { userReducerFn } from './shared/reducers/user.reducers';
import { PdsaService } from './shared/services/pdsa.service';
import { UserService } from './shared/services/user.service';
import { ValidationService } from './shared/services/validation.service';
import { LobService } from './shared/services/lob.service';
import { OrganizationService } from './shared/services/organization.service';
import { StatementService } from './shared/services/statement.service';
import { ResourcesModule } from './resouces/resources.component';
import { AttributionComponent } from './attribution/attribution.component';
import { statementReducerFn } from './shared/reducers/statement.reducers';
import { UploadService } from './shared/services/upload.service';
import { BatchManagementService } from './shared/services/batch-management.service';
import { StatementsInfoComponent } from './statements-info/statements-info.component';
import { CanActivateSubRouteService } from './statements/statements.sub.route.guard';
import { LogInComponent } from './log-in/log-in.component';
import { ReactiveFormsModule } from '@angular/forms';
import firebase from '@firebase/app';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    AttributionComponent,
    StatementsInfoComponent,
    LogInComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    SharedModule,
    PdsaModule,
    OrganizationModule,
    ContactUsModule,
    AboutUsModule,
    PrivacyModule,
    ResourcesModule,
    FontAwesomeModule,
    StoreModule.forRoot({
      breadcrumbs: breadcrumbReducerFn,
      user: userReducerFn,
      statements: statementReducerFn,
    }),
    HttpClientModule,
    EffectsModule.forRoot([BreadcrumbService]),
    MessagesModudle,
    StatementsModule,
    ReactiveFormsModule,
  ],
  providers: [
    PdsaService,
    UserService,
    ValidationService,
    LobService,
    CanActivateService,
    CanActivateSubRouteService,
    OrganizationService,
    StatementService,
    UploadService,
    BatchManagementService,
  ],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {
  constructor() {
    firebase.initializeApp(environment.firebase);
  }
}
