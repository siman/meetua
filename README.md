# MeetUA
Самые интересные события в Киеве!

## Free M1 tasks
https://bitbucket.org/meetua/meetua/issues?status=new&status=open&milestone=M1&sort=-status

## PROD (Digital Ocean)

### Src dir

`cd /home/meetua/meetua`

### Run site

`export NODE_ENV=production;nohup node app &`

or
`export NODE_ENV=production;forever start app.js`

## Install checklist

### Git

```sh
sudo apt-get install git
git config --global user.name "MeetUA Prod"
git config --global user.email "prod@meetua.com"
```

### Node

```sh
sudo apt-get install nodejs
sudo apt-get install npm
sudo apt-get install nodejs-legacy
npm install forever -g
```

### MongoDB
http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/

### Backups

Mongo backup script

```sh
#!/bin/sh
mongodump -o /home/meetua/meetua/dumps/mongodb/`date "+%Y-%m-%d"`
```