INSERT INTO auth."user" 
    (id, username, password, email, is_verified)
VALUES 
    ('e12f815c-a8dd-4552-a5cb-d982b9b8435d', 'caleb_test', '$2b$10$/FqWaHKHVnCDv2Eih.KZVeCSEDnkFbxbnAYw0zzfI9CSwXvNK09Cy', 'caleb@test.com', true),
    ('48c5d74a-4a4b-455f-9554-fa32e399282c', 'test_user', '$2b$10$/FqWaHKHVnCDv2Eih.KZVeCSEDnkFbxbnAYw0zzfI9CSwXvNK09Cy', 'testuser@test.com', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_stats
    (user_id, total_xp, current_xp)
VALUES
    ('e12f815c-a8dd-4552-a5cb-d982b9b8435d', 184, 184),
    ('48c5d74a-4a4b-455f-9554-fa32e399282c', 0, 0)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_profile
    (id, first_name, last_name, weekly_workout_goal)
VALUES
    ('e12f815c-a8dd-4552-a5cb-d982b9b8435d', 'Caleb', 'Test', 3),
    ('48c5d74a-4a4b-455f-9554-fa32e399282c', 'Test', 'User', 6)
ON CONFLICT (id) DO NOTHING