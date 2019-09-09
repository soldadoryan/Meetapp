import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

// import controllers
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';

import authMiddleware from './app/middlewares/auth';
import RegistrationController from './app/controllers/RegistrationController';

const routes = new Router();
const upload = multer(multerConfig);

// users
routes.post('/users', UserController.store);

// sessions
routes.post('/sessions', SessionController.store);


routes.use(authMiddleware);

// users with auth
routes.put('/users', UserController.update);

// meetups with auth
routes.post('/meetups', MeetupController.store);
routes.get('/meetups', MeetupController.index);
routes.get('/meetups/me', MeetupController.show);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);

// files with auth
routes.post('/files', upload.single('file'),  FileController.store);

// registrations with auth
routes.post('/registrations/:id', RegistrationController.store);
routes.get('/registrations/me', RegistrationController.index);

export default routes;