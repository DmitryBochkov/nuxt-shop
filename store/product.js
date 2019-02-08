import { fireApp } from '@/plugins/firebase'

export const state = () => ({
  categories: []
})

export const mutations = {
  loadCategories (state, payload) {
    state.categories.push(payload)
  },
  updateCategory (state, payload) {
    const i = state.categories.indexOf(payload.category)
    state.categories[i].name = payload.name
  },
  removeCategory (state, payload) {
    const i = state.categories.indexOf(payload.category)
    state.categories.splice(i, 1)
  }
}

export const actions = {
  createCategory ({commit}, payload) {
    commit('setBusy', true, { root: true })
    commit('clearError', null, { root: true })
    console.log(payload);
    fireApp.database().ref('categories').push(payload)
      .then(() => {
        commit('setBusy', false, { root: true })
        commit('setJobDone', true, { root: true })
      })
      .catch(error => {
        commit('setBusy', false, { root: true })
        commit('setError', error, { root: true })
      })
  },
  getCategories ({commit}) {
    fireApp.database().ref('categories').on('child_added',
      snapShot => {
        let item = snapShot.val()
        item.key = snapShot.key
        commit('loadCategories', item)
      })
  },
  updateCategory ({commit}, payload) {
    commit('setBusy', true, { root: true })
    commit('clearError', null, { root: true })
    fireApp.database().ref(`categories/${payload.category.key}`).update({ name: payload.name })
      .then(() => {
        commit('setBusy', false, { root: true })
        commit('setJobDone', true, { root: true })
        const categoryData = {
          category: payload.category,
          name: payload.name
        }
        commit('updateCategory', categoryData)
      })
      .catch(error => {
        commit('setBusy', false, { root: true })
        commit('setError', error, { root: true })
      })
  },
  removeCategory ({commit}, payload) {
    fireApp.database().ref(`categories/${payload.category.key}`).remove()
      .then(() => {
        commit('removeCategory', payload)
      })
      .catch(error => {
        console.log(error)
      })
  },
  addProduct({commit}, payload) {
    const productData = payload
    const categories = payload.belongs
    delete productData.belongs

    commit('setBusy', true, { root: true })
    commit('clearError', null, { root: true })

    fireApp.database().ref('products').push(payload)
      .then(result => {
        const productSnippet =  {
          name: productData.name,
          price: productData.price,
          status: productData.status
        }
        let catUpdates = {}
        categories.forEach(catKey => {
          catUpdates[`productCategories/${catKey}/${result.key}`] = productSnippet
        })

        return fireApp.database().ref().update(catUpdates)
      })
      .then(result => {
        commit('setBusy', false, { root: true })
        commit('setJobDone', true, { root: true })
      })
      .catch(err => {
        commit('setBusy', false, { root: true })
        commit('setError', err, { root: true })
      })
  }
}

export const getters = {
  categories (state) {
    return state.categories
  }
}
