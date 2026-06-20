import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePickerModule } from 'primeng/datepicker';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { IDoctorResponse } from '../../../../shared/interface/doctor.interface';
import { BookingSessionService } from '../../../../shared/services/booking-session.service';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { SliderModule } from 'primeng/slider';
import { Select } from 'primeng/select';
import { SpecialtiesService } from '../../../../shared/services/specialties.service';
import { debounceTime, Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-doctor-alldoctors-section',
  imports: [
    FormsModule,
    DatePickerModule,
    CommonModule,
    RouterLink,
    Select,
    SliderModule,
    TranslateModule,
  ],
  templateUrl: './doctor-alldoctors-section.component.html',
  styleUrl: './doctor-alldoctors-section.component.css',
})
export class DoctorAlldoctorsSectionComponent implements OnInit {
  doctorId: string | null = null;
  date1: Date | undefined;

  doctors: IDoctorResponse[] = [];
  filterForm!: FormGroup;

  // Filters
  searchText: string = '';
  selectedPrice: number | null = null;
  availableDate: string | null = null;
  selectedSpeciality: number | null = null;
  maxPrice: number = 500;

  dateOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
  ];

  sessions: any[] = [];
  uniqueDays: any[] = [];

  selectedDate: string | null = null;
  selectedSessionId: number | null = null;

  constructor(
    readonly fb: FormBuilder,
    readonly doctorsService: DoctorsService,
    readonly bookingSessionService: BookingSessionService,
    readonly toastr: ToastrService,
    readonly localStorageService: LocalstorageService,
    readonly specailtiesService: SpecialtiesService,
  ) {}

  ngOnInit(): void {
    this.getSpecialties();
    this.getDoctors();

    this.searchSubject.pipe(debounceTime(600)).subscribe(() => {
      this.applyFilters();
    });
  }

  specialties: any[] = [];
  getSpecialties() {
    this.specailtiesService.getSpecialties().subscribe({
      next: (res: any) => {
        console.log(res);
        this.specialties = res.data || res;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  searchSubject = new Subject<string>();

  // doctors: any[] = [];
  limit = 10;
  loadingMore = false;

  getDoctors(from: number | null = null) {
    console.log(this.maxPrice);

    this.doctorsService
      .getDoctors(
        this.searchText || null,
        this.selectedSpeciality,
        null,
        this.maxPrice,
        this.availableDate,
        null,
        from,
        this.limit,
      )
      .subscribe({
        next: (res: any) => {
          const newDoctors = res.data || res;

          if (from) {
            this.doctors = [...this.doctors, ...newDoctors];
          } else {
            this.doctors = newDoctors;
          }

          this.loadingMore = false;
        },
        error: (err) => {
          console.log(err);
          this.loadingMore = false;
        },
      });
  }

  applyFilters() {
    this.getDoctors();
  }

  resetFilters() {
    this.searchText = '';
    this.selectedPrice = null;
    this.maxPrice = 500;
    this.availableDate = null;
    this.selectedSpeciality = null;
    this.getDoctors();
  }

  onSearchChange() {
    this.searchSubject.next(this.searchText);
  }

  loadMore() {
    if (!this.doctors.length) return;

    this.loadingMore = true;

    const lastId = this.doctors[this.doctors.length - 1].doctorId;

    this.getDoctors(lastId);
  }

  onPageChange(page: number) {
    this.filterForm.patchValue({ From: page });
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}
