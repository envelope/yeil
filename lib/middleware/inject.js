module.exports = object => context => {
  for (const key in object) {
    context[key] = object[key]
  }

  return context
}
