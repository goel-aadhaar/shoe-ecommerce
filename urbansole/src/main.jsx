import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {createBrowserRouter, RouterProvider} from "react-router";
import ErrorPage from './components/ErrorPage.jsx';
import NewArrivalFullPage from './components/New-Arrival Section/newArrivalFullPage.jsx';
import BrandFullPage from './components/brandPage/BrandFullPage.jsx';
import AboutUs from './components/FooterNav/AboutUs.jsx';
import ContactUs from './components/FooterNav/ContactUs.jsx';
import BrandsLogoPage from './components/FooterNav/BrandsFooter.jsx';
import Registration from './components/Registration/Registration.jsx';
import ShoeDetail from './components/shoeDetail.jsx';
import HelpCenter from './components/FooterNav/HelpCenter.jsx';
import DummyFooterNavpage from './components/FooterNav/DummyNavpage.jsx'

const AppRouter = createBrowserRouter([
  {
    path : '/',
    element : <App/>,
    children : [
      { path : 'newArrival',
        element : <NewArrivalFullPage/>
      },
      {
        path:'brands',
        element : <BrandFullPage/>
      }
    ],
    errorElement : <ErrorPage/>

  },
  {
    path : '/about',
    element : <AboutUs/>
  },
  {
    path : '/contact',
    element : <ContactUs/>
  },
  {
    path : '/brandsLogo',
    element : <BrandsLogoPage/>
  },
  {
    path:'/register',
    element : <Registration/>
  },{
    path:'/shoe/:id',
    element: <ShoeDetail/>
  },{
    path: '/support',
    element : <HelpCenter/>
  },
  {
    path: '/Pages/:pageName',
    element: <DummyFooterNavpage />,
  },

]) 




createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider
      router={AppRouter}
    />
    {/* <App/> */}
  </StrictMode>,
)
