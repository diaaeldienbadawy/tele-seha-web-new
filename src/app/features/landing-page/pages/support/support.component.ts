import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { SupportHeroSectionComponent } from "../../support/support-hero-section/support-hero-section.component";
import { SupportContentComponent } from "../../support/support-content/support-content.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";

@Component({
  selector: 'app-support',
  imports: [HeaderComponent, SupportHeroSectionComponent, SupportContentComponent, FooterComponent],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css'
})
export class SupportComponent {

}
