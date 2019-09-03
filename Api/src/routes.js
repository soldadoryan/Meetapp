import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

// import controllers
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// users
routes.post('/users', UserController.store);

// sessions
routes.post('/sessions', SessionController.store);


routes.use(authMiddleware);

// users with auth
routes.put('/users', UserController.update);

// files with auth
routes.post('/files', upload.single('file'),  FileController.store);


export default routes;