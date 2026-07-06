import { Job, SalaryInsight, UserProfile } from './types';

export function getCompanyLogo(companyName: string): string {
  const name = companyName.toLowerCase().trim();
  switch (name) {
    case 'google':
      return '/assets/logos/software_companies/google.png';
    case 'microsoft':
      return '/assets/logos/software_companies/microsoft.png';
    case 'apple':
      return '/assets/logos/software_companies/apple.png';
    case 'adobe':
      return '/assets/logos/software_companies/adobe.png';
    case 'meta':
      return '/assets/logos/software_companies/meta.png';
    case 'ibm':
      return '/assets/logos/software_companies/ibm.png';
    case 'oracle':
      return '/assets/logos/software_companies/oracle.png';
    case 'salesforce':
      return '/assets/logos/software_companies/salesforce.png';
    case 'nvidia':
      return '/assets/logos/software_companies/nvidia.png';
    case 'sap':
      return '/assets/logos/software_companies/sap.png';
    case 'notion':
      return 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg';
    case 'stripe':
      return 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg';
    case 'airbnb':
      return 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg';
    case 'zomato':
      return 'https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png';
    case 'flipkart':
      return 'https://img.icons8.com/color/48/flipkart.png';
    case 'figma':
      return 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg';
    case 'vercel':
      return 'https://assets.vercel.com/image/upload/q_auto/front/favicon/vercel/180x180.png';
    case 'swiggy':
      return 'https://img.icons8.com/color/48/swiggy.png';
    case 'cred':
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/CRED_logo.svg/256px-CRED_logo.svg.png';
    case 'razorpay':
      return 'https://img.icons8.com/color/48/razorpay.png';
    case 'canva':
      return 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_logo.svg';
    case 'linkedin':
      return '/assets/logos/job_websites/linkedin.png';
    case 'amazon':
      return 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg';
    case 'samsung':
      return 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg';
    case 'paypal':
      return 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg';
    case 'cisco':
      return 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg';
    default:
      return `https://www.google.com/s2/favicons?sz=128&domain=${name.replace(/\s+/g, '')}.com`;
  }
}

export function getCompanyApplyUrl(companyName: string, jobTitle: string): string {
  const name = companyName.toLowerCase().trim();
  const q = encodeURIComponent(`${jobTitle} ${companyName}`);
  switch (name) {
    case 'google':
      return `https://www.google.com/about/careers/applications/jobs/results/?q=${encodeURIComponent(jobTitle)}`;
    case 'microsoft':
      return `https://careers.microsoft.com/us/en/search-results?keywords=${encodeURIComponent(jobTitle)}`;
    case 'stripe':
      return `https://stripe.com/jobs/search?q=${encodeURIComponent(jobTitle)}`;
    case 'notion':
      return `https://www.notion.so/careers`;
    case 'figma':
      return `https://www.figma.com/careers/`;
    default:
      // LinkedIn / Indeed / standard redirection
      return `https://www.linkedin.com/jobs/search/?keywords=${q}`;
  }
}

