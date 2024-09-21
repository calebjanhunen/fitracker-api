INSERT INTO "user" 
    (id, username, password, email, first_name, last_name)
VALUES 
    ('e12f815c-a8dd-4552-a5cb-d982b9b8435d', 'caleb_test', '$2b$10$/FqWaHKHVnCDv2Eih.KZVeCSEDnkFbxbnAYw0zzfI9CSwXvNK09Cy', 'caleb@test.com', 'caleb', 'test'),
    ('48c5d74a-4a4b-455f-9554-fa32e399282c', 'test_user', '$2b$10$/FqWaHKHVnCDv2Eih.KZVeCSEDnkFbxbnAYw0zzfI9CSwXvNK09Cy', 'testuser@test.com', 'test', 'user')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_stats
    (user_id, total_xp)
VALUES
    ('e12f815c-a8dd-4552-a5cb-d982b9b8435d', 0),
    ('48c5d74a-4a4b-455f-9554-fa32e399282c', 0)
ON CONFLICT (user_id) DO NOTHING