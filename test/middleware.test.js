const { runMiddleware } = require('../lib/middleware')

describe('runMiddleware', () => {
  it('is a function', () => {
    expect(runMiddleware).to.be.a('function')
  })

  it('throws if context is null or undefined', () => {
    expect(() => runMiddleware(null)).to.throw()
    expect(() => runMiddleware(undefined)).to.throw()
  })

  it('throws if middlewares is not an array', () => {
    expect(() => runMiddleware({})).to.throw()
    expect(() => runMiddleware({}, null)).to.throw()
    expect(() => runMiddleware({}, 'string')).to.throw()
  })

  it('throws if one or more middleware is not a function', () => {
    expect(() => runMiddleware({}, [null])).to.throw()
    expect(() => runMiddleware({}, [undefined])).to.throw()
    expect(() => runMiddleware({}, ['string'])).to.throw()
  })

  it('returns a promise', () => {
    const result = runMiddleware({}, [sinon.fake()])

    expect(result).to.be.instanceof(Promise)
  })

  it('passes context and next function to all middlewares', async () => {
    const fn1 = sinon.spy()
    const fn2 = sinon.spy()
    const context = {}

    await runMiddleware(context, [fn1, fn2])

    expect(fn1.getCall(0).args[0]).to.equal(context)
    expect(fn1.getCall(0).args[1]).to.be.a('function')
    expect(fn2.getCall(0).args[0]).to.equal(context)
    expect(fn2.getCall(0).args[1]).to.be.a('function')
  })

  it('resolves with the return value from the last middleware', async () => {
    const fn1 = sinon.fake.returns('fn1')
    const fn2 = sinon.fake.returns(Promise.resolve('fn2'))
    const fn3 = sinon.fake.returns('fn3')

    expect(await runMiddleware({}, [fn1, fn2]))
      .to.equal('fn2')

    expect(await runMiddleware({}, [fn1, fn3]))
      .to.equal('fn3')
  })

  describe('next() argument', () => {
    it('returns a promise that resolves with the return value', async () => {
      const spy = sinon.spy((ctx, next) => next())
      const syncFn = sinon.fake.returns('sync return value')
      const asyncFn = sinon.fake.returns(Promise.resolve('async return value'))

      await runMiddleware({}, [spy, spy, syncFn])
      await runMiddleware({}, [spy, spy, asyncFn])

      expect(spy.getCall(0).returnValue).to.be.a('promise')
      expect(await spy.getCall(0).returnValue).to.equal('sync return value')

      expect(spy.getCall(1).returnValue).to.be.a('promise')
      expect(await spy.getCall(1).returnValue).to.equal('sync return value')

      expect(spy.getCall(2).returnValue).to.be.a('promise')
      expect(await spy.getCall(2).returnValue).to.equal('async return value')

      expect(spy.getCall(3).returnValue).to.be.a('promise')
      expect(await spy.getCall(3).returnValue).to.equal('async return value')
    })

    it('throws if next() is called multiple times', async () => {
      const fn = async (ctx, next) => {
        await next()
        await next()
      }

      await expect(
        runMiddleware({}, [fn])
      ).to.be.rejectedWith('next() was called multiple times')

      await expect(
        runMiddleware({}, [
          () => {},
          fn
        ])
      ).to.be.rejectedWith('next() was called multiple times')
    })

    it('calls next middleware', async () => {
      let stack = []

      const create = (name, count = 0) => async (ctx, next) => {
        stack.push(`${name}${++count}`)
        await next()
        stack.push(`${name}${++count}`)
      }

      await runMiddleware({}, [
        create('a'),
        create('b'),
        create('c'),
        () => 'value'
      ])

      expect(stack).to.deep.equal(['a1', 'b1', 'c1', 'c2', 'b2', 'a2'])
    })
  })
})
