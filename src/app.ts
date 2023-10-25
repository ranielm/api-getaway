// Importação dos módulos necessários
import express, { NextFunction, Response, Request } from "express";
import axios from "axios";
import dotenv from "dotenv";
import redis from "redis";
import { promisify } from "util";

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Criação da instância do Express
const app = express();

// Configuração da porta que o servidor irá ouvir
const PORT = process.env.GATEWAY_PORT || 4000;

// URLs dos microsserviços de eventos e usuários obtidos das variáveis de ambiente
const USERS_SERVICE_URL =
  process.env.USERS_SERVICE_URL || "http://localhost:3001";
const EVENTS_SERVICE_URL =
  process.env.EVENTS_SERVICE_URL || "http://localhost:3002";

const REDIS_PORT = process.env.REDIS_PORT || 6379;

// Inicialização do cliente Redis
const client = redis.createClient({
  url: `redis://localhost:${REDIS_PORT}`,
});

client.on("error", (error: any) => console.log(`Error: ${error}`));

// Middleware para parsear o corpo da requisição em formato JSON
app.use(express.json());

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.setex).bind(client);

const headers = {
  Origin: "http://localhost:4000",
};

const cacheMiddleware =
  (key: string) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cacheResults = await getAsync(key);
      if (cacheResults) {
        res.send({
          fromCache: true,
          data: JSON.parse(cacheResults),
        });
      }
    } catch (error) {}
  };

// Rota para lidar com as solicitações relacionadas a eventos
app.use("/events", async (req, res) => {
  try {
    // Construção da URL final, compondo a URL base do serviço com o endpoint desejado
    // const EVENTS_SERVICE_URL = "http://localhost:3002";
    const url = `${EVENTS_SERVICE_URL}/events`;
    // url: http://localhost:3002/events

    const method = req.method; // O método HTTP da requisição (GET, POST, DELETE, etc.)
    const data = req.body; // Dados enviados na requisição

    // Faz a requisição ao microsserviço de eventos e espera pela resposta
    const response = await axios({
      headers,
      method,
      data,
      url,
    });

    // Envia a resposta do microsserviço de eventos de volta ao cliente
    res.status(response.status).send(response.data);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).send(error.response?.data);
    } else {
      res.status(500).send({ message: "Um erro inesperado aconteceu" });
    }
  }
});

// Rota para lidar com as solicitações relacionadas a usuarios
app.use("/users", async (req, res) => {
  try {
    const url = `${USERS_SERVICE_URL}/students/studentsList`;

    const method = req.method;
    const data = req.body;

    const response = await axios({
      headers,
      method,
      data,
      url,
    });

    // Envia a resposta do microsserviço de estudantes de volta ao cliente
    res.status(response.status).send(response.data);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).send(error.response?.data);
    } else {
      res.status(500).send({
        message: "Não foi possível acessar o microsserviços de usuários",
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Nosso API Gateway está rodando na porta ${PORT}`);
});
