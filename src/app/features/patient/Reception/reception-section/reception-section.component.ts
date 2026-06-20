import { Component } from '@angular/core';
import { SendSymptomsSectionComponent } from "../send-symptoms-section/send-symptoms-section.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reception-section',
  imports: [SendSymptomsSectionComponent, CommonModule],
  templateUrl: './reception-section.component.html',
  styleUrl: './reception-section.component.css'
})
export class ReceptionSectionComponent {

    showPopup = false;

  openModel() {
    this.showPopup = true;
  }

  closeModel() {
    this.showPopup = false;
  }

}
