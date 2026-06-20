// export interface INextStepEnum {


  // nextStepEnum:
  //   | 'OtpConfirm'
  //   | 'Login'
  //   | 'CreatePassword'
  //   | 'CreateProfile'
  //   | 'CreateMedicalProfile'
  //   | 'SelectProfile'
  //   | 'OpenHome';
// }

export enum INextStepEnum {
  OpenHome = 'OpenHome',
  Login = 'Login',
  CreatePassword = 'CreatePassword',
  CreateProfile = 'CreateProfile',
  CreateMedicalProfile = 'CreateMedicalProfile',
  SelectProfile = 'SelectProfile',
  OtpConfirm = 'OtpConfirm',
  CreateDoctorProfile = 'CreateDoctorProfile',
  CreateDoctorCertificates = 'CreateDoctorCertificates',
  CreateDoctorSchedules = 'CreateDoctorSchedules',
  WaitForAcctivation = 'WaitForAcctivation',
}


export interface INextStep {
  nextStep: INextStepEnum;
}
