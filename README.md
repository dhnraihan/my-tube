<div align="center">
  <h1>🎬 MyTube</h1>
  <p>A modern video sharing platform built with Django, React, and TypeScript</p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  ![Django](https://img.shields.io/badge/Django-092E20?style=flat&logo=django&logoColor=white)
  ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
  
  [![Demo](https://img.shields.io/badge/Live_Demo-FF5722?style=for-the-badge&logo=youtube&logoColor=white)](#live-demo) 
  [![Documentation](https://img.shields.io/badge/Documentation-4285F4?style=for-the-badge&logo=readthedocs&logoColor=white)](#documentation)
</div>

## 🌟 Features

- 🎥 Upload, view, and share videos
- 🔍 Advanced search with filters
- 📱 Responsive design for all devices
- 🔔 Real-time notifications
- 💬 Comments and replies
- 👍 Like and save videos
- 📺 Subscription system
- 📊 Analytics dashboard
- 🔒 User authentication & authorization
- 🏷️ Video categorization and tagging

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **API Client**: Axios
- **Form Handling**: React Hook Form
- **Video Player**: React Player

### Backend
- **Framework**: Django 5.2
- **Database**: PostgreSQL
- **Authentication**: JWT
- **API**: Django REST Framework
- **Storage**: AWS S3 / Local Storage
- **Caching**: Redis
- **Task Queue**: Celery

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL
- Redis

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/dhnraihan/my-tube.git
   cd mytube/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## 🏗️ Project Structure

```
mytube/
├── backend/               # Django backend
│   ├── api/               # API endpoints
│   ├── accounts/          # User authentication
│   ├── videos/            # Video app
│   ├── manage.py          # Django management script
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── app/          # Redux store and API slices
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   └── utils/        # Utility functions
│   └── package.json      # Node dependencies
└── README.md             # This file
```

## 🌐 API Documentation

API documentation is available at `/api/docs/` when running the development server.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Django](https://www.djangoproject.com/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

---

<div align="center">
  Made with ❤️ by Raihan.
</div>
