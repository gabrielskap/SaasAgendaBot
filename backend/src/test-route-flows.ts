import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function run() {
  const { buildApp } = await import('./app')
  const app = await buildApp()

  console.log('Sending GET /chatbot/flows')
  const response = await app.inject({
    method: 'GET',
    url: '/chatbot/flows',
    headers: {
      authorization: 'Bearer mock-token'
    }
  })

  console.log('Response Status:', response.statusCode)
  console.log('Response Body:', response.body)
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
