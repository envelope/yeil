/**
 * Run middleware functions.
 *
 * @param {Object} context - The context object that is passed to all
 * middlewares.
 * @param {...Function} middlewares
 * @returns {Promise}
 */
function runMiddleware(context, middlewares) {
  if (context === null || context === undefined) {
    throw new Error(
      'Running middlewares without a context object is not allowed.'
    )
  }

  if (!Array.isArray(middlewares)) {
    throw new Error('Expected middlewares to be an array.')
  }

  for (const middleware of middlewares) {
    if (typeof middleware !== 'function') {
      throw new Error('Expected middleware to be a function.')
    }
  }

  const length = middlewares.length
  let returnValue
  let index = -1

  async function call(nextIndex) {
    if (index >= nextIndex) {
      throw new Error('next() was called multiple times.')
    }

    index = nextIndex

    // No more functions left
    if (index >= length) {
      return returnValue
    }

    const func = middlewares[index]
    const next = call.bind(null, index + 1)
    const result = await func(context, next)

    // Store return value
    if (index + 1 === length) {
      returnValue = result
    }

    // Index is unchanged, meaning next() wasn't called
    if (index === nextIndex) {
      return await next()
    }

    return returnValue
  }

  return call(0)
}

exports.runMiddleware = runMiddleware
