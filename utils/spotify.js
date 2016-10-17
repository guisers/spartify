import https from 'https'
import querystring from 'querystring'

class Spotify {
    constructor () {

    }

    request (options, query, returnCallback) {
      const callback = function(callbackRes) {
        callbackRes.on('data', (data) => {
          if (callbackRes.statusCode != 200) {
            console.error(`Error: Request to Spotify returned ${callbackRes.statusCode}`)
            console.error(callbackRes.statusMessage)
            res.redirect('/')
          }
          returnCallback(JSON.parse(data))
        })
      }

      var req = https.request(options, callback)
      if (query) {
        req.write(querystring.stringify(query))
      }
      req.end()

      req.on('error', (e) => {
        console.error('Error: Failed request to Spotify')
        console.error(e)
        res.redirect('/')
      })
    }
}

module.exports = Spotify