import { INextStepEnum } from "../../core/models/nextStepEnum";

// Request
export interface IpatientMobileRequest {
  mobile: string;
}

export interface IcreatePasswordRequest extends IpatientMobileRequest {
  password: string;
  createPasswordToken: string;
}

export interface IpatientOtpConfirmRequest extends IpatientMobileRequest {
  otp: string;
}

export interface IpatientLoginRequest extends IpatientMobileRequest {
  password: string;
}

export interface IBasicInfoRequest {
  Name : string;
  IsMale : boolean;
  BirthDate : string;
}


// Response
export interface IUser {
  id: number;
  mobile: string;
  patients: any[];
  role: string;
  status: string;
}

export interface ILoginData {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export interface IpatientLoginResponse {
  data: ILoginData;
  nextStep: INextStepEnum;
}
