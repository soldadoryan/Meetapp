import { Router } from 'express';

// import controllers
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

// users
routes.post('/users', UserController.store);

// sessions
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

// users
routes.put('/users', UserController.update);


export default routes;