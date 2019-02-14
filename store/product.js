import { fireApp } from '@/plugins/firebase'

export const state = () => ({
  categories: [],
  products: [],
  product: null,
  productCategories: []
})

export const mutations = {
  loadCategories(state, payload) {
    state.categories.push(payload)
  },
  updateCategory(state, payload) {
    const i = state.categories.indexOf(payload.category)
    state.categories[i].name = payload.name
  },
  removeCategory(state, payload) {
    const i = state.categories.indexOf(payload.category)
    state.categories.splice(i, 1)
  },
  loadProducts(state, payload) {
    state.products = payload
  },
  loadProduct(state, payload) {
    state.product = payload
  },
  removeProduct(state, payload) {
    const i = state.products.indexOf(payload)
    state.products.splice(i, 1)
  },
  loadProductCategories(state, payload) {
    state.productCategories.push(payload)
  },
  clearProductCategories(state) {
    state.productCategories = []
  }
}

export const actions = {
  createCategory ({commit}, payload) {
    commit('setBusy', true, { root: true })
    commit('clearError', null, { root: true })
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
  addProduct({dispatch, commit}, payload) {
    const productData = payload
    const categories = payload.belongs
    const image = payload.image
    let productKey = ''
    let imageUrl = ''
    delete productData.belongs
    delete productData.image

    commit('setBusy', true, { root: true })
    commit('clearError', null, { root: true })

    fireApp.database().ref('products').push(payload)
      .then(result => {
        productKey = result.key
        return fireApp.storage().ref(`products/${image.name}`).put(image)
      })
      .then(fileData => {
        const fullPath = fileData.metadata.fullPath
        return fireApp.storage().ref(fullPath).getDownloadURL()
      })
      .then(imageUrl => {
        return fireApp.database().ref('products').child(productKey).update({imageUrl: imageUrl})
      })
      .then(() => {
        const productSnippet =  {
          name: productData.name,
          price: productData.price,
          status: productData.status,
          imageUrl: imageUrl
        }
        let catUpdates = {}
        categories.forEach(catKey => {
          catUpdates[`productCategories/${catKey}/${productKey}`] = productSnippet
        })

        return fireApp.database().ref().update(catUpdates)
      })
      .then(result => {
        dispatch('getPoducts')
        commit('setBusy', false, { root: true })
        commit('setJobDone', true, { root: true })
      })
      .catch(err => {
        commit('setBusy', false, { root: true })
        commit('setError', err, { root: true })
      })
  },
  getPoducts({commit}) {
    fireApp.database().ref('products').once('value')
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
  },
  removeProduct({commit}, payload) {
    // 1. Remove the product image from the storage
    // 2. Remove the product from products
    // 3. Remove the product from categories
    const imageUrl = payload.imageUrl
    const refUrl = imageUrl.split('?')[0]
    const httpsRef = fireApp.storage().refFromURL(refUrl)
    httpsRef.delete()
      .then(() => {
        return fireApp.database().ref(`products/${payload.key}`).remove()
          .then(() => {
            return fireApp.database().ref('categories').once('value')
              .then(snapShot => {
                const catKeys = Object.keys(snapShot.val())
                let updates = {}
                catKeys.forEach(key => {
                  updates[`productCategories/${key}/${payload.key}`] = null
                })
                return fireApp.database().ref().update(updates)
              })
          })
      })
      .then(() => {
        commit('removeProduct', payload)
      })
      .catch(err => {
        console.log(err)
      })
  },
  updateProduct({dispatch, commit}, payload) {
    const productData = payload
    const categories = payload.belongs
    const image = payload.image
    const productKey = payload.key
    let oldImageURL = null
    let oldCatsRemoval = {}
    delete productData.belongs // goes to productCategories
    delete productData.image // goes to storage

    commit('setBusy', true, { root: true })
    commit('clearError', null, { root: true })

    fireApp.database().ref(`products/${productKey}`).update(productData) // updated products data
      .then(() => { // upload image if new image provided
        if (image) {
          return fireApp.storage().ref(`products/${image.name}`).put(image)
        } else {
          return false
        }
      })
      .then(fileData => { // update prodact data with new image url
        if (fileData) {
          oldImageURL = productData.oldImageURL
          const fullPath = fileData.metadata.fullPath
          return fireApp.storage().ref(fullPath).getDownloadURL()
        }
      })
      .then(imageUrl => {
        if (imageUrl) {
          productData.imageUrl = imageUrl
          return fireApp.database().ref('products').child(productKey).update({imageUrl: imageUrl})
        }
      })
      .then(() => { // remove old image if new img uploaded and old img exists
        if (oldImageURL) {
          const refUrl = oldImageURL.split('?')[0]
          const httpsRef = fireApp.storage().refFromURL(refUrl)
          return httpsRef.delete()
        }
      })
      .then(() => { // prepare batch removal of product categories attachments
        return fireApp.database().ref('productCategories').on('child_added',
          snapShot => {
            oldCatsRemoval[`productCategories/${snapShot.key}/${productKey}`] = null
          }
        )
      })
      .then(() => { // execute removal of product categories attachments
        return fireApp.database().ref().update(oldCatsRemoval)
      })
      .then(() => { // add new product categories attachments
        const productSnippet =  {
          name: productData.name,
          price: productData.price,
          status: productData.status,
          imageUrl: productData.imageUrl
        }
        let catUpdates = {}
        categories.forEach(catKey => {
          catUpdates[`productCategories/${catKey}/${productKey}`] = productSnippet
        })

        return fireApp.database().ref().update(catUpdates)
      })
      .then(() => {
        dispatch('getPoducts') // dispatch getPoducts to refresh the products list
        commit('setBusy', false, { root: true })
        commit('setJobDone', true, { root: true })
      })
      .catch(err => {
        commit('setBusy', false, { root: true })
        commit('setError', err, { root: true })
      })
  },
  productCategories({commit}, payload) {
    commit('clearProductCategories')

    fireApp.database().ref('productCategories').on('child_added',
      snapShot => {
        let item = snapShot.val()
        item.key = snapShot.key
        if (item[payload] != undefined) {
          commit('loadProductCategories', item.key)
        }
      }
    )
  }

}

export const getters = {
  categories(state) {
    return state.categories
  },
  products(state) {
    return state.products
  },
  product(state) {
    return state.product
  },
  productCategories(state) {
    return state.productCategories
  }
}
