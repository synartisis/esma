
http.createServer(options)

req.body multipart/form-data  ->  https://www.microfocus.com/documentation/idol/IDOL_12_0/MediaServer/Guides/html/English/Content/Shared_Admin/_ADM_POST_requests.htm

load testing: autocannon -c 1000 -d 60 localhost:3000





=================

body-parser: CONTENT_LENGTH_LIMIT setting

=================

header: Content-Encoding (gzip, deflate, br)
  https://nodejs.org/api/zlib.html#compressing-http-requests-and-responses
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding
  req.body support
  echo '{"mydummy": "json"}' | gzip | curl -i --data-binary @- -H "Content-Encoding: gzip" -H "content-type:application/json" http://localhost:3000/bodyparse
  curl -IL -H 'Accept-Encoding: gzip,deflate' http://localhost:3000/st/