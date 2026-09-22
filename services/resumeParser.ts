import mammoth from "mammoth";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { spawn } from "child_process";

const SKILL_MAP: Record<string, string> = {
  "react.js": "React", "reactjs": "React", "react js": "React",
  "javascript": "JavaScript", "java script": "JavaScript",
  "typescript": "TypeScript", "type script": "TypeScript",
  "node.js": "Node.js", "nodejs": "Node.js", "node js": "Node.js",
  "next.js": "Next.js", "nextjs": "Next.js",
  "vue.js": "Vue.js", "vuejs": "Vue.js",
  "tailwind css": "Tailwind CSS", "tailwindcss": "Tailwind CSS", "tailwind": "Tailwind CSS",
  "aws": "AWS", "amazon web services": "AWS",
  "docker": "Docker",
  "kubernetes": "Kubernetes", "k8s": "Kubernetes",
  "git": "Git", "github": "GitHub",
  "python": "Python",
  "postgresql": "PostgreSQL", "postgres": "PostgreSQL", "pg": "PostgreSQL",
  "mongodb": "MongoDB", "mysql": "MySQL",
  "graphql": "GraphQL",
  "rest api": "REST APIs", "restful api": "REST APIs", "rest apis": "REST APIs",
  "c++": "C++", "c#": "C#", ".net": ".NET", "dotnet": ".NET",
  "redux toolkit": "Redux Toolkit", "reduxjs": "Redux Toolkit",
  "ci cd": "CI/CD", "ci/cd": "CI/CD", "cicd": "CI/CD",
  "github actions": "GitHub Actions", "gitlab ci": "GitLab CI", "jenkins": "Jenkins",
  "express js": "Express.js", "express.js": "Express.js",
  "nestjs": "NestJS", "nest.js": "NestJS",
  "fastify": "Fastify",
  "django": "Django", "django rest": "Django REST Framework", "drf": "Django REST Framework",
  "flask": "Flask", "fastapi": "FastAPI",
  "spring boot": "Spring Boot", "springboot": "Spring Boot",
  "redux": "Redux",
  "zustand": "Zustand",
  "prisma": "Prisma",
  "trpc": "tRPC",
  "graphql yoga": "GraphQL Yoga",
  "gin": "Gin", "fiber": "Fiber",
  "gcp": "GCP", "google cloud": "GCP",
  "azure": "Azure", "ms azure": "Azure",
  "firebase": "Firebase", "supabase": "Supabase",
  "redis": "Redis", "rabbitmq": "RabbitMQ", "kafka": "Kafka",
  "terraform": "Terraform", "ansible": "Ansible",
  "nginx": "Nginx",
  "linux": "Linux", "ubuntu": "Linux", "debian": "Linux", "centos": "Linux",
  "sentry": "Sentry", "datadog": "Datadog", "prometheus": "Prometheus", "grafana": "Grafana",
  "new relic": "New Relic",
  "elasticsearch": "Elasticsearch", "logstash": "Logstash", "kibana": "Kibana",
  "helm": "Helm", "argo cd": "ArgoCD",
  "jest": "Jest", "vitest": "Vitest", "cypress": "Cypress", "playwright": "Playwright",
  "selenium": "Selenium",
  "webpack": "Webpack", "vite": "Vite", "rollup": "Rollup", "esbuild": "esbuild",
  "babel": "Babel",
  "figma": "Figma", "sketch": "Sketch", "adobe xd": "Adobe XD",
  "ui ux": "UI/UX", "ui/ux": "UI/UX",
  "system design": "System Design", "software architecture": "System Architecture",
  "microservices": "Microservices",
  "agile": "Agile", "scrum": "Scrum",
  "kanban": "Kanban",
  "jira": "Jira", "confluence": "Confluence",
  "notion": "Notion",
  "slack": "Slack",
  "kotlin": "Kotlin", "swift": "Swift", "objective c": "Objective-C", "objective-c": "Objective-C",
  "flutter": "Flutter", "dart": "Dart",
  "react native": "React Native",
  "ruby": "Ruby", "rails": "Ruby on Rails", "ruby on rails": "Ruby on Rails",
  "go": "Go", "golang": "Go",
  "rust": "Rust",
  "scala": "Scala",
  "perl": "Perl",
  "lua": "Lua",
  "elixir": "Elixir",
  "haskell": "Haskell",
  "clojure": "Clojure",
  "r": "R",
  "matlab": "MATLAB",
  "sas": "SAS",
  "spss": "SPSS",
  "stata": "Stata",
  "tableau": "Tableau",
  "power bi": "Power BI",
  "looker": "Looker",
  "excel": "Microsoft Excel", "ms excel": "Microsoft Excel",
  "vba": "VBA",
  "bash": "Bash", "shell": "Shell Scripting", "shell scripting": "Shell Scripting",
  "powershell": "PowerShell",
  "html": "HTML", "html5": "HTML",
  "css": "CSS", "css3": "CSS",
  "sass": "Sass", "scss": "Sass",
  "less": "Less",
  "bootstrap": "Bootstrap",
  "material ui": "Material UI", "mui": "Material UI",
  "ant design": "Ant Design", "antd": "Ant Design",
  "chakra ui": "Chakra UI",
  "styled components": "Styled Components",
  "emotion": "Emotion",
  "react query": "React Query", "tanstack query": "React Query",
  "react hook form": "React Hook Form",
  "formik": "Formik",
  "yup": "Yup",
  "zod": "Zod",
  "axios": "Axios",
  "expressjs": "Express.js",
  "koa": "Koa",
  "hapi": "Hapi",
  "loopback": "LoopBack",
  "adonisjs": "AdonisJS",
  "laravel": "Laravel",
  "symfony": "Symfony",
  "codeigniter": "CodeIgniter",
  "cakephp": "CakePHP",
  "yii": "Yii",
  "wordpress": "WordPress",
  "drupal": "Drupal",
  "joomla": "Joomla",
  "shopify": "Shopify",
  "magento": "Magento",
  "woocommerce": "WooCommerce",
  "pyramid": "Pyramid",
  "tornado": "Tornado",
  "web2py": "web2py",
  "pandas": "Pandas",
  "numpy": "NumPy",
  "scipy": "SciPy",
  "scikit learn": "Scikit-learn", "sklearn": "Scikit-learn", "scikit-learn": "Scikit-learn",
  "tensorflow": "TensorFlow",
  "pytorch": "PyTorch",
  "keras": "Keras",
  "mxnet": "MXNet",
  "theano": "Theano",
  "caffe": "Caffe",
  "hadoop": "Hadoop",
  "spark": "Apache Spark", "apache spark": "Apache Spark",
  "hive": "Apache Hive",
  "pig": "Apache Pig",
  "mapreduce": "MapReduce",
  "yarn": "YARN",
  "hdfs": "HDFS",
  "cassandra": "Cassandra",
  "hbase": "HBase",
  "couchdb": "CouchDB",
  "dynamodb": "DynamoDB",
  "cosmos db": "Cosmos DB", "cosmosdb": "Cosmos DB",
  "neo4j": "Neo4j",
  "couchbase": "Couchbase",
  "oracle": "Oracle Database", "oracle db": "Oracle Database",
  "sql server": "SQL Server", "mssql": "SQL Server",
  "sqlite": "SQLite",
  "mariadb": "MariaDB",
  "redshift": "Amazon Redshift",
  "bigquery": "BigQuery", "google bigquery": "BigQuery",
  "snowflake": "Snowflake",
  "databricks": "Databricks",
  "airflow": "Apache Airflow", "apache airflow": "Apache Airflow",
  "dbt": "dbt",
  "fivetran": "Fivetran",
  "stitch": "Stitch",
  "glue": "AWS Glue",
  "emr": "AWS EMR",
  "athena": "AWS Athena",
  "kinesis": "AWS Kinesis",
  "lambda": "AWS Lambda",
  "s3": "AWS S3",
  "ec2": "AWS EC2",
  "ecs": "AWS ECS",
  "eks": "AWS EKS",
  "sagemaker": "Amazon SageMaker",
  "comprehend": "AWS Comprehend",
  "rekognition": "AWS Rekognition",
  "lex": "AWS Lex",
  "polly": "AWS Polly",
  "vertex ai": "Vertex AI",
  "gke": "GKE",
  "aks": "AKS",
  "cloud functions": "Cloud Functions",
  "app engine": "App Engine",
  "cloud run": "Cloud Run",
  "cloud storage": "Cloud Storage",
  "bigtable": "Cloud Bigtable",
  "pub sub": "Cloud Pub/Sub",
  "dataflow": "Cloud Dataflow",
  "dataproc": "Cloud Dataproc",
  "ml engine": "ML Engine",
  "pulumi": "Pulumi",
  "cloudformation": "AWS CloudFormation",
  "arm templates": "ARM Templates",
  "bicep": "Bicep",
  "vagrant": "Vagrant",
  "packer": "Packer",
  "consul": "Consul",
  "nomad": "Nomad",
  "vault": "Vault",
  "kong": "Kong",
  "istio": "Istio",
  "linkerd": "Linkerd",
  "envoy": "Envoy",
  "traefik": "Traefik",
  "haproxy": "HAProxy",
  "caddy": "Caddy",
  "apache": "Apache HTTP Server", "httpd": "Apache HTTP Server",
  "iis": "IIS",
  "tomcat": "Apache Tomcat",
  "jetty": "Jetty",
  "jboss": "JBoss",
  "wildfly": "WildFly",
  "weblogic": "WebLogic",
  "websphere": "WebSphere",
  "grpc": "gRPC",
  "protobuf": "Protocol Buffers", "protocol buffers": "Protocol Buffers",
  "soap": "SOAP",
  "openapi": "OpenAPI", "swagger": "OpenAPI",
  "oauth": "OAuth 2.0", "oauth2": "OAuth 2.0", "oauth 2.0": "OAuth 2.0",
  "jwt": "JWT", "json web token": "JWT",
  "saml": "SAML",
  "openid connect": "OpenID Connect", "oidc": "OpenID Connect",
  "ssl": "SSL/TLS", "tls": "SSL/TLS",
  "https": "HTTPS",
  "cors": "CORS",
  "csrf": "CSRF",
  "xss": "XSS",
  "sql injection": "SQL Injection Prevention",
  "owasp": "OWASP Top 10",
  "nist": "NIST Framework",
  "iso 27001": "ISO 27001",
  "soc 2": "SOC 2",
  "gdpr": "GDPR Compliance",
  "hipaa": "HIPAA Compliance",
  "pci dss": "PCI DSS",
  "ccpa": "CCPA",
  "stripe": "Stripe API",
  "braintree": "Braintree",
  "paypal": "PayPal API",
  "razorpay": "Razorpay",
  "authorize.net": "Authorize.Net",
  "square": "Square",
  "adyen": "Adyen",
  "twilio": "Twilio API",
  "plivo": "Plivo",
  "nexmo": "Nexmo", "vonage": "Vonage",
  "sendgrid": "SendGrid",
  "mailgun": "Mailgun",
  "mailchimp": "Mailchimp",
  "postmark": "Postmark",
  "mandrill": "Mandrill",
  "ses": "Amazon SES",
  "sns": "Amazon SNS",
  "sqs": "Amazon SQS",
  "eventbridge": "Amazon EventBridge",
  "step functions": "AWS Step Functions",
  "swiftui": "SwiftUI",
  "uikit": "UIKit",
  "combine": "Combine",
  "coredata": "Core Data", "core data": "Core Data",
  "jetpack compose": "Jetpack Compose",
  "android sdk": "Android SDK",
  "ios sdk": "iOS SDK",
  "xcode": "Xcode",
  "android studio": "Android Studio",
  "eclipse": "Eclipse",
  "intellij": "IntelliJ IDEA",
  "pycharm": "PyCharm",
  "webstorm": "WebStorm",
  "rider": "Rider",
  "clion": "CLion",
  "goland": "GoLand",
  "phpstorm": "PhpStorm",
  "rubymine": "RubyMine",
  "appcode": "AppCode",
  "vs code": "VS Code", "visual studio code": "VS Code", "vscode": "VS Code",
  "visual studio": "Visual Studio",
  "sublime text": "Sublime Text",
  "atom": "Atom",
  "vim": "Vim",
  "neovim": "Neovim",
  "emacs": "Emacs",
  "postman": "Postman",
  "insomnia": "Insomnia",
  "soapui": "SoapUI",
  "curl": "cURL",
  "wireshark": "Wireshark",
  "charles proxy": "Charles Proxy",
  "fiddler": "Fiddler",
  "burp suite": "Burp Suite",
  "nessus": "Nessus",
  "metasploit": "Metasploit",
  "nmap": "Nmap",
  "waf": "WAF", "web application firewall": "WAF",
  "ids": "IDS/IPS", "ips": "IDS/IPS",
  "siem": "SIEM",
  "splunk": "Splunk",
  "sumo logic": "Sumo Logic",
  "logrhythm": "LogRhythm",
  "crowdstrike": "CrowdStrike",
  "carbon black": "Carbon Black",
  "sentinelone": "SentinelOne",
  "palo alto": "Palo Alto Networks",
  "fortinet": "Fortinet",
  "checkpoint": "Check Point",
  "cisco": "Cisco",
  "juniper": "Juniper",
  "f5": "F5 Networks",
  "arista": "Arista",
  "vmware": "VMware",
  "hyper v": "Hyper-V", "hyper-v": "Hyper-V",
  "xen": "Xen",
  "kvm": "KVM",
  "proxmox": "Proxmox",
  "virtualbox": "VirtualBox",
  "parallels": "Parallels",
  "vsphere": "vSphere",
  "esxi": "ESXi",
  "vcenter": "vCenter",
  "horizon": "Horizon View",
  "citrix": "Citrix",
  "rds": "RDS", "remote desktop services": "RDS",
  "active directory": "Active Directory", "ad": "Active Directory",
  "azure ad": "Azure AD", "azure active directory": "Azure AD",
  "okta": "Okta",
  "auth0": "Auth0",
  "keycloak": "Keycloak",
  "ping identity": "Ping Identity",
  "onelogin": "OneLogin",
  "sailpoint": "SailPoint",
  "cyberark": "CyberArk",
  "beyondtrust": "BeyondTrust",
  "centrify": "Centrify",
  "mfa": "MFA", "multi factor authentication": "MFA",
  "sso": "SSO", "single sign on": "SSO",
  "microsoft teams": "Microsoft Teams", "ms teams": "Microsoft Teams",
  "zoom": "Zoom",
  "google meet": "Google Meet",
  "webex": "Webex",
  "discord": "Discord",
  "asana": "Asana",
  "trello": "Trello",
  "monday.com": "Monday.com",
  "clickup": "ClickUp",
  "wrike": "Wrike",
  "basecamp": "Basecamp",
  "airtable": "Airtable",
  "smartsheet": "Smartsheet",
  "sharepoint": "SharePoint",
  "microsoft project": "Microsoft Project",
  "ms project": "Microsoft Project",
  "primavera p6": "Primavera P6",
  "autocad": "AutoCAD",
  "solidworks": "SolidWorks",
  "ansys": "ANSYS",
  "labview": "LabVIEW",
  "arduino": "Arduino",
  "raspberry pi": "Raspberry Pi",
  "plc": "PLC Programming",
  "scada": "SCADA",
  "mips": "MIPS Assembly",
  "assembly": "Assembly Language",
  "verilog": "Verilog",
  "vhdl": "VHDL",
  "fpga": "FPGA",
  "embedded c": "Embedded C",
  "embedded systems": "Embedded Systems",
  "rtos": "RTOS",
  "freertos": "FreeRTOS",
  "vxworks": "VxWorks",
  "qnx": "QNX",
  "autosar": "AUTOSAR",
  "misra": "MISRA C",
  "iso 26262": "ISO 26262",
  "aspice": "ASPICE",
  "do 178c": "DO-178C",
  "iec 61508": "IEC 61508",
  "sil": "SIL",
  "iso 13485": "ISO 13485",
  "iec 62304": "IEC 62304",
  "iso 9001": "ISO 9001",
  "cmmi": "CMMI",
  "itil": "ITIL v4",
  "itsm": "ITSM",
  "devops": "DevOps",
  "sre": "Site Reliability Engineering", "site reliability engineering": "Site Reliability Engineering",
  "devsecops": "DevSecOps",
  "shift left": "Shift-Left Testing",
  "tdd": "TDD", "test driven development": "TDD",
  "bdd": "BDD", "behavior driven development": "BDD",
  "ddd": "DDD", "domain driven design": "Domain-Driven Design",
  "clean architecture": "Clean Architecture",
  "onion architecture": "Onion Architecture",
  "hexagonal architecture": "Hexagonal Architecture",
  "microservices": "Microservices Architecture",
  "serverless": "Serverless Architecture",
  "event driven": "Event-Driven Architecture", "event driven architecture": "Event-Driven Architecture",
  "cqrs": "CQRS",
  "saga pattern": "Saga Pattern",
  "repository pattern": "Repository Pattern",
  "dependency injection": "Dependency Injection",
  "solid": "SOLID Principles",
  "design patterns": "Design Patterns",
  "gof patterns": "GoF Design Patterns",
  "oop": "OOP", "object oriented programming": "Object-Oriented Programming",
  "functional programming": "Functional Programming",
  "reactive programming": "Reactive Programming",
  "rxjava": "RxJava",
  "rxjs": "RxJS",
  "rxswift": "RxSwift",
  "rxandroid": "RxAndroid",
  "reactivex": "ReactiveX",
  "project reactor": "Project Reactor",
  "spring webflux": "Spring WebFlux",
  "akka": "Akka",
  "vertx": "Vert.x",
  "nodejs streams": "Node.js Streams",
  "web sockets": "WebSockets", "websocket": "WebSockets",
  "sse": "Server-Sent Events",
  "long polling": "Long Polling",
  "webhooks": "Webhooks",
  "graphql subscriptions": "GraphQL Subscriptions",
  "signalr": "SignalR",
  "socket.io": "Socket.IO",
  "webrtc": "WebRTC",
  "service workers": "Service Workers",
  "pwa": "Progressive Web Apps", "progressive web app": "Progressive Web Apps",
  "amp": "AMP", "accelerated mobile pages": "AMP",
  "ssr": "Server-Side Rendering", "server side rendering": "Server-Side Rendering",
  "csr": "Client-Side Rendering",
  "ssg": "Static Site Generation",
  "isr": "Incremental Static Regeneration",
  "edge rendering": "Edge Rendering",
  "jamstack": "JAMstack",
  "headless cms": "Headless CMS",
  "strapi": "Strapi",
  "contentful": "Contentful",
  "sanity": "Sanity.io",
  "prismic": "Prismic",
  "graphcms": "GraphCMS",
  "storyblok": "Storyblok",
  "kontent": "Kontent.ai",
  "kentico": "Kentico Kontent",
  "sitecore": "Sitecore",
  "adobe experience manager": "Adobe Experience Manager", "aem": "Adobe Experience Manager",
  "episerver": "Episerver",
  "umbraco": "Umbraco",
  "orchard": "Orchard CMS",
  "orchard core": "Orchard Core",
  "nopcommerce": "nopCommerce",
  "opencart": "OpenCart",
  "prestashop": "PrestaShop",
  "oscommerce": "osCommerce",
  "zen cart": "Zen Cart",
  "bigcommerce": "BigCommerce",
  "volusion": "Volusion",
  "3dcart": "3dcart",
  "shopware": "Shopware",
  "magento 2": "Magento 2",
  "shopify plus": "Shopify Plus",
  "bigcommerce enterprise": "BigCommerce Enterprise",
  "salesforce commerce cloud": "Salesforce Commerce Cloud",
  "sap commerce cloud": "SAP Commerce Cloud",
  "oracle commerce": "Oracle Commerce",
  "ibm websphere commerce": "IBM WebSphere Commerce",
  "hybris": "SAP Hybris",
  "commercetools": "commercetools",
  "elastic path": "Elastic Path",
  "fabric": "Fabric",
  "constructor io": "Constructor.io",
  "algolia": "Algolia",
  "elastic search": "Elasticsearch",
  "solr": "Apache Solr",
  "typesense": "Typesense",
  "meilisearch": "Meilisearch",
  "redisearch": "RediSearch",
  "druid": "Apache Druid",
  "pinot": "Apache Pinot",
  "clickhouse": "ClickHouse",
  "questdb": "QuestDB",
  "timescaledb": "TimescaleDB",
  "influxdb": "InfluxDB",
  "graphite": "Graphite",
  "opentsdb": "OpenTSDB",
  "mongodb": "MongoDB",
  "couchdb": "CouchDB",
  "arangodb": "ArangoDB",
  "fauna": "FaunaDB",
  "surrealdb": "SurrealDB",
  "dgraph": "Dgraph",
  "orientdb": "OrientDB",
  "tigergraph": "TigerGraph",
  "janusgraph": "JanusGraph",
  "neo4j": "Neo4j",
  "dynamodb": "DynamoDB",
  "cosmosdb": "Cosmos DB",
  "documentdb": "DocumentDB",
  "aurora": "Amazon Aurora",
  "rds": "Amazon RDS",
  "cloud sql": "Cloud SQL",
  "azure sql": "Azure SQL",
  "azure cosmos db": "Azure Cosmos DB",
  "google cloud spanner": "Cloud Spanner",
  "spanner": "Cloud Spanner",
  "alloydb": "AlloyDB",
  "bigquery": "BigQuery",
  "redshift": "Amazon Redshift",
  "snowflake": "Snowflake",
  "databricks": "Databricks",
  "synapse": "Azure Synapse Analytics",
  "azure synapse": "Azure Synapse Analytics",
  "materialize": "Materialize",
  "rockset": "Rockset",
  "firebolt": "Firebolt",
  "dremio": "Dremio",
  "denodo": "Denodo",
  "starburst": "Starburst",
  "trino": "Trino",
  "presto": "Presto",
  "athena": "Amazon Athena",
  "kinesis": "Amazon Kinesis",
  "kafka": "Apache Kafka",
  "flink": "Apache Flink",
  "storm": "Apache Storm",
  "samza": "Apache Samza",
  "heron": "Twitter Heron",
  "spark streaming": "Spark Streaming",
  "structured streaming": "Structured Streaming",
  "pulsar": "Apache Pulsar",
  "nats": "NATS",
  "activemq": "ActiveMQ",
  "artemis": "Apache ActiveMQ Artemis",
  "rabbitmq": "RabbitMQ",
  "zeromq": "ZeroMQ", "zmq": "ZeroMQ",
  "nsq": "NSQ",
  "beanstalkd": "Beanstalkd",
  "sidekiq": "Sidekiq",
  "resque": "Resque",
  "bullmq": "BullMQ",
  "agenda": "Agenda",
  "celery": "Celery",
  "rq": "RQ", "python rq": "RQ",
  "huey": "Huey",
  "dramatiq": "Dramatiq",
  "temporal": "Temporal",
  "cadence": "Uber Cadence",
  "airflow": "Apache Airflow",
  "prefect": "Prefect",
  "dagster": "Dagster",
  "luigi": "Luigi",
  "mlflow": "MLflow",
  "kubeflow": "Kubeflow",
  "polyaxon": "Polyaxon",
  "determined ai": "Determined AI",
  "h2o": "H2O.ai",
  "databricks mlflow": "MLflow",
  "aws sagemaker": "Amazon SageMaker",
  "azure machine learning": "Azure Machine Learning",
  "google ai platform": "Google AI Platform",
  "ibm watson": "IBM Watson",
  "salesforce einstein": "Salesforce Einstein",
  "azure cognitive services": "Azure Cognitive Services",
  "google cloud vision": "Cloud Vision API",
  "google cloud nlp": "Cloud Natural Language API",
  "aws comprehend": "Amazon Comprehend",
  "aws rekognition": "Amazon Rekognition",
  "openai api": "OpenAI API",
  "anthropic claude": "Anthropic Claude API",
  "gemini api": "Google Gemini API",
  "llama index": "LlamaIndex",
  "langchain": "LangChain",
  "haystack": "Haystack",
  "chroma": "Chroma",
  "pinecone": "Pinecone",
  "weaviate": "Weaviate",
  "qdrant": "Qdrant",
  "milvus": "Milvus",
  "faiss": "FAISS",
  "annoy": "Annoy",
  "hnswlib": "HNSWlib",
  "transformers": "Hugging Face Transformers",
  "diffusers": "Hugging Face Diffusers",
  "datasets": "Hugging Face Datasets",
  "tokenizers": "Hugging Face Tokenizers",
  "accelerate": "Hugging Face Accelerate",
  "peft": "PEFT",
  "bitsandbytes": "bitsandbytes",
  "lora": "LoRA",
  "qlora": "QLoRA",
  "rag": "RAG", "retrieval augmented generation": "Retrieval-Augmented Generation",
  "fine tuning": "Fine-Tuning",
  "prompt engineering": "Prompt Engineering",
  "chain of thought": "Chain-of-Thought Prompting",
  "few shot learning": "Few-Shot Learning",
  "zero shot learning": "Zero-Shot Learning",
  "transfer learning": "Transfer Learning",
  "fine tuning": "Fine-Tuning",
  "hyperparameter tuning": "Hyperparameter Tuning",
  "cross validation": "Cross-Validation",
  "grid search": "Grid Search",
  "random search": "Random Search",
  "bayesian optimization": "Bayesian Optimization",
  "auto ml": "AutoML",
  "feature engineering": "Feature Engineering",
  "feature selection": "Feature Selection",
  "dimensionality reduction": "Dimensionality Reduction",
  "pca": "PCA",
  "t sne": "t-SNE",
  "umap": "UMAP",
  "clustering": "Clustering",
  "k means": "K-Means Clustering",
  "hierarchical clustering": "Hierarchical Clustering",
  "dbscan": "DBSCAN",
  "anomaly detection": "Anomaly Detection",
  "isolation forest": "Isolation Forest",
  "one class svm": "One-Class SVM",
  "autoencoders": "Autoencoders",
  "regression": "Regression Analysis",
  "linear regression": "Linear Regression",
  "logistic regression": "Logistic Regression",
  "decision trees": "Decision Trees",
  "random forests": "Random Forests",
  "gradient boosting": "Gradient Boosting",
  "xgboost": "XGBoost",
  "lightgbm": "LightGBM",
  "catboost": "CatBoost",
  "adaboost": "AdaBoost",
  "svm": "SVM",
  "naive bayes": "Naive Bayes",
  "knn": "K-Nearest Neighbors",
  "ensemble methods": "Ensemble Methods",
  "bagging": "Bootstrap Aggregating (Bagging)",
  "stacking": "Stacking",
  "voting classifiers": "Voting Classifiers",
  "neural networks": "Neural Networks",
  "cnn": "CNN", "convolutional neural networks": "Convolutional Neural Networks",
  "rnn": "RNN", "recurrent neural networks": "Recurrent Neural Networks",
  "lstm": "LSTM", "long short term memory": "Long Short-Term Memory",
  "gru": "GRU", "gated recurrent unit": "Gated Recurrent Unit",
  "transformer architecture": "Transformer Architecture",
  "attention mechanism": "Attention Mechanism",
  "bert": "BERT",
  "gpt": "GPT",
  "t5": "T5",
  "roberta": "RoBERTa",
  "xlnet": "XLNet",
  "electra": "ELECTRA",
  "bart": "BART",
  "gpt 3": "GPT-3",
  "gpt 4": "GPT-4",
  "chatgpt": "ChatGPT",
  "dall e": "DALL-E",
  "stable diffusion": "Stable Diffusion",
  "midjourney": "Midjourney API",
  "whisper": "OpenAI Whisper",
  "cohere": "Cohere API",
  "ai21 labs": "AI21 Labs API",
  "nltk": "NLTK",
  "spacy": "spaCy",
  "gensim": "Gensim",
  "textblob": "TextBlob",
  "corenlp": "Stanford CoreNLP",
  "open nlp": "Apache OpenNLP",
  "word2vec": "Word2Vec",
  "glove": "GloVe",
  "fasttext": "fastText",
  "doc2vec": "Doc2Vec",
  "topic modeling": "Topic Modeling",
  "lda": "LDA", "latent dirichlet allocation": "Latent Dirichlet Allocation",
  "nmf": "NMF",
  "text classification": "Text Classification",
  "sentiment analysis": "Sentiment Analysis",
  "named entity recognition": "Named Entity Recognition (NER)",
  "part of speech tagging": "Part-of-Speech Tagging",
  "dependency parsing": "Dependency Parsing",
  "coreference resolution": "Coreference Resolution",
  "word sense disambiguation": "Word Sense Disambiguation",
  "machine translation": "Machine Translation",
  "text summarization": "Text Summarization",
  "text generation": "Text Generation",
  "question answering": "Question Answering",
  "speech recognition": "Speech Recognition",
  "text to speech": "Text-to-Speech",
  "speech to text": "Speech-to-Text",
  "ocr": "OCR", "optical character recognition": "Optical Character Recognition",
  "computer vision": "Computer Vision",
  "image classification": "Image Classification",
  "object detection": "Object Detection",
  "image segmentation": "Image Segmentation",
  "semantic segmentation": "Semantic Segmentation",
  "instance segmentation": "Instance Segmentation",
  "facial recognition": "Facial Recognition",
  "pose estimation": "Pose Estimation",
  "optical flow": "Optical Flow",
  "video analysis": "Video Analysis",
  "recommendation systems": "Recommendation Systems",
  "collaborative filtering": "Collaborative Filtering",
  "content based filtering": "Content-Based Filtering",
  "hybrid recommender": "Hybrid Recommendation Systems",
  "matrix factorization": "Matrix Factorization",
  "deep learning": "Deep Learning",
  "reinforcement learning": "Reinforcement Learning",
  "q learning": "Q-Learning",
  "policy gradient": "Policy Gradient Methods",
  "actor critic": "Actor-Critic Methods",
  "markov decision processes": "Markov Decision Processes",
  "monte carlo methods": "Monte Carlo Methods",
  "temporal difference learning": "Temporal Difference Learning",
  "multi agent systems": "Multi-Agent Systems",
  "game theory": "Game Theory",
  "optimization algorithms": "Optimization Algorithms",
  "gradient descent": "Gradient Descent",
  "stochastic gradient descent": "Stochastic Gradient Descent (SGD)",
  "momentum optimization": "Momentum Optimization",
  "nesterov accelerated gradient": "Nesterov Accelerated Gradient",
  "adagrad": "AdaGrad",
  "rmsprop": "RMSprop",
  "adam optimizer": "Adam",
  "nadam": "Nadam",
  "lbfgs": "L-BFGS",
  "newtons method": "Newton's Method",
  "convex optimization": "Convex Optimization",
  "linear programming": "Linear Programming",
  "integer programming": "Integer Programming",
  "nonlinear programming": "Nonlinear Programming",
  "dynamic programming": "Dynamic Programming",
  "greedy algorithms": "Greedy Algorithms",
  "divide and conquer": "Divide and Conquer",
  "backtracking": "Backtracking",
  "branch and bound": "Branch and Bound",
  "graph algorithms": "Graph Algorithms",
  "breadth first search": "Breadth-First Search (BFS)",
  "depth first search": "Depth-First Search (DFS)",
  "dijkstras algorithm": "Dijkstra's Algorithm",
  "bellman ford": "Bellman-Ford Algorithm",
  "floyd warshall": "Floyd-Warshall Algorithm",
  "minimum spanning trees": "Minimum Spanning Trees",
  "kruskals algorithm": "Kruskal's Algorithm",
  "prims algorithm": "Prim's Algorithm",
  "topological sort": "Topological Sorting",
  "network flow": "Network Flow Algorithms",
  "max flow min cut": "Max-Flow Min-Cut Theorem",
  "edmonds karp": "Edmonds-Karp Algorithm",
  "ford fulkerson": "Ford-Fulkerson Method",
  "bipartite matching": "Bipartite Matching",
  "stable marriage": "Stable Marriage Problem",
  "string algorithms": "String Algorithms",
  "kmp": "KMP Algorithm",
  "rabin karp": "Rabin-Karp Algorithm",
  "z algorithm": "Z-Algorithm",
  "suffix array": "Suffix Array",
  "suffix automaton": "Suffix Automaton",
  "trie": "Trie Data Structure",
  "aho corasick": "Aho-Corasick Algorithm",
  "manachers algorithm": "Manacher's Algorithm",
  "regex": "Regular Expressions",
  "finite automata": "Finite Automata",
  "context free grammars": "Context-Free Grammars",
  "pushdown automata": "Pushdown Automata",
  "turing machines": "Turing Machines",
  "computational complexity": "Computational Complexity",
  "p vs np": "P vs NP",
  "np completeness": "NP-Completeness",
  "approximation algorithms": "Approximation Algorithms",
  "randomized algorithms": "Randomized Algorithms",
  "parallel algorithms": "Parallel Algorithms",
  "distributed algorithms": "Distributed Algorithms",
  "mapreduce": "MapReduce",
  "consensus algorithms": "Consensus Algorithms",
  "paxos": "Paxos",
  "raft": "Raft",
  "zab": "ZAB",
  "vector clocks": "Vector Clocks",
  "lamport timestamps": "Lamport Timestamps",
  "eventual consistency": "Eventual Consistency",
  "strong consistency": "Strong Consistency",
  "acid transactions": "ACID Transactions",
  "base properties": "BASE Properties",
  "cap theorem": "CAP Theorem",
  "pacelc theorem": "PACELC Theorem",
  "two phase commit": "Two-Phase Commit (2PC)",
  "three phase commit": "Three-Phase Commit (3PC)",
  "saga pattern": "Saga Pattern",
  "outbox pattern": "Outbox Pattern",
  "cqrs pattern": "CQRS Pattern",
  "event sourcing": "Event Sourcing",
  "repository pattern": "Repository Pattern",
  "unit of work": "Unit of Work Pattern",
  "specification pattern": "Specification Pattern",
  "strategy pattern": "Strategy Pattern",
  "observer pattern": "Observer Pattern",
  "singleton pattern": "Singleton Pattern",
  "factory pattern": "Factory Pattern",
  "abstract factory": "Abstract Factory Pattern",
  "builder pattern": "Builder Pattern",
  "prototype pattern": "Prototype Pattern",
  "adapter pattern": "Adapter Pattern",
  "bridge pattern": "Bridge Pattern",
  "composite pattern": "Composite Pattern",
  "decorator pattern": "Decorator Pattern",
  "facade pattern": "Facade Pattern",
  "flyweight pattern": "Flyweight Pattern",
  "proxy pattern": "Proxy Pattern",
  "chain of responsibility": "Chain of Responsibility Pattern",
  "command pattern": "Command Pattern",
  "interpreter pattern": "Interpreter Pattern",
  "iterator pattern": "Iterator Pattern",
  "mediator pattern": "Mediator Pattern",
  "memento pattern": "Memento Pattern",
  "state pattern": "State Pattern",
  "template method": "Template Method Pattern",
  "visitor pattern": "Visitor Pattern",
  "mvc pattern": "MVC Pattern",
  "mvp pattern": "MVP Pattern",
  "mvvm pattern": "MVVM Pattern",
  "mvi pattern": "MVI Pattern",
  "redux pattern": "Redux Pattern",
  "flux pattern": "Flux Pattern",
  "clean code": "Clean Code",
  "refactoring": "Code Refactoring",
  "code review": "Code Review",
  "pair programming": "Pair Programming",
  "extreme programming": "Extreme Programming (XP)",
  "test automation": "Test Automation",
  "unit testing": "Unit Testing",
  "integration testing": "Integration Testing",
  "system testing": "System Testing",
  "e2e testing": "End-to-End (E2E) Testing",
  "smoke testing": "Smoke Testing",
  "sanity testing": "Sanity Testing",
  "regression testing": "Regression Testing",
  "performance testing": "Performance Testing",
  "load testing": "Load Testing",
  "stress testing": "Stress Testing",
  "soak testing": "Soak Testing",
  "spike testing": "Spike Testing",
  "volume testing": "Volume Testing",
  "security testing": "Security Testing",
  "penetration testing": "Penetration Testing",
  "vulnerability assessment": "Vulnerability Assessment",
  "threat modeling": "Threat Modeling",
  "risk assessment": "Risk Assessment",
  "business continuity": "Business Continuity Planning",
  "disaster recovery": "Disaster Recovery Planning",
  "high availability": "High Availability",
  "fault tolerance": "Fault Tolerance",
  "redundancy": "Redundancy",
  "replication": "Replication",
  "backup strategies": "Backup Strategies",
  "version control": "Version Control",
  "git flow": "Git Flow",
  "github flow": "GitHub Flow",
  "gitlab flow": "GitLab Flow",
  "trunk based development": "Trunk-Based Development",
  "continuous integration": "Continuous Integration (CI)",
  "continuous delivery": "Continuous Delivery (CD)",
  "continuous deployment": "Continuous Deployment",
  "release management": "Release Management",
  "configuration management": "Configuration Management",
  "infrastructure as code": "Infrastructure as Code (IaC)",
  "containerization": "Containerization",
  "orchestration": "Container Orchestration",
  "observability": "Observability",
  "monitoring": "Monitoring",
  "alerting": "Alerting",
  "logging": "Logging",
  "tracing": "Distributed Tracing",
  "apm": "Application Performance Monitoring (APM)",
  "sre principles": "SRE Principles",
  "error budgets": "Error Budgets",
  "blameless postmortems": "Blameless Postmortems",
  "incident management": "Incident Management",
  "problem management": "Problem Management",
  "change management": "Change Management",
  "it service management": "IT Service Management (ITSM)",
  "product management": "Product Management",
  "roadmapping": "Product Roadmapping",
  "user stories": "User Story Writing",
  "requirements gathering": "Requirements Gathering",
  "stakeholder management": "Stakeholder Management",
  "technical writing": "Technical Writing",
  "documentation": "Documentation",
  "knowledge management": "Knowledge Management",
  "mentoring": "Mentoring",
  "coaching": "Coaching",
  "leadership": "Leadership",
  "team management": "Team Management",
  "cross functional collaboration": "Cross-Functional Collaboration",
  "communication skills": "Communication Skills",
  "presentation skills": "Presentation Skills",
  "negotiation skills": "Negotiation Skills",
  "conflict resolution": "Conflict Resolution",
  "critical thinking": "Critical Thinking",
  "problem solving": "Problem Solving",
  "decision making": "Decision Making",
  "time management": "Time Management",
  "prioritization": "Prioritization",
  "organizational skills": "Organizational Skills",
  "attention to detail": "Attention to Detail",
  "creativity": "Creativity",
  "innovation": "Innovation",
  "adaptability": "Adaptability",
  "resilience": "Resilience",
  "emotional intelligence": "Emotional Intelligence",
  "customer focus": "Customer Focus",
  "data driven": "Data-Driven Decision Making",
  "analytical skills": "Analytical Skills",
  "research skills": "Research Skills",
  "technical aptitude": "Technical Aptitude",
  "quick learner": "Fast Learner",
  "self motivated": "Self-Motivated",
  "team player": "Team Player",
  "independent worker": "Independent Worker",
  "proactive": "Proactive",
  "resourceful": "Resourceful",
  "results oriented": "Results-Oriented",
  "quality focused": "Quality-Focused",
  "customer service": "Customer Service",
  "sales": "Sales",
  "marketing": "Marketing",
  "digital marketing": "Digital Marketing",
  "content marketing": "Content Marketing",
  "seo": "SEO", "search engine optimization": "SEO",
  "sem": "SEM", "search engine marketing": "SEM",
  "social media marketing": "Social Media Marketing",
  "email marketing": "Email Marketing",
  "influencer marketing": "Influencer Marketing",
  "affiliate marketing": "Affiliate Marketing",
  "growth hacking": "Growth Hacking",
  "conversion rate optimization": "Conversion Rate Optimization (CRO)",
  "a b testing": "A/B Testing", "ab testing": "A/B Testing",
  "analytics": "Analytics",
  "google analytics": "Google Analytics",
  "mixpanel": "Mixpanel",
  "amplitude": "Amplitude",
  "hotjar": "Hotjar",
  "heap": "Heap Analytics",
  "kissmetrics": "KISSmetrics",
  "intercom": "Intercom",
  "hubspot": "HubSpot",
  "salesforce": "Salesforce CRM",
  "zoho crm": "Zoho CRM",
  "dynamics 365": "Microsoft Dynamics 365",
  "sap crm": "SAP CRM",
  "oracle crm": "Oracle CRM",
  "freshdesk": "Freshdesk",
  "zendesk": "Zendesk",
  "helpscout": "Help Scout",
  "jira service management": "Jira Service Management",
  "servicenow": "ServiceNow",
  "remedy": "BMC Remedy",
  "solarwinds": "SolarWinds",
  "manageengine": "ManageEngine",
  "zabbix": "Zabbix",
  "icinga": "Icinga",
  "nagios": "Nagios",
  "centreon": "Centreon",
  "checkmk": "Checkmk",
  "observium": "Observium",
  "librenms": "LibreNMS",
  "cacti": "Cacti",
  "munin": "Munin",
  "monit": "Monit",
  "chef": "Chef",
  "puppet": "Puppet",
  "ansible": "Ansible",
  "saltstack": "SaltStack",
  "foreman": "The Foreman",
  "rundeck": "Rundeck",
  "awx": "AWX / Ansible Tower",
  "jenkins": "Jenkins",
  "gitlab ci cd": "GitLab CI/CD",
  "github actions": "GitHub Actions",
  "circleci": "CircleCI",
  "travis ci": "Travis CI",
  "teamcity": "TeamCity",
  "bamboo": "Bamboo",
  "azure devops": "Azure DevOps",
  "aws codebuild": "AWS CodeBuild",
  "aws codedeploy": "AWS CodeDeploy",
  "aws codepipeline": "AWS CodePipeline",
  "gcp cloud build": "Cloud Build",
  "spinnaker": "Spinnaker",
  "argo cd": "Argo CD",
  "flux cd": "Flux CD",
  "tekton": "Tekton",
  "jenkins x": "Jenkins X",
  "concourse ci": "Concourse CI",
  "drone ci": "Drone CI",
  "buildkite": "Buildkite",
  "bazel": "Bazel",
  "gradle": "Gradle",
  "maven": "Apache Maven",
  "ant": "Apache Ant",
  "ivy": "Apache Ivy",
  "make": "Make",
  "cmake": "CMake",
  "ninja build": "Ninja",
  "meson": "Meson",
  "scons": "SCons",
  "buck": "Buck",
  "pants": "Pants",
  "please build": "Please Build",
  "earthly": "Earthly",
  "nix": "Nix",
  "guix": "GNU Guix",
  "gentoo portage": "Portage",
  "arch pacman": "Pacman",
  "debian apt": "APT",
  "redhat yum": "YUM/DNF",
  "fedora dnf": "DNF",
  "suse zypper": "Zypper",
  "alpine apk": "APK",
  "bsd ports": "Ports Collection",
  "homebrew": "Homebrew",
  "chocolatey": "Chocolatey",
  "scoop": "Scoop",
  "winget": "WinGet",
  "npm": "npm",
  "yarn": "Yarn",
  "pnpm": "pnpm",
  "pip": "pip",
  "poetry": "Poetry",
  "pipenv": "Pipenv",
  "conda": "Conda",
  "anaconda": "Anaconda",
  "miniconda": "Miniconda",
  "virtualenv": "virtualenv",
  "venv": "venv",
  "pyenv": "pyenv",
  "rbenv": "rbenv",
  "rvm": "RVM",
  "nvm": "NVM",
  "nodenv": "nodenv",
  "fnm": "fnm",
  "volta": "Volta",
  "asdf": "asdf",
  "sdkman": "SDKMAN!",
  "jabba": "Jabba",
  "jenv": "jenv",
  "sdkman": "SDKMAN!",
  "maven wrapper": "Maven Wrapper",
  "gradle wrapper": "Gradle Wrapper",
  "composer": "Composer (PHP)",
  "bundler": "Bundler (Ruby)",
  "gem": "RubyGems",
  "cargo": "Cargo (Rust)",
  "go modules": "Go Modules",
  "dep": "dep",
  "glide": "Glide",
  "govendor": "govendor",
  "swift package manager": "Swift Package Manager",
  "cocoapods": "CocoaPods",
  "carthage": "Carthage",
  "swiftpm": "SwiftPM",
  "dart pub": "Pub (Dart)",
  "flutter pub": "Flutter Pub",
  "nuget": "NuGet",
  "paket": "Paket",
  "maven central": "Maven Central",
  "jcenter": "Bintray JCenter",
  "npm registry": "npm Registry",
  "pypi": "PyPI",
  "rubygems": "RubyGems.org",
  "crates io": "crates.io",
  "pkg go dev": "pkg.go.dev",
  "packagist": "Packagist",
  "nuget gallery": "NuGet Gallery",
  "docker hub": "Docker Hub",
  "quay io": "Quay.io",
  "gcr io": "GCR (Google Container Registry)",
  "ecr": "Amazon ECR",
  "acr": "Azure Container Registry",
  "ghcr": "GitHub Container Registry",
  "gitlab registry": "GitLab Container Registry",
  "harbor": "Harbor Registry",
  "jfrog artifactory": "JFrog Artifactory",
  "nexus": "Sonatype Nexus",
  "azure artifacts": "Azure Artifacts",
  "aws codeartifact": "AWS CodeArtifact",
  "cloudsmith": "Cloudsmith",
  "packagecloud": "packagecloud",
  "helm chart repository": "Helm Chart Repositories",
  "chart museum": "ChartMuseum",
  "artifacthub": "Artifact Hub",
  "cncf landscape": "CNCF Landscape",
  "kubernetes operators": "Kubernetes Operators",
  "helm charts": "Helm Charts",
  "istio service mesh": "Istio Service Mesh",
  "linkerd service mesh": "Linkerd Service Mesh",
  "consul service mesh": "Consul Service Mesh",
  "cillium": "Cilium CNI",
  "calico": "Calico CNI",
  "weave net": "Weave Net",
  "flannel": "Flannel CNI",
  "canal": "Canal CNI",
  "kube router": "Kube-router",
  "romana": "Romana",
  "contiv": "Contiv",
  "open vswitch": "Open vSwitch",
  "sdn": "Software-Defined Networking (SDN)",
  "nfv": "Network Functions Virtualization (NFV)",
  "bgp": "BGP",
  "ospf": "OSPF",
  "eigrp": "EIGRP",
  "rip": "RIP",
  "vrrp": "VRRP",
  "hsrp": "HSRP",
  "glbp": "GLBP",
  "stp": "STP",
  "rstp": "RSTP",
  "mstp": "MSTP",
  "vlan": "VLAN",
  "vxlan": "VXLAN",
  "gre tunnel": "GRE Tunneling",
  "ipsec": "IPsec",
  "wireguard": "WireGuard",
  "openvpn": "OpenVPN",
  "ipsec vpn": "IPsec VPN",
  "ssl vpn": "SSL VPN",
  "sd wan": "SD-WAN",
  "mpls": "MPLS",
  "dmvpn": "DMVPN",
  "getvpn": "GETVPN",
  "flexvpn": "FlexVPN",
  "lisp": "LISP",
  "segment routing": "Segment Routing",
  "srv6": "SRv6",
  "evpn": "EVPN",
  "vpnv4": "MPLS VPNv4",
  "vpnv6": "MPLS VPNv6",
  "l2vpn": "L2VPN",
  "l3vpn": "L3VPN",
  "vpws": "VPWS",
  "vpls": "VPLS",
  "epipe": "Epipe",
  "sap": "SAP",
  "oracle erp": "Oracle ERP Cloud",
  "sap erp": "SAP ERP",
  "workday": "Workday",
  "netsuite": "NetSuite",
  "dynamics 365 finance": "Dynamics 365 Finance",
  "quickbooks": "QuickBooks",
  "xero": "Xero",
  "freshbooks": "FreshBooks",
  "wave accounting": "Wave Accounting",
  "zoho books": "Zoho Books",
  "sage intacct": "Sage Intacct",
  "epicor": "Epicor ERP",
  "infor": "Infor ERP",
  "qad": "QAD ERP",
  "ifs": "IFS ERP",
  "acumatica": "Acumatica",
  "syspro": "SYSPRO",
  "microsoft dynamics gp": "Dynamics GP",
  "microsoft dynamics nav": "Dynamics NAV",
  "microsoft dynamics sl": "Dynamics SL",
  "microsoft dynamics ax": "Dynamics AX",
  "sage 50": "Sage 50",
  "sage 100": "Sage 100",
  "sage 300": "Sage 300",
  "sage 500": "Sage 500",
  "sage x3": "Sage X3",
  "sage crm": "Sage CRM",
  "adobe campaign": "Adobe Campaign",
  "marketo": "Marketo",
  "pardot": "Pardot",
  "oracle eloqua": "Oracle Eloqua",
  "oracle marketing cloud": "Oracle Marketing Cloud",
  "sap marketing cloud": "SAP Marketing Cloud",
  "hubspot marketing hub": "HubSpot Marketing Hub",
  "mailchimp marketing": "Mailchimp Marketing",
  "constant contact": "Constant Contact",
  "convertkit": "ConvertKit",
  "activecampaign": "ActiveCampaign",
  "getresponse": "GetResponse",
  "aweber": "AWeber",
  "mailerlite": "MailerLite",
  "sendinblue": "Sendinblue",
  "omnisend": "Omnisend",
  "drip": "Drip",
  "klaviyo": "Klaviyo",
  "privy": "Privy",
  "sumo": "Sumo",
  "justuno": "Justuno",
  "optimonk": "OptiMonk",
  "wishpond": "Wishpond",
  "unbounce": "Unbounce",
  "instapage": "Instapage",
  "leadpages": "Leadpages",
  "clickfunnels": "ClickFunnels",
  "kartra": "Kartra",
  "kajabi": "Kajabi",
  "teachable": "Teachable",
  "thinkific": "Thinkific",
  "podia": "Podia",
  "mighty networks": "Mighty Networks",
  "circle so": "Circle.so",
  "discourse": "Discourse",
  "vanilla forums": "Vanilla Forums",
  "phpbb": "phpBB",
  "bbpress": "bbPress",
  "buddypress": "BuddyPress",
  "wordpress multisite": "WordPress Multisite",
  "woocommerce": "WooCommerce",
  "easy digital downloads": "Easy Digital Downloads",
  "memberpress": "MemberPress",
  "restrict content pro": "Restrict Content Pro",
  "paid memberships pro": "Paid Memberships Pro",
  "learndash": "LearnDash",
  "lifterlms": "LifterLMS",
  "sensei": "Sensei",
  "gravity forms": "Gravity Forms",
  "contact form 7": "Contact Form 7",
  "wpforms": "WPForms",
  "formidable forms": "Formidable Forms",
  "ninja forms": "Ninja Forms",
  "elementor": "Elementor",
  "beaver builder": "Beaver Builder",
  "divi": "Divi Builder",
  "visual composer": "Visual Composer",
  "wpbakery": "WPBakery",
  "siteorigin": "SiteOrigin Page Builder",
  "themify": "Themify Builder",
  "oxygen": "Oxygen Builder",
  "bricks": "Bricks Builder",
  "breakdance": "Breakdance",
  "acf": "Advanced Custom Fields",
  "custom post type ui": "Custom Post Type UI",
  "yoast seo": "Yoast SEO",
  "rank math": "Rank Math SEO",
  "all in one seo": "All in One SEO (AIOSEO)",
  "jetpack": "Jetpack",
  "wordfence": "Wordfence Security",
  "sucuri": "Sucuri Security",
  "ithemes security": "iThemes Security",
  "updraftplus": "UpdraftPlus",
  "duplicator": "Duplicator",
  "all in one wp migration": "All-in-One WP Migration",
  "wp rocket": "WP Rocket",
  "w3 total cache": "W3 Total Cache",
  "wp super cache": "WP Super Cache",
  "litespeed cache": "LiteSpeed Cache",
  "cloudflare": "Cloudflare",
  "akamai": "Akamai",
  "fastly": "Fastly",
  "stackpath": "StackPath",
  "imperva": "Imperva",
  "sucuri waf": "Sucuri WAF",
  "wordpress hosting": "Managed WordPress Hosting",
  "wp engine": "WP Engine",
  "siteground": "SiteGround",
  "liquid web": "Liquid Web",
  "flywheel": "Flywheel",
  "pressable": "Pressable",
  "pagely": "Pagely",
  "kinsta": "Kinsta",
  "cloudways": "Cloudways",
  "digitalocean": "DigitalOcean",
  "linode": "Linode",
  "vultr": "Vultr",
  "ovh": "OVH",
  "hetzner": "Hetzner",
  "scaleway": "Scaleway",
  "ionos": "IONOS",
  "bluehost": "Bluehost",
  "hostgator": "HostGator",
  "namecheap": "Namecheap",
  "godaddy": "GoDaddy",
  "dreamhost": "DreamHost",
  "a2 hosting": "A2 Hosting",
  "inmotion hosting": "InMotion Hosting",
  "ipage": "iPage",
  "fatcow": "FatCow",
  "justhost": "JustHost",
  "hostmonster": "HostMonster",
  "web hosting bluehost": "Bluehost",
  "site builder": "Website Builders",
  "wix": "Wix",
  "squarespace": "Squarespace",
  "weebly": "Weebly",
  "webnode": "Webnode",
  "strikingly": "Strikingly",
  "webflow": "Webflow",
  "carrd": "Carrd",
  "typora": "Typora",
  "obsidian": "Obsidian",
  "notion": "Notion",
  "roam research": "Roam Research",
  "logseq": "Logseq",
  "remnote": "RemNote",
  "anki": "Anki",
  "evernote": "Evernote",
  "onenote": "Microsoft OneNote",
  "google keep": "Google Keep",
  "apple notes": "Apple Notes",
  "todoist": "Todoist",
  "ticktick": "TickTick",
  "things 3": "Things 3",
  "omnifocus": "OmniFocus",
  "remember the milk": "Remember The Milk",
  "any do": "Any.do",
  "wunderlist": "Wunderlist",
  "microsoft to do": "Microsoft To Do",
  "google tasks": "Google Tasks",
  "calendly": "Calendly",
  "acuity scheduling": "Acuity Scheduling",
  "setmore": "Setmore",
  "square appointments": "Square Appointments",
  "bookly": "Bookly",
  "simplybook me": "SimplyBook.me",
  "zoho bookings": "Zoho Bookings",
  "doodle": "Doodle",
  "when2meet": "When2Meet",
  "x.ai": "x.ai",
  " clara labs": "Clara Labs",
  "google calendar": "Google Calendar",
  "microsoft outlook": "Microsoft Outlook",
  "apple calendar": "Apple Calendar",
  "icalendar": "iCalendar",
  "ical": "iCal",
  "caldav": "CalDAV",
  "carddav": "CardDAV",
  "exchange activesync": "Exchange ActiveSync (EAS)",
  "microsoft exchange": "Microsoft Exchange Server",
  "postfix": "Postfix",
  "sendmail": "Sendmail",
  "exim": "Exim",
  "qmail": "qmail",
  "dovecot": "Dovecot",
  "courier imap": "Courier-IMAP",
  "cyrus imap": "Cyrus IMAP",
  "zimbra": "Zimbra",
  "kerio connect": "Kerio Connect",
  "smartermail": "SmarterMail",
  "icewarp": "IceWarp",
  "g suite": "Google Workspace (G Suite)",
  "google workspace": "Google Workspace",
  "microsoft 365": "Microsoft 365",
  "office 365": "Microsoft 365 (Office 365)",
  "outlook": "Microsoft Outlook",
  "word": "Microsoft Word",
  "excel": "Microsoft Excel",
  "powerpoint": "Microsoft PowerPoint",
  "access": "Microsoft Access",
  "visio": "Microsoft Visio",
  "project": "Microsoft Project",
  "publisher": "Microsoft Publisher",
  "infopath": "Microsoft InfoPath",
  "sharepoint": "Microsoft SharePoint",
  "onedrive": "Microsoft OneDrive",
  "google drive": "Google Drive",
  "dropbox": "Dropbox",
  "box": "Box",
  "icloud": "Apple iCloud",
  "mega": "MEGA",
  "pcloud": "pCloud",
  "sync.com": "Sync.com",
  "tresorit": "Tresorit",
  "spideroak": "SpiderOak",
  "backblaze": "Backblaze",
  "carbonite": "Carbonite",
  "crashplan": "CrashPlan",
  "idrive": "IDrive",
  "acronis": "Acronis",
  "mozy": "Mozy",
  "sugar sync": "SugarSync",
  "ubuntu one": "Ubuntu One",
  "amazon drive": "Amazon Drive",
  "google photos": "Google Photos",
  "flickr": "Flickr",
  "imgur": "Imgur",
  "photobucket": "Photobucket",
  "shutterfly": "Shutterfly",
  "smugmug": "SmugMug",
  "500px": "500px",
  "adobe creative cloud": "Adobe Creative Cloud",
  "photoshop": "Adobe Photoshop",
  "illustrator": "Adobe Illustrator",
  "indesign": "Adobe InDesign",
  "after effects": "Adobe After Effects",
  "premiere pro": "Adobe Premiere Pro",
  "final cut pro": "Apple Final Cut Pro",
  "davinci resolve": "Blackmagic DaVinci Resolve",
  "filmora": "Wondershare Filmora",
  "canva": "Canva",
  "piktochart": "Piktochart",
  "venngage": "Venngage",
  "infogram": "Infogram",
  "adobe spark": "Adobe Express (Spark)",
  "crello": "Crello",
  "stencil": "Stencil",
  "snappa": "Snappa",
  "placeit": "Placeit",
  "envato elements": "Envato Elements",
  "envato market": "Envato Market",
  "themeforest": "ThemeForest",
  "codecanyon": "Codecanyon",
  "graphicriver": "GraphicRiver",
  "videohive": "VideoHive",
  "audiojungle": "AudioJungle",
  "photodune": "PhotoDune",
  "3docean": "3DOcean",
  "activeden": "ActiveDen",
  "tutsplus": "Tuts+",
  "udemy": "Udemy",
  "coursera": "Coursera",
  "edx": "edX",
  "udacity": "Udacity",
  "linkedin learning": "LinkedIn Learning",
  "pluralsight": "Pluralsight",
  "lynda": "Lynda.com",
  "skillshare": "Skillshare",
  "masterclass": "MasterClass",
  "teachable": "Teachable",
  "thinkific": "Thinkific",
  "podia": "Podia",
  "kajabi": "Kajabi",
  "learnworlds": "LearnWorlds",
  "mighty networks": "Mighty Networks",
  "circle so": "Circle.so",
  "discord": "Discord",
  "slack": "Slack",
  "telegram": "Telegram",
  "signal": "Signal",
  "whatsapp business": "WhatsApp Business API",
  "viber": "Viber",
  "wechat": "WeChat",
  "line": "LINE",
  "kakaotalk": "KakaoTalk",
  "instagram": "Instagram",
  "facebook": "Facebook",
  "twitter": "Twitter / X",
  "x social": "X (Twitter)",
  "linkedin": "LinkedIn",
  "tiktok": "TikTok",
  "youtube": "YouTube",
  "snapchat": "Snapchat",
  "pinterest": "Pinterest",
  "reddit": "Reddit",
  "quora": "Quora",
  "medium": "Medium",
  "substack": "Substack",
  "ghost": "Ghost CMS",
  "wordpress": "WordPress",
  "blogger": "Blogger",
  "tumblr": "Tumblr",
  "wix": "Wix",
  "squarespace": "Squarespace",
  "weebly": "Weebly",
  "webflow": "Webflow",
  "hashnode": "Hashnode",
  "dev.to": "dev.to",
  "hackernoon": "Hacker Noon",
  "hacker news": "Hacker News",
  "lobsters": "Lobsters",
  "product hunt": "Product Hunt",
  "indie hackers": "Indie Hackers",
  "hackerone": "HackerOne",
  "bugcrowd": "Bugcrowd",
  "synack": "Synack",
  "yeswehack": "YesWeHack",
  "intigriti": "Intigriti",
  "bugbounty": "Bug Bounty Platforms",
  "capture the flag": "Capture The Flag (CTF)",
  "hack the box": "Hack The Box",
  "tryhackme": "TryHackMe",
  "overthewire": "OverTheWire",
  "vulnhub": "VulnHub",
  "pentesterlab": "PentesterLab",
  "root me": "Root-Me",
  "cryptopals": "CryptoPals",
  "leetcode": "LeetCode",
  "hackerrank": "HackerRank",
  "codeforces": "Codeforces",
  "codechef": "CodeChef",
  "topcoder": "Topcoder",
  "spoj": "SPOJ",
  "geeksforgeeks": "GeeksforGeeks",
  "interviewbit": "InterviewBit",
  "lintcode": "LintCode",
  "binarysearch": "BinarySearch.io",
  "algoexpert": "AlgoExpert",
  "systems expert": "SystemsExpert",
  "frontend expert": "FrontendExpert",
  "backend expert": "BackendExpert",
  "ml expert": "MLExpert",
  "programiz": "Programiz",
  "w3schools": "W3Schools",
  "mdn web docs": "MDN Web Docs",
  "stackoverflow": "Stack Overflow",
  "stack exchange": "Stack Exchange Network",
  "github": "GitHub",
  "gitlab": "GitLab",
  "bitbucket": "Bitbucket",
  "azure devops repos": "Azure DevOps Repos",
  "aws codecommit": "AWS CodeCommit",
  "gcp cloud source repositories": "Cloud Source Repositories",
  "sourceforge": "SourceForge",
  "launchpad": "Launchpad",
  "savannah": "GNU Savannah",
  "gitkraken": "GitKraken",
  "sourcetree": "Atlassian Sourcetree",
  "tower git": "Tower Git Client",
  "git extensions": "Git Extensions",
  "smartgit": "SmartGit",
  "sublime merge": "Sublime Merge",
  "fork git client": "Fork",
  "gitfiend": "GitFiend",
  "gittyup": "Gittyup",
  "tig": "Tig",
  "lazygit": "lazygit",
  "gh cli": "GitHub CLI (gh)",
  "glab": "GitLab CLI (glab)",
  "bitbucket cli": "Bitbucket CLI",
  "figma": "Figma",
  "adobe xd": "Adobe XD",
  "sketch": "Sketch",
  "axure rp": "Axure RP",
  "invision": "InVision",
  "marvel app": "Marvel",
  "framer": "Framer",
  "proto.io": "Proto.io",
  "justinmind": "Justinmind",
  "balsamiq mockups": "Balsamiq Wireframes",
  "moqups": "Moqups",
  "wireframe.cc": "wireframe.cc",
  "miro": "Miro",
  "mural": "MURAL",
  "tandem": "Tandem",
  "figjam": "FigJam",
  "microsoft whiteboard": "Microsoft Whiteboard",
  "google jamboard": "Google Jamboard",
  "conceptboard": "Conceptboard",
  "stormboard": "Stormboard",
  "kanbanflow": "KanbanFlow",
  "kanbanize": "Kanbanize",
  "leankit": "LeanKit",
  "targetprocess": "Targetprocess",
  "shortcut": "Shortcut (formerly Clubhouse)",
  "clubhouse": "Shortcut",
  "pivotal tracker": "Pivotal Tracker",
  "fogbugz": "FogBugz",
  "bugzilla": "Bugzilla",
  "mantis bt": "Mantis Bug Tracker",
  "redmine": "Redmine",
  "trac": "Trac",
  "phabricator": "Phabricator",
  "linear": "Linear",
  "height": "Height.app",
  "notion project management": "Notion Projects",
  "coda": "Coda",
  "retrium": "Retrium",
  "parabol": "Parabol",
  "easyretro": "EasyRetro",
  "funretro": "FunRetro",
  "metro retro": "Metro Retro",
  "teamretro": "TeamRetro",
  "slido": "Slido",
  "mentimeter": "Mentimeter",
  "kahoot": "Kahoot!",
  "quizizz": "Quizizz",
  "quizlet": "Quizlet",
  "goconqr": "GoConqr",
  "brainscape": "Brainscape",
  "cram": "Cram.com",
  "study blue": "StudyBlue",
  "course hero": "Course Hero",
  "chegg": "Chegg",
  "bartleby": "Bartleby",
  "scribd": "Scribd",
  "slideshare": "SlideShare",
  "prezi": "Prezi",
  "canva": "Canva",
  "google slides": "Google Slides",
  "microsoft powerpoint": "Microsoft PowerPoint",
  "keynote": "Apple Keynote",
  "google docs": "Google Docs",
  "microsoft word": "Microsoft Word",
  "pages": "Apple Pages",
  "google sheets": "Google Sheets",
  "libreoffice": "LibreOffice",
  "openoffice": "Apache OpenOffice",
  "onlyoffice": "ONLYOFFICE",
  "wps office": "WPS Office",
  "zoho docs": "Zoho Docs / Workplace",
  "zoho writer": "Zoho Writer",
  "zoho sheet": "Zoho Sheet",
  "zoho show": "Zoho Show",
  "google forms": "Google Forms",
  "microsoft forms": "Microsoft Forms",
  "typeform": "Typeform",
  "jotform": "Jotform",
  "wufoo": "Wufoo",
  "formstack": "Formstack",
  "formassembly": "FormAssembly",
  "paperform": "Paperform",
  "tally forms": "Tally",
  "fillout": "Fillout",
  "feishu": "Feishu / Lark",
  "lark suite": "Lark",
  "dingtalk": "DingTalk",
  "wechat work": "WeCom (WeChat Work)",
  "slack": "Slack",
  "microsoft teams": "Microsoft Teams",
  "google meet": "Google Meet",
  "zoom": "Zoom",
  "webex meetings": "Cisco Webex",
  "gotomeeting": "GoToMeeting",
  "gototraining": "GoToTraining",
  "gotowebinar": "GoToWebinar",
  "join me": "join.me",
  "bluejeans": "BlueJeans",
  "whereby": "Whereby",
  "jitsi": "Jitsi Meet",
  "bigbluebutton": "BigBlueButton",
  "zoom api": "Zoom API",
  "twilio video": "Twilio Video API",
  "vonage video": "Vonage Video API",
  "agora.io": "Agora.io",
  "livekit": "LiveKit",
  "daily.co": "Daily.co",
  "mux": "Mux Video API",
  "cloudflare stream": "Cloudflare Stream",
  "fastly media services": "Fastly Media Services",
  "wowza": "Wowza Streaming Engine",
  "kaltura": "Kaltura Video Platform",
  "brightcove": "Brightcove",
  "ooyala": "Ooyala",
  "jw player": "JW Player",
  "video.js": "Video.js",
  "hls.js": "hls.js",
  "dash.js": "dash.js",
  "shaka player": "Shaka Player",
  "videojs": "Video.js",
  "p2p media sharing": "Peer5",
  "cdn video delivery": "CDN Video Delivery",
  "cloudfront": "Amazon CloudFront",
  "fastly cdn": "Fastly CDN",
  "cloudflare cdn": "Cloudflare CDN",
  "akamai cdn": "Akamai CDN",
  "imperva cdn": "Imperva CDN",
  "stackpath cdn": "StackPath CDN",
  "bunny cdn": "Bunny.net CDN",
  "cdn77": "CDN77",
  "keycdn": "KeyCDN",
  "cdn video": "CDN Video",
  "live streaming": "Live Streaming",
  "vod": "Video on Demand (VOD)",
  "srt": "SRT Protocol",
  "rtmp": "RTMP",
  "rtsp": "RTSP",
  "webrtc": "WebRTC",
  "hls": "HLS",
  "dash": "MPEG-DASH",
  "smooth streaming": "Smooth Streaming",
  "mpeg ts": "MPEG-TS",
  "fmp4": "Fragmented MP4",
  "cmaf": "CMAF",
  "av1": "AV1 Codec",
  "h.265": "H.265 / HEVC",
  "h.264": "H.264 / AVC",
  "vp9": "VP9",
  "vp8": "VP8",
  "theora": "Theora",
  "vorbis": "Vorbis",
  "opus": "Opus",
  "aac": "AAC",
  "mp3": "MP3",
  "wav": "WAV",
  "flac": "FLAC",
  "alac": "ALAC",
  "webm": "WebM",
  "mp4": "MP4",
  "mov": "MOV",
  "mkv": "MKV",
  "avi": "AVI",
  "wmv": "WMV",
  "flv": "FLV",
  "m3u8": "HLS Playlist (m3u8)",
  "mpd": "DASH Manifest (MPD)",
  "srt subtitles": "SRT Subtitles",
  "vtt subtitles": "WebVTT Subtitles",
  "closed captions": "Closed Captions (CC)",
  "sami": "SAMI Subtitles",
  "subrip": "SubRip (SRT)",
  "ass subtitles": "ASS/SSA Subtitles",
  "idx sub subtitles": "IDX/SUB Subtitles",
  "ttml": "Timed Text Markup Language (TTML)",
  "ebu ttd": "EBU-TT Subtitles"
};

export interface ExtractedProfile {
  personal: {
    name: string; title: string; email: string; phone: string;
    location: string; github: string; linkedin: string; portfolio: string;
  };
  summary: string;
  skills: { languages: string; frameworks: string; tools: string; competencies: string; };
  experience: Array<{ company: string; role: string; dates: string; description: string; technologies: string; }>;
  education: Array<{ school: string; degree: string; year: string; coursework: string; gpa?: string; }>;
  projects: Array<{ title: string; technologies: string; description: string; }>;
  certifications: string[];
  confidenceScores: {
    name: number; email: number; phone: number;
    skills: number; experience: number; education: number;
    summary: number; location: number; projects: number; certifications: number; overall: number;
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export async function parsePdfWithOpenDataLoader(buffer: Buffer): Promise<string> {
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `resume_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`);

  await fs.promises.writeFile(tempFilePath, buffer);

  return new Promise((resolve, reject) => {
    const jarPath = path.resolve(process.cwd(), "lib", "opendataloader-pdf-cli.jar");
    const args = [
      "-Djava.awt.headless=true",
      "-Dapple.awt.UIElement=true",
      "-jar",
      jarPath,
      tempFilePath,
      "--format",
      "text",
      "--to-stdout",
      "--quiet"
    ];

    const javaProcess = spawn("java", args);
    let stdout = "";
    let stderr = "";

    javaProcess.stdout.on("data", (data) => {
      stdout += data.toString("utf8");
    });

    javaProcess.stderr.on("data", (data) => {
      stderr += data.toString("utf8");
    });

    javaProcess.on("close", async (code) => {
      try {
        await fs.promises.unlink(tempFilePath);
      } catch (unlinkErr) {
        console.error("[ResumeParser] Error deleting temp file:", unlinkErr);
      }

      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`opendataloader-pdf exited with code ${code}: ${stderr || stdout}`));
      }
    });

    javaProcess.on("error", async (err) => {
      try {
        await fs.promises.unlink(tempFilePath);
      } catch (unlinkErr) {
        // ignore
      }
      reject(err);
    });
  });
}

// ─── 1. PDF extraction using OpenDataLoader PDF (with pdfjs-dist and pdf-parse fallbacks) ───
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  // 1. OpenDataLoader (High quality structure sorting, runs on Localhost)
  try {
    console.log("[ResumeParser] Attempting PDF text extraction via OpenDataLoader PDF...");
    const text = await parsePdfWithOpenDataLoader(buffer);
    if (text && text.trim().length > 50) {
      console.log(`[ResumeParser] OpenDataLoader PDF extraction successful (${text.length} characters)`);
      return text;
    }
    console.warn("[ResumeParser] OpenDataLoader PDF extracted text too short, trying fallback...");
  } catch (err: any) {
    console.warn("[ResumeParser] OpenDataLoader PDF failed, trying next fallback. Error:", err.message || err);
  }

  // 2. pdfjs-dist (Standard layout-aware fallback)
  try {
    console.log("[ResumeParser] Attempting PDF text extraction via pdfjs-dist...");
    // Dynamic import to avoid ESM/CJS issues at module load time
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs" as any);

    // pdfjs needs a Uint8Array
    const uint8 = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8, disableFontFace: true });
    const pdfDoc = await loadingTask.promise;

    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const items = textContent.items as Array<{ str: string; transform: number[] }>;

      if (items.length === 0) {
        pageTexts.push("");
        continue;
      }

      // Detect two-column layout via X coordinate spread
      const xPositions = items.map(item => item.transform[4]);
      const minX = Math.min(...xPositions);
      const maxX = Math.max(...xPositions);
      const xSpread = maxX - minX;
      const isTwoColumn = xSpread > 200;
      const midX = minX + xSpread / 2;

      const sortByPosition = (colItems: typeof items) =>
        colItems
          .sort((a, b) => {
            const yDiff = b.transform[5] - a.transform[5]; // Higher Y = higher on page
            if (Math.abs(yDiff) > 5) return yDiff;
            return a.transform[4] - b.transform[4]; // Same line: left to right
          })
          .map(item => item.str)
          .join(" ");

      let pageText: string;
      if (isTwoColumn) {
        const left = items.filter(item => item.transform[4] < midX);
        const right = items.filter(item => item.transform[4] >= midX);
        pageText = sortByPosition(left) + "\n\n" + sortByPosition(right);
      } else {
        pageText = sortByPosition(items);
      }

      // Collapse excessive whitespace while preserving newlines
      pageText = pageText.replace(/ {2,}/g, ' ').trim();
      pageTexts.push(pageText);
    }

    const text = pageTexts.join("\n\n--- PAGE BREAK ---\n\n");
    if (text && text.trim().length > 50) {
      console.log(`[ResumeParser] pdfjs-dist extraction successful (${text.length} characters)`);
      return text;
    }
  } catch (pdfjsErr: any) {
    console.warn("[ResumeParser] pdfjs-dist failed, trying pdf-parse fallback. Error:", pdfjsErr.message || pdfjsErr);
  }

  // 3. pdf-parse (Pure JS fallback, highly compatible with Vercel serverless)
  try {
    console.log("[ResumeParser] Attempting PDF text extraction via pdf-parse...");
    const pdfParse = (await import("pdf-parse" as any)).default;
    const data = await pdfParse(buffer);
    if (data && data.text && data.text.trim().length > 10) {
      console.log(`[ResumeParser] pdf-parse extraction successful (${data.text.length} characters)`);
      return data.text;
    }
  } catch (pdfParseErr: any) {
    console.error("[ResumeParser] pdf-parse fallback failed:", pdfParseErr.message || pdfParseErr);
  }

  throw new Error("All PDF text extraction libraries failed to extract content from this file.");
}

export async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}

export function detectFileType(fileName: string, base64Data: string): "pdf" | "docx" | "unsupported" {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  const prefix = base64Data.substring(0, 8);
  const decoded = Buffer.from(prefix, 'base64').toString('hex').toLowerCase();
  if (decoded.startsWith("25504446")) return "pdf";
  if (decoded.startsWith("504b0304")) return "docx";
  return "unsupported";
}

export function normalizeSkills(skillsString: string): string {
  if (!skillsString) return "";
  const items = skillsString.split(/[,|;]+/).map(s => s.trim()).filter(Boolean);
  const normalized = items.map(item => {
    const lower = item.toLowerCase();
    return SKILL_MAP[lower] || item;
  });
  return Array.from(new Set(normalized)).join(", ");
}

const SECTION_HEADINGS = {
  SUMMARY: /^(summary|professional\s+summary|about\s+me|profile|personal\s+profile|career\s+objective|objective|personal\s+statement|executive\s+summary|career\s+summary|overview|introduction)/i,
  EXPERIENCE: /^(work\s+experience|professional\s+experience|employment\s+history|work\s+history|career\s+history|experience|employment|positions\s+held|roles\s+&?\s*responsibilities|positions)/i,
  SKILLS: /^(technical\s+skills|skills|technologies|tech\s+stack|core\s+competencies|proficiencies|competencies|programming\s+languages|tools\s+&?\s*technologies|technical\s+proficiency|stack|key\s+skills|relevant\s+skills|software\s+skills|languages\s+&?\s*frameworks|technology|expertise|capabilities|accomplishments|strengths)/i,
  EDUCATION: /^(education|academic\s+background|academic\s+education|academic\s+qualification|qualifications|educational\s+background|studies|academic\s+profile|degree|degrees|university|schooling|institutes|academic\s+achievements)/i,
  PROJECTS: /^(projects|personal\s+projects|key\s+projects|notable\s+projects|relevant\s+projects|portfolio|selected\s+projects|side\s+projects|technical\s+projects|major\s+projects|academic\s+projects|case\s+studies|work\s+samples|capstone\s+projects|freelance\s+projects|open\s+source)/i,
  CERTIFICATIONS: /^(certifications|certificates|awards\s+&?\s*certifications|credentials|professional\s+certifications|licenses|licenses\s+&?\s*certifications|certified|achievements|honors\s+&?\s*awards|awards|accomplishments\s+&?\s*awards|distinctions|recognitions)/i,
  COURSEWORK: /^(coursework|relevant\s+coursework|key\s+courses|curriculum|academic\s+coursework|major\s+subjects|subjects)/i,
  STOP: /^(experience|education|skills|projects|certifications|achievements|publications|languages|interests|hobbies|references|volunteer|awards|additional|extra|other|contact|personal\s+info|links|social|technologies|competencies|strengths|summary|objective|profile|overview)/i
};

const LANGUAGES = [
  "javascript","typescript","python","java","c++","c#","ruby","go","rust","kotlin","swift","php","sql","html","css","r","scala","bash",
  "perl","dart","lua","elixir","haskell","clojure","objective-c","objective c","matlab","sas","spss","stata","powershell","shell",
  "vba","assembly","verilog","vhdl","groovy","julia","solidity","ada","fortran","lisp","prolog","scheme","racket","cobol","natural","abap",
  "sml","erlang","ocaml","f#","visual basic","vb.net","d","nim","zig","crystal","odin","j","apl","kdb+","q","t-sql","pl/sql","nosql"
];

const FRAMEWORKS = [
  "react","vue","angular","next.js","nuxt","django","flask","express","spring","fastapi","tailwind","bootstrap","svelte","laravel","rails","nestjs","fastify",
  "redux toolkit","zustand","prisma","trpc","graphql yoga","express.js","koa","hapi","loopback","adonisjs","symfony","codeigniter","cakephp","yii",
  "django rest","fastapi","tornado","pyramid","web2py","spring boot","spring mvc","hibernate","jpa","struts","jsf","grails","play","vert.x","akka",
  "gin","fiber","echo","beego","revel","iris","flask","django","fastapi","starlette","sanic","tornado","pyramid","bottle","cherrypy","falcon","connexion",
  "strapi","contentful","sanity.io","prismic","graphcms","storyblok","oracle content","kentico kontent","sitecore","aem","episerver","umbraco","orchard",
  "wordpress","drupal","joomla","shopify","magento","woocommerce","prestashop","opencart","nopcommerce","bigcommerce","shopware","symfony",
  "gatsby","remix","sveltekit","astro","eleventy","11ty","hugo","jekyll","hexo","gridsome","nuxt","next.js","solidstart","qwikcity","sveltekit",
  "mui","ant design","chakra ui","styled components","emotion","react query","react hook form","formik","yup","zod","react router","vue router",
  "angular material","ngrx","vuex","pinia","redux toolkit","recoil","jotai","valtio","mobx","xstate","rxjs","rxjava","rxswift","rxandroid",
  "react native","flutter","jetpack compose","swiftui","uikit","combine","core data","android sdk","ios sdk",
  "nativescript","ionic","capacitor","cordova","phonegap","xamarin",".net maui","uno platform","avalonia ui","flutter getx","flutter riverpod",
  "bloc","provider","riverpod","getx","mobx","rxdart","flutter bloc","react query","tanstack query","axios","apollo client","urql","relay",
  "three.js","babylon.js","playcanvas","cannon.js","matter.js","pixi.js","phaser","gsap","anime.js","framer motion","popmotion","react spring",
  "three fiber","react three fiber","drei","d3.js","chart.js","chartjs","highcharts","echarts","amcharts","plotly","victory","recharts","visx",
  "leaflet","mapbox gl","openlayers","cesium","deck.gl","luma.gl","react map gl","google maps api","maplibre"
];

const TOOLS = [
  "git","docker","kubernetes","aws","gcp","azure","firebase","supabase","mongodb","postgresql","mysql","redis","elasticsearch","kafka","terraform","nginx","linux","ci/cd","jenkins","github actions",
  "gitlab ci","circleci","argocd","flux cd","spinnaker","tekton","bazel","gradle","maven","ant","make","cmake","ninja","meson","earthly","nix","conda","poetry","pipenv","venv","pyenv","nvm","nodenv","volta","asdf","sdkman",
  "npm","yarn","pnpm","pip","cargo","composer","bundler","gem","go modules","swift package manager","cocoapods","carthage","pub","nuget","paket","docker hub","ecr","gcr","acr","ghcr","harbor","jfrog artifactory","sonatype nexus",
  "helm charts","istio","linkerd","consul","cilium","calico","flannel","prometheus","grafana","datadog","new relic","sentry","dynatrace","appdynamics","splunk","logrhythm","elk","elastic","logstash","kibana","filebeat","metricbeat",
  "zabbix","icinga","nagios","centreon","checkmk","munin","monit","ansible","chef","puppet","saltstack","foreman","rundeck","aws cloudformation","terraform","pulumi","vagrant","packer","vault","consul","nomad",
  "aws s3","aws ec2","aws lambda","aws rds","aws dynamodb","aws sqs","aws sns","aws sagemaker","aws athena","aws redshift","aws cloudfront","aws ecs","aws eks","aws glue","aws emr","aws kinesis","aws step functions",
  "cloud sql","cloud storage","gke","cloud run","cloud functions","bigquery","dataproc","dataflow","pub/sub","cloud spanner","vertex ai",
  "azure sql","azure cosmos db","azure blob storage","azure functions","azure app service","azure kubernetes service","azure devops","azure pipelines",
  "postman","insomnia","curl","soapui","wireshark","charles proxy","burp suite","metasploit","nessus","nmap","owasp zap","sqlmap","hydra","john the ripper",
  "figma","sketch","adobe xd","axure rp","invision","marvel","framer","proto.io","balsamiq","miro","mural","figjam",
  "jira","confluence","trello","asana","monday.com","clickup","notion","linear","shortcut","pivotal tracker","youtrack","azure devops",
  "vscode","visual studio","intellij","pycharm","webstorm","eclipse","android studio","xcode","sublime text","vim","neovim","emacs",
  "photoshop","illustrator","indesign","after effects","premiere pro","final cut pro","davinci resolve","canva",
  "tableau","power bi","looker","qlik sense","sisense","domo","google data studio","microstrategy","sap businessobjects","cognos","actuate",
  "snowflake","bigquery","redshift","databricks","synapse","dremio","starburst","trino","presto","athena","clickhouse","timescaledb","influxdb",
  "rabbitmq","activemq","apache pulsar","nats","zeromq","beanstalkd","sidekiq","resque","bullmq","agenda","celery","python rq","dramatiq","temporal",
  "apache spark","apache flink","apache storm","apache samza","apache kafka","airbyte","fivetran","stitch data","dbt cloud","airflow","prefect","dagster","luigi","mlflow","kubeflow","prefect",
  "chroma","pinecone","weaviate","qdrant","milvus","faiss","annoy","hnswlib","langchain","llamaindex","haystack","transformers","diffusers","datasets","accelerate","peft","bitsandbytes",
  "openai api","anthropic claude","gemini api","cohere api","ai21 labs","pinecone","chroma","weaviate","qdrant","milvus","faiss","langchain","llamaindex",
  "microsoft 365","google workspace","slack","notion","zoom","teams","google meet","webex","calendly","hubspot","salesforce","zendesk","intercom","freshdesk","servicenow",
  "wordpress","shopify","magento","woocommerce","elementor","yoast seo","rank math","wp rocket","litespeed cache","cloudflare","akamai","fastly"
];

const COMPETENCIES = [
  "leadership","team management","project management","agile","scrum","communication","problem solving","critical thinking","collaboration","mentoring",
  "code review","system design","architecture","data analysis","product thinking","customer focus","stakeholder management","time management",
  "conflict resolution","negotiation","presentation","technical writing","documentation","cross-functional collaboration","decision making",
  "prioritization","organizational skills","attention to detail","creativity","innovation","adaptability","resilience","emotional intelligence",
  "data driven decision making","analytical skills","research skills","technical aptitude","fast learner","self motivated","team player",
  "independent worker","proactive","resourceful","results oriented","quality focused","customer service","sales","marketing","content marketing",
  "seo","sem","social media marketing","email marketing","growth hacking","conversion rate optimization","a/b testing","analytics",
  "devops","sre","devsecops","tdd","bdd","ddd","clean architecture","onion architecture","hexagonal architecture","microservices architecture",
  "serverless architecture","event driven architecture","cqrs","saga pattern","repository pattern","dependency injection","solid principles",
  "design patterns","gof patterns","oop","object oriented programming","functional programming","reactive programming",
  "clean code","refactoring","pair programming","extreme programming","test automation","unit testing","integration testing",
  "system testing","e2e testing","smoke testing","regression testing","performance testing","load testing","stress testing",
  "security testing","penetration testing","vulnerability assessment","threat modeling","risk assessment",
  "business continuity","disaster recovery","high availability","fault tolerance","redundancy","replication","backup strategies",
  "version control","git flow","github flow","trunk based development","continuous integration","continuous delivery","continuous deployment",
  "release management","configuration management","infrastructure as code","containerization","orchestration","observability",
  "monitoring","alerting","logging","distributed tracing","apm","error budgets","blameless postmortems","incident management",
  "problem management","change management","itsm","product management","roadmapping","user stories","requirements gathering",
  "account management","client relations","vendor management","contract negotiation","procurement","budgeting","forecasting",
  "financial modeling","data visualization","reporting","dashboards","kpi tracking","okr","kpi","mbo","smart goals",
  "strategy","tactical planning","market research","competitive analysis","swot analysis","pestel analysis","porter five forces",
  "business development","partnerships","alliances","channel sales","saas metrics","recurring revenue","churn reduction","ltv","cac",
  "unit economics","profitability","pricing strategy","positioning","branding","messaging","copywriting","content strategy",
  "ux research","user interviews","usability testing","heuristic evaluation","accessibility","wcag","section 508","a11y",
  "internationalization","localization","i18n","l10n","responsive design","mobile first","progressive enhancement",
  "graceful degradation","offline first","performance optimization","core web vitals","lighthouse","web.dev","page speed",
  "seo best practices","schema markup","structured data","open graph","meta tags","semantic html","web accessibility",
  "api design","restful design","graphql design","api versioning","openapi","swagger","hypermedia","hateoas",
  "authentication","authorization","oauth2","openid connect","saml","sso","mfa","zerotrust","least privilege",
  "secure coding","input validation","output encoding","parameterized queries","prepared statements","csrf protection","xss prevention",
  "sql injection prevention","insecure deserialization","ssrf prevention","path traversal prevention","clickjacking protection",
  "security headers","csp","hsts","x frame options","referrer policy","feature policy","permissions policy",
  "gdpr","hipaa","pci dss","ccpa","iso 27001","soc 2","nist","owasp top 10","cmmc","fedramp",
  "privacy by design","security by default","defense in depth","zero trust architecture","secure sdlc","sast","dast","iast","rasp",
  "threat intelligence","incident response","forensics","malware analysis","reverse engineering","binary exploitation",
  "cryptography","symmetric encryption","asymmetric encryption","hashing","digital signatures","certificates","pki",
  "key management","hsm","kms","secrets management","password hashing","bcrypt","argon2","scrypt","pbkdf2",
  "network security","firewalls","waf","ids","ips","siem","soar","xdr","edr","antivirus","endpoint protection",
  "cloud security","casb","cspm","cwpp","sase","zero trust network access","ztna","vpn","microsegmentation",
  "cloud cost optimization","finops","cloud migration","lift and shift","replatforming","refactoring","modernization",
  "digital transformation","automation","rpa","robotic process automation","ai ml ops","mlops","dataops","devops",
  "data engineering","data pipelines","etl","elt","data warehousing","data lakes","data lakehouse","data mesh",
  "data governance","data quality","data lineage","data catalog","data privacy","data security","master data management",
  "machine learning operations","mlops","model monitoring","model drift detection","feature store","ml registry",
  "experiment tracking","model versioning","model deployment","model serving","tensorflow serving","torchserve","triton",
  "a/b testing","canary deployment","blue green deployment","rolling deployment","feature flags","dark launches",
  "chaos engineering","game days","load testing","soak testing","stress testing","capacity planning","sizing estimation",
  "benchmarking","profiling","tracing","profiling tools","pprof","py-spy","rbspy","perf","dtrace","strace","tcpdump",
  "netstat","wireshark","tcpdump","nmap","netcat","telnet","curl","wget","postman","insomnia","curl",
  "bash scripting","powershell scripting","python scripting","ruby scripting","perl scripting","automation scripts",
  "cron jobs","scheduled tasks","batch processing","queue workers","background jobs","asynchronous processing",
  "web scraping","data crawling","data extraction","data cleaning","data wrangling","data munging","etl pipelines",
  "technical interviews","hiring","recruiting","onboarding","training","enablement","knowledge sharing",
  "community management","open source contributions","public speaking","conferences","meetups","mentorship",
  "coaching","feedback","performance reviews","career development","succession planning","diversity inclusion",
  "belonging","psychological safety","team culture","values alignment","change management","org design",
  "process improvement","kaizen","lean six sigma","continuous improvement","5s","kanban","muda elimination",
  "theory of constraints","goldratt","critical chain","critical path","gantt charts","pert charts","work breakdown structure",
  "earned value management","evm","risk management","issue management","escalation management","status reporting",
  "stakeholder communication","executive reporting","board presentations","investor relations","pricing strategy",
  "monetization","freemium","product led growth","plg","slg","sales led growth","marketplaces","two sided markets",
  "network effects","viral loops","growth loops","aarrr","pirate metrics","retention","engagement","activation",
  "conversion funnels","drop off analysis","user journey mapping","user flows","customer journey","personas",
  "jobs to be done","outcome driven innovation","value proposition design","business model canvas","lean startup",
  "design thinking","design sprints","brainstorming","ideation","prototyping","mvp","minimum viable product",
  "iteration","pivoting","customer development","jobs to be done","value proposition positioning","go to market strategy"
];

const ROLE_KEYWORDS = [
  "engineer","developer","architect","manager","lead","senior","principal","staff","head","director","vp","chief","executive",
  "analyst","scientist","researcher","designer","pm","product manager","program manager","project manager","scrum master",
  "consultant","specialist","expert","administrator","coordinator","supervisor","director","cto","ceo","cfo","coo","cmo","cio",
  "founder","co-founder","intern","internship","trainee","junior","mid-level","mid","sr","associate","assistant","fellow",
  "freelancer","contractor","advisor","board member","teacher","professor","lecturer","instructor","coach","mentor","tutor",
  "doctor","nurse","therapist","lawyer","attorney","accountant","auditor","finance","hr","recruiter","talent","marketing",
  "sales","business","strategy","operations","ops","devops","sre","qa","tester","testing","dba","database","network","security",
  "infosec","cybersecurity","cloud","devsecops","ml","ai","data","frontend","backend","fullstack","full stack","mobile","ios","android",
  "embedded","firmware","hardware","mechanical","electrical","civil","chemical","biomedical","industrial","aerospace","automotive"
];

const COMPANY_KEYWORDS = [
  "inc","inc.","corp","corporation","ltd","limited","llc","l.l.c.","gmbh","gmbh & co. kg","kg","ag","sa","s.a.","nv","bv","sl","s.l.","srl","s.r.l.",
  "sdn bhd","pty ltd","pte ltd","solutions","technologies","systems","labs","laboratories","group","holdings","partners","associates",
  "services","consulting","software","digital","studio","studios","agency","network","networks","communications","media","interactive",
  "ventures","capital","fund","bank","insurance","health","medical","hospital","clinic","university","college","institute","school",
  "government","ministry","department","agency","commission","authority","council","board","office","division","department"
];

const DEGREE_KEYWORDS = [
  "bachelor","b.tech","btech","b.e","be","b.sc","bsc","b.com","bcom","b.arch","bba","bca","b.pharm","b.ed","b.a","ba","b.des","bfa",
  "master","m.tech","mtech","m.e","me","m.sc","msc","m.com","mcom","m.arch","mba","mca","m.pharm","m.ed","m.a","ma","m.des","mfa",
  "phd","ph.d","doctorate","doctoral","postgraduate","graduate","undergraduate","diploma","certificate","associate","hsc","ssc",
  "intermediate","matriculation","high school","secondary","senior secondary","cbse","icse","igcse","ib","a level","o level",
  "bachelor of technology","bachelor of science","bachelor of engineering","bachelor of commerce","bachelor of arts",
  "bachelor of business administration","bachelor of computer applications","bachelor of architecture","bachelor of design",
  "master of technology","master of science","master of engineering","master of commerce","master of arts",
  "master of business administration","master of computer applications","master of architecture","master of design",
  "doctor of philosophy","doctor of medicine","doctor of pharmacy","doctor of dental surgery","juris doctor",
  "chartered accountant","ca","cfa","cpa","cma","cs","acma","acca","cma","cim","cipd","shrm","phr","sphr",
  "pmp","prince2","six sigma","black belt","green belt","yellow belt","itil","cobit","toefl","ielts","gre","gmat","sat","act"
];

function findSection(lines: string[], regex: RegExp): number {
  return lines.findIndex(l => regex.test(l.trim()));
}

function getSectionLines(lines: string[], startIdx: number, stopRegex: RegExp, maxLines: number = 80): string[] {
  const result: string[] = [];
  if (startIdx < 0) return result;
  for (let i = startIdx + 1; i < Math.min(lines.length, startIdx + 1 + maxLines); i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (stopRegex.test(line)) break;
    result.push(line);
  }
  return result;
}

function extractName(lines: string[], email: string): { name: string; confidence: number } {
  let name = "";
  let confidence = 0;

  for (const line of lines.slice(0, 25)) {
    const trimmed = line.trim();
    if (trimmed.length < 2 || trimmed.length > 60) continue;
    if (trimmed.includes('@') || trimmed.includes('http') || trimmed.includes('://')) continue;
    if (/\d{4,}/.test(trimmed)) continue;
    if (/[:;|/()]/.test(trimmed) && !trimmed.includes("'") && !trimmed.includes(".")) continue;
    if (SECTION_HEADINGS.STOP.test(trimmed)) continue;

    const words = trimmed.split(/\s+/).filter(w => w.length >= 1);
    if (words.length >= 2 && words.length <= 5) {
      const titleCaseWords = words.filter(w => /^[A-Z][a-zA-Z'.\-]*$/.test(w) || /^[A-Z]+$/.test(w)).length;
      if (titleCaseWords === words.length) {
        name = trimmed;
        confidence = 85;
        break;
      }
      if (titleCaseWords >= 1 && words.length <= 4) {
        name = trimmed;
        confidence = 70;
      }
    }
  }

  if (!name && email) {
    const emailPrefix = email.split('@')[0].toLowerCase();
    const cleaned = emailPrefix.replace(/[._-]/g, ' ').replace(/\d+/g, '').trim();
    if (cleaned && cleaned.length >= 3) {
      const titleCased = cleaned.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      for (const line of lines.slice(0, 30)) {
        if (line.toLowerCase().includes(cleaned.split(' ').filter(Boolean)[0] || '')) {
          name = line.trim();
          confidence = 80;
          break;
        }
      }
      if (!name) {
        name = titleCased;
        confidence = 55;
      }
    }
  }

  return { name, confidence };
}

function extractLocation(lines: string[]): string {
  const cityPatterns = [
    /([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})(?:\s|$)/,
    /([A-Z][a-zA-Z\s]+),\s*([A-Z][a-zA-Z\s]+)(?:\s|$)/,
    /([A-Z][a-zA-Z\s]+),\s*([A-Z][a-zA-Z]+)(?:\s|$)/,
    /([A-Z][a-zA-Z\s]+)\s*-\s*([A-Z][a-zA-Z\s]+)(?:\s|$)/
  ];

  for (const line of lines.slice(0, 20)) {
    const trimmed = line.trim();
    if (trimmed.includes('@') || trimmed.includes('http') || trimmed.includes('linkedin') || trimmed.includes('github')) continue;
    if (trimmed.length < 5 || trimmed.length > 80) continue;
    for (const pattern of cityPatterns) {
      const m = trimmed.match(pattern);
      if (m) return m[0];
    }
  }

  const indiaStates = [
    "andhra pradesh","arunachal pradesh","assam","bihar","chhattisgarh","goa","gujarat","haryana","himachal pradesh",
    "jharkhand","karnataka","kerala","madhya pradesh","maharashtra","manipur","meghalaya","mizoram","nagaland",
    "odisha","punjab","rajasthan","sikkim","tamil nadu","telangana","tripura","uttarakhand","uttar pradesh","west bengal",
    "delhi","mumbai","bangalore","bengaluru","chennai","hyderabad","pune","kolkata","ahmedabad","surat","jaipur",
    "lucknow","kanpur","nagpur","indore","thane","bhopal","visakhapatnam","pimpri chinchwad","patna","vadodara",
    "ghaziabad","ludhiana","agra","nashik","faridabad","meerut","rajkot","varanasi","srinagar","aurangabad",
    "dhanbad","amritsar","navi mumbai","howrah","ranchi","jabalpur","coimbatore","vijayawada","jodhpur","madurai",
    "raipur","kota","chandigarh","guwahati","bhubaneswar","cuttack","cochin","kochi","thiruvananthapuram","austin",
    "san francisco","san jose","seattle","new york","chicago","boston","los angeles","washington","dallas","houston",
    "atlanta","philadelphia","miami","denver","portland","minneapolis","detroit","san diego","tampa","st. louis",
    "london","manchester","birmingham","leeds","glasgow","edinburgh","liverpool","bristol","sheffield","cardiff",
    "belfast","dublin","cork","galway","paris","lyon","marseille","toulouse","nice","nantes","strasbourg","montpellier",
    "berlin","munich","hamburg","frankfurt","cologne","stuttgart","düsseldorf","leipzig","dresden","bremen",
    "amsterdam","rotterdam","the hague","utrecht","eindhoven","brussels","antwerp","ghent","bruges","vienna",
    "salzburg","innsbruck","zurich","geneva","basel","lausanne","bern","barcelona","madrid","valencia","seville",
    "malaga","bilbao","lisbon","porto","rome","milan","naples","turin","florence","venice","palermo","genoa",
    "bologna","stockholm","gothenburg","malmo","uppsala","oslo","bergen","trondheim","stavanger","copenhagen",
    "aarhus","odense","helsinki","tampere","turku","warsaw","krakow","wroclaw","gdansk","poznan","prague",
    "brno","ostrava","budapest","debrecen","szeged","bucharest","cluj napoca","timisoara","iasi","braila",
    "sofia","plovdiv","varna","burgas","athens","thessaloniki","patras","heraklion","larissa","zagreb",
    "split","rijeka","osijek","belgrade","novisad","nis","kragujevac","skopje","bitola","prilep","tirana",
    "durres","vlore","sarajevo","banja luka","tuzla","zenica","podgorica","niksic","pljevlja","pristina",
    "prizren","mitrovica","peja","gjakova","istok","mitrovice","jakarta","surabaya","bandung","medan",
    "semarang","makassar","palembang","tangerang","depok","pekanbaru","kuala lumpur","george town","ipoh",
    "johor bahru","shah alam","malacca","kuching","kotakinabalu","bangkok","chiang mai","phuket","pattaya",
    "hatyai","nakhon ratchasima","khon kaen","ho chi minh city","hanoi","da nang","can tho","haiphong","bien hoa",
    "manila","quezon city","davao","cebu","zamboanga","cagayan de oro","general santos","angeles","shenzhen",
    "guangzhou","chengdu","wuhan","hangzhou","xian","chongqing","nanjing","tianjin","suzhou","zhengzhou",
    "changsha","dongguan","foshan","shenyang","qingdao","dalian","kunming","xiamen","jinan","harbin",
    "tokyo","yokohama","osaka","nagoya","sapporo","fukuoka","kobe","kyoto","kawasaki","saitama",
    "seoul","busan","incheon","daegu","daejeon","gwangju","suwon","ulsan","jeonju","cheonju",
    "taipei","new taipei","taichung","kaohsiung","tainan","taoyuan","hsinchu","keelung","chiayi","pingtung",
    "hong kong","kowloon","new territories","macau","singapore","sydney","melbourne","brisbane","perth",
    "adelaide","gold coast","newcastle","canberra","sunshine coast","central coast","wollongong","geelong",
    "hobart","darwin","alice springs","launceston","townsville","cairns","mackay","rockhampton","toowoomba",
    "auckland","wellington","christchurch","hamilton","napier hastings","dunedin","palmerston north","tauranga",
    "lower hutt","invercargill","whangarei","new plymouth","rotorua","nelsontasman","cambridge","queenstown",
    "sao paulo","rio de janeiro","salvador","brasilia","fortaleza","belo horizonte","manaus","curitiba",
    "recife","porto alegre","belem","goiania","guarulhos","campinas","sao luis","maceio","natal","teresina",
    "buenos aires","cordoba","rosario","mendoza","la plata","tucuman","mar del plata","salta","santa fe",
    "santiago de chile","valparaiso","concepcion","la serena","antofagasta","temuco","rica rica","punta arenas",
    "iquique","arica","lima","arequipa","trujillo","chiclayo","piura","iquitos","cusco","callao","huancayo",
    "bogota","medellin","cali","barranquilla","cartagena","cucuta","bucaramanga","ibague","pereira","santa marta",
    "caracas","maracaibo","valencia","barquisimeto","ciudad guayana","san cristobal","maracay","barcelona",
    "quito","guayaquil","cuenca","santo domingo de los tsachilas","machala","loja","ambato","esmeraldas","sangolqui",
    "asuncion","ciudad del este","san lorenzo","luque","fernando de la mora","limpio","caaguazu","encarnacion",
    "montevideo","salto","ciudad de la costa","las piedras","rivera","maldonado","tacuarembo","melo","mercedes",
    "georgetown","linden","new amsterdam","corriverton","bartica","mahdia","mabaruma","port kaituma",
    "paramaribo","lantan","nieuw nickerie","commewijne","wanica","para","saramacca","marowijne","coronie","sipaliwini"
  ];

  const lowerFullText = lines.slice(0, 20).join(' ').toLowerCase();
  for (const loc of indiaStates) {
    if (lowerFullText.includes(loc)) {
      const idx = lowerFullText.indexOf(loc);
      const start = Math.max(0, idx - 30);
      const end = Math.min(lowerFullText.length, idx + loc.length + 20);
      const context = lines.slice(0, 20).join(' ').substring(start, end);
      const cleaned = context.replace(/[^a-zA-Z0-9,\s]/g, ' ').trim();
      if (cleaned.length < 100) return cleaned.split(/\s+/).filter(w => w.length > 1).join(' ');
      return loc.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  return "";
}

function extractSummary(lines: string[]): string {
  const idx = findSection(lines, SECTION_HEADINGS.SUMMARY);
  if (idx >= 0) {
    const sectionLines = getSectionLines(lines, idx, SECTION_HEADINGS.STOP, 40);
    if (sectionLines.length > 0) {
      return sectionLines.join(' ').trim();
    }
  }

  const expIdx = findSection(lines, SECTION_HEADINGS.EXPERIENCE);
  const endIdx = expIdx > 0 ? expIdx : Math.min(lines.length, 30);
  const paragraphLines: string[] = [];
  for (let i = Math.min(5, lines.length); i < endIdx; i++) {
    const line = lines[i].trim();
    if (line.length < 15) continue;
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) continue;
    if (line.includes('@') || line.includes('http') || line.includes('linkedin') || line.includes('github')) continue;
    if (/^\d/.test(line) && line.length < 15) continue;
    paragraphLines.push(line);
    if (paragraphLines.join(' ').length > 400) break;
  }
  return paragraphLines.join(' ').trim().slice(0, 800);
}

function extractExperience(lines: string[], allSkillsLower: string[]): ExtractedProfile['experience'] {
  const experience: ExtractedProfile['experience'] = [];
  const expIdx = findSection(lines, SECTION_HEADINGS.EXPERIENCE);
  if (expIdx < 0) return experience;

  let current: ExtractedProfile['experience'][0] | null = null;
  const stopSection = SECTION_HEADINGS.STOP;

  for (let i = expIdx + 1; i < Math.min(lines.length, expIdx + 80); i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) continue;
    if (stopSection.test(line) && SECTION_HEADINGS.EXPERIENCE.test(line) === false) break;

    const dateRegex = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december|\b\d{2}|\d{4})[\s,–\-–to—presentcurrent]+(?:present|current|\d{4}|current)\b/i;
    const simpleDateRegex = /\d{4}\s*[-–—]\s*(?:\d{4}|present|current)/i;
    const dateMatch = line.match(dateRegex) || line.match(simpleDateRegex);

    const isDateLine = !!dateMatch && (line.length < 100 || line.length < 150);
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('◦') || line.startsWith('▸') || line.startsWith('▫');
    const looksLikeRole = ROLE_KEYWORDS.some(kw => new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i').test(line));
    const looksLikeCompany = COMPANY_KEYWORDS.some(kw => new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i').test(line.toLowerCase())) && line.length > 3;

    if (isDateLine) {
      if (current) experience.push(current);
      current = {
        company: '',
        role: '',
        dates: (dateMatch?.[0] || '').trim(),
        description: '',
        technologies: ''
      };
      const cleanLine = line.replace(dateMatch![0], '').replace(/[,|–\-—•*:]+$/g, '').trim();
      const parts = cleanLine.split(/\s*[|,–\-—@]+\s*|\s{2,}/).filter(Boolean);

      if (parts.length >= 1) {
        const firstPart = parts[0].trim();
        if (firstPart && !ROLE_KEYWORDS.some(kw => new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i').test(firstPart))) {
          current.company = firstPart;
        } else if (firstPart) {
          current.role = firstPart;
        }
        if (parts.length >= 2) {
          for (let j = 1; j < parts.length; j++) {
            const p = parts[j].trim();
            if (!current.role && looksLikeRole && ROLE_KEYWORDS.some(kw => new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i').test(p))) {
              current.role = p;
            } else if (!current.company && !ROLE_KEYWORDS.some(kw => new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i').test(p))) {
              current.company = p;
            }
          }
        }
      }
      continue;
    }

    if (current) {
      if (isBullet) {
        current.description += `${line.startsWith('•') ? line : '• ' + line.replace(/^[•\-*◦▸▫]\s*/, '')}\n`;
      } else if (looksLikeRole && !current.role && line.length < 80 && line.length > 3) {
        current.role = line;
      } else if (!current.company && looksLikeCompany && line.length > 2 && line.length < 80 && !ROLE_KEYWORDS.some(kw => new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i').test(line))) {
        current.company = line;
      } else if (!current.role && line.length > 3 && line.length < 80 && current.company && line !== current.company) {
        current.role = line;
      } else if (line.length > 5) {
        if (current.description.length > 5 && !current.description.trim().endsWith('\n')) current.description += '\n';
        current.description += line.length < 200 ? `• ${line}\n` : line + '\n';
      }
    }
  }

  if (current) experience.push(current);

  const cleaned: ExtractedProfile['experience'] = [];
  for (const exp of experience) {
    const descLower = exp.description.toLowerCase();
    const techsFound: string[] = [];
    for (const skill of allSkillsLower) {
      if (new RegExp(`\\b${escapeRegex(skill)}\\b`, 'i').test(descLower) && !techsFound.includes(skill)) {
        techsFound.push(skill);
      }
    }
    cleaned.push({
      company: exp.company.replace(/\s+/g, ' ').trim(),
      role: exp.role.replace(/\s+/g, ' ').trim(),
      dates: exp.dates,
      description: exp.description.replace(/\n{3,}/g, '\n\n').trim(),
      technologies: techsFound.slice(0, 15).join(', ')
    });
  }
  return cleaned;
}

function extractEducation(lines: string[]): ExtractedProfile['education'] {
  const education: ExtractedProfile['education'] = [];
  const eduIdx = findSection(lines, SECTION_HEADINGS.EDUCATION);
  if (eduIdx < 0) return education;

  const stopSection = SECTION_HEADINGS.STOP;
  const courseworkIdx = findSection(lines.slice(eduIdx), SECTION_HEADINGS.COURSEWORK);

  let currentEdu: Partial<ExtractedProfile['education'][0]> | null = null;

  for (let i = eduIdx + 1; i < Math.min(lines.length, eduIdx + 40); i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (stopSection.test(line) && line.length < 40 && !SECTION_HEADINGS.EDUCATION.test(line) && !SECTION_HEADINGS.COURSEWORK.test(line)) break;

    if (SECTION_HEADINGS.COURSEWORK.test(line)) continue;

    const hasYear = /\b(19|20)\d{2}\b/.test(line);
    const hasDegree = DEGREE_KEYWORDS.some(d => new RegExp(`\\b${escapeRegex(d)}\\b`, 'i').test(line));
    const gpaMatch = line.match(/(?:gpa|cgpa|grade|marks|percentage|score)\s*[:=]?\s*([0-9./%]+)/i);
    const simpleGpaMatch = line.match(/\b([0-9]{1,2}\.[0-9]{1,3})\s*\/?\s*(10|4\.0|100)?\b/);

    if (hasYear || (hasDegree && !currentEdu)) {
      if (currentEdu) {
        education.push(currentEdu as any);
      }
      currentEdu = { school: '', degree: '', year: '', coursework: '' };

      const yearMatch = line.match(/\b((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)?\d{2}|present|current)\b/i) ||
                         line.match(/\b((?:19|20)\d{2})\b/);
      if (yearMatch) {
        currentEdu.year = yearMatch[0];
      }

      if (gpaMatch) {
        currentEdu.gpa = gpaMatch[1];
      } else if (simpleGpaMatch && parseFloat(simpleGpaMatch[1]) < 100) {
        currentEdu.gpa = simpleGpaMatch[0];
      }

      const cleanLine = line
        .replace(currentEdu.year || '', '')
        .replace(gpaMatch?.[0] || '', '')
        .replace(simpleGpaMatch?.[0] || '', '')
        .replace(/[,|–\-—:()]+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();

      const parts = cleanLine.split(/\s{2,}|[|,]/).filter(Boolean).map(p => p.trim()).filter(Boolean);
      for (const part of parts) {
        if (!currentEdu.degree && DEGREE_KEYWORDS.some(d => new RegExp(`\\b${escapeRegex(d)}\\b`, 'i').test(part))) {
          currentEdu.degree = part;
        } else if (part.length > 4) {
          if (!currentEdu.school || currentEdu.school.length < part.length) {
            currentEdu.school = part;
          }
        }
      }
    } else if (currentEdu) {
      if (gpaMatch && !currentEdu.gpa) {
        currentEdu.gpa = gpaMatch[1];
      } else if (simpleGpaMatch && !currentEdu.gpa && parseFloat(simpleGpaMatch[1]) < 100) {
        currentEdu.gpa = simpleGpaMatch[0];
      } else if (DEGREE_KEYWORDS.some(d => new RegExp(`\\b${escapeRegex(d)}\\b`, 'i').test(line)) && !currentEdu.degree) {
        currentEdu.degree = line;
      } else if (line.length > 5 && line.length < 120) {
        if (!currentEdu.school) {
          currentEdu.school = line;
        } else if (!currentEdu.degree) {
          currentEdu.degree = line;
        } else {
          currentEdu.coursework = (currentEdu.coursework + ' ' + line).trim();
        }
      }
    }
  }

  if (currentEdu) education.push(currentEdu as any);

  if (courseworkIdx > 0) {
    const cwLines = getSectionLines(lines.slice(eduIdx), courseworkIdx, SECTION_HEADINGS.STOP, 15);
    const coursework = cwLines.join(', ').replace(/\s{2,}/g, ' ').trim();
    if (coursework && education.length > 0) {
      education[0].coursework = coursework;
    }
  }

  return education.filter(e => e.school || e.degree).map(e => ({
    school: (e.school || '').trim(),
    degree: (e.degree || '').trim(),
    year: (e.year || '').trim(),
    coursework: (e.coursework || '').trim(),
    gpa: e.gpa?.trim() || ''
  }));
}

function extractProjects(lines: string[], allSkillsLower: string[]): ExtractedProfile['projects'] {
  const projects: ExtractedProfile['projects'] = [];
  const projIdx = findSection(lines, SECTION_HEADINGS.PROJECTS);
  if (projIdx < 0) return projects;

  let current: Partial<ExtractedProfile['projects'][0]> | null = null;
  const stopSection = SECTION_HEADINGS.STOP;

  for (let i = projIdx + 1; i < Math.min(lines.length, projIdx + 80); i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (stopSection.test(line) && line.length < 40 && !SECTION_HEADINGS.PROJECTS.test(line)) break;

    const hasColon = line.includes(':');
    const hasTechnologiesKeyword = /^(tech|stack|technologies|tools|built with|made with|developed using|using|platform|tech stack)/i.test(line);

    if (current && hasTechnologiesKeyword) {
      const techValue = line.replace(/^[^:]*:\s*/, '').trim();
      const techItems = techValue.split(/[,|;]+/).map(s => s.trim()).filter(Boolean);
      current.technologies = techItems.join(', ');
      continue;
    }

    if (current && hasColon && /^(title|name|project)/i.test(line)) {
      current.title = line.replace(/^[^:]*:\s*/, '').trim();
      continue;
    }

    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('◦') || line.startsWith('▸');
    const isShortNoPunct = line.length < 80 && line.length > 3 && !line.endsWith('.') && !isBullet && !hasColon;

    if ((isShortNoPunct && !current) || (line.length < 70 && line.length > 3 && !current && !isBullet)) {
      if (current) projects.push(current as any);
      current = { title: line, technologies: '', description: '' };
      continue;
    }

    if (current) {
      if (isBullet) {
        current.description += `${line.startsWith('•') ? line : '• ' + line.replace(/^[•\-*◦▸▫]\s*/, '')}\n`;
      } else if (!current.technologies && hasColon && /(tech|technologies|tools|using)/i.test(line.split(':')[0])) {
        current.technologies = line.replace(/^[^:]*:\s*/, '').trim();
      } else if (line.length > 3) {
        if (current.description && !current.description.endsWith('\n')) current.description += '\n';
        current.description += line.length < 300 ? line : line.slice(0, 300);
      }
    } else {
      current = { title: line.slice(0, 80), technologies: '', description: '' };
    }
  }

  if (current) projects.push(current as any);

  return projects.filter(p => p.title || p.description).map(p => {
    const descLower = (p.description || '').toLowerCase();
    if (!p.technologies) {
      const techs: string[] = [];
      for (const skill of allSkillsLower) {
        if (new RegExp(`\\b${escapeRegex(skill)}\\b`, 'i').test(descLower) && !techs.includes(skill)) {
          techs.push(skill);
        }
      }
      p.technologies = techs.slice(0, 10).join(', ');
    }
    return {
      title: (p.title || '').slice(0, 120).trim(),
      technologies: (p.technologies || '').slice(0, 300).trim(),
      description: (p.description || '').trim().slice(0, 1000)
    };
  });
}

function extractCertifications(lines: string[]): string[] {
  const certifications: string[] = [];
  const certIdx = findSection(lines, SECTION_HEADINGS.CERTIFICATIONS);
  if (certIdx < 0) return certifications;

  const stopSection = SECTION_HEADINGS.STOP;

  for (let i = certIdx + 1; i < Math.min(lines.length, certIdx + 40); i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (stopSection.test(line) && line.length < 40 && !SECTION_HEADINGS.CERTIFICATIONS.test(line)) break;

    const items = line
      .replace(/^[•\-*◦▸▫]\s*/, '')
      .split(/\s*[;|]\s*/)
      .map(s => s.trim())
      .filter(s => s.length >= 4 && s.length <= 150);

    for (const item of items) {
      const cleaned = item
        .replace(/\s*\(?\s*\d{4}\s*\)?\s*$/, '')
        .replace(/\s*\(?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}\s*\)?\s*$/i, '')
        .replace(/\s*\(?\s*(issued|expires|expire|valid|certified|date)[^)]*\)?\s*$/i, '')
        .replace(/\s*[-–—|,.:]\s*$/, '')
        .trim();
      if (cleaned.length >= 4 && !certifications.includes(cleaned)) {
        certifications.push(cleaned);
      }
    }
  }

  return certifications.slice(0, 20);
}

export function extractProfileFromText(text: string): ExtractedProfile {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{0,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{0,4}/);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub|company|school|groups)\/[\w\-_%./]+/i);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w\-./]+/i);
  const portfolioMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?!linkedin|github|twitter|facebook|instagram|youtube|medium|quora|reddit)[\w-]+\.(?:com|org|net|io|dev|me|in|co|app|ai|xyz|tech|design|studio|agency|online)[\w\-./]*/i);

  const email = emailMatch ? emailMatch[0].trim() : "";
  let phone = phoneMatch ? phoneMatch[0].trim() : "";
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) phone = "";
  }
  const linkedin = linkedinMatch ? linkedinMatch[0].trim() : "";
  const github = githubMatch ? githubMatch[0].trim() : "";
  let portfolio = portfolioMatch && !portfolioMatch[0].includes(linkedin) && !portfolioMatch[0].includes(github) ? portfolioMatch[0].trim() : "";
  if (portfolio && (portfolio.includes('resume') || portfolio.includes('cv') || portfolio.includes('linkedin') || portfolio.includes('github'))) {
    portfolio = "";
  }

  const { name, confidence: nameConfidence } = extractName(lines, email);
  const location = extractLocation(lines);
  const summary = extractSummary(lines);

  const lowerText = text.toLowerCase();

  const foundLanguages: string[] = [];
  const foundFrameworks: string[] = [];
  const foundTools: string[] = [];
  const foundCompetencies: string[] = [];

  const skillWindowLines: string[] = [];
  const skillIdx = findSection(lines, SECTION_HEADINGS.SKILLS);
  if (skillIdx >= 0) {
    skillWindowLines.push(...getSectionLines(lines, skillIdx, SECTION_HEADINGS.STOP, 50));
  } else {
    skillWindowLines.push(...lines.slice(0, Math.min(80, lines.length)));
  }
  const skillWindowText = skillWindowLines.join(' ').toLowerCase();
  const expWindowText = findSection(lines, SECTION_HEADINGS.EXPERIENCE) >= 0
    ? getSectionLines(lines, findSection(lines, SECTION_HEADINGS.EXPERIENCE), SECTION_HEADINGS.STOP, 80).join(' ').toLowerCase()
    : '';
  const combinedSkillSearch = (skillWindowText + ' ' + expWindowText + ' ' + lowerText);

  LANGUAGES.forEach(lang => {
    if (new RegExp(`\\b${escapeRegex(lang)}\\b`, 'i').test(combinedSkillSearch)) {
      const normalized = SKILL_MAP[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
      if (!foundLanguages.includes(normalized)) foundLanguages.push(normalized);
    }
  });

  FRAMEWORKS.forEach(fw => {
    if (new RegExp(`\\b${escapeRegex(fw)}\\b`, 'i').test(combinedSkillSearch)) {
      const normalized = SKILL_MAP[fw] || fw.charAt(0).toUpperCase() + fw.slice(1);
      if (!foundFrameworks.includes(normalized)) foundFrameworks.push(normalized);
    }
  });

  TOOLS.forEach(tool => {
    if (new RegExp(`\\b${escapeRegex(tool)}\\b`, 'i').test(combinedSkillSearch)) {
      const normalized = SKILL_MAP[tool] || tool.charAt(0).toUpperCase() + tool.slice(1);
      if (!foundTools.includes(normalized)) foundTools.push(normalized);
    }
  });

  COMPETENCIES.forEach(comp => {
    if (new RegExp(`\\b${escapeRegex(comp)}\\b`, 'i').test(lowerText)) {
      const normalized = comp.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (!foundCompetencies.includes(normalized)) foundCompetencies.push(normalized);
    }
  });

  const allSkillsLower = [...LANGUAGES, ...FRAMEWORKS, ...TOOLS].map(s => s.toLowerCase());
  const experience = extractExperience(lines, allSkillsLower);
  const education = extractEducation(lines);
  const projects = extractProjects(lines, allSkillsLower);
  const certifications = extractCertifications(lines);

  const title = experience[0]?.role || "";

  const totalSkills = foundLanguages.length + foundFrameworks.length + foundTools.length;
  const skillsConf = totalSkills >= 10 ? 95 : totalSkills >= 5 ? 85 : totalSkills >= 2 ? 75 : totalSkills > 0 ? 55 : 0;
  const expConf = experience.length >= 3 ? 95 : experience.length > 0 ? 90 : 0;
  const eduConf = education.length >= 2 ? 95 : education.length > 0 ? 90 : 0;
  const nameConf = nameConfidence;
  const emailConf = email ? 99 : 0;
  const phoneConf = phone ? 95 : 0;
  const summaryConf = summary.length > 80 ? 90 : summary.length > 30 ? 75 : summary.length > 0 ? 55 : 0;
  const locationConf = location.length > 0 ? 85 : 0;
  const projectsConf = projects.length >= 2 ? 90 : projects.length > 0 ? 80 : 0;
  const certsConf = certifications.length >= 3 ? 90 : certifications.length > 0 ? 80 : 0;

  const overall = Math.round(
    (nameConf * 0.08) + (emailConf * 0.07) + (phoneConf * 0.05) +
    (locationConf * 0.05) + (summaryConf * 0.10) +
    (skillsConf * 0.18) + (expConf * 0.22) + (eduConf * 0.10) +
    (projectsConf * 0.08) + (certsConf * 0.07)
  );

  return {
    personal: {
      name,
      title,
      email,
      phone,
      location,
      github,
      linkedin,
      portfolio
    },
    summary,
    skills: {
      languages: foundLanguages.join(', '),
      frameworks: foundFrameworks.join(', '),
      tools: foundTools.join(', '),
      competencies: foundCompetencies.slice(0, 20).join(', ')
    },
    experience,
    education,
    projects,
    certifications,
    confidenceScores: {
      name: nameConf,
      email: emailConf,
      phone: phoneConf,
      skills: skillsConf,
      experience: expConf,
      education: eduConf,
      summary: summaryConf,
      location: locationConf,
      projects: projectsConf,
      certifications: certsConf,
      overall
    }
  };
}
