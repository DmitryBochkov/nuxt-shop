import {fireApp} from '@/plugins/firebase'

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
    let newUser = null
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
  },
  loginUser({commit}, {email, password}) {
    commit('setBusy', true)
    commit('clearError')
    // 1. Login user
    // 2. Find the group user belongs to
    // 3. Set logged in user
    fireApp.auth().signInWithEmailAndPassword(email, password)
      .then(cred => {
        const user = cred.user
        const authUser = {
          email: user.email,
          name: user.displayName,
          id: user.uid,
        }

        return fireApp.database().ref('groups').orderByChild('name').equalTo('Administrator').once('value')
          .then(snapShot => {
            const groupKey = Object.keys(snapShot.val())[0]
            return fireApp.database().ref(`userGroups/${groupKey}`).child(`${authUser.id}`).once('value')
              .then(ugroupSnap => {
                if (ugroupSnap.exists()) {
                  authUser.role = 'admin'
                } else {
                  authUser.role = 'customer'
                }
                commit('setUser', authUser)
                commit('setBusy', false)
                commit('setJobDone', true)
              })
              .catch(err => {
                commit('setBusy', false)
                commit('setError', err)
              })
          })
      })
      .catch(err => {
        commit('setBusy', false)
        commit('setError', err)
      })
  },
  logOut({commit}) {
    fireApp.auth().signOut()
    commit('setUser', null)
  },
  setAuthStatus({commit}) {
    fireApp.auth().onAuthStateChanged(user => {
      if (user) {
        const authUser = {
          email: user.email,
          name: user.displayName,
          id: user.uid,
        }

        fireApp.database().ref('groups').orderByChild('name').equalTo('Administrator').once('value')
        .then(snapShot => {
          const groupKey = Object.keys(snapShot.val())[0]
          fireApp.database().ref(`userGroups/${groupKey}`).child(`${authUser.id}`).once('value')
          .then(ugroupSnap => {
            if (ugroupSnap.exists()) {
              authUser.role = 'admin'
            } else {
              authUser.role = 'customer'
            }
            commit('setUser', authUser)
          })
        })
      }
    })
  },
  updateProfile({commit, getters}, {fullname, email}) {
    // 1. Update user name with updteProfile
    // 2. Update user email with updteEmail
    // 3. Update the datasbase
    // 4. Will divide the code into chunks
    // -LXJJ7C0wHZXtHJlbK6i -LXJJ9COPQKl_RDctFPu
    commit('setBusy', true)
    commit('clearError')
    const userData = getters.user
    const user = fireApp.auth().currentUser

    const updateEmail = () => {
      return user.updateEmail(email)
    }
    const updateDb = () => {
      const updateObj = {}
      if (userData.role == 'admin') {
        updateObj[`userGroups/-LXJJ7C0wHZXtHJlbK6i/${user.uid}`] = fullname
      }
      updateObj[`userGroups/-LXJJ9COPQKl_RDctFPu/${user.uid}`] = fullname
      updateObj[`users/${user.uid}/name`] = fullname
      updateObj[`users/${user.uid}/email`] = email

      return fireApp.database().ref().update(updateObj)
    }
    user.updateProfile({
      displayName: fullname
    })
      .then(updateEmail)
      .then(updateDb)
      .then(() => {
        const userObj = {
          id: userData.id,
          email: email,
          name: fullname,
          role: userData.role
        }
        commit('setUser', userObj)
        commit('setJobDone', true)
        commit('setBusy', false)
      })
      .catch(err => {
        commit('setError', err)
        commit('setBusy', false)
      })

  },
  changePwd ({commit}, payload) {
    commit('setBusy', true)
    commit('clearError')
    const user = fireApp.auth().currentUser
    user.updatePassword(payload.password)
      .then(() => {
        commit('setBusy', false)
        commit('setJobDone', true)
      })
      .catch(error => {
        commit('setBusy', false)
        commit('setError', error)
      })
  }
}

export const getters = {
  user(state) {
    return state.user
  },
  loginStatus(state) {
    return state.user !== null && state.user !== undefined
  },
  userRole(state) {
    const isLoggedIn = state.user !== null && state.user !== undefined
    return isLoggedIn ? state.user.role : 'customer'
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