const RAW_INITIAL_JOBS: Job[] = [
  {
    id: 'google-sse',
    title: 'Senior Software Engineer',
    company: 'Google',
    logoUrl: getCompanyLogo('Google'),
    location: 'Bangalore, India',
    workType: 'Remote',
    jobType: 'Full-time',
    salaryRange: '₹18L – ₹32L PA',
    experienceRequired: '3 – 5 Yrs',
    postedTime: '2h ago',
    skills: ['Python', 'System Design', 'React', 'AWS', 'Docker', 'Kubernetes'],
    description: 'We are looking for a Senior Software Engineer to join our core team and build scalable, reliable, and efficient software solutions that impact billions of people worldwide. In this role, you will design, develop, and deploy major features, lead structural architecture initiatives, and mentor junior engineers.',
    companyAbout: "Google's mission is to organize the world's information and make it universally accessible and useful. We build products and platforms that help billions of users every day, spanning Search, Maps, Gmail, YouTube, and Cloud Infrastructure.",
    requirements: [
      'Bachelor’s or Master’s degree in Computer Science, or equivalent practical experience.',
      '3+ years of professional software development experience in backend, frontend, or full-stack domains.',
      'Strong proficiency with modern programming languages such as Python, Go, Java, or TypeScript/JavaScript.',
      'Solid experience with frontend frameworks like React or Angular, and backend cloud systems (AWS, GCP, or Azure).',
      'Demonstrated expertise in containerized environments (Docker, Kubernetes) and microservices architecture.'
    ],
    benefits: [
      'Comprehensive medical, dental, and vision insurance with 100% premium coverage.',
      'Generous retirement savings matches and equity options (RSUs).',
      'Flexible remote work setups with home-office stipends.',
      'Complimentary chef-prepared meals, snacks, and onsite wellness programs.',
      'Dedicated learning budgets and tuition reimbursement plans.'
    ],
    aiMatchPercent: 96,
    category: 'Experienced'
  },
  {
    id: 'microsoft-pd',
    title: 'Product Designer',
    company: 'Microsoft',
    logoUrl: getCompanyLogo('Microsoft'),
    location: 'Hyderabad, India',
    workType: 'Hybrid',
    jobType: 'Full-time',
    salaryRange: '₹20L – ₹35L PA',
    experienceRequired: '2 – 4 Yrs',
    postedTime: '4h ago',
    skills: ['Figma', 'UI/UX', 'User Research', 'Design Systems', 'Prototyping'],
    description: 'We are seeking a talented Product Designer to craft intuitive and visually arresting experiences for our cloud collaboration suite. You will work closely with product managers, researchers, and engineers to translate complex user problems into elegant interfaces and smooth interactions.',
    companyAbout: 'Microsoft enables digital transformation for the era of an intelligent cloud and an intelligent edge. Our mission is to empower every person and every organization on the planet to achieve more.',
    requirements: [
      '2+ years of experience as a product designer, UI/UX designer, or similar role with a strong design portfolio.',
      'Mastery of industry-standard design tools, primarily Figma and Adobe Creative Suite.',
      'Experience building and maintaining robust, scalable Design Systems.',
      'Ability to create high-fidelity interactive prototypes to validate design ideas with stakeholders and users.',
      'Basic understanding of web technologies (HTML, CSS, JS) to communicate effectively with engineering teams.'
    ],
    benefits: [
      'Highly competitive salary with performance bonuses and stock grants.',
      'Extensive health, life, and disability insurance options.',
      'Flexible working hours and work-from-home options.',
      'Subsidized membership for gyms, sports clubs, or fitness apps.',
      'Annual paid time off (25 days) plus public holidays and volunteer days.'
    ],
    aiMatchPercent: 92,
    category: 'Experienced'
  },
  {
    id: 'notion-ffe',
    title: 'Founding Frontend Engineer',
    company: 'Notion',
    logoUrl: getCompanyLogo('Notion'),
    location: 'Remote',
    workType: 'Remote',
    jobType: 'Full-time',
    salaryRange: '₹1.2Cr – ₹1.8Cr PA',
    experienceRequired: '4 – 7 Yrs',
    postedTime: '6h ago',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Webpack'],
    description: 'As a Founding Frontend Engineer, you will shape the future of our web workspace client. You will be responsible for defining the frontend developer patterns, engineering rich collaborative text-editing interfaces, and optimizing client-side performance for real-time document sync.',
    companyAbout: 'Notion is a single space where you can think, write, and plan. Capture thoughts, manage projects, or even run an entire company — and customize it exactly how you want.',
    requirements: [
      '4+ years of software development experience specializing in rich interactive frontend systems.',
      'Deep expertise in React, TypeScript, and state management architectures.',
      'Experience optimizing rendering performance and network latency for highly interactive canvas or editor applications.',
      'Passion for visual polish, animation, micro-interactions, and pixel-perfect responsive execution.',
      'Familiarity with modern bundlers (Webpack, Vite, Esbuild) and CSS frameworks like Tailwind CSS.'
    ],
    benefits: [
      'Top-tier salary matching Silicon Valley standards with massive early-stage equity grants.',
      'Unlimited Paid Time Off (PTO) with a mandatory 3-week minimum per year.',
      'Full health, dental, vision, and mental health benefits.',
      'Annual $3,000 work-from-home setup and learning stipend.',
      'Bi-annual company retreats to beautiful global destinations.'
    ],
    aiMatchPercent: 90,
    category: 'Experienced'
  },
  {
    id: 'stripe-be',
    title: 'Backend Engineer',
    company: 'Stripe',
    logoUrl: getCompanyLogo('Stripe'),
    location: 'Bangalore, India',
    workType: 'Hybrid',
    jobType: 'Full-time',
    salaryRange: '₹16L – ₹28L PA',
    experienceRequired: '2 – 5 Yrs',
    postedTime: '8h ago',
    skills: ['Go', 'PostgreSQL', 'Kafka', 'AWS', 'Ruby', 'Redis'],
    description: 'We are looking for backend engineers to design, build, and run the global financial infrastructure that processes hundreds of billions of dollars annually. You will build secure APIs, write highly performant ledger systems, and ensure system uptime during peak transactional surges.',
    companyAbout: 'Stripe is a financial infrastructure platform for the internet. Millions of businesses — from the world’s largest enterprises to ambitious startups — use Stripe to accept payments, grow their revenue, and accelerate new business opportunities.',
    requirements: [
      '2+ years of professional backend engineering experience writing production-grade microservices.',
      'Proficiency in languages such as Go, Ruby on Rails, Java, or C++.',
      'Strong database design skills using relational databases (PostgreSQL, MySQL) and cache systems (Redis).',
      'Familiarity with distributed message queues like Apache Kafka or RabbitMQ.',
      'Exceptional focus on code quality, automated testing, API documentation, and security principles.'
    ],
    benefits: [
      'Competitive compensation package with structured cash and equity incentive programs.',
      'Comprehensive global health insurance plan for employee and dependents.',
      'Generous parental leave policies and family care benefits.',
      'Work station setup support with high-end hardware of choice.',
      'Wellness and fitness allowances.'
    ],
    aiMatchPercent: 88,
    category: 'Experienced'
  },
  {
    id: 'airbnb-da',
    title: 'Data Analyst',
    company: 'Airbnb',
    logoUrl: getCompanyLogo('Airbnb'),
    location: 'Gurugram, India',
    workType: 'Remote',
    jobType: 'Full-time',
    salaryRange: '₹12L – ₹20L PA',
    experienceRequired: '1 – 3 Yrs',
    postedTime: '10h ago',
    skills: ['SQL', 'Python', 'Tableau', 'Excel', 'Statistics', 'R'],
    description: 'We are searching for a Data Analyst to join our regional growth team. You will leverage data to uncover insights about travel behaviors, host engagement, and platform retention, crafting dashboards and conveying key trends to drive product strategy.',
    companyAbout: 'Airbnb operates an online marketplace for lodging, primarily homestays for vacation rentals, and tourism activities. Based in San Francisco, California, the platform is accessible via website and mobile app.',
    requirements: [
      '1+ years of experience conducting quantitative data analysis and extracting actionable insights.',
      'Advanced SQL skills to query, clean, and aggregate huge databases.',
      'Proficiency with data visualization tools, specifically Tableau, PowerBI, or Superset.',
      'Experience writing Python scripts for basic data manipulation and analysis using pandas/numpy.',
      'Strong verbal and written communication skills to deliver complex technical insights to non-technical stakeholders.'
    ],
    benefits: [
      'Market-competitive salary and regular bonuses.',
      'Annual travel credits ($2,000) to stay at any Airbnb globally.',
      'Health, travel, and personal accident insurance.',
      'Flexible home office options with high-quality device setups.',
      'Wellness reimbursement program for sports, yoga, or wellness products.'
    ],
    aiMatchPercent: 85,
    category: 'Experienced'
  },
  {
    id: 'zomato-devops',
    title: 'DevOps Engineer',
    company: 'Zomato',
    logoUrl: getCompanyLogo('Zomato'),
    location: 'Gurugram, India',
    workType: 'Hybrid',
    jobType: 'Full-time',
    salaryRange: '₹15L – ₹26L PA',
    experienceRequired: '3 – 5 Yrs',
    postedTime: '12h ago',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Docker', 'Linux'],
    description: 'Help us scale our food delivery network infrastructure. You will manage high-availability clusters, write robust infrastructure-as-code files, and automate rapid CI/CD build steps to keep our services fast, resilient, and secure.',
    companyAbout: 'Zomato is a leading global technology platform connecting customers, restaurant partners, and delivery partners. We fulfill millions of food delivery orders daily with extreme precision and speed.',
    requirements: [
      '3+ years of experience in DevOps, Site Reliability, or Infrastructure Engineering.',
      'Extensive hands-on experience managing Kubernetes clusters in AWS or GCP.',
      'Expertise writing Infrastructure as Code using Terraform or CloudFormation.',
      'Proficiency setting up CI/CD workflows using Jenkins, GitHub Actions, or GitLab CI.',
      'Strong Linux shell scripting and debugging skills.'
    ],
    benefits: [
      'Competitive cash salary, stock options, and health insurance.',
      'Flexible workspace setups and work-from-home options.',
      'Free meals at the office and discount vouchers for food delivery.',
      'Exciting growth paths in a high-paced technology startup.',
      'Regular team building outings and hackathons.'
    ],
    aiMatchPercent: 78,
    category: 'Experienced'
  },
  {
    id: 'flipkart-mobile',
    title: 'Mobile Engineer (React Native)',
    company: 'Flipkart',
    logoUrl: getCompanyLogo('Flipkart'),
    location: 'Bangalore, India',
    workType: 'On-site',
    jobType: 'Full-time',
    salaryRange: '₹18L – ₹30L PA',
    experienceRequired: '3 – 6 Yrs',
    postedTime: '1d ago',
    skills: ['React Native', 'TypeScript', 'iOS', 'Android', 'Redux', 'API Integration'],
    description: 'Join our mobile product division and craft high-performance shopping experiences used by over 100 million customers. You will design, build, and optimize core modules of our React Native app, focusing on memory footprint, smooth animations, and offline usability.',
    companyAbout: 'Flipkart is India’s leading e-commerce marketplace, offering over 150 million products across 80+ categories, driving digital retail innovation at national scale.',
    requirements: [
      '3+ years of professional software engineering experience with at least 2 years focused on React Native.',
      'Deep understanding of TypeScript, React hooks, and native bridge APIs.',
      'Experience optimizing app size, startup time, and scrolling performance for mid-to-low end Android devices.',
      'Familiarity with publishing pipelines on Google Play Store and Apple App Store.',
      'Strong grasp of state management tools like Redux Toolkit, MobX, or Recoil.'
    ],
    benefits: [
      'Lucrative basic compensation package with yearly performance bonus schemes.',
      'Comprehensive family medical coverage with optional top-up programs.',
      'Subsidized corporate transport and modern office facilities.',
      'In-house learning modules, leadership training, and certifications.',
      'Active sports, hobby clubs, and recreational rooms.'
    ],
    aiMatchPercent: 82,
    category: 'Experienced'
  },
  // STUDENTS CATEGORY (Internships)
  {
    id: 'meta-intern',
    title: 'Software Engineering Intern',
    company: 'Meta',
    logoUrl: getCompanyLogo('Meta'),
    location: 'Remote',
    workType: 'Remote',
    jobType: 'Internship',
    salaryRange: '₹55,000 / month',
    experienceRequired: '0 Yrs',
    postedTime: '1d ago',
    skills: ['React', 'JavaScript', 'HTML/CSS', 'Git'],
    description: 'We are seeking passionate student developers to join our engineering teams for a 6-month internship program. You will collaborate on core features, learn engineering best practices, and contribute directly to products reaching billions of people.',
    companyAbout: 'Meta builds technologies that help people connect, find communities, and grow businesses. Our focus is on bringing the metaverse to life and helping people connect in new and immersive ways.',
    requirements: [
      'Currently pursuing a Bachelor’s or Master’s in Computer Science or a related technical field.',
      'Strong foundations in computer science theory, algorithms, and data structures.',
      'Practical coding project experience in JavaScript, Python, C++, or Java.',
      'Familiarity with git, version control, and web standards.'
    ],
    benefits: [
      'Paid competitive monthly stipend.',
      'Mentorship from senior software engineers.',
      'Virtual wellness and developer community networking events.',
      'Potential return offer for a full-time Graduate Role.'
    ],
    aiMatchPercent: 94,
    category: 'Students'
  },
  {
    id: 'figma-intern',
    title: 'UI/UX Design Intern',
    company: 'Figma',
    logoUrl: getCompanyLogo('Figma'),
    location: 'Remote',
    workType: 'Remote',
    jobType: 'Internship',
    salaryRange: '₹50,000 / month',
    experienceRequired: '0 Yrs',
    postedTime: '2d ago',
    skills: ['Figma', 'Prototyping', 'User Research', 'Visual Design'],
    description: 'Help shape the future of design tools. As a Design Intern at Figma, you will work closely with product designers, researchers, and writers to explore new user flows, build visual assets, and iterate on core designer patterns.',
    companyAbout: 'Figma is a collaborative web application for interface design, with additional offline features enabled by desktop applications for macOS and Windows.',
    requirements: [
      'Currently enrolled in a design program (HCI, Graphic Design, Product Design) or self-taught with a outstanding portfolio.',
      'Proficiency in Figma and interactive prototyping methods.',
      'Empathy for design processes, developer handoffs, and UI patterns.',
      'Strong visual storytelling skills and design rationale.'
    ],
    benefits: [
      'Competitive monthly stipend and hardware setup.',
      'Direct collaboration with Figma product leadership.',
      'Learning workshops on design systems and typography.',
      'Access to Figma internal design communities.'
    ],
    aiMatchPercent: 88,
    category: 'Students'
  },
  {
    id: 'airbnb-intern',
    title: 'Product Marketing Intern',
    company: 'Airbnb',
    logoUrl: getCompanyLogo('Airbnb'),
    location: 'Hybrid',
    workType: 'Hybrid',
    jobType: 'Internship',
    salaryRange: '₹40,000 / month',
    experienceRequired: '0 Yrs',
    postedTime: '3d ago',
    skills: ['Communication', 'Data Analysis', 'Marketing Strategy', 'Excel'],
    description: 'We are looking for a Product Marketing Intern to support launch strategies, local market research, and copy execution. You will gain hands-on experience working across product management, creative teams, and regional campaigns.',
    companyAbout: 'Airbnb operates a global marketplace for unique stays and experiences. We empower travelers and hosts, creating a world where anyone can belong anywhere.',
    requirements: [
      'Currently enrolled in a Business, Marketing, Communications, or related degree.',
      'Exceptional written and verbal communication skills.',
      'Analytically minded with experience manipulating basic data in Google Sheets/Excel.',
      'A keen passion for hospitality, community-driven platforms, and travel.'
    ],
    benefits: [
      'Competitive monthly stipend.',
      'Airbnb travel credits for unique stays.',
      'Mentorship from experienced product marketers.',
      'Collaborative, high-growth environment.'
    ],
    aiMatchPercent: 80,
    category: 'Students'
  },
  {
    id: 'vercel-intern',
    title: 'Frontend Developer Intern',
    company: 'Vercel',
    logoUrl: getCompanyLogo('Vercel'),
    location: 'Remote',
    workType: 'Remote',
    jobType: 'Internship',
    salaryRange: '₹65,000 / month',
    experienceRequired: '0 Yrs',
    postedTime: '4d ago',
    skills: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript'],
    description: 'Vercel is looking for a Frontend Developer Intern to join our web team. You will work on expanding developer templates, optimizing documentation UX, and contributing to open-source Next.js examples.',
    companyAbout: 'Vercel provides the developer platform and hosting services to deploy instant, collaborative, and highly-performant frontend applications.',
    requirements: [
      'Active student developer with projects demonstrating strong proficiency in React and Next.js.',
      'Solid command of TypeScript and CSS/Tailwind CSS styling methodologies.',
      'Understanding of modern web performance metrics (Core Web Vitals).',
      'Active contributor to open-source or personal Github repositories.'
    ],
    benefits: [
      'Generous internship stipend.',
      'All-remote equipment allowance (stipend for desk, chair, monitor).',
      'Direct contact with the Next.js core development group.',
      'Flexible study-friendly hours.'
    ],
    aiMatchPercent: 91,
    category: 'Students'
  },
  // FRESHERS CATEGORY (Entry-Level 0-1 Yrs)
  {
    id: 'swiggy-assoc',
    title: 'Associate Frontend Developer',
    company: 'Swiggy',
    logoUrl: getCompanyLogo('Swiggy'),
    location: 'Bangalore, India',
    workType: 'On-site',
    jobType: 'Full-time',
    salaryRange: '₹6L – ₹10L PA',
    experienceRequired: '0 – 1 Yrs',
    postedTime: '1d ago',
    skills: ['JavaScript', 'React', 'CSS', 'HTML', 'Tailwind CSS'],
    description: 'Kickstart your career with our web applications division. As an Associate Frontend Developer, you will help write accessible, modular CSS components, integrate server API routes, and build responsive checkout screens.',
    companyAbout: 'Swiggy is India’s leading on-demand convenience platform, delivering food, groceries, and essential household items to millions of users daily.',
    requirements: [
      'Fresh graduate or self-taught developer with 0-1 years of experience.',
      'Sound knowledge of ES6+ JavaScript, DOM manipulation, and React component state.',
      'Strong attention to visual detail, responsive layouts, and cross-browser styling.',
      'Eagerness to learn in a highly-dynamic, fast-scaling engineering environment.'
    ],
    benefits: [
      'Competitive base pay with employee stock option options (ESOPs).',
      'Comprehensive medical insurance.',
      'Complimentary office breakfast, meals, and snacks.',
      'Regular developer training and bootcamp programs.'
    ],
    aiMatchPercent: 86,
    category: 'Freshers'
  },
  {
    id: 'flipkart-qa',
    title: 'Junior QA Engineer',
    company: 'Flipkart',
    logoUrl: getCompanyLogo('Flipkart'),
    location: 'Bangalore, India',
    workType: 'On-site',
    jobType: 'Full-time',
    salaryRange: '₹5L – ₹8L PA',
    experienceRequired: '0 – 1 Yrs',
    postedTime: '2d ago',
    skills: ['Manual Testing', 'Selenium', 'Java', 'SQL', 'Bug Tracking'],
    description: 'Ensure the quality and reliability of Flipkart’s consumer applications. You will execute functional test cases, write automated UI test scripts using Selenium and Java, and collaborate with developers to track bugs.',
    companyAbout: 'Flipkart is India’s home-grown e-commerce marketplace, scaling digital commerce, payments, and supply chain networks across the nation.',
    requirements: [
      'B.E. / B.Tech / MCA in Computer Science or related fields (recent graduate).',
      'Understanding of software testing concepts, STLC, and test plan creation.',
      'Basic programming skills in Java or Python and basic relational database SQL queries.',
      'Analytical thinking and eye for edge cases.'
    ],
    benefits: [
      'Competitive salary and yearly incentives.',
      'Corporate transport facilities.',
      'Generous medical benefits for parents and dependents.',
      'Active tech communities and training support.'
    ],
    aiMatchPercent: 77,
    category: 'Freshers'
  },
  {
    id: 'cred-support',
    title: 'Tech Support Associate',
    company: 'CRED',
    logoUrl: getCompanyLogo('CRED'),
    location: 'Bangalore, India',
    workType: 'On-site',
    jobType: 'Full-time',
    salaryRange: '₹4L – ₹7L PA',
    experienceRequired: '0 – 1 Yrs',
    postedTime: '3d ago',
    skills: ['Troubleshooting', 'SQL', 'Customer Service', 'Linux Command Line'],
    description: 'Join the backend customer reliability team at CRED. In this role, you will assist in debugging transaction queries, monitoring API webhook alerts, and resolving merchant setup issues.',
    companyAbout: 'CRED is a members-only platform that rewards users for paying credit card bills on time, offering premium lifestyle perks and curated finance products.',
    requirements: [
      'Undergraduate degree with 0-1 years of experience in technical support, customer care, or IT operations.',
      'Basic database query capabilities (SQL select statements, joins).',
      'Knowledge of web architecture (APIs, HTTP response status codes).',
      'Excellent verbal and written communication.'
    ],
    benefits: [
      'Competitive market compensation.',
      'Gourmet meals and premium lounge-style workspaces.',
      'Well-funded wellness allowances.',
      'Great collaborative team culture.'
    ],
    aiMatchPercent: 72,
    category: 'Freshers'
  },
  {
    id: 'razorpay-analyst',
    title: 'Junior Operations Analyst',
    company: 'Razorpay',
    logoUrl: getCompanyLogo('Razorpay'),
    location: 'Bangalore, India',
    workType: 'Hybrid',
    jobType: 'Full-time',
    salaryRange: '₹5L – ₹8L PA',
    experienceRequired: '0 – 1 Yrs',
    postedTime: '4d ago',
    skills: ['Excel', 'SQL', 'Data Analytics', 'Reporting'],
    description: 'Razorpay is hiring a Junior Operations Analyst to monitor merchant onboarding workflows, review compliance verification documents, and build regular Excel data aggregates for operations teams.',
    companyAbout: 'Razorpay is India’s leading payments solutions company, helping businesses accept, process, and disburse digital payments with ease.',
    requirements: [
      'Bachelor’s degree in Business Administration, Science, Commerce or Engineering.',
      'Excellent proficiency with Microsoft Excel (VLOOKUP, Pivot Tables, Formulas).',
      'Basic SQL capabilities to query operations databases.',
      'Strong organizational skills and detail-oriented focus.'
    ],
    benefits: [
      'Competitive entry-level salary.',
      'Top-tier health insurance cover.',
      'Hybrid work flexibility.',
      'Weekly learning sessions and peer mentoring.'
    ],
    aiMatchPercent: 74,
    category: 'Freshers'
  },
  // GRADUATES CATEGORY (Junior roles 0-2 Yrs)
  {
    id: 'google-grad',
    title: 'Graduate Software Engineer',
    company: 'Google',
    logoUrl: getCompanyLogo('Google'),
    location: 'Bangalore, India',
    workType: 'On-site',
    jobType: 'Full-time',
    salaryRange: '₹12L – ₹18L PA',
    experienceRequired: '0 – 2 Yrs',
    postedTime: '1d ago',
    skills: ['Python', 'C++', 'Algorithms', 'Data Structures'],
    description: 'Explore our early career engineering track. As a Graduate Software Engineer, you will undergo structured rotation training across our core infrastructure, Google Cloud, and Search tooling, working on live user impact.',
    companyAbout: "Google's mission is to organize the world's information and make it universally accessible and useful.",
    requirements: [
      'Recent graduate (within past 24 months) in Computer Science, engineering, or related field.',
      'Excellent command of algorithms, complexity analysis, and object-oriented design.',
      'Programming capability in Java, C++, Python, or Go.',
      'Strong communication and collaborative capabilities.'
    ],
    benefits: [
      'Highly competitive base compensation with annual stock grant programs.',
      'Free gourmet food, on-site gym, and sleep pods.',
      'Comprehensive international relocation and setup assistance.',
      'Global network of engineers and career mentors.'
    ],
    aiMatchPercent: 93,
    category: 'Graduates'
  },
  {
    id: 'microsoft-grad',
    title: 'Associate Product Manager',
    company: 'Microsoft',
    logoUrl: getCompanyLogo('Microsoft'),
    location: 'Hyderabad, India',
    workType: 'Hybrid',
    jobType: 'Full-time',
    salaryRange: '₹15L – ₹22L PA',
    experienceRequired: '0 – 2 Yrs',
    postedTime: '2d ago',
    skills: ['Product Management', 'Data Analysis', 'Wireframing', 'Agile'],
    description: 'We are seeking recent graduates to join our Associate Product Manager (APM) program. You will lead cross-functional feature planning, write specification briefs, analyze customer telemetry, and define roadmap priorities.',
    companyAbout: 'Microsoft enables digital transformation for the era of intelligent cloud and intelligent edge.',
    requirements: [
      'Recent graduate in Computer Science, Business, design, or related disciplines.',
      'Demonstrated leadership qualities (student groups, hackathons, startup projects).',
      'Strong analytical capabilities to extract customer patterns from metrics.',
      'Empathetic design-focused mind with superb presentation skills.'
    ],
    benefits: [
      'Excellent starter base salary with structured stock bonuses.',
      'Access to Hyderabad campus workspace amenities.',
      'Dedicated mentoring from Microsoft Director of Product.',
      'Global APM cohort retreats.'
    ],
    aiMatchPercent: 89,
    category: 'Graduates'
  },
  {
    id: 'stripe-grad',
    title: 'Junior Backend Engineer',
    company: 'Stripe',
    logoUrl: getCompanyLogo('Stripe'),
    location: 'Bangalore, India',
    workType: 'Hybrid',
    jobType: 'Full-time',
    salaryRange: '₹14L – ₹20L PA',
    experienceRequired: '0 – 2 Yrs',
    postedTime: '3d ago',
    skills: ['Ruby', 'SQL', 'APIs', 'Git', 'Java'],
    description: 'Stripe is looking for junior backend developers to join our transaction flows team. You will write backend integrations, help refactor old database schemas, write comprehensive unit tests, and improve API reliability.',
    companyAbout: 'Stripe is a financial infrastructure platform for the internet, enabling payments and commerce globally.',
    requirements: [
      '0-2 years of software engineering experience (personal projects and internships count).',
      'Familiarity with SQL relational databases and core OOP principles.',
      'Basic understanding of RESTful API request/response structures.',
      'Commitment to writing clean, well-tested code.'
    ],
    benefits: [
      'Top-tier starting compensation with RSUs.',
      'Comprehensive corporate health benefits.',
      'Equipment allowances for home offices.',
      'Regular team hackathons and social gatherings.'
    ],
    aiMatchPercent: 87,
    category: 'Graduates'
  },
  {
    id: 'canva-grad',
    title: 'Junior UI/UX Designer',
    company: 'Canva',
    logoUrl: getCompanyLogo('Canva'),
    location: 'Remote',
    workType: 'Remote',
    jobType: 'Full-time',
    salaryRange: '₹8L – ₹12L PA',
    experienceRequired: '0 – 2 Yrs',
    postedTime: '4d ago',
    skills: ['Figma', 'UI Design', 'Design Systems', 'Typography'],
    description: 'Create beautiful layouts that empower the world to design. As a Junior UI/UX Designer at Canva, you will assist in creating starter template guidelines, refining dashboard menus, and testing customer ease-of-use.',
    companyAbout: 'Canva makes design accessible for everyone, with web and mobile publishing tools catering to millions of teams and businesses.',
    requirements: [
      '0-2 years of design experience (academic projects, internships, or freelance portfolio).',
      'High proficiency in Figma design files and layout spacing.',
      'Familiarity with atomic design systems and interactive prototypes.',
      'A great visual aesthetic showing clean margins, typography, and contrast.'
    ],
    benefits: [
      'Highly competitive base compensation.',
      'Fully remote team benefits and learning budget.',
      'Generous gym and wellness subscription offsets.',
      'Annual company retreats and fun collaboration zones.'
    ],
    aiMatchPercent: 81,
  }
];

