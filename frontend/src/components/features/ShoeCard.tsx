'use client';

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { BsPlusSquareFill } from 'react-icons/bs';
import { Shoe } from '@/types';

interface ShoeCardProps {
  shoe: Shoe;
}

interface ShoeModalProps {
  shoeName: string;
  shoePrice: string;
  shoeSrc: string;
}

const ShoeCard: React.FC<ShoeCardProps> = ({ shoe }) => {
  const modalRef = useRef<ShoeModalRef>(null);
  
  const brand = shoe?.brand || "BrandName";
  const name = shoe?.name || "Shoe Name";
  const color = shoe?.color || "Color";
  const price = shoe?.price || "Price";
  
  let thumbnailImg = shoe?.imageSet?.thumbnail;
  let hoverImg = shoe?.imageSet?.hover;
  
  if (thumbnailImg == null) thumbnailImg = "https://www.superkicks.in/cdn/shop/files/1_23_63d4bcad-2f4f-4dff-8606-1b9687a04aa5.png?v=1754314154";
  if (hoverImg == null) hoverImg = thumbnailImg;

  const [currentImg, setCurrentImg] = useState(thumbnailImg);

  const getOptimizedImage = (url: string, width: number = 268*2, height: number = 268*2): string => {
    if (!url.includes("res.cloudinary.com")) return url;
    return url.replace(
      "/upload/",
      `/upload/f_auto,q_auto,w_${width},h_${height},c_fill/`
    );
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    modalRef.current?.openModal();
  };

  return (
    <>
      <div 
        className="overflow-hidden shadow-md hover:shadow-lg transition border border-slate-200 cursor-pointer"
        onMouseEnter={() => hoverImg && setCurrentImg(getOptimizedImage(hoverImg))}
        onMouseLeave={() => setCurrentImg(getOptimizedImage(thumbnailImg))}
      >
        <img 
          src={getOptimizedImage(currentImg)} 
          alt={`${brand} shoe`} 
          className="aspect-square w-full object-cover bg-gray-100" 
        />
        
        <div className="p-2 pb-0">
          <div className="flex justify-between items-center text-gray-600">
            <span className="font-semibold">{brand}</span>
            <button 
              aria-label="Add to cart"
              onClick={handleAddToCartClick}
            >
              <BsPlusSquareFill size={20}/>
            </button>
          </div>

          <h4 className="text-black text-left overflow-hidden h-7">{name}</h4>
          <p className="text-slate-500 text-sm text-left mt-1 mb-1 h-5 overflow-hidden">{color}</p>
          
          <p className="mt-1 mb-2 text-black text-left font-medium">{price}/-</p>
        </div>
      </div>
      <ShoeModal 
        shoeName={name} 
        shoePrice={price} 
        shoeSrc={getOptimizedImage(thumbnailImg)} 
        ref={modalRef} 
      />
    </>
  );
};

interface ShoeModalRef {
  openModal: () => void;
  closeModal: () => void;
}

const ShoeModal = forwardRef<ShoeModalRef, ShoeModalProps>(({ shoeName, shoePrice, shoeSrc }, ref) => {
  if (shoeSrc == null) shoeSrc = "https://www.superkicks.in/cdn/shop/files/1_23_63d4bcad-2f4f-4dff-8606-1b9687a04aa5.png?v=1754314154"
  const dialogRef = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => ({
    openModal: () => {
      if (dialogRef.current?.showModal) {
        dialogRef.current.showModal();
      }
    },
    closeModal: () => {
      if (dialogRef.current?.close) {
        dialogRef.current.close();
      }
    }
  }));
  
  return createPortal(
    <dialog ref={dialogRef} className="relative z-10 backdrop:bg-transparent">
      <div className="fixed inset-0 hidden bg-gray-500/75 transition-opacity" />
      <div tabIndex={0} className="fixed inset-0 z-10 w-screen overflow-y-auto focus:outline-none">
        <div className="flex min-h-full items-stretch justify-center text-center md:items-center md:px-2 lg:px-4">
          <div className="flex w-full transform text-left text-base transition data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in md:my-8 md:max-w-2xl md:px-4 data-closed:md:translate-y-0 data-closed:md:scale-95 lg:max-w-2xl">
            <div className="relative flex w-full items-center overflow-hidden bg-white px-3 pt-3 pb-3 shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-5">  
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 sm:top-8 sm:right-6 md:top-6 md:right-6 lg:top-6 lg:right-4"
              >
                <span className="sr-only">Close</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
                  <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="grid w-full grid-cols-1 items-start gap-x-5 gap-y-8 sm:grid-cols-12 lg:gap-x-1">
                <img src={shoeSrc} className="aspect-3/3 w-full rounded-lg bg-gray-100 object-cover sm:col-span-4 lg:col-span-4" />
                <div className="sm:col-span-8 lg:col-span-7 ps-2">
                  <h2 className="text-lg font-bold text-gray-900 sm:pr-12">{shoeName}</h2>
                  <section aria-labelledby="information-heading" className="mt-1">
                    <h3 id="information-heading" className="sr-only">Product information.</h3>
                    <p className="text-xl text-gray-900 mb-1">{shoePrice}</p>
                    <div className="mt-1">
                      <h4 className="sr-only">Reviews</h4>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(4)].map((_, i) => (
                            <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0 text-gray-900">
                              <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" fillRule="evenodd" />
                            </svg>
                          ))}
                          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0 text-gray-200">
                            <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" fillRule="evenodd" />
                          </svg>
                        </div>
                        <p className="sr-only">3.9 out of 5 stars</p>
                        <a href="#" className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">117 reviews</a>
                      </div>
                    </div>
                  </section>
                  <section aria-labelledby="options-heading" className="mt-2">
                    <h3 id="options-heading" className="sr-only">Product options</h3>
                    <form>
                      <fieldset aria-label="Choose a size" className="mt-10">
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-medium text-slate-500">Shoe Size (IND)</div>
                          <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Size guide</a>
                        </div>
                        <div className="mt-2 grid grid-cols-5 gap-2 text-center pb-1">
                          {['7', '8', '9', '10', '11'].map((size, index) => (
                            <label key={size} className="group relative flex items-center justify-center rounded-md border border-gray-300 bg-white p-3">
                              <input 
                                type="radio" 
                                name="shoe_size" 
                                defaultValue={size}
                                defaultChecked={index === 2}
                                className="absolute inset-0 appearance-none focus:outline-none disabled:cursor-not-allowed" 
                              />
                              <span className="text-sm font-medium text-gray-900 uppercase">{size}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <button type="submit" className="mt-6 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-black hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden mb-1">
                        Add to Cart
                      </button>
                      <button type="submit" className="mt-6 flex w-full items-center justify-center rounded-md border border-transparent px-2 py-2 text-base font-medium text-indigo-600 focus:outline-hidden">
                        View Product
                        <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                        </svg>
                      </button>
                    </form>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </dialog>,
    document.body
  );
});

ShoeModal.displayName = 'ShoeModal';

export default ShoeCard;
