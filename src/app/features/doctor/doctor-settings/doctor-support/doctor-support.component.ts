import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { SupportService } from '../../../../shared/services/support.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-doctor-support',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './doctor-support.component.html',
  styleUrl: './doctor-support.component.css',
})
export class DoctorSupportComponent implements OnInit {
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
      question: 'How do I book an online consultation?',
      answer:
        'Simply download our app, create an account, and choose your preferred specialty or doctor. Then, select a suitable time slot for your video or audio consultation.',
      open: false,
    },
    {
      question: ' Are the doctors certified?',
      answer: 'A fast, low-risk rollout measured in weeks, not months.',
      open: false,
    },
    {
      question: 'Is my medical data safe?',
      answer: 'Yes— Any EHR/HIS, CRM, IVR, WhatsApp, and SMS.',
      open: false,
    },
    {
      question: 'Can I get a prescription after the consultation?',
      answer: '24/7/365 with enterprise-grade availability.',
      open: false,
    },
    {
      question: 'What if I miss my appointment?',
      answer:
        'Built with privacy and HIPPA compliance appropriate for healthcare environments.',
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
