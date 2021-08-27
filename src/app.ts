import express from 'express'
import { useCronService } from './services/cronService'

const app: express.Express = express()

app.get('/', (req, res) => {
  // 凝りたくなったらページを開いたときに最終更新時刻などを表示させる。
  res.send('Hello world')
})

const { cronJob } = useCronService()
cronJob.start()

app.listen(3000, () => {
  console.log('Node.js app listening on port 3000!')
})
