import { Outlet, RouterProvider, createHashRouter } from 'react-router-dom';
import { MintGitHubProfile } from './Page/MintGitHubProfile';
import { Header } from './Componenet/Header';
import { Game1 } from './Page/Game1';
import { Home } from './Page/Home';
import { Withdrawal } from './Page/Withdrawal';

const Layout = () => (
  <>
    <Header />
    <Outlet />
  </>
);
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/game",
        element: <Game1 />,
      },
      {
        path: "/reward",
        element: <Withdrawal />,
      },
      {
        path: "/mint",
        element: <MintGitHubProfile />,
      },
    ]
  }
]);



function App() {
  return <RouterProvider router={router} />
}

export default App
