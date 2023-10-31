const app = require('./app/app');
require('./config/dbConnect');
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, console.log(`Server is running on ${PORT}`));

require('./app/socket')(server);
