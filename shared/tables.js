// Single source of truth for every table: the server uses it to validate and
// build queries, and the React UI uses it to draw forms and tables.
//
// Column fields:
//   key        database column name
//   label      text shown in the UI
//   type       text | textarea | email | tel | number | date | list
//   required   true when the value must be filled in
//   options    fixed dropdown values
//   ref        { table, label } foreign key; dropdown filled from that table
//   pattern    regex the value must match (checked on server and in the form)
//   generated  true when the database creates the value (serial id)

export const TABLES = {
  contractor: {
    label: 'Contractor',
    pk: 'contractor_id',
    columns: [
      { key: 'contractor_id', label: 'Unique id', required: true },
      { key: 'contractor_name', label: 'Name of contractor', required: true },
      { key: 'office_address', label: 'Office address + city', type: 'textarea', required: true },
      { key: 'work_address', label: 'Work address + city', type: 'textarea' },
      { key: 'contact_person', label: 'Contact person name', required: true },
      { key: 'contact_number', label: 'Contact number', type: 'tel', required: true, pattern: '^\\+?[0-9]+$' },
      { key: 'mail_id', label: 'Mail id', type: 'email', required: true },
      { key: 'pan_no', label: 'PAN no', required: true, pattern: '^[A-Z]{5}[0-9]{4}[A-Z]$', hint: 'Format AAAAA9999A' },
      { key: 'gst_no', label: 'GST no', pattern: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$', hint: '15 characters' },
      { key: 'state', label: 'State', required: true },
      { key: 'status', label: 'Status', required: true },
      { key: 'company_status', label: 'Company status', required: true },
    ],
  },

  location: {
    label: 'Location',
    pk: 'loc_id',
    columns: [
      { key: 'loc_id', label: 'Loc id', required: true },
      { key: 'location_type', label: 'Type location', required: true },
      { key: 'name', label: 'Name', required: true },
      { key: 'sub_division', label: 'Sub division' },
      { key: 'division', label: 'Division' },
      { key: 'circle', label: 'Circle' },
      { key: 'corporate', label: 'Corporate' },
      { key: 'company', label: 'Company' },
      { key: 'other', label: 'Other', type: 'textarea' },
      { key: 'status', label: 'Status', required: true },
    ],
  },

  bill_type: {
    label: 'Bill type',
    pk: 'bill_type_id',
    columns: [
      { key: 'bill_type_id', label: 'Unique id', required: true },
      { key: 'bill_type', label: 'Type of Bill', required: true, options: ['Standard_voucher', 'Tender_bill'] },
      {
        key: 'work_type',
        label: 'Work type',
        required: true,
        options: ['Transport vehicle', 'Labour', 'Transformer repair', 'Underground cable', 'Erection'],
      },
    ],
  },

  bill_type_document: {
    label: 'Bill type documents',
    pk: 'id',
    generated: true,
    columns: [
      { key: 'bill_type', label: 'Bill type', required: true, options: ['Standard_voucher', 'Tender_bill'] },
      { key: 'documents_required', label: 'Documents required', type: 'list', required: true, hint: 'One per line' },
    ],
  },

  bill: {
    label: 'Bill',
    pk: 'id',
    generated: true,
    columns: [
      { key: 'out_no', label: 'Out no.', required: true },
      { key: 'from_dg_loc', label: 'From DG Loc', required: true, ref: { table: 'location', key: 'loc_id', label: 'name' } },
      { key: 'contractor', label: 'Contractor', required: true, ref: { table: 'contractor', key: 'contractor_id', label: 'contractor_name' } },
      { key: 'bill_type_id', label: 'Type of Bill', required: true, ref: { table: 'bill_type', key: 'bill_type_id', label: 'bill_type' } },
      { key: 'bill_amount', label: 'Bill amount', type: 'number', required: true, min: 0 },
      { key: 'attachment', label: 'Attachment', required: true },
      { key: 'fin_year', label: 'Fin year', required: true, pattern: '^[0-9]{4}-[0-9]{2}$', hint: 'Format 2026-27' },
      { key: 'bank_details', label: 'Bank details', type: 'textarea' },
    ],
  },
};

export const TABLE_NAMES = Object.keys(TABLES);
