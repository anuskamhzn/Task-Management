export default function Footer() {
    return (
      <footer className="bg-[#0A2647] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">DocConnect</h2>
              <p className="text-sm text-gray-300">The ultimate destination for all of your medical needs</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center">
                    <i className="fab fa-facebook-f"></i>
                  </div>
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center">
                    <i className="fab fa-twitter"></i>
                  </div>
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center">
                    <i className="fab fa-instagram"></i>
                  </div>
                </a>
              </div>
            </div>
  
            {/* Explore Column */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Explore</h3>
              <ul className="space-y-2">
                {["Home", "Surgery", "OPD", "Speciality", "Consultation"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
  
            {/* About Us Column */}
            <div>
              <h3 className="text-lg font-semibold mb-4">About Us</h3>
              <ul className="space-y-2">
                {["Who we are", "Our Vision", "Our Team", "Terms & Conditions", "FAQs"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
  
            {/* Contact Column */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-300">
                <li>+91234512345</li>
                <li>info@docconnectt.com</li>
              </ul>
            </div>
          </div>
        </div>
  
        {/* Copyright Section */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 py-4">
            <p className="text-center text-sm text-gray-400">Copyright 2024 DocConnect, All Rights Reserved</p>
          </div>
        </div>
      </footer>
    )
  }
  