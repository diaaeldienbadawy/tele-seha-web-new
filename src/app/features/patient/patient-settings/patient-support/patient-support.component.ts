import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SupportService } from '../../../../shared/services/support.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-support',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './patient-support.component.html',
  styleUrl: './patient-support.component.css',
})
export class PatientSupportComponent implements OnInit {
  supportForm!: FormGroup;

  constructor(
    readonly supportService: SupportService,
    readonly fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.supportForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      mobile: ['', [Validators.required, Validators.minLength(10)]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]],
    });
  }

  onSubmit() {
    console.log(this.supportForm.value);

    this.supportService.support(this.supportForm.value).subscribe({
      next: (res: any) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  faqs = [
    {
      question: 'support.faq1Q',
      answer: 'support.faq1A',
      open: false,
    },
    {
      question: 'support.faq2Q',
      answer: 'support.faq2A',
      open: false,
    },
    {
      question: 'support.faq3Q',
      answer: 'support.faq3A',
      open: false,
    },
    {
      question: 'support.faq4Q',
      answer: 'support.faq4A',
      open: false,
    },
    {
      question: 'support.faq5Q',
      answer: 'support.faq5A',
      open: false,
    },
  ];

  toggleFaq(faq: any) {
    this.faqs.forEach((f) => {
      if (f !== faq) {
        f.open = false;
      }
    });
    faq.open = !faq.open;
  }
}
