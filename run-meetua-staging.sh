export NODE_ENV=staging
sudo forever --uid=meetua-staging -o meetua-staging.log -e meetua-staging.log -a start -c nodemon app.js

