import { fireApp } from '@/plugins/firebase'

export const state = () => ({
  categories: [],
  products: []
})

export const mutations = {
  loadProducts(state, payload) {
    state.products = payload
  }
}

export const actions = {
  getProducts({commit}) {
    fireApp.database().ref('products').limitToLast(50).once('value')
      .then(snapShot => {
        const products = []
        let item = {}
        snapShot.forEach(child => {
          item = child.val()
          item.key = child.key
          products.push(item)
        })
        commit('loadProducts', products.reverse())
      })
      .catch(err => {
        console.log(err)
      })
  }
}

export const getters = {
  categories(state) {
    return state.categories
  },
  products(state) {
    return state.products
  }
}
