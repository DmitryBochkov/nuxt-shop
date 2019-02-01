import fireApp from '@/plugins/firebase'

export const state = () => ({
  user: null,
  error: null,
  busy: false,
  jobDone: false
})

export const mutations = {
  setUser(state, payload) {
    state.user = payload
  },
  setError(state, payload) {
    state.error = payload
  },
  clearError(state) {
    state.error = null
  },
  setBusy(state, payload) {
    state.busy = payload
  },
  setJobDone(state, payload) {
    state.jobDone = payload
  }
}

export const actions = {
  signUpUser({commit}, {fullname, email, password}) {
    commit('setBusy', true)
    commit('clearError')
    // 1. Signup new user
    // 2. Updte firebase user data and set local user data
    // 3. Add usr data into database
    // 4. Attach user to consumer group
    let newUser = null;
    fireApp.auth().createUserWithEmailAndPassword(email, password)
      .then(cred => {
        newUser = cred.user
        return newUser.updateProfile({displayName: fullname})
        .then(() => {
          const currentUser = {
            id: newUser.uid,
            email: email,
            name: fullname,
            role: 'consumer'
          }
          console.log(currentUser);
          commit('setUser', currentUser)
        })
      })
      .then(() => {
        const userData = {
          email: email,
          name: fullname,
          created_at: new Date().toISOString()
        }
        return fireApp.database().ref(`users/${newUser.uid}`).set(userData)
      })
      .then(() => {
        return fireApp.database().ref('groups').orderByChild('name').equalTo('Customer').once('value')
          .then(snapShot => {
            const groupKey = Object.keys(snapShot.val())[0]
            let groupedUser = {}
            groupedUser[newUser.uid] = fullname
            return fireApp.database().ref(`userGroups/${groupKey}`).update(groupedUser)
          })
      })
      .then(() => {
        commit('setJobDone', true)
        commit('setBusy', false)
      })
      .catch(err => {
        commit('setBusy', false)
        commit('setError', err)
      })
  }
}

export const getters = {
  user(state) {
    return state.user
  },
  error(state) {
    return state.error
  },
  busy(state) {
    return state.busy
  },
  jobDone(state) {
    return state.jobDone
  }
}
