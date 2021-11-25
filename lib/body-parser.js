export async function parseRequestBody(req) {
  const bufferArr = []
  for await (const chunk of req) {
    bufferArr.push(chunk)
  }

  const buffer = Buffer.concat(bufferArr).toString()
  const contentType = req.headers['content-type']?.split(';')[0].trim()
  if (contentType === 'application/json') return json(buffer)
  if (contentType === 'application/x-www-form-urlencoded') return urlEncoded(buffer)
  return buffer
}


function json(buffer) {
  const json = buffer.toString()
  try {
    return JSON.parse(json)
  } catch (error) {
    return {}
  }
}


function urlEncoded(buffer) {
  const urlEncoded = buffer.toString()
  try {
    return Object.fromEntries(new URLSearchParams(urlEncoded))
  } catch (error) {
    return {}
  }
}