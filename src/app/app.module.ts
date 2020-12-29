import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

// App Modules
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomePageComponent } from './home-page/home-page.component';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Firebase imports
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { ServiceWorkerModule } from '@angular/service-worker';
import { PdsaModule } from './pdsa/pdsa.component';
import { PdsaService } from './services/pdsa.service';
import { StoreModule } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { OrganizationModule } from './organization/organization.component';
import { reducer } from './shared/reducers/shared-reducers';
import { HttpClientModule } from '@angular/common/http';
import { AboutUsModule } from './about-us/about-us.component';
import { ContactUsModule } from './contact-us/contact-us.component';
import { PrivacyModule } from './privacy/privacy.component';
import { BreadcrumbService } from './shared/breadcrumbs/breadcrumbs.service';
import { EffectsModule } from '@ngrx/effects';
import { ResourcesModule } from './resouces/base-resouce/base-resource.component';
import { ResourcePipe } from './shared/pipes/resouce-pipe.pipe';
import { MessagesModudle } from './messages/messages.component';
import { UserService } from './services/user.service';
import { ValidationService } from './services/validation.service';
import { LobService } from './services/lob.service';
import { StatementsModule } from './statements/statements.component';
import { CanActivateService } from './statements/statements.route.guard';
import { OrganizationService } from './services/organization.service';

@NgModule({
  declarations: [AppComponent, HomePageComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    SharedModule,
    UserModule,
    PdsaModule,
    OrganizationModule,
    ContactUsModule,
    AboutUsModule,
    PrivacyModule,
    ResourcesModule,
    FontAwesomeModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    StoreModule.forRoot({
      breadcrumbs: reducer,
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    HttpClientModule,
    EffectsModule.forRoot([BreadcrumbService]),
    MessagesModudle,
    StatementsModule,
  ],
  providers: [PdsaService, UserService, ValidationService, LobService, CanActivateService, OrganizationService],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
