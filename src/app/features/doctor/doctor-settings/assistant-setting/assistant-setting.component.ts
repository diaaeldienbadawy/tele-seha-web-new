import { Component, ViewChild, ElementRef } from '@angular/core';
import { DoctorAuthService } from '../../service/doctor-auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IphoneValidator } from '../../../../core/models/phone.validator';
import { ToastrService } from 'ngx-toastr';
import intlTelInput from 'intl-tel-input';

@Component({
  selector: 'app-assistant-setting',
  imports: [ReactiveFormsModule],
  templateUrl: './assistant-setting.component.html',
  styleUrl: './assistant-setting.component.css',
})
export class AssistantSettingComponent {
  private _phoneInputRef!: ElementRef;
  iti: any;

  @ViewChild('phoneInput') set phoneInput(content: ElementRef) {
    if (content) {
      this._phoneInputRef = content;
      setTimeout(() => {
        this.initIntlTelInput();
      });
    }
  }

  getCountryCode(dialCode: string): string {
    const clean = dialCode.replace(/[^0-9]/g, '');
    if (clean === '20') return 'eg';
    if (clean === '966') return 'sa';
    if (clean === '971') return 'ae';
    return 'eg';
  }

  initIntlTelInput() {
    if (!this._phoneInputRef) return;
    const el = this._phoneInputRef.nativeElement;

    if (this.iti) {
      this.iti.destroy();
    }

    this.iti = intlTelInput(el, {
      initialCountry: 'eg',
      preferredCountries: ['eg', 'sa', 'ae'],
      separateDialCode: true,
      utilsScript:
        'https://cdn.jsdelivr.net/npm/intl-tel-input@18/build/js/utils.js',
    });

    const currentValue = this.assistantForm.get('mobile')?.value;
    if (currentValue) {
      if (currentValue.includes('-')) {
        const parts = currentValue.split('-');
        const dialCode = parts[0];
        const nationalNumber = parts[1];
        
        const country = this.getCountryCode(dialCode);
        this.iti.setCountry(country);
        el.value = nationalNumber;
      } else {
        this.iti.setNumber(currentValue);
      }
    }

    const sanitizeInput = () => {
      let val = el.value.replace(/[^0-9]/g, '');
      if (val.length > 11) {
        val = val.slice(0, 11);
      }
      el.value = val;
      this.updatePhone();
    };

    el.addEventListener('input', sanitizeInput);
    el.addEventListener('change', sanitizeInput);
    el.addEventListener('countrychange', () => this.updatePhone());
  }

  private updatePhone() {
    if (!this.iti || !this._phoneInputRef) return;
    const dialCode = '+' + this.iti.getSelectedCountryData().dialCode;
    const rawInput = this._phoneInputRef.nativeElement.value.trim();

    if (!rawInput) {
      this.assistantForm.patchValue({ mobile: null });
      return;
    }

    const formatted = `${dialCode}-${rawInput}`;
    this.assistantForm.patchValue({ mobile: formatted });
  }

  constructor(
    readonly doctorAuthService: DoctorAuthService,
    readonly fb: FormBuilder,
    readonly toastr: ToastrService,
  ) {}

  isAddingAssistant: boolean = false;

  assistantForm!: FormGroup;
  initForm() {
    this.assistantForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      mobile: ['', [Validators.required]],
      // mobile: ['', [Validators.required, IphoneValidator()]],
      // password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  assistantSetting: any[] = [];
  editingId: number | null = null;

  ngOnInit(): void {
    this.initForm();
    this.getAssitantData();
  }
  toggleAssistantForm() {
    this.isAddingAssistant = !this.isAddingAssistant;
    if (!this.isAddingAssistant) {
      this.assistantForm.reset();
      this.editingId = null;
    }
  }

  getAssitantData() {
    this.doctorAuthService.getAssistants().subscribe({
      next: (res) => {
        // console.log(res);
        this.assistantSetting = res;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  submit() {
    if (this.assistantForm.invalid) {
      this.assistantForm.markAllAsTouched();
      return;
    }

    if (this.editingId) {
      this.doctorAuthService
        .updateAssistant(this.assistantForm.value, this.editingId)
        .subscribe({
          next: () => {
            this.toastr.success('Updated Successfully');
            this.getAssitantData();
            this.assistantForm.reset();
            this.isAddingAssistant = false;
            this.editingId = null;
          },
        });
    } else {
      this.doctorAuthService
        .createAssistant(this.assistantForm.value)
        .subscribe({
          next: (res) => {
            this.toastr.success('Added Successfully');
            this.getAssitantData();
            this.assistantSetting.push(res);
            this.assistantForm.reset();
            this.isAddingAssistant = false;
          },
        });
    }
  }

  editAssistant(id: number) {
    this.isAddingAssistant = true;
    this.editingId = id;

    const assistant = this.assistantSetting.find((a) => a.id === id);

    if (assistant) {
      this.assistantForm.patchValue({
        fullName: assistant.fullName,
        mobile: assistant.mobile,
      });
    }
  }

  deleteAssistant(id: any) {
    this.doctorAuthService.deleteAssistant(id).subscribe({
      next: (res) => {
        // console.log(res);
        this.getAssitantData();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
