import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { PdsaComponent } from './pdsa/pdsa.component';
import { PdsaHomeComponent } from './pdsa/pdsa-home/pdsa-home.component';
import { OrganizationComponent } from './organization/organization.component';
import { PdsaPlanListComponent } from './pdsa/pdsa-plan-list/pdsa-plan-list.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { BaseResourceComponent } from './resouces/base-resouce/base-resource.component';
import { MessagesComponent } from './messages/messages.component';
import { StatementsComponent } from './statements/statements.component';
import { CanActivateService } from './statements/statements.route.guard';
import { ResourcesComponent } from './resouces/resources.component';
import { AttributionComponent } from './attribution/attribution.component';
import { UploadHistoryComponent } from './statements/upload-history/upload-history.component';
import { HistoryStatementsComponent } from './statements/history-statements/history-statements.component';
import { BatchUploadComponent } from './statements/batch-upload/batch-upload.component';
import { BatchReviewComponent } from './statements/batch-review/batch-review.component';
import { BatchReviewDetailsComponent } from './statements/batch-review/batch-review-details/batch-review-details.component';
import { ReviewPdfComponent } from './statements/batch-review/review-pdf/review-pdf.component';
import { BatchExploreComponent } from './statements/batch-explore/batch-explore.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'organization/:orgId',
    component: OrganizationComponent,
  },
  {
    path: 'organization/:orgId/site/:siteId',
    redirectTo: 'organization/:orgId/site/:siteId/pdsa/list',
  },
  {
    path: 'organization/:orgId/site/:siteId/pdsa/new',
    component: PdsaHomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'organization/:orgId/site/:siteId/pdsa/list',
    component: PdsaPlanListComponent,
    pathMatch: 'full',
  },
  {
    path: 'organization/:orgId/site/:siteId/pdsa/:pdsaId',
    component: PdsaComponent,
  },
  {
    path: 'settings',
    loadChildren: () => import('./user/user.module').then((m) => m.UserModule),
  },
  {
    path: 'about-us',
    component: AboutUsComponent,
  },
  {
    path: 'contact-us',
    component: ContactUsComponent,
  },
  {
    path: 'resources',
    component: ResourcesComponent,
  },
  {
    path: 'resources/:org',
    component: BaseResourceComponent,
  },
  {
    path: 'privacy-policy',
    component: PrivacyComponent,
  },
  {
    path: 'messages',
    component: MessagesComponent,
  },
  {
    canActivate: [CanActivateService],
    component: StatementsComponent,
    path: 'statements',
    children: [
      {
        path: '',
        redirectTo: 'upload-batch',
        pathMatch: 'full',
      },
      {
        component: BatchUploadComponent,
        path: 'upload-batch',
      },
      {
        component: BatchExploreComponent,
        path: 'explore-batch/:uploadId',
      },
      {
        component: BatchReviewComponent,
        path: 'explore-batch',
        data: {
          page: 'explore',
        },
      },
      {
        component: BatchReviewDetailsComponent,
        path: 'review-batch/:uploadId',
        children: [
          {
            component: ReviewPdfComponent,
            path: ':reviewNumber/:ltrId',
          },
        ],
      },
      {
        component: BatchReviewComponent,
        path: 'review-batch',
        data: {
          page: 'review',
        },
      },
      {
        component: BatchReviewComponent,
        path: 'review-history',
        data: {
          page: 'history',
        },
      },
      {
        component: UploadHistoryComponent,
        path: 'upload-history',
      },
      {
        component: HistoryStatementsComponent,
        path: 'statement-history/:uploadId',
      },
      {
        component: HistoryStatementsComponent,
        path: 'statement-history',
      },
      {
        component: undefined,
        path: 'activity',
        redirectTo: '',
      },
    ],
  },
  {
    component: AttributionComponent,
    path: 'attribution',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
