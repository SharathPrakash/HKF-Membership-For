
export interface IFormData {
  // Personal Details
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'male' | 'female' | '';
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  isKannadaShaaleStudent: string;

  // Membership
  entryDate: string;

  // SEPA Mandate
  sepaGender: 'male' | 'female' | 'diverse' | 'none' | 'institution' | '';
  sepaFirstName: string;
  sepaLastName: string;
  sepaAddress: string;
  sepaPostalCode: string;
  sepaCity: string;
  iban: string;
  sepaEntryDate: string;
}