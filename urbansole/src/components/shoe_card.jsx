import React from 'react';
import { BsPlusSquareFill } from "react-icons/bs";
import { useState } from 'react';
import { createPortal } from "react-dom";
import { forwardRef, useImperativeHandle, useRef } from "react";

// 1. Added 'onClick' to the props to handle navigation
const Shoe_Card = ({ brand = 'Nike', name, color, price, imgSrc, imgSrc2, onClick }) => {
    const modalRef = useRef();
    if (imgSrc == null) imgSrc = "https://www.superkicks.in/cdn/shop/files/1_23_63d4bcad-2f4f-4dff-8606-1b9687a04aa5.png?v=1754314154";
    if (imgSrc2 == null) imgSrc2 = imgSrc;

    const [currentImg, setCurrentImg] = useState(imgSrc);

    // 2. Created a new handler for the modal button
    const handleAddToCartClick = (e) => {
      // This stops the card's main onClick from firing when you click the '+' icon
      e.stopPropagation();
      modalRef.current?.openModal();
    };

    return (
      <>
        {/* 3. Added the main onClick and a cursor pointer to the wrapper */}
        <div 
            className="overflow-hidden shadow-md hover:shadow-lg transition border border-slate-200 cursor-pointer"
            onMouseEnter={() => imgSrc2 && setCurrentImg(imgSrc2)}
            onMouseLeave={() => setCurrentImg(imgSrc)}
            onClick={onClick}
        >
            <img 
                src={currentImg} 
                alt={`${brand} shoe`} 
                className="aspect-square w-full object-cover bg-gray-100" 
            />
            
            <div className="p-2 pb-0">
                <div className="flex justify-between items-center text-gray-600">
                    <span className="font-semibold">{brand}</span>
                    {/* 4. The button now uses the new handler */}
                    <button aria-label="Add to cart"
                     onClick={handleAddToCartClick}
                     >
                        <BsPlusSquareFill size={20}/>
                    </button>
                </div>

                <h4 className=" text-black text-left overflow-hidden h-7">{name}</h4>
                <p className="text-slate-500 text-sm text-left mt-1 mb-1 h-5 overflow-hidden">{color}</p>
                
                <p className="mt-1 mb-2 text-black text-left font-medium">{price}/-</p>
            </div>
        </div>
        <Shoe_Modal 
          shoe_name={name} 
          shoe_price={price} 
          shoe_src={imgSrc} 
          ref={modalRef} 
        />
      </>
    );
};

