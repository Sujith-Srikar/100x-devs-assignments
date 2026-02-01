import express from "express";
import * as dotenv from "dotenv";
import authRoute from "./routes/auth.route";
import contestRoute from "./routes/contest.route";
import problemRoute from "./routes/problem.route";

const app = express();
dotenv.config();
const PORT = process.env.PORT;
const PREFIX = process.env.PREFIX;
app.use(express.json());

app.use(`${PREFIX}/auth`, authRoute);
app.use(`${PREFIX}/contests`, contestRoute);
app.use(`${PREFIX}/problems`, problemRoute);

app.listen(PORT, () => console.log(`Started running at ${PORT}`));