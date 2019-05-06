# QRquest

DAS competitive application about collecting achievements in form of QR codes.

# REST api
## [Postman API Docs](https://documenter.getpostman.com/view/3023974/RWgnWzYt)

## Prerequisites
* [Docker CE](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
* [Docker-Compose](https://docs.docker.com/compose/install/#install-compose)  
(or `sudo apt-get install docker-compose` under Ubuntu)

# Backend Development
You can run once and nodeamon will restart node process on docker virtual machine on the fly upon detecting changes in `./backend/dist` path.   
## Docker Image rebuild
**Whenever** you make major **changes** to files other than src (eg. **package.json**) - you have to (!!!) rebuild docker image using command:
```
docker-compose build
```
This will install `node_modules` from scratch to docker image. 

## Running
Execute these commands in `./backend` directory.
### Initialise
```
npm install
```
### Start watching for changes
Typescript transpiler will automaticaly detect changes in *.ts* files in `./backend/src` directory and this will trigger nodemon (if docker service is running) since `./backend/dist` will be overwritten.
```
npm run watch
```
### Start services (docker containers)
**Backend** service is available at *localhost:3000*.  
This also starts **Redis** as standalone service which is only visible to other srvices in the same network `qrnet`. (see `docker-compose.yml`)
```
docker-compose up
```
### Stop services
```
docker-compose down
```
