import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const jobs = [
  {
    title: 'Senior Frontend Engineer',
    description: 'Looking for an experienced React developer with 5+ years of experience. Must know TypeScript, state management, and performance optimization.',
    location: 'Bangalore, India',
    salary_min: 900000,
    salary_max: 1400000,
  },
  {
    title: 'Full Stack Developer',
    description: 'We need a developer comfortable with both React and Node.js. Experience with AWS is a plus.',
    location: 'Mumbai, India',
    salary_min: 700000,
    salary_max: 1100000,
  },
  {
    title: 'Backend Engineer - Node.js',
    description: 'Build scalable APIs using Node.js and PostgreSQL. Work on microservices architecture.',
    location: 'Hyderabad, India',
    salary_min: 800000,
    salary_max: 1200000,
  },
  {
    title: 'DevOps Engineer',
    description: 'Infrastructure automation, CI/CD pipelines, and cloud deployment expertise required. AWS or GCP experience needed.',
    location: 'Bangalore, India',
    salary_min: 950000,
    salary_max: 1350000,
  },
  {
    title: 'Product Manager - Growth',
    description: 'Lead product strategy and growth initiatives for our SaaS platform. Experience with B2B products required.',
    location: 'Remote',
    salary_min: 1200000,
    salary_max: 1700000,
  },
  {
    title: 'UI/UX Designer',
    description: 'Design beautiful and intuitive user interfaces. Figma and prototyping experience essential.',
    location: 'Pune, India',
    salary_min: 600000,
    salary_max: 900000,
  },
  {
    title: 'QA Automation Engineer',
    description: 'Selenium, pytest, and API testing expertise. Build robust automation test suites.',
    location: 'Chennai, India',
    salary_min: 500000,
    salary_max: 800000,
  },
  {
    title: 'Data Engineer',
    description: 'ETL pipelines, data warehousing, and analytics infrastructure. SQL and Python required.',
    location: 'Bangalore, India',
    salary_min: 850000,
    salary_max: 1250000,
  },
  {
    title: 'Machine Learning Engineer',
    description: 'Build ML models for real-world problems. Experience with TensorFlow or PyTorch. PhD preferred but not required.',
    location: 'Bangalore, India',
    salary_min: 1100000,
    salary_max: 1600000,
  },
  {
    title: 'Security Engineer',
    description: 'Secure our infrastructure and applications. Penetration testing and threat modeling experience required.',
    location: 'Bangalore, India',
    salary_min: 1000000,
    salary_max: 1500000,
  },
];

async function seed() {
  try {
    console.log('🌱 Starting seed...');
    
    // Clear existing jobs (optional)
    await pool.query('DELETE FROM jobs;');
    console.log('✓ Cleared existing jobs');

    // Insert jobs
    for (const job of jobs) {
      await pool.query(
        'INSERT INTO jobs (title, description, location, salary_min, salary_max) VALUES ($1, $2, $3, $4, $5)',
        [job.title, job.description, job.location, job.salary_min, job.salary_max]
      );
    }
    
    console.log(`✓ Inserted ${jobs.length} jobs`);
    console.log('✓ Seed completed successfully');
    
  } catch (error) {
    console.error('✗ Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();