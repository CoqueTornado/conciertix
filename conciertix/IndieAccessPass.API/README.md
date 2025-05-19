# IndieAccessPass API

This is the backend API for the IndieAccessPass application, built with ASP.NET Core and PostgreSQL.

## Setup Instructions

### 1. Prerequisites

*   .NET 8 SDK
*   PostgreSQL Server

### 2. Database Setup

1.  Ensure your PostgreSQL server is running.
2.  Create a new PostgreSQL database (e.g., `IndieAccessPassDB`).
3.  Update the connection string in `IndieAccessPass.API/appsettings.Development.json`:
    ```json
    {
      // ... other settings
      "ConnectionStrings": {
        "DefaultConnection": "Host=localhost;Port=5432;Database=IndieAccessPassDB;Username=your_postgres_username;Password=your_postgres_password;"
      },
      // ... other settings
    }
    ```
    Replace `your_postgres_username` and `your_postgres_password` with your actual PostgreSQL credentials.

### 3. Configure JWT Settings

1.  Open `IndieAccessPass.API/appsettings.json`.
2.  Update the `Jwt:Key` with a strong, unique secret key (at least 32 characters long):
    ```json
    {
      // ... other settings
      "Jwt": {
        "Key": "YOUR_VERY_STRONG_AND_UNIQUE_SECRET_KEY_HERE_MIN_32_CHARS",
        "Issuer": "IndieAccessPass.API",
        "Audience": "IndieAccessPass.Users"
      }
      // ... other settings
    }
    ```

### 4. Apply Migrations

Navigate to the root directory of the project (`IndieAccessPass.API`) in your terminal and run the following command to apply the database migrations:

```bash
dotnet ef database update -p IndieAccessPass.API/IndieAccessPass.API.csproj -s IndieAccessPass.API/IndieAccessPass.API.csproj
```
Alternatively, if you are in the `IndieAccessPass.API` directory:
```bash
dotnet ef database update
```

### 5. Run the API

Navigate to the `IndieAccessPass.API` directory in your terminal and run:

```bash
dotnet run
```

The API should now be running, typically at `https://localhost:7xxx` and `http://localhost:5xxx`.

## Testing Endpoints

You can use tools like `curl` or Postman to test the API.

### User Registration

**Endpoint:** `POST /api/auth/register`

**Request Body (JSON):**

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Password123!",
  "role": "User" 
}
```
(Set role to "Admin" for an admin user)

**Example using `curl` (replace port if necessary):**

```bash
curl -X POST -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"Password123!\",\"role\":\"User\"}" http://localhost:5000/api/auth/register
```

### User Login

**Endpoint:** `POST /api/auth/login`

**Request Body (JSON):**

```json
{
  "username": "testuser",
  "password": "Password123!"
}
```

**Example using `curl` (replace port if necessary):**

```bash
curl -X POST -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"Password123!\"}" http://localhost:5000/api/auth/login
```

This will return a JWT token if successful.

### Get Current User (Secured Endpoint)

**Endpoint:** `GET /api/users/me`

**Headers:**

*   `Authorization`: `Bearer YOUR_JWT_TOKEN` (Replace `YOUR_JWT_TOKEN` with the token obtained from login)

**Example using `curl` (replace port and token):**

```bash
curl -X GET -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/users/me
```

This endpoint will return the details of the currently authenticated user.