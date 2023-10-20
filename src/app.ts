import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 4000;

const EVENTS_SERVICE_URL = process.env.EVENTS_SERVICE_URL;
const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;

app.use(express.json());

app.use("/events", async (req, res) => {
  try {
    const url = `${EVENTS_SERVICE_URL}${req.url}events`;
    const method = req.method;
    const data = req.body;

    const response = await axios({
      method,
      url,
      data,
    });
    res.status(response.status).send(response.data);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).send(error.response?.data);
    } else {
      res.status(500).send({ message: "An unexpected error occurred" });
    }
  }
});

// Encaminhar solicitações para o microsserviço de usuários
app.use("/users", async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${USERS_SERVICE_URL}${req.url}`,
      data: req.body,
    });
    res.status(response.status).send(response.data);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).send(error.response?.data);
    } else {
      res.status(500).send({ message: "An unexpected error occurred" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
