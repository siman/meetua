export NODE_ENV=staging
sudo forever --uid=meetua-staging -a start -c nodemon app.js

