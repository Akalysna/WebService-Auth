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
    deleteRole(userId, role) {
      return new Promise((resolve, reject) => {

        this.getRoleId(role).then((res) => {
            let query = "DELETE FROM `possede` WHERE id_users = ? AND id_roles = ?;"
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

    updateUser (body, uid) {
      return new Promise ((resolve, reject) => {
        let query = "UPDATE `users` SET `login`=?,`password`=?, `update_at`= NOW(), `status`=? WHERE uid = ?;";
        let hashPassword = bcrypt.hashSync(body.password, saltRounds)
        let params = [
          body.login,
          hashPassword,
          body.status,
          uid
        ]
        connection.query(query, params, async (err, results) => {
          if(!err) {
            if (body.roles.length > 0) {
              let user = await Auth.getUser(uid);
              for (let role in body.roles) {
                if (user.roles.includes(body.roles[role])) {
                  delete user.roles[body.roles[role]]
                  continue;
                }
                else {
                  await Auth.addRole(uid, body.roles[role]);
                  delete user.roles[body.roles[role]]
                }
              }
              if (user.roles.length > 0) {
                for (let role in user.roles) {
                  Auth.deleteRole(uid, user.roles[role])
                }
              }
              user = await Auth.getUser(uid);
              resolve(user);
            }
          }
          else {
            reject()
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
      return new Promise((resolve, reject) => {
        const query = "SELECT uid, login, GROUP_CONCAT(roles.name, ',') as roles, created_at, updated_at FROM users LEFT JOIN possede on possede.id_users = users.id_users LEFT JOIN roles on roles.id_role = possede.id_roles WHERE users.uid = ?;";
        connection.query(query, [uid], (err, results) => {
          if (!err) {
            const user = {...results[0]};
            user.roles = user.roles.split(',');
            resolve(results[0]);
          }
          else {
            reject(err);
          }
        })
      })
    },
    getToken (body) {
      let query = "SELECT `uid`, `login`, `password` FROM `users` WHERE login = ?;";
      connection.query(query, async (err, result) => {
        if (!err) {
          if(bcrypt.compareSync(body.password, result[0].password)) {
            const user = await Auth.getUser(result[0].uid)
            const token = jwt.sign({...user}, process.env.SECRET, {expiresIn: 60*60})
          }
        }
      })
    }
}