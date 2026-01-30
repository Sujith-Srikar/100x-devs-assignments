import express from "express";
import * as dotenv from "dotenv";
import authRoute from "./routes/auth.route";

const app = express();
dotenv.config();
const PORT = process.env.PORT;
const PREFIX = process.env.PREFIX;
app.use(express.json());

app.use(`${PREFIX}/auth`, authRoute);

app.listen(PORT, () => console.log(`Started running at ${PORT}`));