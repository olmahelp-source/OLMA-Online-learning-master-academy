# Table Format Specification

This document defines the columns of the bill register table, in order.

| # | Column Name       | Field Key         | Type                 | Required | Notes                                      |
|---|-------------------|-------------------|----------------------|----------|--------------------------------------------|
| 1 | Out no.           | `out_no`          | Text / Number        | Yes      | Outward reference number                   |
| 2 | From DG Loc       | `from_dg_loc`     | Text                 | Yes      | Originating DG location                    |
| 3 | Contractor        | `contractor`      | Text                 | Yes      | Contractor name                            |
| 4 | Type of Bill      | `bill_type`       | Text (dropdown)      | Yes      | Category of the bill                       |
| 5 | Bill Amount       | `bill_amount`     | Decimal (2 places)   | Yes      | Amount of the bill                         |
| 6 | Attachment        | `attachment`      | Text (select list)   | Yes      | Chosen from the predefined attachment list |
| 7 | Fin year          | `fin_year`        | Text (e.g. `2026-27`)| Yes      | Financial year of the bill                 |
| 8 | Bank details      | `bank_details`    | Text                 | No       | Optional                                   |

## Column Details

1. **Out no.**: Outward reference number for the bill. Must be unique within a financial year.
2. **From DG Loc**: Location of the DG (Directorate General) from which the bill originates.
3. **Contractor**: Name of the contractor who submitted the bill.
4. **Type of Bill**: Category of the bill. Values come from a dropdown list.
5. **Bill Amount**: Monetary amount of the bill. Stored as a decimal with two decimal places and must be zero or greater.
6. **Attachment (from list)**: One value selected from the predefined attachment list. Free text is not accepted.
7. **Fin year**: Financial year in the format `YYYY-YY`, for example `2026-27`.
8. **Bank details (optional)**: Bank account information for payment. This column may be left empty.

## Validation Rules

- Columns 1–7 are mandatory. A row cannot be saved while any of them is empty.
- Column 8 may be left empty.
- Column 5 must be a valid number greater than or equal to zero.
- Column 7 must match the pattern `^\d{4}-\d{2}$`, and the two-digit part must equal the last two digits of the year plus one.
- Column 6 must match one of the values in the attachment list.

# Contractor Details Specification

This section defines the fields of the contractor details table, in order.

| # | Field Name        | Field Key          | Type             | Required | Notes                                  |
|---|-------------------|--------------------|------------------|----------|----------------------------------------|
| 1 | Unique id         | `contractor_id`    | Text             | Yes      | Unique identifier for the contractor   |
| 2 | Name of contractor| `contractor_name`  | Text             | Yes      | Legal name of the contractor           |
| 3 | Office address    | `office_address`   | Text (address + city) | Yes | Registered office address and city  |
| 4 | Work address      | `work_address`     | Text (address + city) | No  | Site or working office address and city |
| 5 | Contact person    | `contact_person`   | Text             | Yes      | Name of the contact person             |
| 6 | Contact number    | `contact_number`   | Text (digits)    | Yes      | Phone number                           |
| 7 | Mail id           | `mail_id`          | Email            | Yes      | Must be a valid email address          |
| 8 | PAN no            | `pan_no`           | Text (10 chars)  | Yes      | Format `AAAAA9999A`                    |
| 9 | GST no            | `gst_no`           | Text (15 chars)  | No       | Format `99AAAAA9999A9Z9`               |
| 10 | State            | `state`            | Text (select list)| Yes     | State of the contractor                |
| 11 | Status           | `status`           | Text (select list)| Yes     | Operational status of the contractor   |
| 12 | Company status   | `company_status`   | Text (select list)| Yes     | Legal status of the company            |

## Validation Rules

- Column 1 must be unique across all contractors.
- Column 7 must be a valid email address.
- Column 8 must match `^[A-Z]{5}[0-9]{4}[A-Z]$`.
- Column 9, when provided, must match `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$`.
- Column 6 must contain only digits (optionally with a leading `+`).

# Location Table Specification

This section defines the fields of the location table, in order.

| # | Field Name    | Field Key       | Type                  | Required | Notes                                  |
|---|---------------|-----------------|-----------------------|----------|----------------------------------------|
| 1 | Loc id        | `loc_id`        | Text                  | Yes      | Unique identifier for the location     |
| 2 | Type location | `location_type` | Text (select list)    | Yes      | Kind of location                       |
| 3 | Name          | `name`          | Text                  | Yes      | Name of the location                   |
| 4 | Sub division  | `sub_division`  | Text (select list)    | No       | Sub division the location belongs to   |
| 5 | Division      | `division`      | Text (select list)    | No       | Division the location belongs to       |
| 6 | Circle        | `circle`        | Text (select list)    | No       | Circle the location belongs to         |
| 7 | Corporate     | `corporate`     | Text (select list)    | No       | Corporate office the location belongs to |
| 8 | Company       | `company`       | Text (select list)    | No       | Company the location belongs to        |
| 9 | Oth           | `other`         | Text                  | No       | Other information (see note)           |

## Validation Rules

- Column 1 must be unique across all locations.
- Columns 1–3 are mandatory.
- Columns 4–9 may be left empty.
