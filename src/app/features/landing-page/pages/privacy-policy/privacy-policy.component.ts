import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { PrivacyHeroSectionComponent } from "../../privacyPolicy/privacy-hero-section/privacy-hero-section.component";
import { PrivacyContentComponent } from "../../privacyPolicy/privacy-content/privacy-content.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";

@Component({
  selector: 'app-privacy-policy',
  imports: [HeaderComponent, PrivacyHeroSectionComponent, PrivacyContentComponent, FooterComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css'
})
export class PrivacyPolicyComponent {

}
