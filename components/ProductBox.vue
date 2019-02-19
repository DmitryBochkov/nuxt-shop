<template>
  <div class="card">
    <div class="card-image">
      <figure class="image is-4by3">
        <nuxt-link :to="{ path: productPath(product.name, product.key) }"><img :src="product.imageUrl" :alt="product.name"></nuxt-link>
      </figure>
    </div>
    <div class="card-content">
      <div class="media-content has-text-centered">
        <p class="subtitle is-6">{{ product.name }}</p>
        <p class="title is-4">{{ product.price | currency }}</p>
      </div>
    </div>
    <footer class="card-footer">
      <p class="card-footer-item">
        <span>
          <a href="#" class="button is-primary" @click.prevent="addToCart(product)">Add to Cart</a>
        </span>
      </p>
    </footer>
  </div>
</template>

<script>
import {slugifyString} from '@/plugins/helpers'
import cartMixin from '@/mixins/cartMixin'

  export default {
    name: 'ProductBox',
    props: ['product'],
    mixins: [cartMixin],
    methods: {
      productPath(name, key) {
        const slug = slugifyString(name)
        return `/product/${slug}/${key}`
      }
    }
  }
</script>
