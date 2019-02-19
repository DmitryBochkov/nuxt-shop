export default {
  data() {
    return {
      cart: this.$store.getters['catalog/cart']
    }
  },
  methods: {
    addToCart(product, quantity) {
      const productQuantity = (!quantity || quantity < 1) ? 1 : parseInt(quantity)
      const item = {
        product: product,
        quantity: productQuantity
      }
      this.$store.commit('catalog/updateCart', item)
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
