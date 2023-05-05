/** @typedef {import('esma').Middleware} Middleware */


/** @type {(languages: string[]) => Middleware} */
export function multilingual(languages) {
  if (!languages || languages.length === 0) throw new Error(`esma.multilingual: languages not defined`)

  return function multilingual(req, res) {
    let urlHasLang = false
    let lang = getLanguageFromURL(req.url, languages)                               // get lang from URL
    if (lang) urlHasLang = true
    const queryLang = getLanguageFromQuery(req.url)                                 // get lang from URL query
    if (queryLang && queryLang !== lang) {
      lang = queryLang
      return res.redirect(`/${lang}${req.url.substring(lang.length + 1)}`)
    }
    if (!lang) lang = getLanguageFromRefererHeader(req.headers.referer, languages)  // get lang from referer header
    if (!lang) lang = languages[0]                                                  // use default lang (first in array)
    res.locals.lang = lang
    if (urlHasLang) {
      req.url = req.url.substring(lang.length + 1)
    } else {
      if (req.method === 'GET') return res.redirect(`/${lang}${req.url}`)
    }
  }
}


/** @type {(url: string, languages: string[]) => string} */
function getLanguageFromURL(url, languages) {
  for (const lang of languages) {
    if (url.startsWith(`/${lang}/`)) return lang
  }
  return ''
}


/** @type {(url: string) => string?} */
function getLanguageFromQuery(url) {
  if (!url) return ''
  return new URLSearchParams(url.split('?').pop()).get('lang')
}


/** @type {(refererHeader: string | undefined, languages: string[]) => string} */
function getLanguageFromRefererHeader(refererHeader, languages) {
  if (!refererHeader) return ''
  const referrerPath = new URL(refererHeader).pathname
  for (const lang of languages) {
    if (referrerPath.startsWith(`/${lang}/`)) return lang
  }
  return ''
}