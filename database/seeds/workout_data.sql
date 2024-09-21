/***************** INSERT WORKOUT FOR caleb_test ***********************/
-- Get user id
DO $$
DECLARE
    userId UUID;
    userCreatedexerciseId UUID;
    exercise1Id UUID;
    exercise2Id UUID;
BEGIN
    -- Get user for workout
    SELECT id INTO userId FROM "user" WHERE username = 'caleb_test';

    -- Delete already existing workout
    DELETE FROM workout WHERE user_id = userId;

    -- Get the user created exercise that was inserted in the seed file
    SELECT id INTO userCreatedexerciseId FROM exercise WHERE user_id = userId;

    -- Get 2 random default exercises
    SELECT id INTO exercise1Id FROM exercise WHERE is_custom = false ORDER BY RANDOM();
    SELECT id INTO exercise2Id FROM exercise WHERE is_custom = false AND id != exercise1Id ORDER BY RANDOM();

    -- Insert into workout table
    INSERT INTO workout
        (name, user_id, duration)
    VALUES
        ('Test Workout: caleb_test', userId, 4428);
    RAISE NOTICE 'Inserted 1 workout into workout table';

    -- Insert 3 exercises into workout_exercise table
    INSERT INTO workout_exercise
        (id, "order", workout_id, exercise_id)
    VALUES
        ('2202693c-8203-4d1c-9efd-036ceb2cece4', 1, (SELECT id FROM workout WHERE name = 'Test Workout: caleb_test'), exercise1Id),
        ('6e05cfd8-2b50-461b-95ce-05d1ff2b8ed9', 2, (SELECT id FROM workout WHERE name = 'Test Workout: caleb_test'), userCreatedExerciseId),
        ('eab67b3f-33b7-4161-972d-46f106d75487', 3, (SELECT id FROM workout WHERE name = 'Test Workout: caleb_test'), exercise2Id);
    RAISE NOTICE 'Inserted 3 workout_exercises into workout_exercise table';

    -- Insert 3 sets for each exercise in the workout_set table
    INSERT INTO workout_set
        ("order", workout_exercise_id, reps, weight, rpe)
    VALUES
        (1, '2202693c-8203-4d1c-9efd-036ceb2cece4', 15, 100, 10),
        (2, '2202693c-8203-4d1c-9efd-036ceb2cece4', 14, 100, 10),
        (3, '2202693c-8203-4d1c-9efd-036ceb2cece4', 13, 100, 10),

        (1, '6e05cfd8-2b50-461b-95ce-05d1ff2b8ed9', 10, 40, 9),
        (2, '6e05cfd8-2b50-461b-95ce-05d1ff2b8ed9', 8, 35, 10),
        (3, '6e05cfd8-2b50-461b-95ce-05d1ff2b8ed9', 6, 35, 10),
        
        (1, 'eab67b3f-33b7-4161-972d-46f106d75487', 12, 100, 8),
        (2, 'eab67b3f-33b7-4161-972d-46f106d75487', 12, 100, 9),
        (3, 'eab67b3f-33b7-4161-972d-46f106d75487', 10, 100, 10);
    RAISE NOTICE 'Inserted 9 sets into workout_set table';
    
END $$;

