import firebase from 'firebase'

const config = require('../config/index')()
const fireConfig = config.fireConfig

let fireApp

if (!fireApp && !firebase.apps.length) {
  fireApp = firebase.initializeApp(fireConfig)
} else {
  fireApp = firebase.app()
}

export default fireApp
