import ReactDOM from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './styles.css'

const queryClient = new QueryClient()

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
