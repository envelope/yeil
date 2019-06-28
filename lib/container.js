const { runMiddleware } = require('./middleware')
const inject = require('./middleware/inject')

function createContainer() {
  // Global middleware
  let middleware = []

  // Container
  const container = {
    use,
    call,
    install,
    inject
  }

  function install(plugin) {
    if (typeof plugin !== 'function') {
      throw new Error('Expected plugin to be a function')
    }

    plugin(container)
  }

  /**
   * Mount global middleware functions
   */
  function use(...funcs) {
    for (const func of funcs) {
      if (typeof func !== 'function') {
        throw new Error('Expected middleware to be a function')
      }
      if (middleware.includes(func)) {
        continue
      }
      middleware.push(func)
    }

    return container
  }

  async function call(action, params = {}) {
    const context = { action, params, call }

    function handler() {
      if (typeof context.action !== 'function') {
        throw new Error('Expected action to be a function')
      }

      return context.action(context.params, context)
    }

    return await runMiddleware(context, [...middleware, handler])
  }

  return container
}

module.exports = createContainer
