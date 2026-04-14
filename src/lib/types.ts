export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

export type VisaType = 'Skilled Worker' | 'Health & Care' | 'Global Talent' | 'Graduate' | 'Other';

export interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  salary: string;
  visaType: VisaType;
  sponsorshipConfirmed: boolean;
  status: ApplicationStatus;
  deadline: string;
  source: string;
  notes: string;
  dateAdded: string;
  technology?: string;
}
