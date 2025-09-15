

const ImageTextSection = ({ imageUrl, altText, heading, textContent, isReversed }) => {
    // Tailwind's flex-row-reverse utility for alternating layout
    const directionClass = isReversed ? 'md:flex-row-reverse' : 'md:flex-row';

    return (
      <div className={`flex flex-col md:flex-row items-center justify-center  p-4 md:p-6 space-y-8 md:space-y-0 md:space-x-12 ${directionClass}`}>
        <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-2xl">
          <img src={imageUrl} alt={altText} className="w-full object-cover" />
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left p-10">
          <h2 className="text-3xl font-bold mb-4 tracking-wide text-white">{heading}</h2>
          <p className="text-gray-300 leading-relaxed text-lg">{textContent}</p>
        </div>
      </div>
    );
  };


function AboutUs() {
     const sections = [
    {
      imageUrl: "https://www.superkicks.in/cdn/shop/articles/banner_2_520x500_520x500_4a3de568-3ce1-4b3a-8873-3ff50aa707be.jpg?v=1736864176",
      altText: "Sneakers on a car",
      heading: "ABOUT URBONSOLE",
      textContent: "Born in 2018, Urbansole was built to make way for expression of streetwear culture and lifestyle in India. What started as a destination for sneakerheads quickly transformed into a movement which redefined lifestyle, fashion, music, and culture for a new generation. Over the years, Urbansole has grown to become India's premium lifestyle destination with stores across Mumbai, Delhi, Bengaluru, Hyderabad and Jaipur. We house a carefully curated collection of global and homegrown labels, bringing together style and substance.",
      isReversed: false,
    },
    {
      imageUrl: "https://www.superkicks.in/cdn/shop/articles/banner_520x500_520x500_05c6145c-cd2f-484d-9ad8-ab347fad5c66.jpg?v=1736864191",
      altText: "Person trying on shoes",
      heading: "OUR MISSION",
      textContent: "Urbansole Apparel, our own range of elevated daily clothing, creates fits which are minimal and made to move. Urbansole is also a launchpad for India’s creative underground. Our original content series Co-Sign provides a platform for emerging artists and cultural disruptors to showcase their music, art, and voice. At Urbansole, we prefer to stay behind the scenes as catalysts for a growing community of passionate new-age creators.",
      isReversed: true,
    },
    {
      imageUrl: "https://www.superkicks.in/cdn/shop/articles/Banner_Image_520x500_520x500_5afd8714-82f1-4287-a3a5-1a1bbbfdc48e.jpg?v=1736864107",
      altText: "Sneakers on a table",
      heading: "JOIN THE MOVEMENT",
      textContent: "Urbansole is more than just a store; it's a movement. We regularly host events, workshops, and pop-ups to bring our community together. Follow us on social media and subscribe to our newsletter to stay updated on the latest drops, events, and collaborations. Join the Urbansole family and be part of the culture that is shaping the future of Indian streetwear.",
      isReversed: false,
    },
  ];
  return (
    <div className="bg-black min-h-screen text-gray-100 font-sans p-4 sm:p-8">

      {/* Main content container for the sections */}
      <main className='my-10'>
        {sections.map((section, index) => (
          <ImageTextSection key={index} {...section} />
        ))}
      </main>

    </div>
  )
}

export default AboutUs