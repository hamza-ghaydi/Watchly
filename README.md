# Movie/Series Management Application

A full-stack movie and series management web application built with Laravel 11, Inertia.js, React 18, and Tailwind CSS. The app integrates with the OMDB API to fetch movie and series data.

## Features

### Authentication & Roles
- Two user roles: **admin** and **user** (default: user)
- After registration, users are redirected to the dashboard
- Admin middleware guards all `/admin/*` routes
- Default admin account: `admin@app.com` / `password`

### OMDB API Integration
- API key stored in database settings table (not .env)
- Cached API key to avoid repeated database hits
- Search movies/series by title
- Fetch full details by IMDB ID
- Import movies by IMDB URL
- Custom exception handling with user-friendly error messages

### Movie Management
- **Import Movies**: Search by title or import by IMDB URL
- **To Watch List**: Track movies you want to watch
- **Watched List**: Mark movies as watched with personal ratings (1-10)
- **Delete Movies**: Remove movies from your list
- Duplicate prevention: Can't add the same movie twice

### Dashboard Statistics
**User Dashboard:**
- Total movies in list
- Total series in list
- Count of watched items
- Count of to-watch items

**Admin Dashboard:**
- Total registered users
- Total unique movies/series in system
- Total watched entries across all users
- Total to-watch entries across all users
- Most imported movie (most popular)

### Admin Features
- **User Management**: View all users, promote/demote roles, delete users
- **Movie Views**: See all users' movies (To Watch / Watched) with user column
- **Settings**: Configure OMDB API key with test connection feature
- **Filters**: Filter movies by user and type (movie/series)

### UI/UX Features
- Cinema dark theme with deep navy/charcoal background
- IMDB gold (#F5C518) accent colors
- Movie posters with hover zoom effects
- Responsive card grid (2 cols mobile → 3 tablet → 4-5 desktop)
- Smooth modal transitions
- Toast notifications for success/error messages
- Interactive star rating system (1-10)
- Debounced search with live results

## Tech Stack

- **Backend**: Laravel 11
- **Frontend**: React 18 + Inertia.js v2
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: SQLite (configurable)
- **API**: OMDB API (https://www.omdbapi.com/)

## Installation

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- SQLite (or configure another database)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database setup**
   ```bash
   php artisan migrate:fresh --seed
   ```
   This will create:
   - Admin user: `admin@app.com` / `password`
   - Test user: `test@example.com` / `password`

6. **Build frontend assets**
   ```bash
   npm run build
   ```

7. **Get OMDB API Key**
   - Visit https://www.omdbapi.com/apikey.aspx
   - Sign up for a free API key
   - After starting the server, login as admin and configure the API key in Settings

8. **Start the development server**
   ```bash
   php artisan serve
   ```

9. **Access the application**
   - Open http://localhost:8000
   - Login as admin: `admin@app.com` / `password`
   - Or login as user: `test@example.com` / `password`

## Development

### Run development server with hot reload
```bash
npm run dev
```

### Run both Laravel and Vite dev servers
```bash
composer dev
```

### Run tests
```bash
php artisan test
```

### Code formatting
```bash
composer lint
npm run format
```

## Usage

### For Users

1. **Import a Movie**
   - Navigate to "To Watch" page
   - Click "Add Movie" button
   - Search by title or paste IMDB URL
   - Select a movie from search results

2. **Mark as Watched**
   - Click "Mark Watched" on any movie in your To Watch list
   - Rate the movie from 1-10 stars
   - Movie moves to Watched list

3. **Delete a Movie**
   - Click the trash icon on any movie card
   - Confirm deletion

### For Admins

1. **Configure OMDB API**
   - Go to Settings
   - Enter your OMDB API key
   - Click "Test" to verify connection
   - Save the key

2. **Manage Users**
   - Go to Users page
   - Change user roles (promote to admin / demote to user)
   - Delete users (cannot delete yourself)

3. **View All Movies**
   - Access "All To Watch" or "All Watched" pages
   - Filter by user or type (movie/series)
   - View which users have added which movies

## API Endpoints

### User Routes
- `GET /movies/to-watch` - View to-watch list
- `GET /movies/watched` - View watched list
- `GET /movies/search?q={query}` - Search movies
- `POST /movies/import` - Import a movie
- `POST /movies/{movie}/mark-watched` - Mark movie as watched
- `DELETE /movies/{movie}` - Delete movie from list

### Admin Routes
- `GET /admin/settings` - Settings page
- `POST /admin/settings` - Update API key
- `POST /admin/settings/test` - Test API connection
- `GET /admin/users` - User management
- `PATCH /admin/users/{user}` - Update user role
- `DELETE /admin/users/{user}` - Delete user
- `GET /admin/movies/to-watch` - View all to-watch movies
- `GET /admin/movies/watched` - View all watched movies

## Database Schema

### Tables
- `users` - User accounts with roles
- `movies` - Movie/series data from OMDB
- `movie_user` - Pivot table linking users to movies with status and ratings
- `settings` - Application settings (API keys, etc.)

## License

This project is open-sourced software licensed under the MIT license.