export const INITIAL_JOBS: Job[] = RAW_INITIAL_JOBS.map(job => ({
  ...job,
  applyUrl: getCompanyApplyUrl(job.company, job.title)
}));

export const INITIAL_SALARY_INSIGHTS: SalaryInsight[] = [
  {
    role: 'Software Engineer',
    averageSalary: '₹16.8 LPA',
    changePercent: 12,
    changeDirection: 'up',
    skills: ['React', 'Python', 'AWS', 'SQL', 'Node.js'],
    demandLevel: 'High',
    trendData: [12, 13.2, 13.0, 14.5, 14.1, 15.6, 15.0, 16.8]
  },
  {
    role: 'Product Designer',
    averageSalary: '₹14.2 LPA',
    changePercent: 14,
    changeDirection: 'up',
    skills: ['Figma', 'UI/UX', 'Design Systems', 'User Research'],
    demandLevel: 'High',
    trendData: [9.5, 10.2, 11.5, 12.0, 12.8, 13.5, 13.0, 14.2]
  },
  {
    role: 'Data Analyst',
    averageSalary: '₹10.5 LPA',
    changePercent: 8,
    changeDirection: 'up',
    skills: ['SQL', 'Python', 'Tableau', 'Excel', 'Statistics'],
    demandLevel: 'Medium',
    trendData: [7.8, 8.2, 8.5, 9.0, 9.4, 9.8, 10.1, 10.5]
  },
  {
    role: 'DevOps Engineer',
    averageSalary: '₹18.0 LPA',
    changePercent: 18,
    changeDirection: 'up',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD'],
    demandLevel: 'High',
    trendData: [13.0, 14.2, 15.0, 15.8, 16.5, 17.2, 17.5, 18.0]
  },
  {
    role: 'Full Stack Developer',
    averageSalary: '₹15.0 LPA',
    changePercent: 10,
    changeDirection: 'up',
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
    demandLevel: 'High',
    trendData: [11.0, 11.8, 12.5, 13.0, 13.4, 14.0, 14.5, 15.0]
  }
];

