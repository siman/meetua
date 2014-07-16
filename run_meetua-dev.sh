export NODE_ENV=development
export MONGODB='mongodb://localhost:27017/meetua-dev'
sudo forever --uid=meetua-dev -a start -c nodemon app.js

