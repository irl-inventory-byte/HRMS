export const CHECKLIST_ITEMS = [
  { key: "offer_letter_signed", label: "Offer letter signed" },
  { key: "id_documents_collected", label: "ID proof & documents collected" },
  { key: "office_accounts_created", label: "Office email & accounts created" },
  { key: "equipment_issued", label: "Laptop / equipment issued" },
  { key: "access_card_issued", label: "Access card / building access" },
  { key: "hr_induction_completed", label: "HR induction completed" },
  { key: "policy_handbook_acknowledged", label: "Policy & handbook acknowledged" },
  { key: "buddy_manager_intro", label: "Buddy / manager introduction" },
  { key: "nda_signed", label: "NDA signed" },
  { key: "posh_training_completed", label: "POSH training completed" },
] as const;

export type ChecklistKey = (typeof CHECKLIST_ITEMS)[number]["key"];