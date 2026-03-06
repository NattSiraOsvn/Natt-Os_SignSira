/**
 * Employee Entity — Nhân sự Tâm Luxury
 * HR_FIELDS_LEVELS: field-level permission control
 */

export const HR_FIELDS_LEVELS = {
  BASIC: ['fullName', 'dob', 'gender', 'nationality', 'ethnic', 'idCard',
          'originAddress', 'permanentAddress', 'temporaryAddress', 'contactAddress', 'email', 'phone'] as const,
  WORK:  ['employeeCode', 'status', 'department', 'position', 'workPlace',
          'contractNo', 'contractDate', 'contractType', 'approvalStatus'] as const,
  FINANCE: ['baseSalary', 'salaryFactor', 'allowanceLunch', 'allowancePosition',
            'bankAccountOwner', 'bankAccountNo', 'bankName', 'bankBranch', 'bankCode'] as const,
  INSURANCE: ['insuranceCode', 'insuranceBookNo', 'medicalCardNo', 'contributionRate',
              'minWageRegion', 'contributionAmount', 'medicalRegistration', 'medicalCode', 'medicalUnit'] as const,
} as const;

export type HRFieldLevel = keyof typeof HR_FIELDS_LEVELS;
