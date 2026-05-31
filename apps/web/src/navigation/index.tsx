import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './routes'

export const Navigation = (): React.ReactElement => {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}
