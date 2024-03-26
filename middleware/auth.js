import dotenv from "dotenv"
dotenv.config()

export default (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (authorization === '' || authorization === null) {
      throw new Error('no-token-error');
    }
    const token = authorization.split(' ')?.[1];
    if (token === "" || token === undefined) {
      throw new Error("invalid-token-error");
    }
    const decodedToken = jwt.verify(token,  process.env.SECRET);
    const userId = decodedToken.userId;
    const roles = decodedToken.roles;
    req.auth = {
      userId: userId,
      roles: roles
    }
    next()
  }
  catch(error) {
    switch (error.message) {
      case 'no-token-error':
        res.sendStatus(401)
        break;
      case 'invalid-token-error':
        res.sendStatus(422)
        break;
      default:
        res.sendStatus(400);
        break;
    }
  }
} 