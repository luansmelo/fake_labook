import supertest, { Response } from "supertest";
import app, { server } from "../src/index";
import { BaseDatabase } from "../src/database/BaseDatabase";
import bcrypt from "bcrypt";
import { validate as uuidValidate } from "uuid";
import createTables from "./create_tables";

const request = supertest(app);
let userResponse: Response;
let user: any;
let post: any;
let token: string;

async function createUser() {
  userResponse = await request.post("/users/signup").send({
    name: "Novo Usuário",
    email: "novo@usuario.com",
    password: "senha123",
  });

  user = await BaseDatabase.connection("users")
    .first()
    .where("email", "novo@usuario.com");

  token = userResponse.body.token;
}

beforeEach(async () => {
  await createTables();
  await BaseDatabase.connection("likes_dislikes").truncate();
  await BaseDatabase.connection("posts").truncate();
  await BaseDatabase.connection("users").truncate();

  await createUser();

  await request
    .post("/posts")
    .set("Authorization", token)
    .send({ content: "Labook" });

  post = await BaseDatabase.connection("posts")
    .first()
    .where("content", "Labook");
});

afterEach(async () => {
  await BaseDatabase.connection.schema.dropTableIfExists("likes_dislikes");
  await BaseDatabase.connection.schema.dropTableIfExists("posts");
  await BaseDatabase.connection.schema.dropTableIfExists("users");
});

afterAll(async () => {
  await BaseDatabase.connection.destroy();
  return server.close();
});

describe("usuários:", () => {
  it("Deve criar um novo usuário", async () => {
    expect(userResponse.status).toBe(201);
    expect(userResponse.body.token).toBeDefined();
    expect(typeof userResponse.body.token).toBe('string');
  });
  
  it("Deve gerar um UUID válido para o usuário", async () => {
    const isUuidValid = uuidValidate(user.id);
    expect(isUuidValid).toBe(true);
  });

  it("Deve hash a senha corretamente", async () => {
    const password = "senha123";
    const hashedPassword = await bcrypt.hash(password, 12);

    expect(hashedPassword).not.toBe(password);

    const match = await bcrypt.compare(password, hashedPassword)
    expect(match).toBe(true);
  });
});

describe("posts:", () => {
  it("Deve criar um novo post", async () => {
    expect(post.content).toBe("Labook");
    expect(post.creator_id).toBe(user.id);
  });

  it("Deve buscar todos os posts", async () => {
    const response = await request.get("/posts").set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("Deve editar um post", async () => {
    const newContent = "Labook Atualizado";
    await request
      .put("/posts/" + post.id)
      .set("Authorization", token)
      .send({ content: newContent });

      const updatedPost = await BaseDatabase.connection("posts")
      .first()
      .where("id", post.id);

    expect(updatedPost.content).toBe(newContent);
  });

  it("Deve excluir um post", async () => {
    const deleteResponse = await request
      .delete("/posts/" + post.id)
      .set("Authorization", token);
    expect(deleteResponse.status).toBe(200);

    const deletedPost = await BaseDatabase.connection("posts")
      .first()
      .where("id", "=", post.id);
    expect(deletedPost).toBeUndefined();
  });

  it("Deve realizar o like em um post", async () => {
    const likeResponse = await request
      .put("/posts/" + post.id + "/like")
      .set("Authorization", token)
      .send({ like: true });
    expect(likeResponse.status).toBe(200);

    const updatedPost = await BaseDatabase.connection("posts")
      .first()
      .where("id", post.id);
    expect(updatedPost.likes).toBe(post.likes + 1);
  });

  it("Deve realizar o dislike em um post", async () => {
    const dislikeResponse = await request
      .put("/posts/" + post.id + "/like")
      .set("Authorization", token)
      .send({ like: false });
    expect(dislikeResponse.status).toBe(200);

    const updatedPost = await BaseDatabase.connection("posts")
      .first()
      .where("id", post.id);
    expect(updatedPost.dislikes).toBe(post.dislikes + 1);
  });
});
