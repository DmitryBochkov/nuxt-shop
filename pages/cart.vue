<template>
  <div>
    <section class="section no-top-pad">
      <h5 class="title is-5">Shopping Cart</h5><hr>

      <template v-if="cart.items.length > 0">
        <table class="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th></th>
              <th>Product</th>
              <th class="has-text-centered">Quantity</th>
              <th class="has-text-right">Price</th>
              <th class="has-text-right">Amount</th>
            </tr>
          </thead>
          <tbody class="cart">
            <tr v-for="(item, index) in cart.items" :key="index">
              <td><img :src="item.product.imageUrl" alt="Image" class="image is-48x48"></td>
              <td>{{ item.product.name }}</td>
              <td class="has-text-centered">
                {{ item.quantity }}
                <a class="button is-primary is-outlined is-small" @click.prevent="increaseQuantity(index)">
                  <span class="icon is-small">
                    <i class="fa fa-plus"></i>
                  </span>
                </a>
                <a class="button is-danger is-outlined is-small" @click.prevent="decreaseQuantity(index)">
                  <span class="icon is-small">
                    <i class="fa fa-minus"></i>
                  </span>
                </a>
              </td>
              <td class="has-text-right">{{ item.product.price | currency }}</td>
              <td class="has-text-right">{{ item.product.price * item.quantity | currency }}</td>
            </tr>

            <tr>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td class="has-text-right"><strong>Total <span class="cart-total">{{ cartTotal | currency }}</span></strong></td>
            </tr>
          </tbody>
        </table>

        <div class="field is-grouped is-grouped-centered">
          <div class="control">
            <nuxt-link class="button is-info" to="/">Back to Shopping</nuxt-link>
          </div>
          <div class="control">
            <a class="button is-primary" @click.prevent="checkout">Checkout</a>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="has-text-centered">
          <h5 class="title is-5">Yuor shopping cart is empty.</h5>
          <nuxt-link class="button is-info" to="/">Back to Shopping</nuxt-link>
        </div>
      </template>

    </section>
  </div>
</template>

<script>
  import cartMixin from '@/mixins/cartMixin'
  export default {
    mixins: [cartMixin],
    methods: {
       checkout() {
         const isLoggedIn = this.$store.getters.loginStatus
         if (!isLoggedIn) {
           this.$store.commit('setForwardRoute', '/checkout')
           this.$router.push('/login')
         } else {
           this.$router.push('/checkout')
         }
       }
    }
  }
</script>
