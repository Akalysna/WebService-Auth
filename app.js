import express from "express"
import { Auth } from "./auth.js"
import multer from "multer"

const app = express()
const port = 3000

/**Pour "lire le body lors d'un post"*/
const upload = multer();

//Création d'un compte utilisateur
app.post("/api/account", upload.fields([]), (req, res) => {

    Auth.createAccount(req.body).then((result) => {
        res.status(201).json(result)
    }).catch(err => {
        res.status(400).json(err)
    })  
})


app.listen(port, ()=> {
    console.log("Listen on port " + port);
})