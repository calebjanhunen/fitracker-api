'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  // Insert new equipment
  await db.runSql(`
    INSERT INTO public.equipment (id, name) VALUES
      (6, 'assisted'),
      (7, 'resistance bands'),
      (8, 'medicine ball'),
      (9, 'smith machine'),
      (10, 'kettlebell'),
      (11, 'other')
  `);

  await db.runSql(`
    INSERT INTO public.body_part (id, name) VALUES  
      (11, 'forearms')
  `);

  // Add new back exercises
  await db.runSql(`
      INSERT INTO public.exercise (name, body_part_id, equipment_id) VALUES
        ('Pull-Up', 5, 6),
        ('Bent Over Row', 5, 1),
        ('Bent Over Row', 5, 2),
        ('Bent Over Single Arm Row', 5, 2),
        ('Smith Machine Row', 5, 9),
        ('Pendlay Row', 5, 1),
        ('Lat Pulldown', 5, 4),
        ('Seated Row', 5, 3),
        ('Seated Row', 5, 4),
        ('T Bar Row', 5, 4),
        ('Face Pull', 5, 3),
        ('Shrug', 5, 1),
        ('Shrug', 5, 2),
        ('Shrug', 5, 4),
        ('Back Extension', 5, 5),
        ('Lat Pullover', 5, 3)
    `);

  // Add new bicep exercises
  await db.runSql(`
      INSERT INTO public.exercise (name, body_part_id, equipment_id) VALUES
        ('Bicep Curl', 1, 1),  
        ('Bicep Curl', 1, 3),  
        ('Bicep Curl', 1, 4),
        ('Reverse Bicep Curl', 1, 1),
        ('Reverse Bicep Curl', 1, 2),
        ('Reverse Bicep Curl', 1, 3),
        ('Reverse Bicep Curl', 1, 4),
        ('Hammer Curl', 1, 2),
        ('Hammer Curl', 1, 3),
        ('Concentration Curl', 1, 2),
        ('Incline Curl', 1, 2),
        ('Preacher Curl', 1, 2),
        ('Preacher Curl', 1, 4),
        ('Preacher Curl', 1, 1)
    `);

  // Add new tricep exercises
  await db.runSql(`
        INSERT INTO public.exercise (name, body_part_id, equipment_id) VALUES
          ('Tricep Dips', 2, 4),
          ('Tricep Dips', 2, 6),
          ('Overhead Tricep Extensions', 2, 3),
          ('Overhead Tricep Extensions', 2, 2),
          ('Overhead Tricep Extensions', 2, 1),
          ('Tricep Pushdown', 2, 3),
          ('Tricep Pushdown', 2, 4),
          ('Tricep Extension', 2, 3),
          ('Tricep Extension', 2, 4),
          ('Skullcrusher', 2, 1),
          ('Skullcrusher', 2, 2),
          ('Close Grip Bench Press', 2, 1),
          ('Tricep Kickbacks', 2, 3),
          ('Pushup', 2, 5)
    `);

  // Add new shoulder exercises
  await db.runSql(`
      UPDATE public.exercise
      SET name = 'Seated Overhead Press'
      WHERE name = 'Shoulder Press' AND
        is_custom = false  
    `);
  await db.runSql(`
        INSERT INTO public.exercise (name, body_part_id, equipment_id) VALUES
          ('Seated Overhead Press', 3, 1),
          ('Seated Overhead Press', 3, 4),
          ('Standing Overhead Press', 3, 1),
          ('Standing Overhead Press', 3, 2),
          ('Standing Overhead Press', 3, 4),
          ('Arnold Press', 3, 2),
          ('Upright Row', 3, 2),
          ('Upright Row', 3, 1),
          ('Upright Row', 3, 3),
          ('Upright Row', 3, 9),
          ('Lateral Raise', 3, 2),
          ('Lateral Raise', 3, 3),
          ('Lateral Raise', 3, 4),
          ('Rear Delt Fly', 3, 2),
          ('Rear Delt Fly', 3, 3),
          ('Rear Delt Fly', 3, 4),
          ('Front Raise', 3, 3),
          ('Front Raise', 3, 1)
    `);

  // Add new chest exercises
  await db.runSql(`
      INSERT INTO public.exercise (name, body_part_id, equipment_id) VALUES
        ('Bench Press', 4, 2),
        ('Chest Press', 4, 4),
        ('Bench Press', 4, 9),
        ('Incline Bench Press', 4, 1),
        ('Incline Bench Press', 4, 2),
        ('Incline Bench Press', 4, 9),
        ('Incline Chest Press', 4, 4),
        ('Decline Bench Press', 4, 1),
        ('Decline Bench Press', 4, 2),
        ('Decline Bench Press', 4, 4),
        ('Chest Fly', 4, 2),
        ('Chest Fly', 4, 3),
        ('Chest Fly', 4, 4),
        ('Chest Dips', 4, 5),
        ('Chest Dips', 4, 6),
        ('Pushup', 4, 5)
  `);

  // Add new core exercises
  await db.runSql(`
      INSERT INTO public.exercise (name, body_part_id, equipment_id) VALUES
        ('Side Plank', 6, 5),
        ('Russian Twist', 6, 5),
        ('Situp', 6, 5),
        ('Crunch', 6, 5),
        ('Crunch', 6, 4),
        ('Reverse Crunch', 6, 5),
        ('Cable Crunch', 6, 3),
        ('Decline Crunch', 6, 3),
        ('Leg Raise', 6, 3)
  `);

  // Add new Leg exercises
  await db.runSql(`
      INSERT INTO public.exercise (name, body_part_id, equipment_id) VALUES
        ('Front Squat', 7, 1),
        ('Squat', 7, 9),
        ('Squat', 7, 5),
        ('V Squat', 7, 4),
        ('Hack Squat', 7, 4),
        ('Pendulum Squat', 7, 4),
        ('Goblet Squat', 7, 2),
        ('Lunge', 7, 2),
        ('Lunge', 7, 1),
        ('Step-up', 7, 2),
        ('Leg Extension', 7, 4),
        ('Sissy Squat', 7, 5),
        ('Bulgarian Split Squats', 7, 2),
        ('Deadlift', 7, 1),
        ('Romanian Deadlift', 7, 1),
        ('Romanian Deadlift', 7, 2),
        ('Romanian Deadlift', 7, 9),
        ('Stiff-leg Deadlift', 7, 1),
        ('Stiff-leg Deadlift', 7, 2),
        ('Stiff-leg Deadlift', 7, 9),
        ('Good Morning', 7, 1),
        ('Good Morning', 7, 2),
        ('Good Morning', 7, 9),
        ('Seated Leg Curl', 7, 4),
        ('Lying Leg Curl', 7, 4),
        ('Hip Thrust', 7, 1),
        ('Hip Thrust', 7, 2),
        ('Hip Thrust', 7, 4),
        ('Hip Thrust', 7, 9),
        ('Nordic Hamstring Curl', 7, 5),
        ('Kickbacks', 7, 3),
        ('Kickbacks', 7, 4),
        ('Standing Calf Raise', 7, 4),
        ('Seated Calf Raise', 7, 4),
        ('Leg Press Calf Raise', 7, 4),
        ('Hip Abductor', 7, 4),
        ('Hip Adductor', 7, 4)
  `);

  // Insert forearm exercises
  await db.runSql(`
    INSERT INTO public.exercise (name, body_part_id, equipment_id) VALUES
    ('Wrist Curl', 11, 2),
    ('Wrist Curl', 11, 1),
    ('Wrist Curl', 11, 3),
    ('Reverse Wrist Curl', 11, 2),
    ('Reverse Wrist Curl', 11, 1),
    ('Reverse Wrist Curl', 11, 3)
  `);
};

