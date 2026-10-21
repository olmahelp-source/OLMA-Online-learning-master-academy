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
