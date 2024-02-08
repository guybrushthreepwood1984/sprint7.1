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
newUser('Michi', 'password');

const app = express();
app.use(express.json());
app.use(cors());
const server = createServer(app);
export const io = new Server(server, {
  connectionStateRecovery: {}
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/login', (_req: Request, res: Response) => {
  res.sendFile(join(__dirname, 'login.html'));
});

app.get('/room', (req: Request, res: Response) => {
  if (req) res.sendFile(join(__dirname, 'index.html'));
});

app.post('/room', (req: Request, res: Response) => {
  const data = req.body;
  console.log(data);
  res.status(201);
});

// app.post('/', (req: Request, res: Response) => {
//   res.sendFile(join(__dirname + '/index.html'));
//   const data = req.body;
//   res.status(201).send(data);
// });

io.on('connection', async (socket) => {
  socket.on('chat message', async (msg, clientOffset, callback) => {
    io.emit('chat message', msg /*result.lastID*/);
    addMessage('Michi', msg, clientOffset, 'chatroom1');
    callback();
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
