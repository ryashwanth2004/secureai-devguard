export interface Course {
  id: string;
  title: string;
  instructor: string;
  description: string;
  fullDescription: string;
  price: number;
  rating: number;
  students: number;
  duration: string;
  level: string;
  category: string;
  image: string;
  topics: string[];
  prerequisites: string[];
}

export const COURSES: Course[] = [
  {
    id: '1',
    title: 'Advanced Machine Learning & Neural Systems',
    instructor: 'Dr. Sarah Chen, Ph.D.',
    description: 'Master deep learning architectures, PyTorch pipelines, and predictive modeling.',
    fullDescription: 'A rigorous hands-on introduction to modern machine learning. Covers supervised learning, deep convolutional neural networks, transformer foundations, and optimization strategies.',
    price: 89.99,
    rating: 4.9,
    students: 14230,
    duration: '32 hours',
    level: 'Intermediate',
    category: 'AI & Data Science',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&q=80',
    topics: ['Deep Learning', 'PyTorch Foundations', 'CNN Architectures', 'Model Evaluation & Loss'],
    prerequisites: ['Basic Python proficiency', 'Linear algebra basics']
  },
  {
    id: '2',
    title: 'Enterprise Full-Stack Cloud Architecture',
    instructor: 'Prof. James Miller',
    description: 'Build production-ready distributed systems with React, Node.js, and Microservices.',
    fullDescription: 'Comprehensive full-stack engineering covering architectural design patterns, state management, REST & GraphQL APIs, database optimization, and CI/CD pipelines.',
    price: 119.99,
    rating: 4.8,
    students: 21850,
    duration: '48 hours',
    level: 'Advanced',
    category: 'Software Engineering',
    image: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=600&q=80',
    topics: ['React & TypeScript', 'FastAPI & Node.js', 'PostgreSQL Scaling', 'Docker & Kubernetes'],
    prerequisites: ['HTML/CSS/JS fundamentals']
  },
  {
    id: '3',
    title: 'Offensive Security & Ethical Penetration Testing',
    instructor: 'Dr. Amanda Foster',
    description: 'Learn modern security auditing, threat hunting, and OWASP defense in depth.',
    fullDescription: 'An immersive cybersecurity course examining network vulnerabilities, web application security (OWASP Top 10), cryptographic protocols, and secure deployment pipelines.',
    price: 99.99,
    rating: 4.9,
    students: 9640,
    duration: '36 hours',
    level: 'Intermediate',
    category: 'Cybersecurity',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80',
    topics: ['Network Pentesting', 'OWASP Top 10 Analysis', 'Exploit Mitigation', 'Security Auditing'],
    prerequisites: ['Computer networking foundations']
  },
  {
    id: '4',
    title: 'Applied Big Data Analytics & Pipeline Engineering',
    instructor: 'Prof. Li Wei',
    description: 'Extract intelligence from multi-terabyte datasets using modern analytics toolsets.',
    fullDescription: 'Practical big data processing using Apache Spark, Pandas, DuckDB, and interactive visualization dashboards.',
    price: 79.99,
    rating: 4.7,
    students: 11420,
    duration: '28 hours',
    level: 'Beginner',
    category: 'AI & Data Science',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    topics: ['Pandas & NumPy', 'Apache Spark', 'Data Pipelines', 'Statistical Inference'],
    prerequisites: ['Introductory programming']
  },
  {
    id: '5',
    title: 'Cloud Infrastructure & DevSecOps Automation',
    instructor: 'Dr. Robert Park',
    description: 'Automate zero-trust cloud infrastructure deployment on AWS & Azure.',
    fullDescription: 'Master Terraform, container orchestration, automated vulnerability scanning in CI/CD, and serverless compute design.',
    price: 139.99,
    rating: 4.8,
    students: 8320,
    duration: '40 hours',
    level: 'Advanced',
    category: 'Cloud & DevOps',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80',
    topics: ['AWS Architecture', 'Terraform (IaC)', 'DevSecOps Pipelines', 'Monitoring & Prometheus'],
    prerequisites: ['Linux terminal familiarity']
  },
  {
    id: '6',
    title: 'Cross-Platform Mobile App Engineering',
    instructor: 'Prof. Emma Wilson',
    description: 'Deliver native iOS and Android experiences with React Native and Expo.',
    fullDescription: 'Build polished, fluid mobile applications featuring offline-first storage, native push notifications, biometrics, and secure app-store release automation.',
    price: 109.99,
    rating: 4.7,
    students: 13900,
    duration: '34 hours',
    level: 'Beginner',
    category: 'Software Engineering',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
    topics: ['React Native & Expo', 'Mobile UX Patterns', 'Local SQLite & Cache', 'Native Bridge APIs'],
    prerequisites: ['JavaScript fundamentals']
  }
];
