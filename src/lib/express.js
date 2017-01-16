import express from 'express';
import expressWs from 'express-ws';
import env from 'dotenv';

env.config();
let sockets = [];
class Express {
  constructor(port) {
    this.app = express();
    this.router = express.Router(); // eslint-disable-line new-cap
    expressWs(this.app);
    this.router.ws('/coffeeorder', (socket) => {
      sockets = sockets.concat(socket);
      console.log(`WebSocket connected (${sockets.length} current)`);

      socket.on('close', () => {
        sockets = sockets.filter(s => s !== socket);
        console.log(`WebSocket disconnected (${sockets.length} remain)`);
      });

      socket.on('error', (err) => {
        console.error('A web socket error occured:');
        console.error(err.stack);
      });
    });
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', 'http://coffe.dev:8080');
      res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Access-Control-Allow-Credentials', 'true');
      next();
    });
    this.app.use('/', this.router);
    this.app.listen(port, () => {
      console.log(`Magic happens on port ${port}`);
    });
  }

  updateWeb(data) {
    console.log(`Notifying ${sockets.length} web sockets of update...`);
    sockets.forEach(socket => socket.send(JSON.stringify(data)));
  }
}
const port = process.env.PORT || 3000;
const expressClass = new Express(port);
export default expressClass;
export const updateSocket = expressClass.updateWeb;
