-- Increase VARCHAR limits for fields that may have long values

ALTER TABLE students 
ALTER COLUMN pickup_route TYPE VARCHAR(255),
ALTER COLUMN pickup_stop TYPE VARCHAR(255),
ALTER COLUMN drop_route TYPE VARCHAR(255),
ALTER COLUMN drop_stop TYPE VARCHAR(255),
ALTER COLUMN pickup_bus_route_abb TYPE VARCHAR(150),
ALTER COLUMN drop_bus_route_abb TYPE VARCHAR(150),
ALTER COLUMN father_office_name TYPE VARCHAR(255),
ALTER COLUMN mother_office_name TYPE VARCHAR(255),
ALTER COLUMN class_teacher_name TYPE VARCHAR(255),
ALTER COLUMN mentor_name TYPE VARCHAR(255),
ALTER COLUMN counselor_name TYPE VARCHAR(255),
ALTER COLUMN previous_school_name TYPE VARCHAR(255),
ALTER COLUMN fee_category TYPE VARCHAR(255),
ALTER COLUMN bank_name TYPE VARCHAR(255),
ALTER COLUMN bank_branch TYPE VARCHAR(255),
ALTER COLUMN bank_account_holder TYPE VARCHAR(255),
ALTER COLUMN guardian_aunt_name TYPE VARCHAR(255),
ALTER COLUMN guardian_uncle_name TYPE VARCHAR(255),
ALTER COLUMN guardian_grandfather_name TYPE VARCHAR(255),
ALTER COLUMN guardian_grandmother_name TYPE VARCHAR(255),
ALTER COLUMN guardian_driver_name TYPE VARCHAR(255),
ALTER COLUMN pickup_driver_name TYPE VARCHAR(255),
ALTER COLUMN pickup_conductor_name TYPE VARCHAR(255),
ALTER COLUMN pickup_helper_name TYPE VARCHAR(255),
ALTER COLUMN pickup_caretaker_name TYPE VARCHAR(255),
ALTER COLUMN drop_driver_name TYPE VARCHAR(255),
ALTER COLUMN drop_conductor_name TYPE VARCHAR(255),
ALTER COLUMN drop_helper_name TYPE VARCHAR(255),
ALTER COLUMN drop_caretaker_name TYPE VARCHAR(255);

ALTER TABLE staff
ALTER COLUMN bank_name TYPE VARCHAR(255),
ALTER COLUMN bank_branch TYPE VARCHAR(255),
ALTER COLUMN reporting_authority TYPE VARCHAR(255),
ALTER COLUMN class_teacher_of TYPE VARCHAR(255),
ALTER COLUMN class_incharge TYPE VARCHAR(255),
ALTER COLUMN main_subject TYPE VARCHAR(255),
ALTER COLUMN qualification_subject TYPE VARCHAR(255);

COMMENT ON TABLE students IS 'Student records with comprehensive information from Excel import';
COMMENT ON TABLE staff IS 'Staff records with comprehensive information from Excel import';
