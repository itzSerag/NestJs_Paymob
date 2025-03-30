# NestJS Payment Starter Project

This is a **NestJS-based starter project** designed to provide a robust foundation for building applications with **authentication**, **authorization**, **email verification**, and **payment integration**. It is ideal for developers looking to kickstart their projects with a scalable and secure backend.

## Features

- **Authentication & Authorization**:
  - JWT-based authentication (Access & Refresh Tokens).
  - Role-based access control (RBAC).
  - Guards for public routes, role-based routes, and verified user routes.

- **User Management**:
  - User registration and login.
  - Email verification using OTP.
  - Password reset functionality.

- **Payment Integration**:
  - Paymob payment gateway integration.
  - Secure payment initialization and webhook handling.

- **Email Service**:
  - Email verification and password reset emails using Brevo (formerly Sendinblue).

- **Database**:
  - MongoDB integration using Mongoose.
  - Abstract repository pattern for database operations.

- **Code Quality**:
  - Fully typed with TypeScript.
  - Validation using `class-validator`.
  - Linting with ESLint and formatting with Prettier.

- **Testing**:
  - End-to-end testing setup with Jest and Supertest.

## Prerequisites

- **Node.js**: v16 or higher
- **MongoDB**: A running MongoDB instance
- **Environment Variables**: Configure the `.env` file (see [Setup](#setup))

## Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/NestJs_payment.git
   cd NestJs_payment
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and configure the following variables:
   ```env
   PORT=5000
   DATABASE_URI=your_mongodb_connection_string
   JWT_ACCESS_SECRET=your_access_token_secret
   JWT_REFRESH_SECRET=your_refresh_token_secret
   JWT_ACCESS_EXP=1h
   JWT_REFRESH_EXP=7d
   BREVO_API_KEY=your_brevo_api_key
   EMAIL_FROM=your_email_address
   PAYMOB_API_KEY=your_paymob_api_key
   PAYMOB_INTEGRATION_ID=your_integration_id
   PAYMOB_IFRAME_ID=your_iframe_id
   PAYMOB_HMAC_SECRET=your_hmac_secret
   ```

4. **Run the Application**:
   ```bash
   npm run start:dev
   ```

5. **Access the API**:
   The API will be available at `http://localhost:5000/api`.

## Project Structure

```
src/
├── auth/               # Authentication & Authorization
├── common/             # Shared modules and utilities
├── mail/               # Email service and OTP management
├── payment/            # Payment integration with Paymob
├── user/               # User management
├── app.module.ts       # Root module
└── main.ts             # Application entry point
```

## API Endpoints

### Authentication
- `POST /auth/login`: User login
- `POST /auth/signup`: User registration
- `POST /auth/refresh`: Refresh access token
- `POST /auth/reset-password`: Reset password
- `POST /auth/verify-otp`: Verify email OTP

### User
- `GET /user/profile/me`: Get current user profile
- `GET /user`: Get all users (Admin only)
- `GET /user/:id`: Get user by ID (Admin only)
- `PATCH /user/:id`: Update user (Admin only)

### Payment
- `POST /payment/initialize`: Initialize a payment
- `POST /payment/webhook`: Handle payment webhook

## Testing

Run the tests using Jest:
```bash
npm run test
```

Run end-to-end tests:
```bash
npm run test:e2e
```

## Technologies Used

- **NestJS**: Backend framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **Passport**: Authentication middleware
- **Brevo**: Email service
- **Paymob**: Payment gateway
- **TypeScript**: Strongly typed JavaScript
- **Jest**: Testing framework

## Contributing

Contributions are welcome! Feel free to fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or support, please contact [serag.eldien.mahmoud@gmail.com](mailto:serag.eldien.mahmoud@gmail.com).

---
**Happy Coding!**
