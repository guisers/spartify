import express from 'express'
const router = express.Router()

import https from 'https'
import querystring from 'querystring'


import baseConfig from '../config/baseConfig'
const env = process.env.NODE_ENV || 'development'
var secrets
if (env === 'development') {
  secrets = require('../config/secrets')
}

import Spotify from '../utils/spotify'
const spotify = new Spotify();
const spotifyClientId = process.env.SPOTIFY_CLIENT_ID || secrets.spotifyClientId
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET || secrets.spotifyClientSecret

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' })
})

/* Authenticate with Spotify */
router.get('/authenticate', (req, res, next) => {
  var url = 'https://accounts.spotify.com/authorize?'
  const redirectUri = `${baseConfig[env].baseUrl}/callback`
  const query = {
    'client_id': spotifyClientId,
    'response_type': 'code',
    'redirect_uri': redirectUri,
    'scope': 'playlist-modify-public'
  }
  url += querystring.stringify(query)

  res.cookie('redirectUri', redirectUri, {maxAge: 300000})
  res.redirect(url)
})

router.get('/callback', (req, res, next) => {
  const code = req.query.code
  const redirectUri = req.cookies.redirectUri

  const creds = Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString('base64')

  const options = {
    hostname: 'accounts.spotify.com',
    path: '/api/token',
    port: '443',
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  const query = {
    'grant_type': 'authorization_code',
    'code': code,
    'redirect_uri': redirectUri
  }

  spotify.request(options, query, (data) => {
    res.cookie('accessToken', data.access_token, {maxAge: 300000})
    res.redirect('/')
  });
})

router.get('/playlists', (req, res, next) => {
  const token = req.cookies.accessToken
  const options = {
    hostname: 'api.spotify.com',
    path: '/v1/me/playlists',
    port: '443',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  spotify.request(options, null, (data) => {
    console.log(data);
    res.send('whoop');
  });
})

module.exports = router
