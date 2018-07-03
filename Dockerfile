FROM debian:sid-slim as builder

RUN apt-get update
RUN apt-get install -y --no-install-recommends ca-certificates curl unzip nodejs npm \
    git python2.7 cmake autoconf libtool automake pkg-config make

RUN git clone https://github.com/juj/emsdk.git

WORKDIR emsdk
RUN ./emsdk install latest
RUN ./emsdk activate latest

WORKDIR /

# use latest version of protoc for js, v3.1.0 generates incorrect js
RUN curl -k -L -o protoc.zip https://github.com/google/protobuf/releases/download/v3.6.0/protoc-3.6.0-linux-x86_64.zip && \
    unzip protoc.zip && \
    rm protoc.zip

WORKDIR /app/protoc3.1

# for cpp use v3.1.0. It must be the same version as the fork of protobuf for emscripten
RUN curl -k -L -o protoc.zip https://github.com/google/protobuf/releases/download/v3.1.0/protoc-3.1.0-linux-x86_64.zip && \
    unzip protoc.zip && \
    rm protoc.zip

WORKDIR /app

RUN npm install -g yarn

COPY build_libs.sh .

RUN /bin/bash -c "source ../emsdk/emsdk_env.sh && ./build_libs.sh"

COPY package.json .
COPY yarn.lock .
RUN yarn

COPY . .

RUN ./protogen.sh

RUN /bin/bash -c "source ../emsdk/emsdk_env.sh && ./wasm_build.sh"
RUN yarn build

FROM nginx:latest

COPY --from=builder /app/build /usr/share/nginx/html
