#!/bin/bash
cd ../Frontend
npm install
ng build
rm -r ../Backend/dist
mv ./dist/libretrac ../Backend/dist
cd ../Backend
go get
go build .
cd ..
sudo docker build -t shulginio/shulgin:2.0.4 .
sudo docker push shulginio/shulgin:2.0.4
