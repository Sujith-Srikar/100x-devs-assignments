# contest-platform-assignment

This project was generated using our custom project scaffolding tool. It includes:


- A backend project (JavaScript/TypeScript) with Express and a database configuration.


## Setup Instructions

### Frontend
No frontend setup was performed.

### Backend
1. Navigate to the server folder: `cd server`
2. Update the `.env` file with your configuration:

   - For MongoDB, set `MONGODB_URI` (e.g., `mongodb+srv://<username>:<password>@cluster0.mongodb.net/<databaseName>?retryWrites=true&w=majority`)
   - For FireBase, set `FIREBASE_SERVICE_ACCOUNT` and `FIREBASE_DATABASE_URL`
   - For SupaBase, set `SUPABASE_URL` and `SUPABASE_KEY`

3. Run the development server: `npm run dev`


## Notes
- Ensure you have Node.js installed.
- For any environment variables required, please update the `.env` file in the respective folders.
- For more details, refer to the documentation in each project folder.
