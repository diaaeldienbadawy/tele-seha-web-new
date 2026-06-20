import { doctor } from './../../../features/doctor/doctor.routes';
import { GlobalUserStateService } from '../../../core/services/state/global-user-state.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  PLATFORM_ID,
  inject,
  computed,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-header-profile',
  imports: [CommonModule, RouterLink],
  templateUrl: './headerprofile.component.html',
  styleUrl: './headerprofile.component.css',
})
export class HeaderprofileComponent implements OnInit {
  @Output() openAccountModal = new EventEmitter<void>();

  openModal() {
    this.openAccountModal.emit();
    console.log('openModal');
  }

  user = {
    name: 'Mohamed Ali',
    image: '../../../../../assets/images/pexels-mart-production-8217300 1.png',
  };

  showActions = false;

  toggleActions() {
    this.showActions = !this.showActions;
  }

  closeActions() {
    this.showActions = false;
  }

  isLoggedIn = computed(() => !!this.globalUserStateService.accessToken());
  role = computed(() => this.globalUserStateService.role() ?? '');
  
  patientName = computed(() => this.globalUserStateService.patientName());
  doctorName = computed(() => this.globalUserStateService.doctorName());
  doctorIamge = computed(() => this.globalUserStateService.doctorImage());

  private platformId = inject(PLATFORM_ID);

  constructor(
    readonly globalUserStateService: GlobalUserStateService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Signals are already assigned above as computed properties.
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      this.globalUserStateService.clearUserData();
      localStorage.clear();
      this.router.navigate(['/home']);
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-menu')) {
      this.showActions = false;
    }
  }
}
