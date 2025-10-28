export type Role = "Admin" | "Manager" | "Staff";

export interface Branch {
  name: string;
  location: string;
  review_link: string;
  contact_number: string;
}

export interface CompanyRegistration {
  contact_name: string;
  contact_email: string;
  contact_number: string;
  organization_name: string;
  organization_email?: string;
  password: string;
  role: Role;
  branches: Branch[];
}

export type AuthResponse = {
  success: boolean;
  token?: string;
  role?: "admin" | "user";
  message?: string;
};

export type RegisterPayload = {
  contactName: string;
  contactEmail: string;
  contactNumber: string;
  organisationName: string;
  organisationEmail?: string;
  password: string;
  branches: {
    name: string;
    location: string;
    reviewLink: string;
    contactNo: string;
  }[];
};