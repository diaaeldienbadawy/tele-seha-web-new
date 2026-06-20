import { Routes } from '@angular/router';


export const landing:Routes = [

  {
    path : '' ,
    loadComponent : () => import('./pages/landing-page-home/landing-page-home.component').then(m => m.LandingPageHomeComponent)
  },
  {
    path : 'search-for-doctor' ,
    loadComponent : () => import('./pages/search-for-doctor/search-for-doctor.component').then(m => m.SearchForDoctorComponent)
  },
  {
    path : 'specialities' ,
    loadComponent : () => import('./pages/all-specailties-landing-page/all-specailties-landing-page.component').then(m => m.AllSpecailtiesLandingPageComponent)
  },
  {
    path : 'for-doctor' ,
    loadComponent : () => import('./pages/for-doctor/for-doctor.component').then(m => m.ForDoctorComponent)
  },
  {
    path : 'about-us' ,
    loadComponent : () => import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent)
  },
  {
    path : 'privacy-policy' ,
    loadComponent : () => import('./pages/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
  },
  {
    path : 'terms-and-conditions' ,
    loadComponent : () => import('./pages/term-and-condition/term-and-condition.component').then(m => m.TermAndConditionComponent)
  },
  {
    path : 'support' ,
    loadComponent : () => import('./pages/support/support.component').then(m => m.SupportComponent)
  }

];
