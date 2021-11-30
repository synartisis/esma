http.createServer(options)

req.body multipart/form-data  ->  https://www.microfocus.com/documentation/idol/IDOL_12_0/MediaServer/Guides/html/English/Content/Shared_Admin/_ADM_POST_requests.htm
req.body support gzip, deflate 

load testing: autocannon -c 1000 -d 60 localhost:3000
