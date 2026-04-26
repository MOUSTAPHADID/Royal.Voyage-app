/**
 * Visa System Types and Interfaces
 * Safe skeleton for future Visa System implementation
 * No breaking changes to existing integrations
 */

// Visa Application Status
export type VisaApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "more_documents_required"
  | "approved"
  | "rejected"
  | "cancelled";

// Visa Payment Status
export type VisaPaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

// Visa Type
export type VisaType =
  | "tourist"
  | "business"
  | "umrah"
  | "student"
  | "transit"
  | "family_visit";

// Visa Provider
export type VisaProvider =
  | "manual"
  | "sherpa"
  | "ivisa"
  | "other";

// Document Type
export type VisaDocumentType =
  | "passport_copy"
  | "personal_photo"
  | "hotel_booking"
  | "flight_booking"
  | "bank_statement"
  | "invitation_letter"
  | "travel_insurance"
  | "additional_document"
  | "approved_visa_file";

// Document Status
export type VisaDocumentStatus =
  | "uploaded"
  | "accepted"
  | "rejected";

// Visa Application Interface
export interface VisaApplication {
  id: string;
  visaApplicationId: string;
  customerId: string;
  agencyId?: string;
  partnerId?: string;
  destinationCountry: string;
  travelerNationality: string;
  visaType: VisaType;
  expectedTravelDate: string;
  numberOfTravelers: number;
  fullName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  passportExpiry: string;
  phone: string;
  email: string;
  status: VisaApplicationStatus;
  paymentStatus: VisaPaymentStatus;
  provider: VisaProvider;
  providerReference?: string;
  price: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// Visa Document Interface
export interface VisaDocument {
  id: string;
  visaApplicationId: string;
  documentType: VisaDocumentType;
  fileName: string;
  fileKey: string;
  storageProvider: string;
  uploadedBy: string;
  status: VisaDocumentStatus;
  createdAt: Date;
}

// Visa Activity Log Interface
export interface VisaActivityLog {
  id: string;
  visaApplicationId: string;
  action: string;
  performedBy: string;
  details?: Record<string, any>;
  createdAt: Date;
}

// Create Visa Application Request
export interface CreateVisaApplicationRequest {
  destinationCountry: string;
  travelerNationality: string;
  visaType: VisaType;
  expectedTravelDate: string;
  numberOfTravelers: number;
  fullName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  passportExpiry: string;
  phone: string;
  email: string;
}

// Update Visa Application Request
export interface UpdateVisaApplicationRequest {
  fullName?: string;
  phone?: string;
  email?: string;
  expectedTravelDate?: string;
  numberOfTravelers?: number;
}

// Admin Status Change Request
export interface AdminStatusChangeRequest {
  status: VisaApplicationStatus;
  note?: string;
}

// Request More Documents Request
export interface RequestMoreDocumentsRequest {
  requiredDocuments: VisaDocumentType[];
  message: string;
}

// Approve Visa Request
export interface ApproveVisaRequest {
  note?: string;
}

// Reject Visa Request
export interface RejectVisaRequest {
  reason: string;
}

// Upload Approved Visa Request
export interface UploadApprovedVisaRequest {
  fileName: string;
  fileBuffer: Buffer;
}

// Visa Stats
export interface VisaStats {
  totalApplications: number;
  byStatus: Record<VisaApplicationStatus, number>;
  byProvider: Record<VisaProvider, number>;
  totalRevenue: number;
  averageProcessingTime: number;
}

// Partner Visa API Request
export interface PartnerVisaRequest {
  destinationCountry: string;
  travelerNationality: string;
  visaType: VisaType;
  expectedTravelDate: string;
  numberOfTravelers: number;
  fullName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  passportExpiry: string;
  phone: string;
  email: string;
}

// Partner Visa Response
export interface PartnerVisaResponse {
  id: string;
  visaApplicationId: string;
  status: VisaApplicationStatus;
  paymentStatus: VisaPaymentStatus;
  price: number;
  currency: string;
  createdAt: Date;
}
