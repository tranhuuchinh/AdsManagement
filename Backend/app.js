const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const corsOptions = require('./configs/corsOptions.js');
const authRoute = require('./routes/authRoute.js');
const accountRoute = require('./routes/accountRoute.js');
const cadreRoute = require('./routes/cadreRoute.js');
const authenticateUser = require('./middlewares/authentication.middleware.js');
const googleRoute = require('./routes/googleRoute.js');
const wardRoute = require('./routes/wardRoute.js');
const editBoardRoute = require('./routes/editBoardRequestRoute.js');
const editPointRoute = require('./routes/editPointRequestRoute.js');
const boardTypeRoute = require('./routes/boardTypeRoute.js');
const advertisementTypeRoute = require('./routes/advertisementTypeRoute.js');
const boardRoute = require('./routes/boardRoute.js');
const pointRoute = require('./routes/pointRoute.js');
const civilianRoute = require('./routes/civilianRoute.js');
const logRoute = require('./routes/logRoute.js');
const logConstants = require('./constants/logConstant.js');
const logController = require('./controllers/logController');
const morgan = require('morgan');

const connection = require('./server'); // Sử dụng module quản lý kết nối cơ sở dữ liệu
const contractRoute = require('./routes/contract.route.js');

const app = express();

dotenv.config({ path: './config.env' });

const port = process.env.PORT;

app.use(cors(corsOptions));

app.use(express.json());

const originalSend = app.response.send;
app.response.send = function sendOverWrite(body) {
  originalSend.call(this, body);
  this.res_body = body;
};

morgan.token('res_body', (_req, res) => res.res_body?.substring(0, logConstants.resSize));

morgan.token('req_body', (req) => {
  return JSON.stringify(req.body)?.substring(0, logConstants.resSize);
});

app.use(morgan((tokens, req, res) => logController.addLog(tokens, req, res)));

app.use('/', googleRoute);
app.use('/board', authenticateUser, boardRoute);
app.use('/point', authenticateUser, pointRoute);
app.use('/edit_board', authenticateUser, editBoardRoute);
app.use('/edit_point', authenticateUser, editPointRoute);
app.use('/board_type', boardTypeRoute);
app.use('/advertisement_type', advertisementTypeRoute);
app.use('/auth', authRoute);
app.use('/account', authenticateUser, accountRoute);
app.use('/cadre', authenticateUser, cadreRoute);
app.use('/ward', authenticateUser, wardRoute);
app.use('/contract', contractRoute);
app.use('/civilian', civilianRoute);
app.use('/log', logRoute);

const server = app.listen(port, () => {
  console.log(`Server app listening on port ${port}`);
});

const socketIo = require('socket.io')(server, {
  cors: { origin: '*' },
});

socketIo.on('connection', (socket) => {
  ///Handle khi có connect từ client tới
  console.log('New client connected ' + socket.id);

  // socket.emit('update', socket.id); // Example send event to client

  socket.on('disconnect', () => {
    console.log('Client disconnected'); // Khi client disconnect thì log ra terminal.
  });
});

//Cách sử dụng
// const socket = require('../app');
// socket?.socketIo?.emit('update', 'aaaaa');

module.exports.socketIo = socketIo;
