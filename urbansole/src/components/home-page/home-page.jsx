import React from "react";
import TrendingSection from "../trending-section/trending";
import NewArrivalSection from "../New-Arrival Section/new-arrival-section"
import BrandCarousel from "../brandCardCarousel";
import FilterBar from "../filter";
import AdCard from "./adCard1";
import AdCard2 from "./adCard2";
import AdCard3 from "./adCard3";
const Home = ()=>{
    console.log("Home-page.jsx called...");
    
    return(
        <>
            <NewArrivalSection/>
            <BrandCarousel/>
            <FilterBar/>
            <TrendingSection/>
            <AdCard2/>
            <AdCard3/>
            <AdCard/>
        </>
    );
}
export default Home;