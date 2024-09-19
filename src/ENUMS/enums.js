export const LoanStatus = {
  INACTIVE: 'InActive',
  ACTIVE: 'Active',
  EXTEND: 'Extend',
  BUYBACK: 'BuyBack Completed',
  LIQUIDATE: 'Liquidate',
  OVERDUE: 'Overdue',
};

export const AppointmentStatus = {
  VALUATION: 1,
  BUYBACK: 2,
  EXTEND: 3,
  LIQUIDATE: 4,
};

export const EmiStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  EXPIRED: 'expired',
  OVERDUE: 'Overdue',
};

export const AgreementType = {
  MURABAHA: 1,
  FULLFILLMENT: 2,
  LIQUIDATE: 3,
};

export const NotificationsType = {
  ALL: 1,
  PAYMENT: 2,
  ALERT: 3,
  INQUIRY: 4,
  GREETING: 5,
};

export const ApplicationStatus = {
  APPLIED_FOR_LOAN: 1,
  STORE_VISIT: 2,
  VALUATION_REJECT: 3,
  VALUATION_CHECK: 4,
  GENERATE_AGREEMENT: 5,
  APPROVED_BY_CUSTOMER: 6,
  REJECT_BY_CUSTOMER: 7,
  READY_FOR_DISBURSMENT: 8,
  LOAN_PROCESS_COMPLETED: 9,
};

export const PriceTagStatus = {
  DEFAULT_TAG: '',
  REQUESTED_FOR_VERIFICATION: 1,
  REQUESTED_FOR_APPROVAL: 2,
  APPROVED: 3,
};

export const UserRolePermission = {
  MAKER: 1,
  CHECKER: 2,
  APPROVER: 3,
};

export const KycStatus = {
  CUSTOMER_DOCUMENT_UPLOADED: 'Document uploaded',
  Verified: 'Verified',
  UnVerified: 'Un-Verified',
};
export const ReviewStatus = {
  Approved: 'Approved',
  Disapproved: 'Disapproved',
};
