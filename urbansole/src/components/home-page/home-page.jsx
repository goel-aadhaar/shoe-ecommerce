import React, { useState, useEffect } from 'react'; // Make sure to import useEffect
import TrendingSection from "../trending-section/trending";
import NewArrivalSection from "../New-Arrival Section/new-arrival-section"
import BrandCarousel from "../brandCardCarousel";
import AdCard from "./adCard1";
import AdCard2 from "./adCard2";
import AdCard3 from "./adCard3";
import ImageSlider from '../ImageSlider';

const Home = ()=>{
    console.log("Home-page.jsx called...");
    console.log("carouselCard.jsx caled....");
    return(
        <>
            <ImageSlider/>
            <TrendingSection/>
            <BrandCarousel/>
            <NewArrivalSection/>
            <AdCard2/>
            <AdCard3/>
            <AdCard/>
        </>
    );
}
export default Home;