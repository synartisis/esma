web server for node.js inspired by express.js

## installation

```console
$ npm i esma
```

## features

* basic express.js compatibility
* built with modern features such as ES Modules and async-await
* zero dependencies

## usage

```js
import esma from 'esma'
const server = esma.createServer()

server.use(/* middleware */)

const __dirname = new URL('.', import.meta.url).pathname
server.use(esma.static(__dirname + '../client'))

server.listen(3000, () => console.log('listening', 3000))
```
