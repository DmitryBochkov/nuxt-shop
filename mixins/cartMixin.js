export default {
  data() {
    return {
      cart: this.$store.getters['catalog/cart']
    }
  },
  methods: {
    productInCart(product) {
      const cartItems = this.cart.items
      for (var i = 0; i < cartItems.length; i++) {
        if (cartItems[i].product.key === product.key) {
          return i
        }
      }
      return null
    },
    addToCart(product, quantity) {
      const index = this.productInCart(product)
      const productQuantity = (!quantity || quantity < 1) ? 1 : parseInt(quantity)

      if (index === null) {
        const item = {
          product: product,
          quantity: productQuantity
        }
        this.$store.commit('catalog/updateCart', item)
      } else {
        if (!quantity) {
          this.$store.commit('catalog/increaseQuantity', index)
        } else {
          this.$store.commit('catalog/updateQuantity', {index, productQuantity})
        }
      }

      this.$toast.show('Shopping cart updated', {
        theme: 'bubble',
        position: 'top-center',
        duration: 1500
      })
    },
    increaseQuantity(index) {
      this.$store.commit('catalog/increaseQuantity', index)
    },
    decreaseQuantity(index) {
      this.$store.commit('catalog/decreaseQuantity', index)
    }
  },
  computed: {
    cartTotal() {
      let totalAmount = 0
      this.cart.items.forEach(item => {
        totalAmount += item.quantity * parseFloat(item.product.price)
      })

      return totalAmount
    }
  }
}
