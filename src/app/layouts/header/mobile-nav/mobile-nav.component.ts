import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LocalstorageService } from '../../../core/services/localstorage.service';
import { GlobalUserStateService } from '../../../core/services/state/global-user-state.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-mobile-nav',
  imports: [RouterLink, RouterLinkActive, CommonModule, TranslateModule],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.css',
})
export class MobileNavComponent implements OnInit {
  readonly localStorageService = inject(LocalstorageService);
  readonly globalUserStateService = inject(GlobalUserStateService);
  readonly route = inject(Router);

  open = false;
  readonly userRole   = this.globalUserStateService.role;
  readonly isLoggedIn = computed(() => !!this.userRole());
  readonly isPatient  = computed(() => this.userRole() === 'Patient');
  readonly isDoctor   = computed(() => this.userRole() === 'Doctor');

  patientName = '';
  doctorName = '';

  private _subs = new Subscription();

  ngOnInit(): void {
    this._subs.add(
      this.localStorageService.patientName$.subscribe(name => {
        this.patientName = name;
      })
    );

    this._subs.add(
      this.localStorageService.doctorName$.subscribe(name => {
        this.doctorName = name;
      })
    );
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }


  toggle() {
    this.open = !this.open;
  }

  removeSpecialty() {
    this.localStorageService.remove('specialtyId');
  }

  scrollTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
