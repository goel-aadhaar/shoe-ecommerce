import React from "react";
import Navbar from "../Navbar";
import Footer from "../footer";

import brandData from "../../data";
import ShoeList from "../shoe_list";


const BrandPage = ({props})=>{

    let brandName = props;
    const normalize = (str) => str.toLowerCase().replace(/\s+/g, "");
    const brandShoes = brandData[normalize(brandName)] || 'puma';

    return(
        <>
            <Navbar/>
            <shoe_list
                props ={brandShoes}
            />
            <Footer/>
        </>
    );
}

export default BrandPage;