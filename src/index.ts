import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// importe aqui a rota de user e post do estudante!
import userRouter from "./router/userRouter";
import postRouter from "./router/postRouter";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

export const server = app.listen(process.env.PORT || 3003, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT || 3003}`);
});

app.use("/users", userRouter);
app.use("/posts", postRouter);

export default app;
