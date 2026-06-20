import { Component } from '@angular/core';
import { FooterComponent } from '../../../../layouts/footer/footer.component';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { LandingPageHeroSectionComponent } from '../../home/landing-page-hero-section/landing-page-hero-section.component';
import { LandingPagePartnersComponent } from '../../home/landing-page-partners/landing-page-partners.component';
import { LandingPageWhyTeleSehaComponent } from '../../home/landing-page-why-tele-seha/landing-page-why-tele-seha.component';
import { LandingPageSimpleStepsComponent } from '../../home/landing-page-simple-steps/landing-page-simple-steps.component';
import { LandingPageComprehensiveCareComponent } from '../../home/landing-page-comprehensive-care/landing-page-comprehensive-care.component';
import { LandingPageGetStartedComponent } from '../../home/landing-page-get-started/landing-page-get-started.component';
import { LandingPageForDoctorsComponent } from '../../home/landing-page-for-doctors/landing-page-for-doctors.component';
import { LandingPageFullClinicComponent } from '../../home/landing-page-full-clinic/landing-page-full-clinic.component';
import { CommonModule } from '@angular/common';
import { LandingPageStartSeeingComponent } from "../../home/landing-page-start-seeing/landing-page-start-seeing.component";

@Component({
  selector: 'app-landing-page-home',
  imports: [
    CommonModule,
    FooterComponent,
    HeaderComponent,
    LandingPageHeroSectionComponent,
    LandingPagePartnersComponent,
    LandingPageWhyTeleSehaComponent,
    LandingPageSimpleStepsComponent,
    LandingPageComprehensiveCareComponent,
    LandingPageGetStartedComponent,
    LandingPageForDoctorsComponent,
    LandingPageFullClinicComponent,
    LandingPageStartSeeingComponent
],
  templateUrl: './landing-page-home.component.html',
  styleUrl: './landing-page-home.component.css',
})
export class LandingPageHomeComponent {
  faqs = [
    {
      question: 'How do I book an online consultation?',
      answer:
        'Simply download our app, create an account, and choose your preferred specialty or doctor. Then, select a suitable time slot for your video or audio consultation.',
      open: false,
    },
    {
      question: ' Are the doctors certified?',
      answer: 'A fast, low-risk rollout measured in weeks, not months.',
      open: false,
    },
    {
      question: 'Is my medical data safe?',
      answer: 'Yes— Any EHR/HIS, CRM, IVR, WhatsApp, and SMS.',
      open: false,
    },
    {
      question: 'Can I get a prescription after the consultation?',
      answer: '24/7/365 with enterprise-grade availability.',
      open: false,
    },
    {
      question: 'What if I miss my appointment?',
      answer:
        'Built with privacy and HIPPA compliance appropriate for healthcare environments.',
      open: false,
    },
  ];

  toggleFaq(faq: any) {
    this.faqs.forEach((f) => {
      if (f !== faq) {
        f.open = false;
      }
    });
    faq.open = !faq.open;
  }
}
