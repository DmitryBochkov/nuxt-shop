<template>
  <div>
    <!-- <section class="section left-right-pad is-fluid">
      <div class="hero is-medium is-primary is-bold has-text-centered">
        <div class="hero-body">
          <h1 class="title">
            Warm Welcome to the Nshop!
          </h1>
          <h2 class="subtitle">
            Toys and Gifts for the Geeky Ones!
          </h2>
        </div>
      </div>
    </section> -->

    <section class="section">
      <div class="box">
        <nav class="level">
          <div class="level-left">
            <div class="field is-grouped is-grouped-multiline">
              <p class="control">
                <input class="input" type="text" placeholder="Keyword" v-model="keyword">
              </p>
              <p class="control">
                <span class="select">
                  <select v-model="category">
                    <option value="">All</option>
                    <option v-for="category in categories" :key="category.key" :value="category.key">{{ category.name }}</option>
                  </select>
                </span>
              </p>
              <p class="control">
                <a class="button is-primary" @click.prevent="search">
                  Search
                </a>
              </p>
            </div>
          </div>

          <div class="level-right">
            <div class="field is-grouped is-grouped-multiline">
              <p class="control">
                <span class="select">
                  <select v-model="sort">
                    <option value="">Latest</option>
                    <option value="low">Price - Low to High</option>
                    <option value="high">Price - High to Low</option>
                  </select>
                </span>
              </p>
            </div>
          </div>
        </nav>
      </div>

      <div class="columns is-mobile is-multiline">
        <div
          v-for="product in products" :key="product.key"
          class="column is-full-mobile is-half-tablet is-half-desktop is-one-third-widescreen is-one-quarter-fullhd"
        >
          <ProductBox :product="product" />
        </div>

      </div>
    </section>
  </div>
</template>

<script>
import ProductBox from '@/components/ProductBox'
export default {
  data() {
    return {
      keyword: '',
      category: '',
      sort: ''
    }
  },
  computed: {
    products() {
      return this.$store.getters['catalog/products']
    },
    categories() {
      return this.$store.getters['catalog/categories']
    }
  },
  created() {
    const loadedProducts = this.$store.getters['catalog/products']
    if (loadedProducts.length === 0) {
      this.$store.dispatch('catalog/getProducts')
      this.$store.dispatch('catalog/getCategories')
    }
  },
  components: {
    ProductBox
  },
  methods: {
    search() {
      const searchData = {
        keyword: this.keyword,
        category: this.category,
        sort: this.sort
      }
      this.$store.dispatch('catalog/productSearch', searchData)
    }
  }
}
</script>
