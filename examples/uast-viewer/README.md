# uast-viewer example

1. run bblfsh

2. run proxy

```
docker build -t uast-viewer/envoy -f ./envoy.Dockerfile .
docker run -d -p 8080:8080 uast-viewer/envoy
```

3. run frontend

```bash
yarn start
```
