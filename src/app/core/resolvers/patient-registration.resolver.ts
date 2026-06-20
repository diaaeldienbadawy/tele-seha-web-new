import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PatientRegistrationListsStateService } from '../services/state/patient-registration-lists-state.service';

export const patientRegistrationResolver: ResolveFn<any> = () => {
  const listsStateService = inject(PatientRegistrationListsStateService);
  return listsStateService.loadLists();
};
