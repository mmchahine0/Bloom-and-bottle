# Bloom and Bottle

Bloom and Bottle is a full-stack e-commerce web application for perfumes and samples, featuring a modern user interface, robust admin dashboard, and seamless shopping experience.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- 🛒 User-friendly shopping cart and checkout
- 🔐 Authentication & Authorization (user/admin)
- 📦 Product, Collection, and Order management (admin)
- 📝 Reviews and feedback system
- 🔔 Notifications
- 📱 Responsive design
- 🌐 SEO optimized
- ☁️ Image upload (AWS S3)
- 📊 Dashboard analytics (admin)
- 🛡️ Rate limiting and security best practices

---

## Tech Stack

**Frontend:**
- React (TypeScript)
- Vite
- Redux Toolkit
- React Query
- CSS Modules

**Backend:**
- Node.js
- Express.js
- TypeScript
- MongoDB (with Mongoose)
- Redis (rate limiting, caching)
- AWS S3 (file storage)

**Other:**
- Vercel (deployment)
- ESLint, Prettier (code quality)
- Jest (testing, if applicable)

---

## Project Structure

```plaintext
Bloom-and-bottle/
  ├── client/      # Frontend (React)
  │   ├── src/
  │   └── ...
  └── server/      # Backend (Node.js/Express)
      ├── src/
      └── ...
```

### Notable Folders

- `client/src/features/` – Main app features (cart, products, admin, etc.)
- `client/src/components/` – Reusable UI and layout components
- `server/src/features/` – API endpoints grouped by feature
- `server/src/database/model/` – Mongoose models
- `server/src/utils/` – Utility functions (email, AWS, etc.)

---

## Getting Started

### Prerequisites

- Node.js (v16+)
- Yarn (or npm)
- MongoDB instance
- AWS S3 bucket (for image uploads)
- Redis instance (optional, for rate limiting/caching)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Bloom-and-bottle.git
cd Bloom-and-bottle
```

### 2. Install dependencies

```bash
cd client
yarn install
cd ../server
yarn install
```

### 3. Set up environment variables

Create `.env` files in both `client/` and `server/` directories. Example for server:

```env
server/ 

MONGODB_URI=""
JWT_REFRESH_SECRET=""
JWT_SECRET=""

CORS_ORIGIN=""

PORT=""
REDIS_URL=""

GMAIL_CLIENT_ID=""
GMAIL_CLIENT_SECRET=""
GMAIL_REFRESH_TOKEN=""
GMAIL_EMAIL=""


AWS_ACCESS_KEY=""
AWS_SECRET_KEY=""
AWS_REGION=""

BUCKET_NAME="" 

NODE_ENV=""

client/

VITE_REDUX_ENCRYPTION_KEY=""
VITE_API_BASE_URL=""
```

### 4. Run the development servers

**Backend:**

```bash
cd server
yarn dev
```

**Frontend:**

```bash
cd client
yarn dev
```

The frontend will typically run on [http://localhost:5173](http://localhost:5173) and the backend on [http://localhost:5000](http://localhost:5000).

---

## Scripts

| Directory | Script         | Description                |
|-----------|---------------|----------------------------|
| client    | `yarn dev`    | Start React dev server     |
| client    | `yarn build`  | Build frontend for prod    |
| server    | `yarn dev`    | Start backend in dev mode  |
| server    | `yarn start`  | Start backend in prod      |

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Contact

For questions or support, please open an issue or contact the maintainer.
