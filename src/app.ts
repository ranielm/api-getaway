import express, { Request, Response, NextFunction } from "express";
import axios from "axios";
import dotenv from "dotenv";
import redis from "redis";
import { promisify } from "util";

dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 4000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const EVENTS_SERVICE_URL = process.env.EVENTS_SERVICE_URL;
const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;

const client = redis.createClient({
  url: `redis://localhost:${REDIS_PORT}`,
});

client.on("error", (error: any) => console.error(`Error : ${error}`));

app.use(express.json());

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.setex).bind(client);

const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = "events"; // Ajustado para "events"
  try {
    const cacheResults = await getAsync(key); // Usando a função promisificada
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

app.use("/events", cacheMiddleware, async (req, res) => {
  try {
    const url = `${EVENTS_SERVICE_URL}${req.url}events`;
    const method = req.method;
    const data = req.body;

    const response = await axios({
      method,
      url,
      data,
    });

    await setAsync("events", 10000, JSON.stringify(response.data)); // Usando a função promisificada e setex

    res.status(response.status).send({
      fromCache: false,
      data: response.data,
    });
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).send(error.response?.data);
    } else {
      res.status(500).send({ message: "An unexpected error occurred" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
