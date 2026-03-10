# Notice Board Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

### 3. Cloudinary Setup
1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → Settings → API Keys
3. Copy your Cloud Name, API Key, and API Secret to `.env`

### 4. Run the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get user profile | Yes |

### Notices
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notices` | Get all notices | Yes |
| GET | `/api/notices/published` | Get published notices | No |
| POST | `/api/notices/upload` | Create notice with file | Yes |
| PUT | `/api/notices/:id` | Update notice | Yes |
| PATCH | `/api/notices/:id/toggle` | Toggle publish status | Yes |
| DELETE | `/api/notices/:id` | Delete notice | Yes |

## Socket.io Events

### Server → Client
- `notice:created` - New notice created
- `notice:updated` - Notice updated
- `notice:toggled` - Notice publish status changed
- `notice:deleted` - Notice deleted

## Frontend Integration

The frontend is already configured to connect to `http://localhost:5000`.

### First-Time Setup
1. Start the backend server
2. Go to `/auth` in the frontend
3. Register the first user (automatically becomes admin)
4. Login and start managing notices
