FROM archlinux as base
RUN pacman -Syu --noconfirm
RUN pacman -Sy base-devel --noconfirm
WORKDIR /opt/LibreTrac
COPY ./Backend/libretrac ./libretrac
COPY ./Backend/dist ./dist
COPY ./Backend/.env ./.env
RUN useradd -m -d /opt/LibreTrac libretrac
RUN chown -R libretrac:libretrac /opt/LibreTrac
USER libretrac
EXPOSE 8080 
CMD ["/opt/LibreTrac/libretrac"]
