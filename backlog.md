req.baseUrl  https://expressjs.com/en/api.html#req.baseUrl

=================

etag (dynamic content) https://expressjs.com/en/api.html#etag.options.table

http.createServer(options)

req.body multipart/form-data
  https://www.microfocus.com/documentation/idol/IDOL_12_0/MediaServer/Guides/html/English/Content/Shared_Admin/_ADM_POST_requests.htm
  https://expressjs.com/en/api.html#req.properties



check http headers returned from nginx  => curl -I http://anaggelia.lan.eoppep.gr/

load testing: autocannon -c 1000 -d 60 localhost:3000


=================

body-parser: CONTENT_LENGTH_LIMIT setting
static: etag, maxAge options
res.sendFile https://expressjs.com/en/api.html#res.sendFile

=================

esma settings: env, trust proxy (http://expressjs.com/en/guide/behind-proxies.html)

req.cookies, req.signedCookies https://expressjs.com/en/api.html#req.cookies

range requests: https://medium.com/@vishal1909/how-to-handle-partial-content-in-node-js-8b0a5aea216 https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests

header: Content-Encoding (gzip, deflate, br)
  https://nodejs.org/api/zlib.html#compressing-http-requests-and-responses
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding
  req.body support
  echo '{"mydummy": "json"}' | gzip | curl -i --data-binary @- -H "Content-Encoding: gzip" -H "content-type:application/json" http://localhost:3000/bodyparse
  curl -IL -H 'Accept-Encoding: gzip,deflate' http://localhost:3000/st/