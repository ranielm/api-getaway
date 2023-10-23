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
    // EVENTS_SERVICE_URL = http://localhost:3002
    const url = `${EVENTS_SERVICE_URL}/events`;
    // url: http://localhost:3002/events
    const method = req.method; // O método HTTP da requisição (GET, POST, DELETE, etc.)
    const data = req.body; // Dados enviados na requisição

    // Faz a requisição ao microsserviço de eventos e espera pela resposta
    const response = await axios({
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

app.listen(PORT, () => {
  console.log(`Nosso API Gateway está rodando na porta ${PORT}`);
});
