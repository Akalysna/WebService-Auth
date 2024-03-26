import express from "express"
import { Auth } from "./auth.js"
// import multer from "multer"
import authMiddleWare from "./middleware/auth.js"

const app = express()
app.use(express.json())
const port = 3000

/**Pour "lire le body lors d'un post"*/
// const upload = multer();

//Création d'un compte utilisateur
app.post("/api/account", authMiddleWare, (req, res) => {

    Auth.createAccount(req.body).then((result) => {
        res.status(201).json(result)
    }).catch(err => {
        res.status(400).json(err)
    })  
})

app.get("/api/account/:uid", authMiddleWare, (req, res) => {
    Auth.getUser(req.params.uid).then(result => {
        res.status(200).json(result);
    }).catch(err => {
      res.sendStatus(404);
    })
})

app.put("/api/account/:uid", authMiddleWare, (req, res) => {
    const uid = req.params.uid == "me" ? req.auth.userId : req.params.uid;
    let body = {...req.body}
    if (!req.auth.roles.includes("ROLE_ADMIN")) {
      if(req.params.uid !== "me") {
        res.sendStatus(403)
        return;
      }
      if (req.body.roles.includes('ROLE_ADMIN')){
        res.sendStatus(403)
        return;
        // delete body.roles[body.roles.indexOf("ROLE_ADMIN")]
      }
    }
    Auth.updateUser(body, uid).then(result => {
      res.status(201).json(result);
    }).catch(err => {
      res.sendStatus(404);
    })
})

app.post('/api/token', (req, res) => {
  Auth.getToken(req.body).then(result => {
    res.status(200).json(result)
  }).catch(err => {
    res.sendStatus(404)
  })
})


app.listen(port, ()=> {
    console.log("Listen on port " + port);
})