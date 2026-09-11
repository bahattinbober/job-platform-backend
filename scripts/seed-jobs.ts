import 'dotenv/config';

// POST /jobs, src/jobs/jobs.controller.ts içinde @UseGuards(JwtAuthGuard) ile korunuyor,
// bu yüzden bu script her zaman önce /auth/login çağırıp JWT alıyor.
// SEED_EMAIL / SEED_PASSWORD ile giriş yapılamıyorsa süreç baştan durur.

const API_URL = process.env.SEED_API_URL ?? 'http://localhost:3001';
const SEED_EMAIL = process.env.SEED_EMAIL;
const SEED_PASSWORD = process.env.SEED_PASSWORD;

interface SeedJob {
  companyName: string;
  title: string;
  description: string;
  location?: string;
  remoteType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  visaSponsorship?: boolean;
  skills?: string[];
  source: string;
}

const jobs: SeedJob[] = [
  {
    companyName: 'TechNova GmbH',
    title: 'Backend Developer',
    description:
      'We are looking for a Backend Developer to help build and maintain the services powering our logistics platform. You will design REST APIs, model data in PostgreSQL, and work closely with the frontend team to ship features end to end. Experience with Node.js and Express in a production environment is expected. You should be comfortable writing tests and reviewing pull requests from teammates.',
    location: 'Berlin, Germany',
    remoteType: 'hybrid',
    experienceLevel: 'Mid',
    salaryMin: 55000,
    salaryMax: 72000,
    currency: 'EUR',
    visaSponsorship: true,
    skills: ['Node.js', 'PostgreSQL', 'Express', 'Docker'],
    source: 'seed',
  },
  {
    companyName: 'Northwind Systems',
    title: 'Senior Backend Engineer',
    description:
      'Northwind Systems is hiring a Senior Backend Engineer to own the architecture of our payments processing pipeline. You will design fault-tolerant services in Go, define SLAs with downstream teams, and mentor two mid-level engineers. A strong background in distributed systems and message queues (Kafka or similar) is required. You will also participate in on-call rotation and incident postmortems.',
    location: 'Amsterdam, Netherlands',
    remoteType: 'remote',
    experienceLevel: 'Senior',
    skills: ['Go', 'Kafka', 'PostgreSQL', 'gRPC'],
    source: 'seed',
  },
  {
    companyName: 'Bright Path Digital',
    title: 'Junior Frontend Developer',
    description:
      'Bright Path Digital is looking for a Junior Frontend Developer to join our product team. You will build UI components in React under the guidance of senior engineers, fix bugs reported by QA, and gradually take ownership of small features. Basic knowledge of JavaScript, HTML, and CSS is required; TypeScript experience is a plus but not mandatory. This is a great opportunity to grow within a supportive team.',
    location: 'London, United Kingdom',
    experienceLevel: 'Junior',
    skills: ['React', 'JavaScript', 'CSS'],
    source: 'seed',
  },
  {
    companyName: 'Solaris Labs',
    title: 'Frontend Engineer',
    description:
      'Solaris Labs builds tools for renewable energy operators, and we need a Frontend Engineer to modernize our dashboard application. You will migrate legacy views to Vue 3, improve accessibility across the product, and collaborate with our design team on a new component library. Solid experience with state management and component testing is expected. We value clean, well-documented code over clever one-liners.',
    location: 'Barcelona, Spain',
    remoteType: 'hybrid',
    experienceLevel: 'Mid',
    salaryMin: 40000,
    salaryMax: 54000,
    currency: 'EUR',
    skills: ['Vue', 'TypeScript', 'CSS', 'Vite'],
    source: 'seed',
  },
  {
    companyName: 'Clearwater Software',
    title: 'Full-Stack Developer',
    description:
      'We need a Full-Stack Developer to work across our Next.js frontend and Node.js backend for a growing fintech product. You will implement features from design to deployment, write integration tests, and help define our API contracts. Experience with both React and a relational database is required. You will work in a small cross-functional squad with a product manager and a designer.',
    location: 'Dublin, Ireland',
    remoteType: 'hybrid',
    experienceLevel: 'Mid',
    skills: ['Next.js', 'Node.js', 'PostgreSQL', 'TypeScript'],
    source: 'seed',
  },
  {
    companyName: 'Meridian Works',
    title: 'Senior Full-Stack Engineer',
    description:
      'Meridian Works is looking for a Senior Full-Stack Engineer to lead the technical direction of our internal tooling suite. You will design systems spanning a React frontend and a Django backend, make architectural decisions with long-term maintainability in mind, and pair with junior engineers to raise the team\'s overall bar. You should be equally comfortable debugging a production incident and reviewing a database schema change. Prior experience leading a small team is a strong plus.',
    location: 'Berlin, Germany',
    remoteType: 'remote',
    experienceLevel: 'Senior',
    salaryMin: 75000,
    salaryMax: 95000,
    currency: 'EUR',
    visaSponsorship: true,
    skills: ['React', 'Django', 'Python', 'PostgreSQL', 'Docker'],
    source: 'seed',
  },
  {
    companyName: 'Cascade Cloud',
    title: 'DevOps Engineer',
    description:
      'Cascade Cloud is hiring a DevOps Engineer to help us scale our AWS infrastructure as we onboard enterprise customers. You will manage Terraform modules, improve our CI/CD pipelines, and work with engineering teams to reduce deployment friction. Hands-on experience with AWS, containerization, and infrastructure as code is required. You will also help define our monitoring and alerting strategy.',
    location: 'Amsterdam, Netherlands',
    remoteType: 'hybrid',
    experienceLevel: 'Mid',
    skills: ['AWS', 'Terraform', 'Docker', 'GitHub Actions'],
    source: 'seed',
  },
  {
    companyName: 'Ironclad Systems',
    title: 'Senior DevOps Engineer',
    description:
      'We are looking for a Senior DevOps Engineer to own the reliability of our Kubernetes-based platform serving millions of requests per day. You will design our multi-region deployment strategy, drive incident response processes, and evaluate new tooling for observability. Deep expertise with Kubernetes, service meshes, and cost optimization on cloud infrastructure is expected. You will report directly to the Head of Infrastructure.',
    location: 'Stockholm, Sweden',
    remoteType: 'remote',
    experienceLevel: 'Senior',
    salaryMin: 68000,
    salaryMax: 88000,
    currency: 'EUR',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'Prometheus'],
    source: 'seed',
  },
  {
    companyName: 'Polaris Analytics',
    title: 'Data Engineer',
    description:
      'Polaris Analytics is expanding its data platform team and needs a Data Engineer to build reliable ETL pipelines. You will design and maintain Airflow DAGs, optimize our data warehouse queries, and partner with analysts to make data more accessible across the company. Strong Python skills and experience with SQL at scale are required. Familiarity with dbt is a plus.',
    location: 'Berlin, Germany',
    remoteType: 'hybrid',
    experienceLevel: 'Mid',
    skills: ['Python', 'Airflow', 'SQL', 'dbt'],
    source: 'seed',
  },
  {
    companyName: 'Beacon Insights',
    title: 'Senior Data Scientist',
    description:
      'Beacon Insights is looking for a Senior Data Scientist to lead the development of recommendation models used across our consumer app. You will own the full model lifecycle from experimentation to production deployment, collaborate with engineers on serving infrastructure, and present findings to non-technical stakeholders. A strong background in machine learning, statistics, and Python is required, along with experience shipping models that serve real users. Publication or open-source contributions are a plus.',
    location: 'London, United Kingdom',
    experienceLevel: 'Senior',
    salaryMin: 70000,
    salaryMax: 92000,
    currency: 'GBP',
    skills: ['Python', 'Machine Learning', 'SQL', 'PyTorch'],
    source: 'seed',
  },
  {
    companyName: 'Loop Mobile',
    title: 'iOS Developer',
    description:
      'Loop Mobile builds a social scheduling app used by teams across Europe, and we are hiring an iOS Developer to help us ship our next major release. You will build features in Swift and SwiftUI, work closely with our designer on interaction details, and help maintain our App Store release process. Solid experience with iOS app architecture and Apple\'s Human Interface Guidelines is expected. You will collaborate closely with our small but experienced mobile team.',
    location: 'Barcelona, Spain',
    remoteType: 'hybrid',
    experienceLevel: 'Mid',
    skills: ['Swift', 'SwiftUI', 'iOS', 'REST APIs'],
    source: 'seed',
  },
  {
    companyName: 'Vantage Apps',
    title: 'Junior Android Developer',
    description:
      'Vantage Apps is looking for a Junior Android Developer to join our small mobile team building productivity tools. You will implement UI screens in Kotlin, fix bugs reported through our crash reporting tool, and learn our codebase under the mentorship of a senior mobile engineer. Basic Kotlin knowledge and an understanding of Android lifecycle fundamentals are required. This role is a strong fit for someone early in their mobile career who wants to grow quickly.',
    location: 'Amsterdam, Netherlands',
    experienceLevel: 'Junior',
    skills: ['Kotlin', 'Android', 'REST APIs'],
    source: 'seed',
  },
  {
    companyName: 'Harbor Digital',
    title: 'Junior Backend Developer',
    description:
      'Harbor Digital is hiring a Junior Backend Developer to support our growing engineering team building booking software for small hotels. You will implement API endpoints in Django, write unit tests, and fix bugs under the guidance of senior developers. Basic knowledge of Python and relational databases is expected; production experience is not required. We invest heavily in mentorship and code review as a learning tool.',
    location: 'Lisbon, Portugal',
    remoteType: 'hybrid',
    experienceLevel: 'Junior',
    skills: ['Python', 'Django', 'PostgreSQL'],
    source: 'seed',
  },
  {
    companyName: 'Ferrum Technologies',
    title: 'Senior Backend Engineer',
    description:
      'Ferrum Technologies is looking for a Senior Backend Engineer to modernize a Java monolith into a set of well-defined services. You will lead technical design discussions, establish coding standards for the backend team, and work with the platform team on deployment pipelines. Deep experience with Java, Spring Boot, and relational database design is required. Experience with large-scale system migrations is a strong plus.',
    location: 'Munich, Germany',
    remoteType: 'onsite',
    experienceLevel: 'Senior',
    salaryMin: 80000,
    salaryMax: 100000,
    currency: 'EUR',
    visaSponsorship: true,
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Kafka'],
    source: 'seed',
  },
  {
    companyName: 'Lumen Software',
    title: 'Senior Frontend Developer',
    description:
      'Lumen Software is hiring a Senior Frontend Developer to lead the rebuild of our design system and component library used across five product teams. You will define frontend architecture standards, review pull requests from other frontend engineers, and collaborate closely with design on accessibility and performance. Strong experience with React, TypeScript, and testing frameworks is required. You will also help onboard and mentor newer team members.',
    location: 'Paris, France',
    remoteType: 'hybrid',
    experienceLevel: 'Senior',
    skills: ['React', 'TypeScript', 'Storybook', 'Jest'],
    source: 'seed',
  },
  {
    companyName: 'Bitforge',
    title: 'Junior Full-Stack Developer',
    description:
      'Bitforge is a small studio building MVPs for early-stage startups, and we are looking for a Junior Full-Stack Developer to join our delivery team. You will build features across a MERN stack, participate in client calls to understand requirements, and ship code frequently in a fast-paced environment. Basic experience with React and Node.js is expected, along with a willingness to learn quickly across different codebases. This role offers broad exposure to many kinds of products in a short time.',
    location: 'Warsaw, Poland',
    experienceLevel: 'Junior',
    skills: ['React', 'Node.js', 'MongoDB', 'Express'],
    source: 'seed',
  },
  {
    companyName: 'Nimbus Works',
    title: 'Junior DevOps Engineer',
    description:
      'Nimbus Works is looking for a Junior DevOps Engineer to support our platform team in improving deployment reliability. You will help maintain CI/CD pipelines, assist with basic infrastructure changes under supervision, and learn our monitoring stack. Some exposure to Linux, Docker, and scripting is expected, but deep DevOps experience is not required. We are looking for someone curious and eager to build a career in infrastructure.',
    location: 'Prague, Czech Republic',
    remoteType: 'hybrid',
    experienceLevel: 'Junior',
    skills: ['Docker', 'Linux', 'CI/CD'],
    source: 'seed',
  },
  {
    companyName: 'Delta Metrics',
    title: 'Junior Data Engineer',
    description:
      'Delta Metrics is hiring a Junior Data Engineer to help maintain our analytics pipelines feeding internal dashboards. You will write SQL transformations, assist with data quality checks, and learn to build ETL jobs under the guidance of a senior data engineer. Comfort with SQL and basic Python scripting is expected. This is a good opportunity for someone early in their data career looking to specialize in engineering rather than analysis.',
    location: 'Rotterdam, Netherlands',
    experienceLevel: 'Junior',
    skills: ['SQL', 'Python', 'ETL'],
    source: 'seed',
  },
  {
    companyName: 'Skyline Apps',
    title: 'Mobile Developer (React Native)',
    description:
      'Skyline Apps builds a cross-platform travel companion app, and we need a Mobile Developer to maintain and extend our React Native codebase. You will implement new features shared across iOS and Android, work with native modules when needed, and help improve our app\'s startup performance. Solid experience with React Native and mobile app release processes is required. You will work closely with our two backend engineers to define API contracts.',
    location: 'Vienna, Austria',
    remoteType: 'hybrid',
    experienceLevel: 'Mid',
    salaryMin: 48000,
    salaryMax: 62000,
    currency: 'EUR',
    skills: ['React Native', 'TypeScript', 'iOS', 'Android'],
    source: 'seed',
  },
  {
    companyName: 'Northlight Studio',
    title: 'Backend Developer',
    description:
      'Northlight Studio is looking for a Backend Developer to work on the platform powering our subscription-based publishing tools. You will build and maintain APIs in Ruby on Rails, write database migrations, and collaborate with a small product team to prioritize technical work. Practical experience with Rails and relational databases is required. We are a small team, so you will have significant ownership over the features you build.',
    location: 'Copenhagen, Denmark',
    remoteType: 'onsite',
    experienceLevel: 'Mid',
    skills: ['Ruby on Rails', 'PostgreSQL', 'Sidekiq'],
    source: 'seed',
  },
  {
    companyName: 'Alpine Softworks',
    title: 'Senior Frontend Engineer',
    description:
      'Alpine Softworks is hiring a Senior Frontend Engineer to lead the frontend for our enterprise resource planning product built in Angular. You will make architectural decisions for a large, long-lived codebase, mentor two mid-level engineers, and work directly with enterprise customers on complex UI requirements. Deep experience with Angular and large-scale application state management is required. Experience in regulated industries such as finance or healthcare is a plus.',
    location: 'Zurich, Switzerland',
    remoteType: 'hybrid',
    experienceLevel: 'Senior',
    salaryMin: 95000,
    salaryMax: 120000,
    currency: 'CHF',
    visaSponsorship: true,
    skills: ['Angular', 'TypeScript', 'RxJS'],
    source: 'seed',
  },
  {
    companyName: 'Granite Cloud',
    title: 'Senior Site Reliability Engineer',
    description:
      'Granite Cloud is looking for a Senior Site Reliability Engineer to improve the reliability of our multi-tenant SaaS platform. You will define SLOs, build automation to reduce toil, and lead incident response for critical outages. Strong experience with cloud infrastructure, observability tooling, and on-call leadership is required. You will work closely with engineering managers across multiple teams to align on reliability priorities.',
    location: 'Berlin, Germany',
    remoteType: 'remote',
    experienceLevel: 'Senior',
    skills: ['Kubernetes', 'AWS', 'Prometheus', 'Terraform'],
    source: 'seed',
  },
  {
    companyName: 'Riverstone Data',
    title: 'Senior Data Engineer',
    description:
      'Riverstone Data is hiring a Senior Data Engineer to lead the design of our real-time streaming infrastructure. You will architect pipelines using Spark and Kafka, set standards for data quality across the organization, and mentor a small team of data engineers. Deep experience with distributed data processing and event-driven architectures is required. You will also work directly with data science teams to ensure pipelines meet their needs.',
    location: 'Amsterdam, Netherlands',
    remoteType: 'hybrid',
    experienceLevel: 'Senior',
    salaryMin: 78000,
    salaryMax: 98000,
    currency: 'EUR',
    skills: ['Spark', 'Kafka', 'Python', 'SQL'],
    source: 'seed',
  },
];

