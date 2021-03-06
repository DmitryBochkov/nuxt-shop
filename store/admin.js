import {fireApp, adminApp} from '@/plugins/firebase'

export const state = () => ({
  groups: [],
  admins: []
})

export const mutations = {
  addGroup(state, payload) {
    state.groups.push(payload)
  },
  loadGroups(state, payload) {
    state.groups.push(payload)
  },
  updateGroup(state, payload) {
    const groupIndex = state.groups.findIndex(group => group.key === payload.group.key)
    state.groups[groupIndex].name = payload.name
  },
  removeGroup(state, payload) {
    const groupIndex = state.groups.findIndex(group => group.key === payload.group.key)
    state.groups.splice(groupIndex, 1)
  },
  loadAdmins (state, payload) {
    state.admins.push(payload)
  },
  removeAdmin (state, payload) {
    const i = state.admins.indexOf(payload.admin)
    state.admins.splice(i, 1)
  }
}

export const actions = {
  createGroup({commit}, payload) {
    commit('setBusy', true, {root: true})
    commit('clearError', null, {root: true})

    fireApp.database().ref('groups').push(payload)
      .then(() => {
        commit('setBusy', false, {root: true})
        commit('setJobDone', true, {root: true})
        // commit('addGroup', payload )
      })
      .catch(err => {
        commit('setBusy', false, {root: true})
        commit('setError', err, {root: true})
      })
  },
  updateGroup({commit}, payload) {
    commit('setBusy', true, {root: true})
    commit('clearError', null, {root: true})

    fireApp.database().ref(`groups/${payload.group.key}`).update({ name: payload.name })
      .then(() => {
        commit('setBusy', false, {root: true})
        commit('setJobDone', true, {root: true})

        const groupData = {
          group: payload.group,
          name: payload.name
        }
        commit('updateGroup', groupData)
      })
      .catch(err => {
        commit('setBusy', false, {root: true})
        commit('setError', err, {root: true})
      })
  },
  removeGroup({commit}, payload) {
    fireApp.database().ref(`groups/${payload.group.key}`).remove()
      .then(() => {
        commit('removeGroup', payload)
      })
      .catch(err => {
        console.log(err)
      })
  },
  getGroups({commit}) {
    fireApp.database().ref('groups').on('child_added', snapShot => {
      let item = snapShot.val()
      item.key = snapShot.key
      commit('loadGroups', item)
    })
  },
  createAdmin ({commit}, payload) { // Signup new administrator
    commit('setBusy', true, { root: true })
    commit('clearError', null, { root: true })
    let newAdmin = null
    adminApp.auth().createUserWithEmailAndPassword(payload.email, payload.password)
      .then(cred => {
        newAdmin = cred.user
        console.log(newAdmin);
        newAdmin.updateProfile({ displayName: payload.fullname })
        // Add extra user data into database
        const userProfile = {
          email: payload.email,
          fullname: payload.fullname,
          created_at: new Date().toISOString()
        }
        fireApp.database().ref(`users/${newAdmin.uid}`).set(userProfile)
      })
      .then(() => {
        // Assigning user to administrator group
        fireApp.database().ref('groups').orderByChild('name').equalTo('Administrator').once('value')
          .then(snapShot => {
            const groupKey = Object.keys(snapShot.val())[0]
            let groupedUser = {}
            groupedUser[newAdmin.uid] = payload.fullname
            fireApp.database().ref(`userGroups/${groupKey}`).update(groupedUser)
          })
      })
      .then(() => {
        // Assigning user to consumer group
        fireApp.database().ref('groups').orderByChild('name').equalTo('Customer').once('value')
          .then(snapShot => {
            const groupKey = Object.keys(snapShot.val())[0]
            let groupedUser = {}
            groupedUser[newAdmin.uid] = payload.fullname
            fireApp.database().ref(`userGroups/${groupKey}`).update(groupedUser)
          })
      })
      .then(() => {
        commit('setJobDone', true, { root: true })
        commit('setBusy', false, { root: true })
      })
      .catch(error => {
        commit('setBusy', false, { root: true })
        commit('setError', error, { root: true })
      })
},
getAdmins ({commit}) {
  fireApp.database().ref('groups').orderByChild('name').equalTo('Administrator').once('value')
    .then(snapShot => {
      let item = {}
      const groupKey = Object.keys(snapShot.val())[0]
      fireApp.database().ref(`userGroups/${groupKey}`).on('child_added',
        snapShot => {
          item = {
            id: snapShot.key,
            name: snapShot.val()
          }
          commit('loadAdmins', item)
        })
    })
    .catch(error => {
      console.log(error)
    })
},
removeAdmin ({commit}, payload) {
  fireApp.database().ref('groups').orderByChild('name').equalTo('Administrator').once('value')
    .then(snapShot => {
      const groupKey = Object.keys(snapShot.val())[0]
      fireApp.database().ref(`userGroups/${groupKey}/${payload.admin.id}`).remove()
        .then(() => {
          commit('removeAdmin', payload)
        })
    })
    .catch(error => {
      console.log(error)
    })
}
}

export const getters = {
  groups(state) {
    return state.groups
  },
  admins (state) {
    return state.admins
  }
}
