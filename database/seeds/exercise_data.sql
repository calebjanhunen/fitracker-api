DELETE FROM exercise WHERE name = 'Chest Press: caleb_test';
DELETE FROM exercise WHERE name = 'Barbell Row: test_user';

INSERT INTO exercise
    (name, body_part_id, equipment_id, is_custom, user_id)
VALUES
    ('Chest Press: caleb_test', 4, 4, true, 'e12f815c-a8dd-4552-a5cb-d982b9b8435d'),
    ('Barbell Row: test_user', 5, 1, true, '48c5d74a-4a4b-455f-9554-fa32e399282c')