import { Component } from '@angular/core';
import { AboutUsHeroSectionComponent } from "../../about-us/about-us-hero-section/about-us-hero-section.component";
import { AboutUsContentComponent } from "../../about-us/about-us-content/about-us-content.component";
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";

@Component({
  selector: 'app-about-us',
  imports: [AboutUsHeroSectionComponent, AboutUsContentComponent, HeaderComponent, FooterComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent {

}
