import postgres from "postgres";

// Seeding needs write privileges, so prefer the owner role (SEED_DATABASE_URL).
// DATABASE_URL is the read-only role the playground uses at runtime; fall back
// to it only if no owner string is set (e.g. before the read-only split).
const sql = postgres(process.env.SEED_DATABASE_URL ?? process.env.DATABASE_URL!);

// A small but related schema so every surface has something real to show —
// four tables with foreign keys, which gives the ER diagram its edges:
//   employees   → departments
//   projects    → departments
//   assignments → employees, projects   (many-to-many join)
async function seed() {
  // Drop in dependency order so a re-seed is clean.
  await sql`DROP TABLE IF EXISTS assignments, projects, employees, departments CASCADE`;

  await sql`
    CREATE TABLE departments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      location VARCHAR(100) NOT NULL,
      budget DECIMAL(12, 2) NOT NULL
    )
  `;

  await sql`
    CREATE TABLE employees (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      department_id INTEGER NOT NULL REFERENCES departments(id),
      salary DECIMAL(10, 2) NOT NULL,
      hire_date DATE NOT NULL,
      city VARCHAR(100) NOT NULL
    )
  `;

  await sql`
    CREATE TABLE projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      department_id INTEGER NOT NULL REFERENCES departments(id),
      status VARCHAR(20) NOT NULL,
      budget DECIMAL(12, 2) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE
    )
  `;

  await sql`
    CREATE TABLE assignments (
      employee_id INTEGER NOT NULL REFERENCES employees(id),
      project_id INTEGER NOT NULL REFERENCES projects(id),
      role VARCHAR(60) NOT NULL,
      allocation_pct INTEGER NOT NULL,
      assigned_date DATE NOT NULL,
      PRIMARY KEY (employee_id, project_id)
    )
  `;

  await sql`
    INSERT INTO departments (name, location, budget) VALUES
    ('Engineering', 'San Francisco', 2000000),
    ('Marketing', 'New York', 800000),
    ('HR', 'Chicago', 400000),
    ('Finance', 'New York', 1200000)
  `;

  // department_id matches the serial ids above: Engineering=1, Marketing=2, HR=3, Finance=4
  await sql`
    INSERT INTO employees (name, email, department_id, salary, hire_date, city) VALUES
    ('Alice Johnson',  'alice.johnson@talkql.dev',  1,  95000, '2019-03-15', 'San Francisco'),
    ('Bob Smith',      'bob.smith@talkql.dev',      1,  88000, '2020-07-01', 'Austin'),
    ('Carol White',    'carol.white@talkql.dev',    2,  72000, '2018-11-20', 'New York'),
    ('David Lee',      'david.lee@talkql.dev',      1, 102000, '2017-05-10', 'San Francisco'),
    ('Eva Martinez',   'eva.martinez@talkql.dev',   3,  65000, '2021-01-12', 'Chicago'),
    ('Frank Chen',     'frank.chen@talkql.dev',     2,  78000, '2019-08-25', 'New York'),
    ('Grace Kim',      'grace.kim@talkql.dev',      1,  97000, '2020-02-14', 'Austin'),
    ('Henry Brown',    'henry.brown@talkql.dev',    4,  85000, '2018-06-30', 'Chicago'),
    ('Iris Davis',     'iris.davis@talkql.dev',     3,  63000, '2022-03-08', 'San Francisco'),
    ('James Wilson',   'james.wilson@talkql.dev',   4,  91000, '2017-09-19', 'New York'),
    ('Karen Taylor',   'karen.taylor@talkql.dev',   1, 110000, '2016-04-22', 'San Francisco'),
    ('Leo Anderson',   'leo.anderson@talkql.dev',   2,  69000, '2021-11-05', 'Austin'),
    ('Mia Thomas',     'mia.thomas@talkql.dev',     4,  87000, '2019-12-17', 'Chicago'),
    ('Nathan Jackson', 'nathan.jackson@talkql.dev', 1,  99000, '2018-07-03', 'New York'),
    ('Olivia Harris',  'olivia.harris@talkql.dev',  3,  67000, '2020-10-28', 'Austin'),
    ('Paul Clark',     'paul.clark@talkql.dev',     2,  74000, '2017-02-14', 'San Francisco'),
    ('Quinn Lewis',    'quinn.lewis@talkql.dev',    4,  93000, '2021-05-19', 'New York'),
    ('Rachel Walker',  'rachel.walker@talkql.dev',  1, 105000, '2015-08-11', 'Chicago'),
    ('Sam Hall',       'sam.hall@talkql.dev',       3,  61000, '2022-07-22', 'San Francisco'),
    ('Tina Young',     'tina.young@talkql.dev',     2,  76000, '2019-01-09', 'New York')
  `;

  await sql`
    INSERT INTO projects (name, department_id, status, budget, start_date, end_date) VALUES
    ('Apollo Platform',    1, 'active',    750000, '2022-01-10', NULL),
    ('Helios Migration',   1, 'completed', 420000, '2021-03-01', '2021-12-15'),
    ('Brand Refresh',      2, 'active',    180000, '2022-04-01', NULL),
    ('Recruiting Drive',   3, 'completed',  90000, '2021-06-01', '2022-02-28'),
    ('Budget Planning FY23',4,'planned',   120000, '2022-09-01', NULL),
    ('Data Platform',      1, 'active',    540000, '2022-02-15', NULL)
  `;

  await sql`
    INSERT INTO assignments (employee_id, project_id, role, allocation_pct, assigned_date) VALUES
    (1,  1, 'Tech Lead',        60, '2022-01-10'),
    (2,  1, 'Engineer',        100, '2022-01-15'),
    (4,  1, 'Architect',        40, '2022-01-10'),
    (7,  6, 'Engineer',        100, '2022-02-15'),
    (11, 6, 'Tech Lead',        50, '2022-02-15'),
    (14, 2, 'Engineer',        100, '2021-03-01'),
    (18, 2, 'Engineer',         80, '2021-03-01'),
    (4,  6, 'Architect',        50, '2022-02-20'),
    (3,  3, 'Campaign Lead',    70, '2022-04-01'),
    (6,  3, 'Designer',        100, '2022-04-05'),
    (12, 3, 'Copywriter',       60, '2022-04-10'),
    (5,  4, 'Recruiter',       100, '2021-06-01'),
    (9,  4, 'Coordinator',      50, '2021-06-15'),
    (8,  5, 'Analyst',          80, '2022-09-01'),
    (10, 5, 'Lead',             40, '2022-09-01')
  `;

  const [{ count: deps }] = await sql`SELECT count(*)::int FROM departments`;
  const [{ count: emps }] = await sql`SELECT count(*)::int FROM employees`;
  const [{ count: projs }] = await sql`SELECT count(*)::int FROM projects`;
  const [{ count: asgs }] = await sql`SELECT count(*)::int FROM assignments`;
  console.log(`Seeded ${deps} departments, ${emps} employees, ${projs} projects, ${asgs} assignments`);

  await sql.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
