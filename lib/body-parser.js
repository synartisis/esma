export async function parseRequestBody(req) {
  const bufferArr = []
  for await (const chunk of req) {
    bufferArr.push(chunk)
  }

  const buffer = Buffer.concat(bufferArr).toString()
  const contentType = req.headers['content-type']?.split(';')[0].trim()
  if (contentType === 'application/json') return json(buffer)
  return buffer
}


function json(buffer) {
  const json = buffer.toString()
  return JSON.parse(json)
}