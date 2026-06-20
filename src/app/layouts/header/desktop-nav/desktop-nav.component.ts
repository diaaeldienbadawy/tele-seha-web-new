import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocalstorageService } from '../../../core/services/localstorage.service';
import { GlobalUserStateService } from '../../../core/services/state/global-user-state.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-desktop-nav',
  imports: [RouterLink, RouterLinkActive, CommonModule, TranslateModule],
  templateUrl: './desktop-nav.component.html',
  styleUrl: './desktop-nav.component.css',
})
export class DesktopNavComponent implements OnInit, OnDestroy {
  readonly localStorageService = inject(LocalstorageService);
  readonly globalUserStateService = inject(GlobalUserStateService);
  readonly route = inject(Router);

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
