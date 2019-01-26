import fireApp from '@/plugins/firebase'

export const state = () => ({
  groups: []
})

export const mutations = {
  loadGroups(state, payload) {
    state.groups.push(payload)
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
      })
      .catch(err => {
        commit('setBusy', false, {root: true})
        commit('setError', err, {root: true})
      })
  }
}

export const getters = {
  groups(state) {
    return state.groups
  }
}
