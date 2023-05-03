cd ../Frontend
ng build
rm -r ../Backend/dist
mv dist/libretrac ../Backend/dist
