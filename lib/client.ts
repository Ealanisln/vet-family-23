// client.ts
import { createClient } from '@sanity/client'

export default createClient({
  projectId: 'iyk0a3lk', // you can find this in sanity.json
  dataset: 'production', // or the name you chose in step 1
  useCdn: true // `false` if you want to ensure fresh data
})