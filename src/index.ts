import express, { Request, Response } from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import { Socket } from 'node:dgram';
import cors from 'cors';
import { isStringObject } from 'node:util/types';
import {
  connectDB,
  newUser,
  addMessage
} from './infrastructure/database/update_db';

connectDB();

const app = express();
app.use(express.json());
app.use(cors());
const server = createServer(app);
export const io = new Server(server, {
  connectionStateRecovery: {}
});

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(
  `output of: const __dirname = dirname(fileURLToPath(import.meta.url)) is: ${__dirname}`
);

app.get('/login', (_req: Request, res: Response) => {
  res.sendFile(join(__dirname, 'login.html'));
});

app.post('/login', async (req: Request, res: Response) => {
  const data = req.body;
  const username = data.username;
  const password = data.password;
  if (username && password) {
    try {
      await newUser(username, password);
      res.redirect(`/room?username=${username}`);
      console.log({ username: username, password: password });
      res.status(201);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: 'Not possible to create user' });
    }
  }
});
let usernameAppGet = '';
app.get('/room', (req: Request, res: Response) => {
  const usernameAppGet = req.query.username;
  res.sendFile(join(__dirname, 'index.html'));
});

app.post('/room', async (req: Request, res: Response) => {});

// app.post('/', (req: Request, res: Response) => {
//   res.sendFile(join(__dirname + '/index.html'));
//   const data = req.body;
//   res.status(201).send(data);
// });

// io.use((socket, next) => {
//   next();
// });

io.on('connection', async (socket) => {
  const username = socket.handshake.query.username;
  let room = socket.handshake.query.room || 'defaultRoom';
  console.log(`Socket.IO username is ${username}`);
  socket.on('switchRoom', (newRoom) => {
    socket.leave(room);
    socket.join(newRoom);
    room = newRoom;
    console.log(`User ${username} switched to room ${newRoom}`);
  });
  socket.on('chat message', async (msg, clientOffset, callback) => {
    io.emit('chat message', msg);
    addMessage(username, msg, clientOffset, room);
    callback();
  });

  socket.on('disconnect', () => {
    console.log(`A user has disconnected`);
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
