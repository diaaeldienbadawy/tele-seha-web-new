import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientAuthService } from '../../service/patient-auth.service';
import { SessionStateService } from '../../../../shared/services/session-state.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { SignalRService } from '../../../../shared/services/signalr.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-waiting-info-section',
  imports: [TranslateModule],
  templateUrl: './patient-waiting-info-section.component.html',
  styleUrl: './patient-waiting-info-section.component.css',
})
export class PatientWaitingInfoSectionComponent implements OnInit {
  session: any;
  sessionId: string | null = null;
  item: any;
  constructor(
    readonly route: ActivatedRoute,
    readonly patientService: PatientAuthService,
    readonly router: Router,
    readonly localStorageService: LocalstorageService,
    private signalRService: SignalRService,
  ) {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || null;
  }

  ngOnInit(): void {
    console.log(this.sessionId);
    console.log('Received item:', this.item);

    this.item = JSON.parse(this.localStorageService.get('sessionState'));

    // الاشتراك في تحديثات الـ session فقط
    this.signalRService.sessionUpdates.subscribe((updatedSession) => {
      if (updatedSession) {
        this.session = updatedSession;
      }
    });

    this.signalRService.startConnection();

    this.getSession();
  }

  getSession() {
    this.patientService.waitingSession(Number(this.sessionId)).subscribe({
      next: (res) => {
        console.log(res);
        this.session = res;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
