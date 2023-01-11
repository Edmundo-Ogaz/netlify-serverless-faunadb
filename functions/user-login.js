/* Import faunaDB sdk */
//import * as bcrypt from 'bcrypt';
const bcrypt = require('bcryptjs');
const faunadb = require('faunadb')
const q = faunadb.query

exports.handler = (event, context) => {
  console.log('Function `user-login` invoked', event.body)
  const body = event.body && JSON.parse(event.body)
  if (!body || !body.email || !body.password) {
    return Promise.resolve({
      statusCode: 200,
      body: JSON.stringify(null)
    })
  }

  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
  })
  return client.query(
    q.Get(
      q.Match(
        q.Ref('indexes/user_by_email'),
        body.email
      )
    )
  )
  .then(async (response) => {
    let result = null
    if (response && response.data
      && (await bcrypt.compare(body.password, response.data.password))
    ) {
      const { password, ...user } = response.data;
      result = user
    }
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    }
  }).catch((error) => {
    console.log('error', error)
    return {
      statusCode: 400,
      body: JSON.stringify(error)
    }
  })
}
