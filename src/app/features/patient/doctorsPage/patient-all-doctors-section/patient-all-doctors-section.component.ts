import { Component, OnInit } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { IDoctorResponse } from '../../../../shared/interface/doctor.interface';
import { RouterLink } from '@angular/router';
import { BookingSessionService } from '../../../../shared/services/booking-session.service';
import { ToastrService } from 'ngx-toastr';
import { LocalstorageService } from '../../../../core/services/localstorage.service';
import { BookingSessionComponent } from '../../../../shared/components/booking-session/booking-session.component';
import { spec } from 'node:test/reporters';
import { SpecialtiesService } from '../../../../shared/services/specialties.service';
import { Select } from 'primeng/select';
import { debounceTime, last, max, Subject } from 'rxjs';
import { SliderModule } from 'primeng/slider';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-all-doctors-section',
  imports: [
    FormsModule,
    DatePickerModule,
    CommonModule,
    RouterLink,
    BookingSessionComponent,
    Select,
    SliderModule,
    TranslateModule,
  ],
  templateUrl: './patient-all-doctors-section.component.html',
  styleUrl: './patient-all-doctors-section.component.css',
})
export class PatientAllDoctorsSectionComponent implements OnInit {
  showPopup: boolean = false;

  // doctorId: string | null = null;
  date1: Date | undefined;

  doctors: IDoctorResponse[] = [];
  filterForm!: FormGroup;

  // Filters
  searchText: string = '';
  selectedPrice: number | null = null;
  availableDate: string | null = null;
  selectedSpeciality: number | null = null;
  maxPrice!: number ;

  dateOptions = [
    { label: 'doctorsList.today', value: 'today' },
    { label: 'doctorsList.thisWeek', value: 'week' },
    { label: 'doctorsList.thisMonth', value: 'month' },
  ];

  sessions: any[] = [];
  uniqueDays: any[] = [];

  patientId: string | null = null;

  specialtyId: string | null = null;

  constructor(
    readonly fb: FormBuilder,
    readonly doctorsService: DoctorsService,
    readonly bookingSessionService: BookingSessionService,
    readonly toastr: ToastrService,
    readonly localStorageService: LocalstorageService,
    readonly specailtiesService: SpecialtiesService,
  ) {
    this.patientId = this.localStorageService.get('patientId') || null;
    this.specialtyId = this.localStorageService.get('specialtyId') || null;
  }

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
  loadingMore = false;

  getDoctors(
    LastId: number | null = null,
    from: number | null = null,
    SortBy: string | null = null,
  ) {
    console.log("sssssssssssssssssss");
    console.log(LastId , from, SortBy);

    this.doctorsService
      .getDoctors(
        this.searchText || null,
        this.selectedSpeciality,
        null,
        this.maxPrice,
        this.availableDate,
        null,
        from,
        LastId,
        SortBy,
      )
      .subscribe({
        next: (res: any) => {
          const newDoctors = res.data || res;

          if (from || LastId) {
            this.doctors = [...this.doctors, ...newDoctors];
            console.log("Doctors:", this.doctors);

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
    const from = this.doctors[this.doctors.length - 1].rating;
    const sortby = 'HeighestRating';
    console.log(lastId);
    console.log(from);
    console.log(sortby);

    this.getDoctors(lastId , from, sortby);
  }

  onPageChange(page: number) {
    this.filterForm.patchValue({ From: page });
  }

  doctorId: number | null = null;
  // showPopup = false;

  openBooking(id: number) {
    this.doctorId = id;
    this.showPopup = true;
  }
}