// Your original Shoe_Modal component remains unchanged
const  Shoe_Modal = forwardRef(({shoe_name, shoe_price, shoe_src}, ref)  =>{
    if(shoe_src == null) shoe_src =  "https://www.superkicks.in/cdn/shop/files/1_23_63d4bcad-2f4f-4dff-8606-1b9687a04aa5.png?v=1754314154"
    const dialogRef = useRef();

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
        <el-dialog>
      <dialog id="modal" ref={dialogRef}  className="relative z-10 backdrop:bg-transparent">
        <el-dialog-backdrop className="fixed inset-0 hidden bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in md:block"></el-dialog-backdrop>
        <div tabIndex="0" className="fixed inset-0 z-10 w-screen overflow-y-auto focus:outline-none">
          <div className="flex min-h-full items-stretch justify-center text-center md:items-center md:px-2 lg:px-4">
            <el-dialog-panel className="flex w-full transform text-left text-base transition data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in md:my-8 md:max-w-2xl md:px-4 data-closed:md:translate-y-0 data-closed:md:scale-95 lg:max-w-2xl">
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
                <div className="grid w-full grid-cols-1 items-start gap-x-5 gap-y-8 sm:grid-cols-12 lg:gap-x-1 ">
                  <img src= {shoe_src} className="aspect-3/3 w-full rounded-lg bg-gray-100 object-cover sm:col-span-4 lg:col-span-4 "  />
                  <div className="sm:col-span-8 lg:col-span-7 ps-2">
                    <h2 className="text-lg font-bold text-gray-900 sm:pr-12">{shoe_name}</h2>
                    <section aria-labelledby="information-heading" className="mt-1">
                      <h3 id="information-heading" className="sr-only">Product information.</h3>
                      <p className="text-xl text-gray-900 mb-1">{shoe_price}</p>
                      <div className="mt-1">
                        <h4 className="sr-only">Reviews</h4>
                        <div className="flex items-center">
                          <div className="flex items-center">
                            <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" className="size-5 shrink-0 text-gray-900"><path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" fillRule="evenodd" /></svg>
                            <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" className="size-5 shrink-0 text-gray-900"><path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" fillRule="evenodd" /></svg>
                            <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" className="size-5 shrink-0 text-gray-900"><path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" fillRule="evenodd" /></svg>
                            <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" className="size-5 shrink-0 text-gray-900"><path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" fillRule="evenodd" /></svg>
                            <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" className="size-5 shrink-0 text-gray-200"><path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" fillRule="evenodd" /></svg>
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
                            <div className="text-lg font-medium text-slate-500">Shoe Size (IND) </div>
                            <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Size guide</a>
                          </div>
                          <div className="mt-2 grid grid-cols-5 gap-2 text-center pb-1">
                            <label aria-label="7_" className="group relative flex items-center justify-center rounded-md border border-gray-300 bg-white p-3 has-defaultChecked :border-indigo-600 has-defaultChecked :bg-indigo-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-indigo-600 has-disabled:border-gray-400 has-disabled:bg-gray-200 has-disabled:opacity-25">
                              <input type="radio" name="size" className="absolute inset-0 appearance-none focus:outline-none disabled:cursor-not-allowed" />
                              <span className="text-sm font-medium text-gray-900 uppercase group-has-defaultChecked :text-white">7</span>
                            </label>
                            <label aria-label="8_" className="group relative flex items-center justify-center rounded-md border border-gray-300 bg-white p-3 has-defaultChecked :border-indigo-600 has-defaultChecked :bg-indigo-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-indigo-600 has-disabled:border-gray-400 has-disabled:bg-gray-200 has-disabled:opacity-25">
                              <input type="radio" name="shoe_size" className="absolute inset-0 appearance-none focus:outline-none disabled:cursor-not-allowed" />
                              <span className="text-sm font-medium text-gray-900 uppercase group-has-defaultChecked :text-white">8</span>
                            </label>
                            <label aria-label="9_" className="group relative flex items-center justify-center rounded-md border border-gray-300 bg-white p-3 has-defaultChecked :border-indigo-600 has-defaultChecked :bg-indigo-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-indigo-600 has-disabled:border-gray-400 has-disabled:bg-gray-200 has-disabled:opacity-25">
                              <input type="radio" name="shoe_size" defaultChecked  className="absolute inset-0 appearance-none focus:outline-none disabled:cursor-not-allowed" />
                              <span className="text-sm font-medium text-gray-900 uppercase group-has-defaultChecked :text-white">9</span>
                            </label>
                            <label aria-label="10_" className="group relative flex items-center justify-center rounded-md border border-gray-300 bg-white p-3 has-defaultChecked :border-indigo-600 has-defaultChecked :bg-indigo-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-indigo-600 has-disabled:border-gray-400 has-disabled:bg-gray-200 has-disabled:opacity-25">
                              <input type="radio" name="shoe_size" className="absolute inset-0 appearance-none focus:outline-none disabled:cursor-not-allowed" />
                              <span className="text-sm font-medium text-gray-900 uppercase group-has-defaultChecked :text-white">10</span>
                            </label>
                            <label aria-label="11_" className="group relative flex items-center justify-center rounded-md border border-gray-300 bg-white p-3 has-defaultChecked :border-indigo-600 has-defaultChecked :bg-indigo-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-indigo-600 has-disabled:border-gray-400 has-disabled:bg-gray-200 has-disabled:opacity-25">
                              <input type="radio" name="shoe_size" className="absolute inset-0 appearance-none focus:outline-none disabled:cursor-not-allowed" />
                              <span className="text-sm font-medium text-gray-900 uppercase group-has-defaultChecked :text-white">11</span>
                            </label>
                          </div>
                        </fieldset>
                        <button type="submit" className="mt-6 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-black hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden mb-1">Add to Cart</button>
                        <button type="submit" className="mt-6 flex w-full items-center justify-center rounded-md border border-transparent px-2 py-2 text-base font-medium text-indigo-600 focus:outline-hidden">View Product
                            <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                            </svg>
                        </button>
                      </form>
                    </section>
                  </div>
                </div>
              </div>
            </el-dialog-panel>
          </div>
        </div>
      </dialog>
        </el-dialog>,
        document.body
    );
});

export {Shoe_Card}
export default Shoe_Modal