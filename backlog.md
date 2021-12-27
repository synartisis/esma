
=================

req.body multipart/form-data
  https://www.microfocus.com/documentation/idol/IDOL_12_0/MediaServer/Guides/html/English/Content/Shared_Admin/_ADM_POST_requests.htm
  https://expressjs.com/en/api.html#req.properties



load testing: autocannon -c 1000 -d 60 localhost:3000


=================

res.sendFile https://expressjs.com/en/api.html#res.sendFile

=================

esma settings: trust proxy (http://expressjs.com/en/guide/behind-proxies.html)

req.cookies, req.signedCookies https://expressjs.com/en/api.html#req.cookies

range requests: https://medium.com/@vishal1909/how-to-handle-partial-content-in-node-js-8b0a5aea216 https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests

Content-Type: better handling of charset=utf-8 at static and requestListener.sendResponse

header: Content-Encoding (gzip, deflate, br)
  https://nodejs.org/api/zlib.html#compressing-http-requests-and-responses
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding
  req.body support
  echo '{"mydummy": "json"}' | gzip | curl -i --data-binary @- -H "Content-Encoding: gzip" -H "content-type:application/json" http://localhost:3000/bodyparse
  curl -IL -H 'Accept-Encoding: gzip,deflate' http://localhost:3000/st/
