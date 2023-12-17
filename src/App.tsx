import { Input } from '@nextui-org/react'
import { useState } from 'react'
import { Outlet, RouterProvider, createHashRouter, useRoutes } from 'react-router-dom';
import { MintGitHubProfile } from './Page/MintGitHubProfile';
import { Header } from './Componenet/Header';

const Layout = () => (
  <>
    <Header />
    <Outlet />
  </>
);
const router = createHashRouter([
  {
    element: <Layout />,
    children: [{
      path: "/",
      element: <div />,
    },
    {
      path: "/mint",
      element: <MintGitHubProfile />,
    },
    ]
  }
]);



function App() {


  return (
    <>

      <RouterProvider router={router} />
    </>
  )
}

export default App
