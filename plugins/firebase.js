import firebase from 'firebase'

const config = require('../config/index')()
const fireConfig = config.fireConfig

let fireApp, adminApp

if (!fireApp && !firebase.apps.length) {
  fireApp = firebase.initializeApp(fireConfig)
  adminApp = firebase.initializeApp(fireConfig, 'fireAdmin')
} else {
  fireApp = firebase.app()
  adminApp = firebase.app('fireAdmin')
}

export {fireApp, adminApp}
