FROM node:latest

COPY . .
RUN yarn
RUN cp node_modules/bblfsh/dist/libuast.wasm public/

EXPOSE 3000
CMD yarn start
