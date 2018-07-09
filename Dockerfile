# Dockerfile to build the library without deps on host machine
#
# docker build -t bblfshjs-build .
# then you can grab the builded lib from /bblfsh directory

FROM debian:sid-slim

RUN apt-get update
RUN apt-get install -y --no-install-recommends ca-certificates curl unzip nodejs npm \
    git python2.7 cmake autoconf libtool automake pkg-config make

RUN git clone https://github.com/juj/emsdk.git

WORKDIR emsdk
RUN ./emsdk install latest
RUN ./emsdk activate latest

WORKDIR /

RUN curl -k -L -o protoc.zip https://github.com/google/protobuf/releases/download/v3.6.0/protoc-3.6.0-linux-x86_64.zip && \
    unzip protoc.zip && \
    rm protoc.zip

WORKDIR /bblfsh

RUN npm install -g yarn

COPY . .

RUN yarn
RUN /bin/bash -c "source ../emsdk/emsdk_env.sh && yarn build"
