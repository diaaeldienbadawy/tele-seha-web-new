import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { DoctorRegistrationListsStateService } from '../services/state/doctor-registration-lists-state.service';

export const doctorRegistrationResolver: ResolveFn<any> = () => {
  const listsStateService = inject(DoctorRegistrationListsStateService);
  return listsStateService.loadLists();
};
