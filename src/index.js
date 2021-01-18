const express = require('express');
require('./db/mongoose.js');
const userRouter = require('./routers/user.js');
const taskRouter = require('./routers/task.js');

const app = express();
const port = process.env.PORT;

// parses incoming json into an object
app.use(express.json());

// register the routers
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server is listening on port: ' + port);
})