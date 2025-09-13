import React, { useState, useEffect } from 'react'; // Make sure to import useEffect
import TrendingSection from "../trending-section/trending";
import NewArrivalSection from "../New-Arrival Section/new-arrival-section"
import BrandCarousel from "../brandCardCarousel";
import AdCard from "./adCard1";
import AdCard2 from "./adCard2";
import AdCard3 from "./adCard3";
const Home = ({onShoeClick})=>{
    console.log("Home-page.jsx called...");
    console.log("carouselCard.jsx caled....");
    return(
        <>
            <NewArrivalSection
                onShoeClick = {onShoeClick}
            />
            <BrandCarousel/>
            <TrendingSection
                onShoeClick = {onShoeClick}
            />
            <AdCard2/>
            <AdCard3/>
            <AdCard/>
        </>
    );
}
export default Home;