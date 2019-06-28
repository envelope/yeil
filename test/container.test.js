const createContainer = require('../lib/container')

describe('createContainer()', () => {
  it('is a function', () => {
    expect(createContainer).to.be.a('function')
  })

  it('returns a yeil container', () => {
    const container = createContainer()

    expect(container.call).to.be.a('function')
    expect(container.use).to.be.a('function')
  })

  describe('container', () => {
    let container

    beforeEach(() => {
      container = createContainer()
    })

    describe('use()', () => {
      it('throws if middleware is not a function', () => {
        expect(() => container.use('string')).to.throw()
        expect(() => container.use(null)).to.throw()
        expect(() => container.use(() => {}, 'string')).to.throw()
      })

      it('does not add the same middleware more than once', async () => {
        const fn = sinon.fake()
        container.use(fn, fn, fn)

        await container.call(() => {})
        expect(fn.callCount).to.equal(1)
      })
    })

    describe('install()', () => {
      it('throws if given plugin is not a function', () => {
        expect(() => container.install('string'))
          .to.throw('Expected plugin to be a function')
        expect(() => container.install())
          .to.throw('Expected plugin to be a function')
      })

      it('calls plugin with container as argument', () => {
        const plugin = sinon.fake()

        container.install(plugin)
        expect(plugin.lastArg).to.equal(container)
      })
    })

    describe('call()', () => {
      it('throws if action is not a function', async () => {
        await expect(container.call('string'))
          .to.be.rejectedWith('Expected action to be a function')
      })

      it('calls action with params and context', async () => {
        const action = sinon.fake.returns('return value')
        const params = { params: true }

        await container.call(action, params)

        const call = action.getCall(0)
        const context = call.args[1]

        expect(call.args[0]).to.equal(params)
        expect(context).to.have.property('action', action)
        expect(context).to.have.property('params', params)
        expect(context).to.have.property('call', container.call)
      })

      it('resolves with the return value from the action', async () => {
        expect(await container.call(() => 'sync')).to.equal('sync')
        expect(
          await container.call(() => Promise.resolve('async'))
        ).to.equal('async')
      })

      it('allows middleware to modify action before it is called', async () => {
        const action = sinon.fake()
        container.use((ctx) => ctx.action = action)

        await expect(container.call('string', {})).to.not.be.rejected
        expect(action.called).to.be.true
      })
    })
  })
})
