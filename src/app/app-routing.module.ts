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
import { BatchUploadComponent } from './statements/batch-upload/batch-upload.component';
import { BatchReviewComponent } from './statements/batch-review/batch-review.component';
import { BatchReviewDetailsComponent } from './statements/batch-review/batch-review-details/batch-review-details.component';
import { ReviewPdfComponent } from './statements/batch-review/review-pdf/review-pdf.component';
import { BatchExploreComponent } from './statements/batch-explore/batch-explore.component';
import { StatementsInfoComponent } from './statements-info/statements-info.component';
import { CanActivateSubRouteService } from './statements/statements.sub.route.guard';

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
  // {
  //   path: 'settings',
  //   loadChildren: () => import('./user/user.module').then((m) => m.UserModule),
  // },
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
    path: 'statements-info',
    component: StatementsInfoComponent,
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
        canActivate: [CanActivateSubRouteService],
        component: BatchUploadComponent,
        path: 'upload-batch',
      },
      {
        canActivate: [CanActivateSubRouteService],
        component: BatchExploreComponent,
        path: 'explore-batch/:uploadId',
      },
      {
        canActivate: [CanActivateSubRouteService],
        component: BatchReviewComponent,
        path: 'explore-batch',
        data: {
          page: 'explore',
        },
      },
      {
        canActivate: [CanActivateSubRouteService],
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
        canActivate: [CanActivateSubRouteService],
        component: BatchReviewComponent,
        path: 'review-batch',
        data: {
          page: 'review',
        },
      },
      {
        canActivate: [CanActivateSubRouteService],
        component: BatchExploreComponent,
        path: 'review-history/:uploadId',
      },
      {
        canActivate: [CanActivateSubRouteService],
        component: BatchReviewComponent,
        path: 'review-history',
        data: {
          page: 'history',
        },
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
