export interface LoginDto {
  email: string;
  password: string;
}

export interface SignUpDto {
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  email: string;
  password: string;
}

export interface UserData {
  id: number;
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  user: UserData;
}
