const inject = require('../lib/middleware/inject')

describe('inject middleware', () => {
  it('is a function', () => {
    expect(inject).to.be.a('function')
  })

  it('extends context with properties', () => {
    const method = () => {}
    const context = {}
    const middleware = inject({ property: 'string', method })

    expect(middleware)
      .to.be.a('function')

    expect(middleware(context))
      .to.deep.equal({ property: 'string', method })
  })
})
