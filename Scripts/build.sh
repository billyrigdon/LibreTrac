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
docker build -t libretrac/libretrac:2.1.5 .
docker push libretrac/libretrac:2.1.5
