import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function seed() {
  await sql`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      department VARCHAR(100) NOT NULL,
      salary DECIMAL(10, 2) NOT NULL,
      hire_date DATE NOT NULL,
      city VARCHAR(100) NOT NULL
    )
  `;

  await sql`DELETE FROM employees`;

  await sql`
    INSERT INTO employees (name, department, salary, hire_date, city) VALUES
    ('Alice Johnson', 'Engineering', 95000, '2019-03-15', 'San Francisco'),
    ('Bob Smith', 'Engineering', 88000, '2020-07-01', 'Austin'),
    ('Carol White', 'Marketing', 72000, '2018-11-20', 'New York'),
    ('David Lee', 'Engineering', 102000, '2017-05-10', 'San Francisco'),
    ('Eva Martinez', 'HR', 65000, '2021-01-12', 'Chicago'),
    ('Frank Chen', 'Marketing', 78000, '2019-08-25', 'New York'),
    ('Grace Kim', 'Engineering', 97000, '2020-02-14', 'Austin'),
    ('Henry Brown', 'Finance', 85000, '2018-06-30', 'Chicago'),
    ('Iris Davis', 'HR', 63000, '2022-03-08', 'San Francisco'),
    ('James Wilson', 'Finance', 91000, '2017-09-19', 'New York'),
    ('Karen Taylor', 'Engineering', 110000, '2016-04-22', 'San Francisco'),
    ('Leo Anderson', 'Marketing', 69000, '2021-11-05', 'Austin'),
    ('Mia Thomas', 'Finance', 87000, '2019-12-17', 'Chicago'),
    ('Nathan Jackson', 'Engineering', 99000, '2018-07-03', 'New York'),
    ('Olivia Harris', 'HR', 67000, '2020-10-28', 'Austin'),
    ('Paul Clark', 'Marketing', 74000, '2017-02-14', 'San Francisco'),
    ('Quinn Lewis', 'Finance', 93000, '2021-05-19', 'New York'),
    ('Rachel Walker', 'Engineering', 105000, '2015-08-11', 'Chicago'),
    ('Sam Hall', 'HR', 61000, '2022-07-22', 'San Francisco'),
    ('Tina Young', 'Marketing', 76000, '2019-01-09', 'New York')
  `;

  console.log("Seeded 20 employees");
  await sql.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
