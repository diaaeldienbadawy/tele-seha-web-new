import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function IphoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const phoneRegex = /^\+20-\d{10}$/;

    return phoneRegex.test(control.value)
      ? null
      : { invalidEgyptPhone: true };
  };
}
