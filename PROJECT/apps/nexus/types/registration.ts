export interface RegistrationStartPayload {
  full_name: string;
  business_email: string;
  organization_name: string;
}

export interface RegistrationCompletePayload {
  token: string;
  organization_website?: string;
  industry?: string;
  company_size?: string;
  country?: string;
  selected_plan_id?: string;
  requested_domain_ids: string[];
  password: string;
  confirm_password: string;
}

export interface OrganizationRegistrationRequest {
  id: string;
  organizationName: string;
  adminName: string;
  businessEmail: string;
  status: "PENDING_EMAIL_VERIFICATION" | "EMAIL_VERIFIED" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "CANCELLED";
  emailVerified: boolean;
  selectedPlan: string;
  selectedPlanSlug?: string;
  requestedDomains: string[];
  country?: string;
  companySize?: string;
  industry?: string;
  website?: string;
  rejectionReason?: string;
  createdAt: string;
}
