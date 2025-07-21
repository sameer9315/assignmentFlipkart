# Flipkart Offers Service – PiePay Assignment

### 📦 Prerequisites

- Node.js (v16+ recommended)
- npm (Node Package Manager)
- Git (to clone the repo)
- SQLite (no separate setup needed – it's file-based)

## 1. Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/sameer9315/assignmentFlipkart.git
   cd assignmentFlipkart
2. Install dependencies:
    npm install
3. Create a .env file in the root directory and add:
    PORT=3000
    NODE_ENV=development
4. Start the server:
    npm start
No separate migration command is needed as Sequelize syncs the models automatically.

## 2. Assumptions
    offerId is a unique identifier used to prevent duplicate offers.

    Offers may be of type FLAT or PERCENTAGE.

    validFrom and validTo are optional; null means the offer is always valid in that direction.

    Bank names are stored in uppercase for consistency.

    SQLite is used for ease of local development without extra dependencies.

## 3. Design Choices
    Express.js was chosen for its simplicity and lightweight nature, ideal for REST APIs.

    Sequelize ORM was used to interact with the database, enabling easy switching between SQLite and more robust databases like PostgreSQL.

    The offer schema includes fields to support both flat and percentage discounts and validity windows.

    findOrCreate is used during offer ingestion to prevent duplicates.

    Parsing logic is abstracted into a separate utility to handle multiple Flipkart response formats.

## 4. Scaling GET /highest-discount to 1,000 RPS
    To scale this endpoint:

    Add indexes on bankName, paymentInstrument, minAmount, validFrom, validTo, and isActive.

    Use Redis caching to store active offers for frequent queries.

    Replace SQLite with PostgreSQL and use connection pooling.

    Deploy multiple Node.js instances behind a load balancer.

    Memoize discount calculations where applicable for repeated queries.

## 5. Improvements with More Time
    Add unit and integration tests using Jest.

    Add input validation using Joi or express-validator.

    Implement pagination and filtering on offer list APIs.

    Document the API using Swagger or Postman collections.

    Add better logging and error tracking using Winston or Sentry.

    Move from SQLite to PostgreSQL for better performance and scalability.

