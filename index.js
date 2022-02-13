import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import router from './routers/transactions/transactionRouters.js';
import routerUser from './routers/users/authenticationRouters.js';
import { LIMIT_JSON } from './lib/constants.js';
import { HttpCode } from './lib/constants.js';
// import swaggerUi from 'swagger-ui-express';
// import swaggerDocument from './swagger.json';
import authRouter from './routers/auth/authenticationGoogleRouters.js';

/////////////
// const PORT = process.env.PORT || 5000

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: LIMIT_JSON }));

app.use(cors());
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', router);
app.use('/api/users', routerUser);
app.use('/auth', authRouter);

app.use((_req, res) => {
  res
    .status(HttpCode.NOT_FOUND)
    .json({ status: 'error', code: HttpCode.NOT_FOUND, message: 'Not found' });
});

async function startApp() {
  try {
    await mongoose.connect(process.env.DB_URL);

    app.listen(process.env.PORT, () =>
      console.log('Server is running on PORT ' + process.env.PORT),
    );
  } catch (err) {
    console.log('err : ', err);
  }
}

// mongoose.connection.on ('disconnected', ()=>{
//   console.log ('Mongoose disconnected from DB.');
// })

//Этот код срабатывает для отключения от базы данных, когда нижимаем Ctrl+C
// process.on('SIGINT', async () => {
//   mongoose.connection.close();
//   console.log ('Connection DB closed');
//   process.exit(1)
// })

startApp();
