import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Carousel } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { PatientVideoCallService } from '../../service/patient-video-call.service';
import { ChatService, ChatMessageType } from '../../service/chat.service';
import { Environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-patient-send-picture-video-call',
  imports: [Carousel, ButtonModule],
  templateUrl: './patient-send-picture-video-call.component.html',
  styleUrl: './patient-send-picture-video-call.component.css',
})
export class PatientSendPictureVideoCallComponent implements OnInit {
  checkUpId = '';
  id = 0;
  constructor(
    readonly patientVideoCall: PatientVideoCallService,
    private readonly chatService: ChatService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const raw =
      localStorage.getItem('agoraDetails') || localStorage.getItem('agoraDetailsPatient') || '{}';

    try {
      const stored = JSON.parse(raw) as { checkUpId?: unknown; checkupId?: unknown; id?: unknown };
      console.log(stored.id);
      this.id = Number(stored.id);
      this.getImages();

      const id = stored?.checkUpId ?? stored?.checkupId ?? stored?.id;
      if (id != null && id !== '') this.checkUpId = String(id);
    } catch {
    }
  }

  getImages(){
    this.patientVideoCall.getMeetingDetails(Number(this.id)).subscribe({
      next: (res) => {
        const images = res.images;
        this.images = images.map((image: any) => ({
          src:  image.url,
          alt: image.url,
        }));
        console.log("this.images");
        console.log(this.images);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  images = [];

  private resolveImageUrlForChat(src: string): string {
    const s = src?.trim() ?? '';
    if (!s) return s;
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('blob:')) return s;
    if (!isPlatformBrowser(this.platformId)) return s;
    try {
      return new URL(s, document.baseURI).href;
    } catch {
      return s;
    }
  }

  onCarouselImageClick(src: string): void {
    if (!this.checkUpId || !src) return;
    const url = this.resolveImageUrlForChat(src);
    this.chatService.sendMessage(this.checkUpId, url, {
      isDoctor: false,
      messageType: ChatMessageType.Image
    });
  }

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
