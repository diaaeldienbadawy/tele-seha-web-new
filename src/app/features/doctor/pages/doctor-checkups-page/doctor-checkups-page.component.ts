import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { FooterComponent } from '../../../../layouts/footer/footer.component';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { NotificationService } from '../../../patient/service/notification.service';

/**
 * سجل كشوفات الطبيب: كل الكشوفات (المفتوحة والمكتملة)، وجوّه كل كشف —
 * الميتينجات بروشتاتها وتحاليلها وأشعتها مع النتائج اللي المريض رفعها، وشات الكشف.
 */
@Component({
  selector: 'app-doctor-checkups-page',
  imports: [CommonModule, TranslateModule, HeaderComponent, FooterComponent],
  templateUrl: './doctor-checkups-page.component.html',
  styleUrl: './doctor-checkups-page.component.css',
})
export class DoctorCheckupsPageComponent implements OnInit {
  doctorId: number | null = null;
  isLoading = false;
  filter: 'all' | 'completed' = 'all';

  checkups: any[] = [];

  /** الكشف المفتوح تفاصيله حالياً */
  expandedId: number | null = null;
  details: any = null;
  isLoadingDetails = false;

  /** شات الكشف المفتوح */
  chatMessages: any[] | null = null;
  isLoadingChat = false;
  showChat = false;

  selectedImage: string | null = null;

  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private doctorService: DoctorsService,
    private localStorage: LocalstorageService,
    private toaster: ToastrService,
  ) {}

  ngOnInit(): void {
    this.doctorId = Number(this.localStorage.get('doctorId')) || null;
    this.load();

    // Live results: when the patient uploads a lab/radiology result (or the doctor issues a
    // report), refresh the currently-open case so the new result appears without the doctor
    // having to collapse and re-open it. The header centralises the hub connection, but start
    // it here too (idempotent) so this page works on a deep-link/refresh.
    const doctorId = this.localStorage.get('doctorId');
    if (doctorId) this.notificationService.startDoctorConnection(doctorId);
    this.notificationService.reportEvents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reloadOpenDetails());
  }

  /** Silently re-fetch the expanded case's details (no spinner, no collapse). */
  private reloadOpenDetails(): void {
    if (!this.expandedId) return;
    this.doctorService.getCheckupDetails(this.expandedId).subscribe({
      next: (res) => (this.details = res),
      error: () => {},
    });
  }

  load() {
    if (!this.doctorId) return;
    this.isLoading = true;
    this.doctorService
      .getDoctorCheckups(this.doctorId, this.filter === 'completed')
      .subscribe({
        next: (res: any[]) => {
          this.checkups = res || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load checkups:', err);
          this.checkups = [];
          this.isLoading = false;
        },
      });
  }

  setFilter(f: 'all' | 'completed') {
    if (this.filter === f) return;
    this.filter = f;
    this.expandedId = null;
    this.details = null;
    this.load();
  }

  toggle(checkup: any) {
    if (this.expandedId === checkup.id) {
      this.expandedId = null;
      this.details = null;
      this.showChat = false;
      return;
    }
    this.expandedId = checkup.id;
    this.details = null;
    this.chatMessages = null;
    this.showChat = false;
    this.isLoadingDetails = true;
    this.doctorService.getCheckupDetails(checkup.id).subscribe({
      next: (res) => {
        this.details = res;
        this.isLoadingDetails = false;
      },
      error: (err) => {
        console.error('Failed to load checkup details:', err);
        this.isLoadingDetails = false;
        this.toaster.error('تعذر تحميل تفاصيل الكشف');
        this.expandedId = null;
      },
    });
  }

  toggleChat() {
    this.showChat = !this.showChat;
    if (this.showChat && this.chatMessages === null && this.expandedId) {
      this.isLoadingChat = true;
      this.doctorService.getCheckupChat(this.expandedId).subscribe({
        next: (res: any[]) => {
          this.chatMessages = res || [];
          this.isLoadingChat = false;
        },
        error: (err) => {
          console.error('Failed to load chat:', err);
          this.chatMessages = [];
          this.isLoadingChat = false;
        },
      });
    }
  }

  /** روابط النتائج المرفوعة لطلب معيّن (تحاليل: result / أشعة: radiologicalExaminationResult). */
  resultLinks(request: any, key: 'result' | 'radiologicalExaminationResult'): string[] {
    const results = request?.[key] ?? [];
    return results.flatMap((r: any) => r?.links ?? []);
  }

  isImage(link: string): boolean {
    const ext = link?.split('.').pop()?.toLowerCase() ?? '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  }

  getFileName(link: string): string {
    return link?.split('/').pop() || 'File';
  }

  openFile(link: string) {
    window.open(link, '_blank');
  }

  meetingsCount(checkup: any): number {
    return checkup?.meetings?.length ?? 0;
  }
}
