import mysql from "mysql2"
import bcrypt from "bcrypt"

import dotenv from "dotenv"
dotenv.config()

//Connexion à la BDD
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER_DATABASE,
    password: process.env.PASSWORD_DATABASE,
    database: process.env.DATABASE
})

const saltRounds = 10

export const Auth = {

    addRole(userId, role) {

        return new Promise((resolve, reject) => {

            this.getRoleId(role).then((res) => {

                let query = "INSERT INTO `possede`(`id_roles`, `id_users`) VALUES (?,?)"
                let param = [res, userId]

                connection.query(query, param, (err, result) => {
                    if (!err) {
                        resolve(result)
                    } else {
                        reject(err)
                    }
                })
            })
        })
    },

    getUser(uid) {

        return new Promise((resolve, reject) => {
            const query = "SELECT `uid`, `login`, `created_at`, `update_at` FROM users WHERE uid = ?;";
            connection.query(query, [uid], (err, result) => {
                if (!err) {

                    let user = result[0]

                    let query = "SELECT name FROM roles INNER JOIN possede on roles.id_roles = possede.id_roles where id_users = ?"
                    connection.query(query, [], (err, result) => {
                        if (!err) {

                            //Récupération des roles
                            user[roles] = result
                            resolve(user)
                        } else
                            reject(err)
                    })
                }
                else {
                    reject({
                        status: 422,
                        err: err
                    });
                }
            })
        })
    },

    createAccount(body) {
        return new Promise((resolve, reject) => {

            let hashPassword = bcrypt.hashSync(body.password, saltRounds)

            let query = "INSERT INTO `users`(`login`, `password`, `status`) VALUES (?,?,?)"
            let params = [
                body.login,
                hashPassword,
                body.status ?? null
            ]

            connection.query(query, params, (err, result) => {

                //Insertion de l'utilisateur réussi
                if (!err) {

                    let insertId = result.insertId

                    //Récupération des roles existant
                    let query = "SELECT id_roles as id, name FROM roles"

                    connection.query(query, (err, result) => {

                        if (!err) {

                            let roles = new Map()
                            let values = []

                            result.forEach(item => {
                                roles.set(item.name, item.id)
                            });

                            let bodyRoles = JSON.parse(body.roles)
                            bodyRoles.forEach(role => {
                                values.push([roles.get(role), insertId])
                            });

                            let query = "INSERT INTO possede (id_roles, id_users) VALUES ?";
                            connection.query(query, [values], (err, result) => {

                                if (!err) {

                                    let query = "SELECT uid FROM users WHERE id_users = ?"
                                    connection.query(query, [insertId], (err, result) => {

                                        if (!err) {
                                            this.getUser(result[0].uid).then(result => {
                                                resolve(result)
                                            })
                                        } else
                                            reject(err)
                                    })
                                }
                                else
                                    reject(err)
                            })


                        } else {
                            reject(err)
                        }
                    })

                } else {
                    reject(err)
                }
            })

        })
    },

    getRoleId(name) {
        return new Promise((resolve, reject) => {

            let query = "SELECT id_roles as id FROM roles WHERE name=?"
            let params = [name]
            connection.query(query, params, (err, result) => {
                if (!err) {
                    resolve(result[0].id)
                } else {
                    reject(err)
                }
            })
        })
    },

    getUser(uid) {

    }
}