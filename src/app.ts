import express, { Request, Response, NextFunction } from "express";
import axios from "axios";
import dotenv from "dotenv";
import redis from "redis";

dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 4000;
const REDIS_PORT = 6379;
console.log("🚀 ~ file: app.ts:11 ~ REDIS_PORT:", REDIS_PORT);

const client = redis.createClient({
  url: `redis://localhost:${REDIS_PORT}`,
});

client.on("error", (error: any) => console.error(`Error : ${error}`));

app.use(express.json());

async function fetchApiData(id: string) {
  console.log("🚀 ~ file: app.ts:22 ~ fetchApiData ~ id:", id);
  const apiResponse = await axios.get(`http://localhost:4000/events/${id}`);
  console.log("Request sent to the API");
  console.log(
    "🚀 ~ file: app.ts:24 ~ fetchApiData ~ apiResponse:",
    apiResponse
  );
  return apiResponse.data;
}

const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = req.params.event;
  try {
    const cacheResults = await client.get(key);
    if (cacheResults) {
      res.send({
        fromCache: true,
        data: JSON.parse(cacheResults),
      });
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    next();
  }
};

app.get("/events/:id", cacheMiddleware, async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log("🚀 ~ file: app.ts:56 ~ app.use ~ id:", id);
  try {
    const results = await fetchApiData(id);
    if (results.length === 0) {
      throw "API returned an empty array";
    }
    await client.set(id, JSON.stringify(results));
    res.send({
      fromCache: false,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Data unavailable");
  }
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
