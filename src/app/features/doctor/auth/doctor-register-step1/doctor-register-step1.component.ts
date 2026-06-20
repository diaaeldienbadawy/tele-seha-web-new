import { doctor } from './../../doctor.routes';
import { Component, OnInit } from '@angular/core';
import { AuthLogoComponent } from '../../../../shared/components/auth-logo/auth-logo.component';
import { AuthLeftSideComponent } from '../../../../shared/components/auth-left-side/auth-left-side.component';
import { DoctorRegistrationListsStateService } from '../../../../core/services/state/doctor-registration-lists-state.service';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DoctorAuthService } from '../../service/doctor-auth.service';
import { SpecialtiesService } from '../../../../shared/services/specialties.service';
import { ISpecialties } from '../../../../shared/interface/specialties.interface';
import { Select } from 'primeng/select';
import { GlobalUserStateService } from '../../../../core/services/state/global-user-state.service';
import { DoctorRegistrationStateService } from '../../../../core/services/state/doctor-registration-state.service';
import { INextStepEnum } from '../../../../core/models/nextStepEnum';
import { DoctorsService } from '../../../../shared/services/doctors.service';
import { PatientAuthService } from '../../../patient/service/patient-auth.service';

@Component({
  selector: 'app-doctor-register-step1',
  imports: [
    AuthLogoComponent,
    AuthLeftSideComponent,
    RouterLink,
    ReactiveFormsModule,
    Select,
  ],
  templateUrl: './doctor-register-step1.component.html',
  styleUrl: './doctor-register-step1.component.css',
})
export class DoctorRegisterStep1Component implements OnInit {
  fileName: string = '';
  selectedImage!: File;
  previewUrl: string | null = null;

  basicInfoForm!: FormGroup;
  jobTitles: any[] = [];
  scientificDegrees: any;
  universities: any[] = [];
  
  isLoading: boolean = false;
  isEditMode: boolean = false;
  doctorId: any = null;

  constructor(
    readonly fb: FormBuilder,
    readonly toastr: ToastrService,
    readonly doctorAuthService: DoctorAuthService,
    readonly doctorService: DoctorsService,
    readonly route: Router,
    readonly specialtiesService: SpecialtiesService,
    readonly globalUserStateService: GlobalUserStateService,
    readonly doctorRegistrationStateService: DoctorRegistrationStateService,
    private patientAuthService: PatientAuthService,
    private listsStateService: DoctorRegistrationListsStateService,
  ) {
  }

  ngOnInit(): void {
    this.doctorId = this.globalUserStateService.doctorId() || this.doctorRegistrationStateService.doctorId();
    this.initForm();
    
    // Assign from lists state service
    this.specialties = this.listsStateService.specialties();
    this.scientificDegrees = this.listsStateService.scientificDegrees();
    this.jobTitles = this.listsStateService.jobTitles();

    if (this.doctorId) {
      this.loadExistingData();
    }
  }

  loadExistingData() {
    this.isLoading = true;
    this.doctorAuthService.getDoctorBasicInfo(this.doctorId).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.isEditMode = true;
          const data = res.data;
          
          this.basicInfoForm.patchValue({
            Name: data.name || '',
            Subspecialty: data.subspecialty || '',
            Price: data.price || '',
            FollowUpPrice: data.followUpPrice || '',
            SpecialtyId: data.specialtyId || '',
            ScientificDegree: data.scientificDegree || '',
          });

          if (data.imageUrl) {
            this.fileName = 'Current Image Uploaded';
            this.previewUrl = data.imageUrl;
          }

          if (data.jobTitleEn && this.jobTitles.length > 0) {
            const matchedJob = this.jobTitles.find((j: any) => j.titleEn === data.jobTitleEn || j.titleAr === data.jobTitleEn);
            if (matchedJob) {
              this.basicInfoForm.patchValue({ JobTitle: matchedJob });
            }
          }
        }
        
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  initForm() {
    this.basicInfoForm = this.fb.group({
      Name: ['', [Validators.required]],
      Image: [null],
      Subspecialty: [''],
      JobTitle: ['', [Validators.required]],
      University: [''],
      ScientificDegree: ['', [Validators.required]],
      Price: ['', [Validators.required]],
      FollowUpPrice: [''],
      SpecialtyId: ['', [Validators.required]],
    });
  }

  specialties: ISpecialties[] = [];

  save() {
    if (this.basicInfoForm.invalid) {
      this.basicInfoForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();

    formData.append('Name', this.basicInfoForm.value.Name);
    formData.append('Image', this.selectedImage);
    formData.append('SubSpeciality', this.basicInfoForm.value.Subspecialty);

    const JobTitle = this.basicInfoForm.value.JobTitle;

    if (JobTitle) {
      formData.append('JobTitleAr', JobTitle.titleAr);
      formData.append('JobTitleEn', JobTitle.titleEn);
    }

    const university = this.basicInfoForm.value.University;

    if (university) {
      formData.append('UniversityAr', university.universityName);
      formData.append('UniversityEn', university.universityNameEn);
    }

    formData.append(
      'ScientificDegree',
      this.basicInfoForm.value.ScientificDegree,
    );
    formData.append('Price', this.basicInfoForm.value.Price);
    formData.append('FollowUpPrice', this.basicInfoForm.value.FollowUpPrice);
    formData.append('SpecialtyId', this.basicInfoForm.value.SpecialtyId);

    this.isLoading = true;

    if (this.isEditMode && this.doctorId) {
      this.doctorAuthService.updateProfiel(this.doctorId, formData).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.globalUserStateService.hydrateNextStep(res.nextStep);
          if (res.data?.imageUrl) {
             this.doctorRegistrationStateService.setDoctorImage(res.data.imageUrl);
          }
          this.toastr.success('Profile updated successfully');
          this.route.navigate(['doctor/auth/register/createProfile'], { replaceUrl: true });
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.doctorAuthService.basicInfo(formData).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.globalUserStateService.hydrateNextStep(res.nextStep);
          this.doctorRegistrationStateService.setDoctorId(res.data.doctorId);
          this.doctorRegistrationStateService.setDoctorImage(res.data.Image);
          this.route.navigate(['doctor/auth/register/createProfile'], { replaceUrl: true });
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      this.selectedImage = file;
      this.fileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);

      // اربط الصورة بالـ Form
      this.basicInfoForm.patchValue({
        Image: file,
      });

      this.basicInfoForm.get('Image')?.updateValueAndValidity();
    }
  }

  clearLocalStorage() {
    this.globalUserStateService.clearUserData();
    this.doctorRegistrationStateService.clearRegistrationData();
    this.route.navigate(['/'], { replaceUrl: true });
  }
}
