-- Creates the tables used by the app. Safe to run more than once.

CREATE TABLE IF NOT EXISTS contractor (
  contractor_id    TEXT PRIMARY KEY,
  contractor_name  TEXT NOT NULL,
  office_address   TEXT NOT NULL,
  work_address     TEXT,
  contact_person   TEXT NOT NULL,
  contact_number   TEXT NOT NULL,
  mail_id          TEXT NOT NULL,
  pan_no           TEXT NOT NULL,
  gst_no           TEXT,
  state            TEXT NOT NULL,
  status           TEXT NOT NULL,
  company_status   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS location (
  loc_id         TEXT PRIMARY KEY,
  location_type  TEXT NOT NULL,
  name           TEXT NOT NULL,
  sub_division   TEXT,
  division       TEXT,
  circle         TEXT,
  corporate      TEXT,
  company        TEXT,
  other          TEXT,
  status         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bill_type (
  bill_type_id  TEXT PRIMARY KEY,
  bill_type     TEXT NOT NULL CHECK (bill_type IN ('Standard_voucher', 'Tender_bill')),
  work_type     TEXT NOT NULL CHECK (work_type IN (
                  'Transport vehicle', 'Labour', 'Transformer repair', 'Underground cable', 'Erection'))
);

CREATE TABLE IF NOT EXISTS bill_type_document (
  id                  SERIAL PRIMARY KEY,
  bill_type           TEXT NOT NULL CHECK (bill_type IN ('Standard_voucher', 'Tender_bill')),
  documents_required  TEXT[] NOT NULL
);

CREATE TABLE IF NOT EXISTS bill (
  id            SERIAL PRIMARY KEY,
  out_no        TEXT NOT NULL,
  from_dg_loc   TEXT NOT NULL REFERENCES location (loc_id),
  contractor    TEXT NOT NULL REFERENCES contractor (contractor_id),
  bill_type_id  TEXT NOT NULL REFERENCES bill_type (bill_type_id),
  bill_amount   NUMERIC(14, 2) NOT NULL CHECK (bill_amount >= 0),
  attachment    TEXT NOT NULL,
  fin_year      TEXT NOT NULL CHECK (fin_year ~ '^[0-9]{4}-[0-9]{2}$'),
  bank_details  TEXT
);
