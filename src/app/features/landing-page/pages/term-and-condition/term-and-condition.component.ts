import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";
import { TermsAndCondititonHeroSectionComponent } from "../../terms-and-condition/terms-and-condititon-hero-section/terms-and-condititon-hero-section.component";
import { TermsAndCondititonContentComponent } from "../../terms-and-condition/terms-and-condititon-content/terms-and-condititon-content.component";

@Component({
  selector: 'app-term-and-condition',
  imports: [HeaderComponent, FooterComponent, TermsAndCondititonHeroSectionComponent, TermsAndCondititonContentComponent],
  templateUrl: './term-and-condition.component.html',
  styleUrl: './term-and-condition.component.css'
})
export class TermAndConditionComponent {

}
