# Form Elements

Generated from `shared/tables.js` by `npm run docs:forms`. Do not edit by hand.

## Contractor (`contractor`)

| Field | Element | HTML type | Requirement | Method (rules) | Actions | Properties |
|---|---|---|---|---|---|---|
| Unique id (`contractor_id`) | Single-line input | text | Required | any text, trimmed | Read-only when editing an existing record; On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Name of contractor (`contractor_name`) | Single-line input | text | Required | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Office address + city (`office_address`) | Multi-line text | — | Required | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Work address + city (`work_address`) | Multi-line text | — | Optional | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Contact person name (`contact_person`) | Single-line input | text | Required | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Contact number (`contact_number`) | Single-line input | tel | Required | matches `^\+?[0-9]+$` | On change: updates the form value; On save: sent to the server, checked, then stored | pattern |
| Mail id (`mail_id`) | Single-line input | email | Required | valid email address | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| PAN no (`pan_no`) | Single-line input | text | Required | matches `^[A-Z]{5}[0-9]{4}[A-Z]$` | On change: updates the form value; On save: sent to the server, checked, then stored | pattern, title "Format AAAAA9999A" |
| GST no (`gst_no`) | Single-line input | text | Optional | matches `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$` | On change: updates the form value; On save: sent to the server, checked, then stored | pattern, title "15 characters" |
| State (`state`) | Single-line input | text | Required | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Status (`status`) | Single-line input | text | Required | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Company status (`company_status`) | Single-line input | text | Required | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |

## Location (`location`)

| Field | Element | HTML type | Requirement | Method (rules) | Actions | Properties |
|---|---|---|---|---|---|---|
| Loc id (`loc_id`) | Single-line input | text | Required | any text, trimmed | Read-only when editing an existing record; On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Type location (`location_type`) | Single-line input | text | Required | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Name (`name`) | Single-line input | text | Required | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Sub division (`sub_division`) | Single-line input | text | Optional | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Division (`division`) | Single-line input | text | Optional | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Circle (`circle`) | Single-line input | text | Optional | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Corporate (`corporate`) | Single-line input | text | Optional | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Company (`company`) | Single-line input | text | Optional | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Other (`other`) | Multi-line text | — | Optional | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Status (`status`) | Single-line input | text | Required | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |

## Bill type (`bill_type`)

| Field | Element | HTML type | Requirement | Method (rules) | Actions | Properties |
|---|---|---|---|---|---|---|
| Unique id (`bill_type_id`) | Single-line input | text | Required | any text, trimmed | Read-only when editing an existing record; On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Type of Bill (`bill_type`) | Dropdown (fixed list) | — | Required | one of: Standard_voucher, Tender_bill | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Work type (`work_type`) | Dropdown (fixed list) | — | Required | one of: Transport vehicle, Labour, Transformer repair, Underground cable, Erection | On change: updates the form value; On save: sent to the server, checked, then stored | — |

## Bill type documents (`bill_type_document`)

| Field | Element | HTML type | Requirement | Method (rules) | Actions | Properties |
|---|---|---|---|---|---|---|
| Bill type (`bill_type`) | Dropdown (fixed list) | — | Required | one of: Standard_voucher, Tender_bill | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Documents required (`documents_required`) | Multi-line list (one per line) | — | Required | split on new lines or commas, empty items removed | On change: updates the form value; On save: sent to the server, checked, then stored | title "One per line" |

## Bill (`bill`)

| Field | Element | HTML type | Requirement | Method (rules) | Actions | Properties |
|---|---|---|---|---|---|---|
| Out no. (`out_no`) | Single-line input | text | Required | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| From DG Loc (`from_dg_loc`) | Dropdown (lookup) | — | Required | must match an existing location.loc_id | On change: updates the form value; On save: sent to the server, checked, then stored; On open: loads location for the dropdown | — |
| Contractor (`contractor`) | Dropdown (lookup) | — | Required | must match an existing contractor.contractor_id | On change: updates the form value; On save: sent to the server, checked, then stored; On open: loads contractor for the dropdown | — |
| Type of Bill (`bill_type_id`) | Dropdown (lookup) | — | Required | must match an existing bill_type.bill_type_id | On change: updates the form value; On save: sent to the server, checked, then stored; On open: loads bill_type for the dropdown | — |
| Bill amount (`bill_amount`) | Single-line input | number | Required | number, ≥ 0 | On change: updates the form value; On save: sent to the server, checked, then stored | step 0.01, min 0 |
| Attachment (`attachment`) | Single-line input | text | Required | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
| Fin year (`fin_year`) | Single-line input | text | Required | matches `^[0-9]{4}-[0-9]{2}$` | On change: updates the form value; On save: sent to the server, checked, then stored | pattern, title "Format 2026-27" |
| Bank details (`bank_details`) | Multi-line text | — | Optional | any text, trimmed | On change: updates the form value; On save: sent to the server, checked, then stored | — |
