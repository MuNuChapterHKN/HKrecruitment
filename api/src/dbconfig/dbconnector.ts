import {Sequelize} from "sequelize";

const url = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`

export const mySequelize = new Sequelize(url, {
    dialect: "postgres", dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
})
