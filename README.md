# MeetUA
Самые интересные события в Киеве!

## Free M1 tasks
https://bitbucket.org/meetua/meetua/issues?status=new&status=open&milestone=M1&sort=-status

## PROD (Digital Ocean)

http://80.240.138.171

### Src dir

`cd /home/meetua/meetua`

### Run site

`export NODE_ENV=production;nohup node app &`

or
`export NODE_ENV=production;forever start app.js`

## Install checklist

### Helpful soft

```sh
sudo apt-get install mc
sudo apt-get install htop
```

### Git

```sh
sudo apt-get install git
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

### Open port 80

To allow incoming web traffic:
`sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT`

### Backups

Mongo backup script should be put to file `/etc/cron.daily/mongoalldump`. Set execution mode.

```sh
#!/bin/sh
mongodump -o /home/meetua/PERSISTENT_DATA_DIR/mongodb/`date "+%Y-%m-%d"
```

### Other

To enable git autocompletion (if absent) add next line to user's `.bashrc`
```sh
source /etc/bash_completion.d/git
```

Setup global username and email for git. Useful when commiting from prod:
```sh
git config --global user.name "MeetUA Prod"
git config --global user.email "prod@meetua.com"
```