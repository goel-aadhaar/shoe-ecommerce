import React from 'react';
import ShimmerShoeCard from './shoe_card_shimmer';

const ShimmerShoeCard_ = () => {
    let arr = [0,0,0,0]
    console.log("call coming here in ");
    
    return (
        <div className="max-w-[300px] h-[300px] grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 overflow-hidden shadow-md transition border border-slate-200 animate-shimmer">
            {
                arr.map(()=>{
                    console.log('calling four times');
                    
                    <ShimmerShoeCard/>
                })
            }
        </div>
    );
};

export default ShimmerShoeCard_;