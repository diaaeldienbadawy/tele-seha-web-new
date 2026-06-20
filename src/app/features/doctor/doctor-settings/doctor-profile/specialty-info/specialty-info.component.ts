import { Component, OnInit, signal } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LocalstorageService } from '../../../../../core/services/localstorage.service';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { DoctorAuthService } from '../../../service/doctor-auth.service';
import { SpecialtiesService } from '../../../../../shared/services/specialties.service';
import { ISpecialties } from '../../../../../shared/interface/specialties.interface';
import { DoctorsService } from '../../../../../shared/services/doctors.service';

@Component({
  selector: 'app-specialty-info',
  imports: [CommonModule, ReactiveFormsModule, Select],
  templateUrl: './specialty-info.component.html',
  styleUrl: './specialty-info.component.css',
})
export class SpecialtyInfoComponent implements OnInit {
  imagePreview: string | null = null;
  selectedImage!: File;
  fileName: string = '';

  basicInfoForm!: FormGroup;

  showBtnSave = signal<boolean>(false);

  doctorId: any;
  jobTitles: string[] = [];
  scientificDegrees: any;
  dataProfile: any;

  constructor(
    readonly fb: FormBuilder,
    readonly localStorageService: LocalstorageService,
    readonly doctorAuthService: DoctorAuthService,
    readonly doctorService: DoctorsService,
    readonly specialtiesService: SpecialtiesService,
    readonly toastr: ToastrService,
  ) {
    this.doctorId = this.localStorageService.get('doctorId');
  }

  ngOnInit(): void {
    this.initForm();
    this.getEnumScientificDegrees();
    this.getAllSpecialties();
    this.getDoctorJopTitle();
  }

  getEnumScientificDegrees() {
    this.doctorService.getEnum().subscribe({
      next: (res) => {
        console.log('getEnumScientificDegrees');
        console.log(res);
        const mapping: { [key: string]: string } = {
          'Bachelor': 'Bachelor, BS, B.Sc., MBBCH',
          'Master': 'Master, MS, M.Sc., MPH',
          'Doctorate': 'Doctorate, PhD, MD'
        };

        if (Array.isArray(res.ScientificDegree)) {
          this.scientificDegrees = res.ScientificDegree.map((val: string) => ({
            value: val,
            label: mapping[val] || val
          }));
        } else if (res.ScientificDegree) {
          this.scientificDegrees = Object.keys(res.ScientificDegree).map((key: string) => ({
            value: key,
            label: mapping[key] || key
          }));
        } else {
          this.scientificDegrees = [
            { value: 'Bachelor', label: 'Bachelor, BS, B.Sc., MBBCH' },
            { value: 'Master', label: 'Master, MS, M.Sc., MPH' },
            { value: 'Doctorate', label: 'Doctorate, PhD, MD' }
          ];
        }
      },
      error: () => {
        this.scientificDegrees = [
          { value: 'Bachelor', label: 'Bachelor, BS, B.Sc., MBBCH' },
          { value: 'Master', label: 'Master, MS, M.Sc., MPH' },
          { value: 'Doctorate', label: 'Doctorate, PhD, MD' }
        ];
      }
    });
  }

  specialties: ISpecialties[] = [];
  getAllSpecialties() {
    this.specialtiesService.getSpecialties().subscribe({
      next: (res: any) => {
        // console.log(res);
        this.specialties = res.data || res;
      },
    });
  }

  initForm() {
    this.basicInfoForm = this.fb.group({
      Name: ['', [Validators.required]],
      Image: [null],
      Subspecialty: [''],
      JobTitle: ['', [Validators.required]],
      ScientificDegree: ['', [Validators.required]],
      Price: ['', [Validators.required]],
      FollowUpPrice: [''],
      SpecialtyId: ['', [Validators.required]],
    });
  }



  getDoctorJopTitle() {
    this.doctorAuthService.getDoctorJopTitle().subscribe({
      next: (res) => {
        console.log(res);
        // Correct the swapped titleAr and titleEn from the backend
        this.jobTitles = res.map((item: any) => ({
          ...item,
          titleAr: item.titleEn,
          titleEn: item.titleAr
        }));
        this.loadDoctorDetails();
      },
      error: () => {
        this.toastr.error('Failed to load info lists');
      },
    });
  }

  loadDoctorDetails() {
    this.doctorService.getDoctorProfile(this.doctorId).subscribe({
      next: (res) => {
        this.dataProfile = res.data;

        // ابحث عن الـ jobTitle object من الـ jobTitles list
        const matchedJobTitle = this.jobTitles.find(
          (j : any ) => 
            j.titleAr === this.dataProfile.jobTitleAr || 
            j.titleEn === this.dataProfile.jobTitleAr ||
            j.titleAr === this.dataProfile.jobTitleEn ||
            j.titleEn === this.dataProfile.jobTitleEn
        );

        this.basicInfoForm.patchValue({
          Name: this.dataProfile.name,
          SpecialtyId: this.dataProfile.specialtyId,
          ScientificDegree: this.dataProfile.scientificDegree,
          Price: this.dataProfile.price,
          FollowUpPrice: this.dataProfile.followUpPrice,
          Image: this.dataProfile?.imageUrl,
          Subspecialty: this.dataProfile.subspecialty,
          JobTitle: matchedJobTitle || null,
        });

        this.basicInfoForm.disable();

        if (this.dataProfile?.imageUrl) {
          this.imagePreview = this.dataProfile.imageUrl;
        }
      },
      error: () => {
        this.toastr.error('Failed to load doctor info');
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedImage = file;
      this.fileName = file.name;
      this.imagePreview = URL.createObjectURL(file);

      this.basicInfoForm.patchValue({
        Image: file,
      });
      this.basicInfoForm.get('Image')?.updateValueAndValidity();
    }
  }

  save() {
    if (this.basicInfoForm.invalid) {
      this.basicInfoForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const value = this.basicInfoForm.value;
    // console.log(value);

    formData.append('Name', this.basicInfoForm.value.Name);
    formData.append('Image', this.selectedImage);
    formData.append('SubSpeciality', this.basicInfoForm.value.Subspecialty);

    const JobTitle = this.basicInfoForm.value.JobTitle;

    if (JobTitle) {
      formData.append('JobTitleAr', JobTitle.titleAr);
      formData.append('JobTitleEn', JobTitle.titleEn);
    }



    formData.append(
      'ScientificDegree',
      this.basicInfoForm.value.ScientificDegree,
    );
    formData.append('Price', this.basicInfoForm.value.Price);
    formData.append('FollowUpPrice', this.basicInfoForm.value.FollowUpPrice);
    formData.append('SpecialtyId', this.basicInfoForm.value.SpecialtyId);

    this.doctorService
      .updateDoctorProfileSpecialty(this.doctorId, formData)
      .subscribe({
        next: (res) => {
          console.log(res);
          console.log(res.imageUrl);
          this.toastr.success('Doctor info updated successfully');
          this.localStorageService.setDoctorName(res.name);
          this.localStorageService.setDoctorImage(res.imageUrl);
          this.loadDoctorDetails();
          this.showBtnSave.set(false);
          this.basicInfoForm.disable();
        },
        error: () => {
          this.toastr.error('Failed to update doctor info');
          this.showBtnSave.set(false);
          this.basicInfoForm.disable();
        },
      });
  }

  edit() {
    this.showBtnSave.set(true);
    this.basicInfoForm.enable();
  }
}
