const pg = require('pg');
const uuid = require('uuid');
const bcrypt = require('bcrypt');

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

    await client.query(SQL)
}




module.exports = {
    client,
    createTables
}