exports.down = async function (db) {
  // Delete forearm exercises
  await db.runSql(`
    DELETE FROM public.exercise WHERE name = 'Wrist Curl' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Reverse Wrist Curl' AND is_custom = false;  
  `);

  // Delete Leg Exercises
  await db.runSql(`
    DELETE FROM public.exercise WHERE name = 'Front Squat' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Squat' AND is_custom = false AND equipment_id != 1;
    DELETE FROM public.exercise WHERE name = 'V Squat' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Hack Squat' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Pendulum Squat' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Goblet Squat' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Lunge' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Step-up' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Leg Extension' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Sissy Squat' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Bulgarian Split Squats' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Deadlift' AND is_custom = false AND body_part_id = 7;
    DELETE FROM public.exercise WHERE name = 'Romanian Deadlift' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Stiff-leg Deadlift' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Good Morning' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Seated Leg Curl' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Lying Leg Curl' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Hip Thrust' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Nordic Hamstring Curl' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Kickbacks' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Standing Calf Raise' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Seated Calf Raise' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Leg Press Calf Raise' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Hip Abductor' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Hip Adductor' AND is_custom = false;  
  `);

  // Delete core exercises
  await db.runSql(`
    DELETE FROM public.exercise WHERE name = 'Side Plank' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Russian Twist' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Situp' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Crunch' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Reverse Crunch' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Cable Crunch' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Decline Crunch' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Leg Raise' AND is_custom = false;  
  `);

  // Delete chest exercises
  await db.runSql(`
    DELETE FROM public.exercise WHERE name = 'Bench Press' AND is_custom = false AND (equipment_id = 2 OR equipment_id = 9);
    DELETE FROM public.exercise WHERE name = 'Chest Press' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Incline Bench Press' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Incline Chest Press' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Decline Bench Press' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Chest Fly' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Chest Dips' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Pushup' AND is_custom = false;  
  `);

  // Delete shoulder exercises
  await db.runSql(`
    DELETE FROM public.exercise WHERE name = 'Seated Overhead Press' AND is_custom = false AND (equipment_id = 1 OR equipment_id = 4);
    DELETE FROM public.exercise WHERE name = 'Standing Overhead Press' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Arnold Press' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Upright Row' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Lateral Raise' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Rear Delt Fly' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Front Raise' AND is_custom = false;  
  `);
  await db.runSql(`
    UPDATE public.exercise
    SET name = 'Shoulder Press'
    WHERE name = 'Seated Overhead Press' AND
      is_custom = false  
  `);

  await db.runSql(`
    DELETE FROM public.exercise WHERE name = 'Tricep Dips' AND is_custom = false AND equipment_id != 5;
    DELETE FROM public.exercise WHERE name = 'Overhead Tricep Extensions' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Tricep Pushdown' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Tricep Extension' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Skullcrusher' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Close Grip Bench Press' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Tricep Kickbacks' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Pushup' AND is_custom = false;  
  `);

  await db.runSql(`
    DELETE FROM public.exercise WHERE name = 'Bicep Curl' AND is_custom = false AND equipment_id != 2;
    DELETE FROM public.exercise WHERE name = 'Reverse Bicep Curl' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Hammer Curl' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Concentration Curl' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Incline Curl' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Preacher Curl' AND is_custom = false;  
  `);

  await db.runSql(`
    DELETE FROM public.exercise WHERE name = 'Pull-Up' AND is_custom = false AND equipment_id != 5;
    DELETE FROM public.exercise WHERE name = 'Bent Over Row' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Bent Over Single Arm Row' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Smith Machine Row' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Pendlay Row' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Lat Pulldown' AND is_custom = false AND equipment_id != 3;
    DELETE FROM public.exercise WHERE name = 'Seated Row' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'T Bar Row' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Face Pull' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Shrug' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Back Extension' AND is_custom = false;
    DELETE FROM public.exercise WHERE name = 'Lat Pullover' AND is_custom = false;  
  `);

  await db.runSql(`
    UPDATE public.body_part
    SET name = 'legs'
    WHERE id = 7;  
  `);
  await db.runSql(`
    DELETE FROM public.body_part WHERE id > 8  
  `);

  await db.runSql(`
    DELETE FROM public.equipment WHERE id > 5
  `);
};

exports._meta = {
  version: 1,
};
