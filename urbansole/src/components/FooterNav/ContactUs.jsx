
import Footer from '../footer'
import Navbar from '../Navbar'

function ContactUs() {
  return (
    <>
    <Navbar/>
    <div className="flex flex-col items-center justify-center min-h-screen text-black p-8 my-7">
    <div className="w-full max-w-4xl bg-black rounded-2xl shadow-xl p-8 md:p-12">
      <h2 className="text-4xl font-extrabold text-center mb-8 tracking-wide bg-clip-text bg-gradient-to-r text-white">Contact</h2>
      
      {/* Online Inquiries Section */}
      <div className="mb-8 text-white">
        <h3 className="text-2xl font-bold mb-2 text-white">ONLINE ORDER INQUIRIES <span className="text-sm font-normal text-gray-400">(Mon-Sat, 11AM-6PM)</span></h3>
        <p className="text-gray-300 mb-2">Please Visit our <a href="#" className="text-gray-300 hover:text-yellow-500 font-semibold underline">Help Center</a> or reach us through below options:</p>
        <p className="text-lg font-mono">Customer care mail id - care@urbansole.in</p>
        <p className="text-lg font-mono">Customer Care number - 02241498322</p>
      </div>

      {/* Find Us Section */}
      <div>
        <h3 className="text-2xl font-bold mb-4 text-white">Find Us:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Mumbai Location */}
          <div className="border rounded-xl p-6 shadow-md">
            <h4 className="text-xl font-semibold mb-2 text-yellow-400">Mumbai</h4>
            <p className="text-gray-300">Ground Floor, Yashwant Smruti Building, 12th Road, Khar West, Off-Linking Road, Near Madhu Park, Mumbai-400052</p>
            <p className="text-gray-300 mt-2 font-mono">+91 8097811422</p>
            <p className="text-gray-400 mt-2">Monday - Sunday</p>
            <p className="text-gray-400">11 AM - 8 PM</p>
          </div>
          {/* Bengaluru Location */}
          <div className="rounded-xl p-6 shadow-md">
            <h4 className="text-xl font-semibold mb-2 text-yellow-400">Bengaluru</h4>
            <p className="text-gray-300">No. 1079, Ground Floor, 12th Main Rd, HAL 2nd Stage, Appareddipalya, Indiranagar, Bengaluru, Karnataka 560038</p>
            <p className="text-gray-300 mt-2 font-mono">+91 9987843520</p>
            <p className="text-gray-400 mt-2">Monday - Sunday</p>
            <p className="text-gray-400">11 AM - 8 PM</p>
          </div>
          {/* Delhi Location */}
          <div className=" rounded-xl p-6 shadow-md">
            <h4 className="text-xl font-semibold mb-2 text-yellow-400">Delhi</h4>
            <p className="text-gray-300">39, Ground & Basement, Munika Marg, Vasant Vihar, New Delhi 110057</p>
            <p className="text-gray-300 mt-2 font-mono">+91 9987393520</p>
            <p className="text-gray-400 mt-2">Monday - Sunday</p>
            <p className="text-gray-400">11 AM - 8 PM</p>
          </div>
          {/* Hyderabad Location */}
          <div className="border rounded-xl p-6 shadow-md">
            <h4 className="text-xl font-semibold mb-2 text-yellow-400">Hyderabad</h4>
            <p className="text-gray-300">8-2-589/3, Road No. 8, Banjara Hills, Hyderabad, Telangana 500034</p>
            <p className="text-gray-300 mt-2 font-mono">+91 9987363520</p>
            <p className="text-gray-400 mt-2">Monday - Sunday</p>
            <p className="text-gray-400">11 AM - 8 PM</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer/>
  </>
    
  )
}

export default ContactUs