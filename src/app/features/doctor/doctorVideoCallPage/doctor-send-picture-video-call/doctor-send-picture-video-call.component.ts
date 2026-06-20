import { Component } from '@angular/core';
import { Carousel } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-doctor-send-picture-video-call',
  imports: [Carousel, ButtonModule],
  templateUrl: './doctor-send-picture-video-call.component.html',
  styleUrl: './doctor-send-picture-video-call.component.css',
})
export class DoctorSendPictureVideoCallComponent {
  images = [
    {
      src: 'assets/images/doctor-9 1.png',
      alt: 'doctor 1',
    },
    {
      src: 'assets/images/doctor-9 1.png',
      alt: 'doctor 2',
    },
    {
      src: 'assets/images/doctor-9 1.png',
      alt: 'doctor 3',
    },
    {
      src: 'assets/images/doctor-9 1.png',
      alt: 'doctor 4',
    },
    {
      src: 'assets/images/doctor-9 1.png',
      alt: 'doctor 3',
    },
    {
      src: 'assets/images/doctor-9 1.png',
      alt: 'doctor 4',
    },
    {
      src: 'assets/images/doctor-9 1.png',
      alt: 'doctor 3',
    },
    {
      src: 'assets/images/doctor-9 1.png',
      alt: 'doctor 4',
    },
  ];

  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 4,
      numScroll: 1,
    },
    {
      breakpoint: '1200px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '992px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '576px',
      numVisible: 1,
      numScroll: 1,
    },
  ];
}
