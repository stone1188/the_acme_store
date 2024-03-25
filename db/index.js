const pg = require("pg");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const client = new pg.Client(`prostgress://localhost/${process.env.DB_NAME}`);

const createTables = async () => {
     const SQL = `
        DROP TABLE IF EXISTS favorite;
        DROP TABLE IF EXISTS product;
        DROP TABLE IF EXISTS users;

        CREATE TABLE users(
            id UUID PRIMARY KEY,
            username VARCHAR(100) UNIQUE,
            password VARCHAR(100) 
        );

        CREATE TABLE product(
            id UUID PRIMARY KEY,
            name VARCHAR(100)
        );

        CREATE TABLE favorite(
            id UUID PRIMARY KEY,
            user_id UUID REFERENCES users(id) NOT NULL,
            product_id UUID REFERENCES product(id) NOT NULL,
            CONSTRAINT unique_product_user UNIQUE (product_id, user_id)
        );
    `;

     await client.query(SQL);
};

const createUser = async ({ username, password }) => {
     const SQL = `INSERT INTO users(id, username, password) VALUES($1,$2,$3) RETURNING *`;
     const response = await client.query(SQL, [
          uuid.v4(),
          username,
          await bcrypt.hash(password, 10),
     ]);
     response.rows[0];
};

const fetchUsers = async () => {
     const SQL = `SELECT * from users`;
     const response = await client.query(SQL);
     return response.rows;
};

const createProduct = async ({ name }) => {
     const SQL = `INSERT INTO product(id, name) VALUES($1,$2) RETURNING *`;
     const response = await client.query(SQL, [uuid.v4(), name]);
     response.rows[0];
};

const fetchProduct = async () => {
     const SQL = `SELECT * from product`;
     const response = await client.query(SQL);
     return response.rows;
};

const createFavorite = async ({ user_id, product_id}) => {
     const SQL = `INSERT INTO favorite(id, user_id, product_id)
        VALUES($1,$2,$3) RETURNING *`;
     const response = await client.query(SQL, [
          uuid.v4(),
          user_id,
          product_id,
     ]);
     return response.rows[0];
};

const fetchFavorite = async () => {
     const SQL = `SELECT * from favorite WHERE user_id= '${user_id}'`;
     const response = await client.query(SQL);
     return response.rows;
};

const destroyFavorite = async ({ unique_product_user }) => {
     const SQL = `DELETE * from favorite WHERE unique_product_user= $1`;
     const response = await client.query(SQL, [unique_product_user]);
};

const seed = async () => {
     await Promise.all([
          createUser({ username: "chris", password: "far123" }),
          createUser({ username: "sarah", password: "reach333" }),
          createUser({ username: "mike", password: "bana4321" }),
          createProduct({ name: "laptop" }),
          createProduct({ name: "phone" }),
          createProduct({ name: "mouse" }) 
     ]);

     const users = await fetchUsers();
     const product = await fetchProduct();
     await Promise.all([
          createFavorite({ user_id: users[0].id, product_id: product[1].id }),
          createFavorite({ user_id: users[1].id, product_id: product[2].id }),
          createFavorite({ user_id: users[2].id, product_id: product[0].id }),
     ]);
};

module.exports = {
     client,
     createTables,
     createUser,
     fetchUsers,
     createProduct,
     fetchProduct,
     createFavorite,
     fetchFavorite,
     destroyFavorite,
     seed
};
