import fireApp from '@/plugins/firebase'

export const state = () => ({
  groups: []
})

export const mutations = {
  addGroup(state, payload) {
    state.groups.push(payload)
  },
  loadGroups(state, payload) {
    state.groups.push(payload)
  },
  updateGroup(state, payload) {
    const groupIndex = state.groups.findIndex(group => {
      return group.key === payload.group.key
    })
    state.groups[groupIndex].name = payload.name
  },
  removeGroup(state, payload) {
    const groupIndex = state.groups.findIndex(group => {
      return group.key === payload.group.key
    })
    state.groups.splice(groupIndex, 1)
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
        commit('addGroup', payload )
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
  }
}

export const getters = {
  groups(state) {
    return state.groups
  }
}
