// AdidasProductShimmer.jsx

import React from 'react';
import './ShimmerShoeDetail.css';

const ShimmerShoeDetail = () => {
    return (
        <div className="shimmer-container bg-white mt-10">
            <div className="shimmer-layout">
                {/* Left side: Image Grid */}
                <div className="shimmer-image-section">
                    <div className="shimmer-image-box">
                        <div className="shimmer-gradient"></div>
                    </div>
                    <div className="shimmer-image-box">
                        <div className="shimmer-gradient"></div>
                    </div>
                    <div className="shimmer-image-box">
                        <div className="shimmer-gradient"></div>
                    </div>
                    <div className="shimmer-image-box">
                        <div className="shimmer-gradient"></div>
                    </div>
                </div>

                {/* Right side: Details Section */}
                <div className="shimmer-details-section">
                    <div className="shimmer-text-line brand-name"></div>
                    <div className="shimmer-text-line product-title"></div>
                    <div className="shimmer-text-line price"></div>
                    <div className="shimmer-text-line size-label"></div>
                    <div className="shimmer-size-options">
                        <div className="shimmer-size-box"></div>
                        <div className="shimmer-size-box"></div>
                        <div className="shimmer-size-box"></div>
                        <div className="shimmer-size-box"></div>
                        <div className="shimmer-size-box"></div>
                        <div className="shimmer-size-box"></div>
                    </div>
                    
                    <div className="shimmer-add-to-cart-btn"></div>
                    
                    <div className="shimmer-delivery-info">
                        <div className="shimmer-text-line delivery-label"></div>
                        <div className="shimmer-text-line delivery-text"></div>
                    </div>
                    
                    <div className="shimmer-section-toggle">
                        <div className="shimmer-text-line toggle-text"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShimmerShoeDetail;