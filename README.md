# 🧠 AI Exam Readiness Checker

**Winner Project for Panda Hacks 2025** 🏆

An intelligent study companion that transforms your notes into personalized quizzes using advanced AI, helping high school students study smarter and achieve better grades.

![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.3.1-blue)

## 🌟 Features

### ✨ Core Features

- **AI-Powered Quiz Generation**: Upload notes/syllabus → Get personalized quizzes instantly
- **Adaptive Testing**: Questions adjust based on your performance level
- **Multiple Question Types**: MCQ, Short Answer, Fill-in-the-blank
- **Instant Feedback**: Get immediate results with detailed explanations
- **Progress Tracking**: Monitor improvement over time with analytics
- **Study Streaks**: Gamified learning to maintain motivation

### 🎯 Advanced Features

- **Smart Analytics Dashboard**: Visualize performance trends and weak areas
- **Community Quizzes**: Browse and take quizzes created by other students
- **Leaderboards**: Compete with peers and track rankings
- **Personalized Recommendations**: AI suggests study focus areas
- **Achievement System**: Unlock badges and milestones
- **Mobile-First Design**: Responsive interface optimized for all devices

## 🛠 Tech Stack

### Frontend

- **React 18** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **Recharts** - Data visualization
- **React Hook Form** - Form handling

### Backend

- **Node.js + Express** - Server framework
- **MongoDB + Mongoose** - Database and ODM
- **JWT Authentication** - Secure user sessions
- **OpenAI GPT-4** - AI quiz generation
- **Multer** - File uploads
- **Joi** - Input validation
- **Helmet** - Security middleware

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas)
- **OpenAI API key**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-exam-readiness-checker.git
cd "AI Exam Readiness Checker"
```

### 2. Install Dependencies

```bash
# Install root and client dependencies
npm run install-all
```

### 3. Environment Setup

#### Backend (.env)

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ai-exam-checker

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-jwt-key

# OpenAI API (required for quiz generation)
OPENAI_API_KEY=your-openai-api-key-here

# Client URL for CORS
CLIENT_URL=http://localhost:5173
```

#### Frontend (client/.env)

```bash
VITE_API_URL=http://localhost:5000/api
```

### 4. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create account/login
3. Go to API Keys section
4. Create new secret key
5. Add to your `.env` file

### 5. Start Development Servers

```bash
# Start both backend and frontend
npm run dev

# Or start individually:
npm run server  # Backend only
npm run client  # Frontend only
```

### 6. Open Your Browser

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## 📱 Demo Credentials

For quick testing:

- **Email**: demo@student.com
- **Password**: demo123

## 🎮 How to Use

### Creating Your First Quiz

1. **Sign up/Login** to your account
2. **Click "Create Quiz"** on the dashboard
3. **Upload or paste** your study material
4. **Configure settings** (difficulty, question count, types)
5. **Generate quiz** and start learning!

### Taking a Quiz

1. **Select a quiz** from your dashboard or browse community quizzes
2. **Answer questions** at your own pace
3. **Get instant feedback** with explanations
4. **Review results** and focus on weak areas

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Quizzes

- `POST /api/quiz/generate` - Generate quiz from content
- `GET /api/quiz/:id` - Get specific quiz
- `POST /api/quiz/:id/submit` - Submit quiz answers
- `GET /api/quiz/user/attempts` - Get user's quiz history
- `GET /api/quiz/user/stats` - Get user statistics

### User Analytics

- `GET /api/user/dashboard` - Dashboard data
- `GET /api/user/analytics` - Detailed analytics
- `GET /api/user/leaderboard` - Leaderboard rankings

## 🏗 Project Structure

```
AI Exam Readiness Checker/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # State management
│   │   ├── utils/         # Helper functions
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                 # Node.js backend
│   ├── models/            # Database schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic
│   └── server.js          # Entry point
├── .env                   # Backend environment
└── package.json           # Root dependencies
```

## 🎨 Design Philosophy

### Student-Centric UX

- **Intuitive Navigation**: Clear, icon-based interface
- **Motivational Elements**: Streaks, badges, celebrations
- **Mobile-First**: Optimized for studying on-the-go
- **Accessibility**: WCAG compliant design

### Performance

- **Fast Loading**: Optimized bundles and lazy loading
- **Offline Support**: PWA capabilities (future enhancement)
- **Real-time Updates**: Live progress tracking

## 🔮 Future Enhancements

- **📱 Mobile App**: Native iOS/Android apps
- **🔍 OCR Integration**: Extract text from handwritten notes
- **🎮 Gamification**: More achievements, XP system
- **👥 Study Groups**: Collaborate with classmates
- **📚 Subject Templates**: Pre-built quiz templates
- **🎯 AI Tutoring**: Personalized study recommendations
- **📊 Parent Dashboard**: Progress sharing with parents

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🎖 Awards & Recognition

- **🏆 Winner - Panda Hacks 2025**
- **🎯 Best Use of AI for Education**
- **💡 Most Innovative Student Tool**

## 👥 Team

- **Full-Stack Development**: Built with ❤️ for students
- **AI Integration**: Powered by OpenAI GPT-4
- **UX Design**: Student-centered approach

## 📞 Support

Need help? We're here for you!

- 📧 **Email**: support@ai-exam-checker.com
- 📝 **Issues**: [GitHub Issues](https://github.com/your-username/ai-exam-readiness-checker/issues)

## 🌟 Show Your Support

If this project helped you ace your exams, please ⭐ star this repo and share it with your classmates!

---

**Made with 💙 for students, by students**

_"Study smarter, not harder" - AI Exam Readiness Checker Team_
