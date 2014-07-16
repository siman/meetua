export NODE_ENV=development
sudo forever --uid=meetua-dev -a start -c nodemon app.js

