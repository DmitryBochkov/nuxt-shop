import { fireApp } from '@/plugins/firebase'

export const state = () => ({
  categories: [],
  products: [],
  cart: {
    items: []
  }
})

export const mutations = {
  loadProducts(state, payload) {
    state.products = payload
  },
  loadCategories(state, payload) {
    state.categories = payload
  },
  updateQuantity(state, {index, productQuantity}) {
    state.cart.items[index].quantity = productQuantity
  },
  increaseQuantity(state, index) {
    state.cart.items[index].quantity += 1
  },
  decreaseQuantity(state, index) {
    state.cart.items[index].quantity -= 1
    if (state.cart.items[index].quantity === 0) {
      state.cart.items.splice(index, 1)
    }
  },
  updateCart(state, payload) {
    state.cart.items.push(payload)
  },
  emptyCart(state) {
    state.cart.items = []
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
  },
  postOrder({commit}, payload) {
    // orders/orderKey/usrKey/productKey/productDetail
    const orderKey = fireApp.database().ref('orders').push().key
    const items = payload.items
    const user = fireApp.auth().currentUser
    let orderItems = {}

    items.forEach(item => {
      orderItems[`orders/${orderKey}/${user.uid}/${item.product.key}`] = {
        product: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
        createdAt: new Date().toISOString()
      }
    })

    fireApp.database().ref().update(orderItems)
      .then(() => {
        commit('emptyCart')
        commit('setJobDone', true, {root: true})
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
  },
  cart(state) {
    return state.cart
  }
}
