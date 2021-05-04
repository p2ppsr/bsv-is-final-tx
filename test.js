const isFinalTransaction = require('./index')
const bsv = require('bsv')
const axios = require('axios')

const MAXINT = 0xffffffff
jest.mock('axios')

describe('isFinalTransaction', () => {
  beforeAll(() => {
    axios.get.mockReturnValue({ data: { blocks: 660000 } })
  })
  it('Throws an Error if the provided value is not a bsv.Transaction', async () => {
    expect(isFinalTransaction('foo')).rejects.toThrow(new TypeError(
      'The first parameter must be an instance of bsv.Transaction.'
    ))
  })
  it('Returns true if all inputs have max sequence numbers', async () => {
    const testTx = bsv.Transaction()
    testTx.addInput(new bsv.Transaction.Input({
      sequenceNumber: MAXINT,
      output: new bsv.Transaction.Output({
        script: require('crypto').randomBytes(25).toString('hex'),
        satoshis: 1000
      }),
      prevTxId: require('crypto').randomBytes(32).toString('hex'),
      outputIndex: 0,
      script: bsv.Script.empty()
    }))
    testTx.addInput(new bsv.Transaction.Input({
      sequenceNumber: MAXINT,
      output: new bsv.Transaction.Output({
        script: require('crypto').randomBytes(25).toString('hex'),
        satoshis: 1000
      }),
      prevTxId: require('crypto').randomBytes(32).toString('hex'),
      outputIndex: 0,
      script: bsv.Script.empty()
    }))
    expect(await isFinalTransaction(testTx)).toEqual(true)
  })
  it('Returns true if all inputs have max sequence number even if lock time is set', async () => {
    const testTx = bsv.Transaction()
    /*
      Transaction must be locked before adding inputs to avoid the library
      resetting the sequence numbers. During a real use-case, this would not be
      a problem, and this test simply ensures that lock time is ignored when
      sequence numbers are at max.
    */
    testTx.lockUntilDate(new Date())
    testTx.addInput(new bsv.Transaction.Input({
      sequenceNumber: MAXINT,
      output: new bsv.Transaction.Output({
        script: require('crypto').randomBytes(25).toString('hex'),
        satoshis: 1000
      }),
      prevTxId: require('crypto').randomBytes(32).toString('hex'),
      outputIndex: 0,
      script: bsv.Script.empty()
    }))
    testTx.addInput(new bsv.Transaction.Input({
      sequenceNumber: MAXINT,
      output: new bsv.Transaction.Output({
        script: require('crypto').randomBytes(25).toString('hex'),
        satoshis: 1000
      }),
      prevTxId: require('crypto').randomBytes(32).toString('hex'),
      outputIndex: 0,
      script: bsv.Script.empty()
    }))
    expect(await isFinalTransaction(testTx)).toEqual(true)
  })
  it('Returns true when some inputs have a low sequence when lock time is a date in the past', async () => {
    const testTx = bsv.Transaction()
    testTx.addInput(new bsv.Transaction.Input({
      sequenceNumber: 1,
      output: new bsv.Transaction.Output({
        script: require('crypto').randomBytes(25).toString('hex'),
        satoshis: 1000
      }),
      prevTxId: require('crypto').randomBytes(32).toString('hex'),
      outputIndex: 0,
      script: bsv.Script.empty()
    }))
    testTx.addInput(new bsv.Transaction.Input({
      sequenceNumber: MAXINT,
      output: new bsv.Transaction.Output({
        script: require('crypto').randomBytes(25).toString('hex'),
        satoshis: 1000
      }),
      prevTxId: require('crypto').randomBytes(32).toString('hex'),
      outputIndex: 0,
      script: bsv.Script.empty()
    }))
    testTx.lockUntilDate(parseInt(Date.now() / 1000) - 3600)
    expect(await isFinalTransaction(testTx)).toEqual(true)
  })
  it('Returns false when some inputs have a low sequence when lock time is a date in the future', async () => {
    const testTx = bsv.Transaction()
    testTx.addInput(new bsv.Transaction.Input({
      sequenceNumber: MAXINT,
      output: new bsv.Transaction.Output({
        script: require('crypto').randomBytes(25).toString('hex'),
        satoshis: 1000
      }),
      prevTxId: require('crypto').randomBytes(32).toString('hex'),
      outputIndex: 0,
      script: bsv.Script.empty()
    }))
    testTx.addInput(new bsv.Transaction.Input({
      sequenceNumber: 1,
      output: new bsv.Transaction.Output({
        script: require('crypto').randomBytes(25).toString('hex'),
        satoshis: 1000
      }),
      prevTxId: require('crypto').randomBytes(32).toString('hex'),
      outputIndex: 0,
      script: bsv.Script.empty()
    }))
    testTx.lockUntilDate(parseInt(Date.now() / 1000) + 3600)
    expect(await isFinalTransaction(testTx)).toEqual(false)
  })
  it('Returns true when some inputs have a low sequence when lock time is a block height in the past', async () => {
    const testTx = bsv.Transaction()
    testTx.addInput(new bsv.Transaction.Input({
      sequenceNumber: 1,
      output: new bsv.Transaction.Output({
        script: require('crypto').randomBytes(25).toString('hex'),
        satoshis: 1000
      }),
      prevTxId: require('crypto').randomBytes(32).toString('hex'),
      outputIndex: 0,
      script: bsv.Script.empty()
    }))
    testTx.addInput(new bsv.Transaction.Input({
      sequenceNumber: MAXINT,
      output: new bsv.Transaction.Output({
        script: require('crypto').randomBytes(25).toString('hex'),
        satoshis: 1000
      }),
      prevTxId: require('crypto').randomBytes(32).toString('hex'),
      outputIndex: 0,
      script: bsv.Script.empty()
    }))
    testTx.lockUntilBlockHeight(15)
    expect(await isFinalTransaction(testTx)).toEqual(true)
  })
  it('Returns false when some inputs have a low sequence when lock time is a block height in the future', async () => {
    const testTx = bsv.Transaction()
    testTx.addInput(new bsv.Transaction.Input({
      sequenceNumber: MAXINT,
      output: new bsv.Transaction.Output({
        script: require('crypto').randomBytes(25).toString('hex'),
        satoshis: 1000
      }),
      prevTxId: require('crypto').randomBytes(32).toString('hex'),
      outputIndex: 0,
      script: bsv.Script.empty()
    }))
    testTx.addInput(new bsv.Transaction.Input({
      sequenceNumber: 1,
      output: new bsv.Transaction.Output({
        script: require('crypto').randomBytes(25).toString('hex'),
        satoshis: 1000
      }),
      prevTxId: require('crypto').randomBytes(32).toString('hex'),
      outputIndex: 0,
      script: bsv.Script.empty()
    }))
    testTx.lockUntilBlockHeight(480000000)
    expect(await isFinalTransaction(testTx)).toEqual(false)
  })
})
