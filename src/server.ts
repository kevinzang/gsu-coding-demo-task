import express from 'express';

import {routeFeedback} from './feedback';

const PORT = 3000;

export const server = express();

server.use(express.json());

routeFeedback(server);

server.listen(PORT, () => {
  console.log(`GetSetUp coding demonstration task listening on port ${PORT}`);
});
