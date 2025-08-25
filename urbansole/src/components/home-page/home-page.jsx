import React from "react";
import TrendingSection from "../trending-section/trending";
import BrandCarousel from "../brandCardCarousel";
import FilterBar from "../filter";
const Home = ()=>{
    return(
        <>
            <BrandCarousel/>
            <FilterBar/>
            <TrendingSection/>
        </>
    );
}

export default Home;