async function login(): Promise<string> {
  if (!SEED_EMAIL || !SEED_PASSWORD) {
    throw new Error(
      'SEED_EMAIL ve SEED_PASSWORD ortam değişkenleri tanımlı değil. POST /jobs JwtAuthGuard ile korunuyor, bu yüzden giriş bilgisi olmadan devam edilemez.',
    );
  }

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: SEED_EMAIL, password: SEED_PASSWORD }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Giriş başarısız (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { accessToken?: string };

  if (!data.accessToken) {
    throw new Error('Giriş yanıtında accessToken bulunamadı.');
  }

  return data.accessToken;
}

async function createJob(job: SeedJob, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(job),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${body}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// GET /jobs korumasız (bkz. src/jobs/jobs.controller.ts), token gerekmiyor.
// Job.embedding Prisma şemasında Unsupported("vector(1024)") olarak tanımlı
// (bkz. prisma/schema.prisma); Prisma Client Unsupported alanları hiç expose etmez,
// bu yüzden GET /jobs yanıtında "embedding" alanı muhtemelen hiç bulunmaz.
// Yine de bunu koddan varsaymak yerine yanıtta gerçekten kontrol ediyoruz.
async function reportEmbeddingStatus(): Promise<void> {
  console.log('30 saniye bekleniyor (embedding kuyruğunun işlemesi için)...');
  await sleep(30000);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/jobs`);
  } catch (error) {
    console.log(
      `GET /jobs çağrılamadı, embedding durumu kontrol edilemedi: ${(error as Error).message}`,
    );
    return;
  }

  if (!response.ok) {
    console.log(
      `GET /jobs başarısız (${response.status}), embedding durumu kontrol edilemedi.`,
    );
    return;
  }

  const data = (await response.json()) as Array<Record<string, unknown>>;
  const seeded = data.filter((job) => job.source === 'seed');

  if (seeded.length === 0) {
    console.log(
      'GET /jobs yanıtında "seed" kaynaklı ilan bulunamadı, embedding durumu kontrol edilemedi.',
    );
    return;
  }

  const hasEmbeddingField = seeded.some((job) =>
    Object.prototype.hasOwnProperty.call(job, 'embedding'),
  );

  if (!hasEmbeddingField) {
    console.log(
      `GET /jobs yanıtı embedding alanını döndürmüyor, embedding durumu API'den görülemiyor. Toplam ilan sayısı: ${seeded.length}.`,
    );
    return;
  }

  const filled = seeded.filter((job) => job.embedding != null).length;
  console.log(
    `Embedding durumu: ${filled}/${seeded.length} ilanın embedding'i dolu.`,
  );
}

async function main() {
  console.log(`Seed hedefi: ${API_URL}`);
  console.log(`Toplam ${jobs.length} ilan oluşturulacak.\n`);

  let token: string;
  try {
    token = await login();
    console.log('Giriş başarılı, JWT alındı.\n');
  } catch (error) {
    console.error(`Giriş adımı başarısız oldu, işlem durduruldu: ${(error as Error).message}`);
    process.exitCode = 1;
    return;
  }

  let succeeded = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      await createJob(job, token);
      succeeded++;
      console.log(`OK   ${job.companyName} — ${job.title}`);
    } catch (error) {
      failed++;
      console.log(
        `FAIL ${job.companyName} — ${job.title}: ${(error as Error).message}`,
      );
    }
    // OpenRouter'ın ücretsiz katmanındaki rate limit'e takılmamak için
    // her istekten sonra bekle (embedding kuyruğu bu isteği hemen işlemeye başlıyor).
    await sleep(800);
  }

  console.log('');
  console.log(
    `Özet: toplam ${jobs.length}, başarılı ${succeeded}, başarısız ${failed}.`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }

  await reportEmbeddingStatus();
}

main();
