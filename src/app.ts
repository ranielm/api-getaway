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

  } catch (error: any) {

  }
});

// Inicia o servidor na porta configurada
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
