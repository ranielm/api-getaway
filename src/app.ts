// Importação dos módulos necessários
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Criação da instância do Express
const app = express();
// Configuração da porta que o servidor irá ouvir
const PORT = process.env.GATEWAY_PORT || 4000;

// URLs dos microsserviços de eventos e usuários obtidos das variáveis de ambiente
const EVENTS_SERVICE_URL = process.env.EVENTS_SERVICE_URL;
const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;

// Middleware para parsear o corpo da requisição em formato JSON
app.use(express.json());

// Rota para lidar com as solicitações relacionadas a eventos
app.use("/events", async (req, res) => {
  try {
    // Construção da URL final, compondo a URL base do serviço com o endpoint desejado
    const url = `${EVENTS_SERVICE_URL}${req.url}events`;
    const method = req.method; // O método HTTP da requisição (GET, POST, etc.)
    const data = req.body; // Dados enviados na requisição

    // Faz a requisição ao microsserviço de eventos e espera pela resposta
    const response = await axios({
      method,
      url,
      data,
    });

    // Envia a resposta do microsserviço de eventos de volta ao cliente
    res.status(response.status).send(response.data);
  } catch (error: any) {
    // Lida com erros provenientes da requisição ao microsserviço
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).send(error.response?.data);
    } else {
      res.status(500).send({ message: "An unexpected error occurred" });
    }
  }
});

// Rota para lidar com as solicitações relacionadas a usuários
app.use("/users", async (req, res) => {
  try {
    // Faz a requisição ao microsserviço de usuários e espera pela resposta
    const response = await axios({
      method: req.method,
      url: `${USERS_SERVICE_URL}${req.url}`,
      data: req.body,
    });

    // Envia a resposta do microsserviço de usuários de volta ao cliente
    res.status(response.status).send(response.data);
  } catch (error: any) {
    // Lida com erros provenientes da requisição ao microsserviço
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).send(error.response?.data);
    } else {
      res.status(500).send({ message: "An unexpected error occurred" });
    }
  }
});

// Inicia o servidor na porta configurada
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
