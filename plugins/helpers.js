import slugify from 'slugify'

export const slugifyString = str => {
  if (!str) {
    return ''
  }
  
  return slugify(str, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  })
}