export const DEFAULT_USER: UserProfile = {
  name: 'Devender Kumar',
  email: 'devender.kumar@gmail.com',
  role: 'Software Engineer',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDygoxBzgjRmZYQ4uIK-GWpjX_FRMByJYrQaV21iuO5-rVvqyFlrzVyxl_a1Vcm27q1W7sFuhkMlLVR0tTqYVJoQ_mPM9ClMRvetN0pCsTVbfoPUpak2f47mmUgJszUtvyU7xBedtbLVrFoIn914KkawqLINIJSkVz9Ued9DSm94XU2wea25YULzaNxYy7taAF-ScbG7PpLXXO0ds-Nvkdy27DQk0fsT8Ms7bQZIsO0Q25v5WbYfdSQB_bKWY4CWlCAwVzoiGXYg3RJ',
  skills: ['React', 'TypeScript', 'JavaScript', 'Python', 'CSS', 'HTML'],
  experienceYears: 4,
  desiredSalary: '₹22L PA',
  profileCompleteness: 65,
  resumeText: `DEVENDER KUMAR
Software Engineer | devender.kumar@gmail.com | +91 98765 43210

PROFESSIONAL SUMMARY
Passionate and detail-oriented Software Engineer with over 4 years of experience specializing in building responsive, component-driven web applications. Strong expert in JavaScript, TypeScript, and modern frontend environments like React and Next.js, with additional backend experience writing microservices in Python. Highly motivated to deliver clean, maintainable code and scalable systems.

TECHNICAL SKILLS
- Languages: JavaScript (ES6+), TypeScript, Python, HTML5, CSS3
- Libraries & Frameworks: React.js, Redux Toolkit, Next.js, Tailwind CSS, Express
- Dev Tools & Databases: Git, VS Code, Docker, AWS, PostgreSQL, MongoDB, Vite, Webpack

EXPERIENCE
Software Engineer | TechScale Solutions (2022 - Present)
- Architected and built high-performance enterprise dashboard interfaces in React and Tailwind CSS, reducing bundle sizes by 28% and client page load times by 1.2s.
- Authored reusable components and unified design-system guidelines for multiple internal product teams.
- Collaborated closely with Product Designers and UI developers to implement high-fidelity prototypes and fluid layout animations using Motion.

Junior Software Developer | WebCraft Technologies (2020 - 2022)
- Implemented and polished responsive web pages for international e-commerce clients.
- Integrated third-party RESTful APIs and optimized state management queries using Redux.
- Wrote robust unit and integration tests using Jest, achieving 85% coverage across major codebase repositories.

EDUCATION
Bachelor of Technology in Computer Science and Engineering
Indian Institute of Technology (IIT), Delhi (2016 - 2020)`
};
;
