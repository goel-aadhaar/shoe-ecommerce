import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom"; // Use react-router-dom
import ErrorPage from './components/ErrorPage.jsx';
import AboutUs from './components/FooterNav/AboutUs.jsx';
import ContactUs from './components/FooterNav/ContactUs.jsx';
import BrandsLogoPage from './components/FooterNav/BrandsFooter.jsx';
import Registration from './components/Registration/Registration.jsx';
import ShoeDetail from './components/shoeDetail.jsx';
import HelpCenter from './components/FooterNav/HelpCenter.jsx';
import DummyFooterNavpage from './components/FooterNav/DummyNavpage.jsx'
import AllShoePage from './components/allShoePage.jsx';
import ProfilePage from './components/userProfilePage/Userprofile';
import AdminPanelApp from './components/Admin/AdminPanel.jsx';
import Home from './components/home-page/home-page';
import LoginPage from './components/Registration/Login.jsx';
import CartPage from './components/Cart/cart.jsx';

const AppRouter = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'collections/:queryType',
        element: <AllShoePage />
      },
      {
        path: 'about',
        element: <AboutUs />
      },
      {
        path: 'contact',
        element: <ContactUs />
      },
      {
        path: 'brandsLogo',
        element: <BrandsLogoPage />
      },
      {
        path: 'register',
        element: <Registration />
      }, {
        path: 'shoe/:id',
        element: <ShoeDetail />
      }, {
        path: 'support',
        element: <HelpCenter />
      },
      {
        path: 'Pages/:pageName',
        element: <DummyFooterNavpage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />
      }, {
        path: 'login',
        element: <LoginPage/>
      },
      {
        path: 'admin',
        element: <AdminPanelApp />
      },
      {
        path: 'cart',
        element : <CartPage/>
      }
    ],
    errorElement: <ErrorPage />
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={AppRouter} />
  </StrictMode>,
)