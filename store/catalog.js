import { fireApp } from '@/plugins/firebase'

export const state = () => ({
  categories: [],
  products: []
})

export const mutations = {
  loadProducts(state, payload) {
    state.products = payload
  },
  loadCategories(state, payload) {
    state.categories = payload
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
  },
  getCategories({commit}) {
    fireApp.database().ref('categories').once('value')
      .then(snapShot => {
        const categories = []
        let item = {}
        snapShot.forEach(child => {
          item = child.val()
          item.key = child.key
          categories.push(item)
        })
        commit('loadCategories', categories)
      })
      .catch(err => {
        console.log(err)
      })
  },
  productSearch({commit}, payload) {
    let ref = 'products'
    if (payload.category) {
      ref = `productCategories/${payload.category}`
    }

    fireApp.database().ref(`${ref}`).orderByChild('name').limitToLast(50).startAt(payload.keyword).endAt(payload.keyword + '\uf8ff').once('value')
      .then(snapShot => {
        let products = []
        let item = {}
        snapShot.forEach(child => {
          item = child.val()
          item.key = child.key
          products.push(item)
        })

        if (payload.sort) {
          if (payload.sort == 'low') {
            products.sort((a, b) => {
              return a.price - b.price
            })
          } else {
            products.sort((a, b) => {
              return b.price - a.price
            })
          }
        } else {
          products = products.reverse()
        }
        commit('loadProducts', products)
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
