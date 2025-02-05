import { FiSearch, FiMapPin, FiCpu, FiShield, FiStar, FiMessageSquare } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import Footer from "./footer";

const features = [
    { title: "AI-Powered Recommendations", description: "Our advanced AI suggests the best doctors based on your needs.", icon: FiCpu },
    { title: "Verified Doctors", description: "We ensure all listed doctors are verified professionals.", icon: FiShield },
    { title: "Doctor Reviews & Ratings", description: "See reviews and ratings from other patients.", icon: FiStar },
    { title: "Quick Chat Support", description: "Have questions? Our chatbot is here to assist you anytime.", icon: FiMessageSquare },
];
const specializations = [
    { name: "Primary Care", icon: "https://img.icons8.com/ios-filled/100/0A2647/stethoscope.png" },
    { name: "Dentist", icon: "https://img.icons8.com/ios-filled/100/0A2647/tooth.png" },
    { name: "OB-GYN", icon: "https://img.icons8.com/ios-filled/100/0A2647/pregnant.png" },
    { name: "Dermatologist", icon: "https://img.icons8.com/ios-filled/100/0A2647/skin.png" },
    { name: "Psychiatrist", icon: "https://img.icons8.com/ios-filled/100/0A2647/brain.png" },
    { name: "Eye Doctor", icon: "https://img.icons8.com/ios-filled/100/0A2647/glasses.png" },
];

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            {/* <div className="bg-gradient-to-b"
                style={{
                    background: 'linear-gradient(180deg, rgba(36,52,71,1) 0%, rgba(63,95,128,1) 22%, rgba(118,155,170,1) 50%, rgba(41,91,134,1) 100%)',
                }}
            > */}
            <div className="bg-gradient-to-b from-navy via-navy/50 to-slate-700">
                <nav className="container mx-auto px-4 py-4">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="text-2xl text-white font-bold flex items-center gap-1">
                                <NavLink to="/"><span>DocConnect</span></NavLink>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center justify-center space-x-8 text-white">
                            <a href="/" className="hover:text-blue-300">Home</a>
                            <a href="/browse" className="hover:text-blue-300">Browse</a>
                            <a href="/about" className="hover:text-blue-300">About us</a>
                            <a href="/doctorsignup" className="hover:text-blue-300">List your Practice</a>
                        </div>
                        <div className="flex items-center gap-2">
                            <NavLink to="/login">
                                <button className="px-4 py-2 text-white border border-white rounded-full hover:bg-white hover:text-navy transition">
                                    Sign In
                                </button>
                            </NavLink>
                            <NavLink to="/signup">
                                <button className="px-4 py-2 bg-white text-navy rounded-full border border-white hover:bg-navy/100 hover:text-white transition">
                                    Register
                                </button>
                            </NavLink>
                        </div>
                    </div>
                </nav>

                <main className="container mx-auto px-4 pt-20 pb-32">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-3xl font-bold text-white mb-12">Find the right Doctor for You</h1>
                        <div className="bg-white p-2 rounded-full flex items-center gap-2 max-w-2xl mx-auto">
                            <div className="flex-1 flex items-center gap-2 px-4">
                                <FiSearch className="w-5 h-5 text-gray-400" />
                                <input type="text" placeholder="Search Specialist or Hospital" className="w-full border-0 focus:outline-none" />
                            </div>
                            <div className="h-6 w-px bg-gray-200" />
                            <div className="flex-1 flex items-center gap-2 px-4">
                                <FiMapPin className="w-5 h-5 text-gray-400" />
                                <input type="text" placeholder="Near you or Enter City" className="w-full border-0 focus:outline-none" />
                            </div>
                            <button className="px-4 py-2 bg-navy text-white rounded-full border border-navy hover:bg-white hover:text-navy transition">
                                Find
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Why Choose Us Section */}
            <section className="container mx-auto px-4 py-16 font-sans">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <span className="text-navy font-semibold">Why Choose Us</span>
                        <h2 className="text-4xl font-bold text-black">We Made Health Care Easy for your Family</h2>
                        <p className="text-gray-800 text-justify leading-relaxed">
                            Our system simplifies healthcare for your family by providing easy access to trusted doctors, tailored to
                            your specific needs. With our user-friendly platform, you can effortlessly search for doctors based on
                            specialization, symptoms, or location. Whether it's a routine check-up or a specialized consultation, you
                            can find the right doctor in no time. Our AI-powered search ensures accurate results, while features like
                            doctor profiles, patient reviews, and ratings help you make informed decisions. The system also allows you
                            to schedule appointments conveniently, all from the comfort of your home.
                        </p>
                        <div className="flex items-center gap-4">
                            <NavLink to="/about">
                                <button className="px-6 py-3 bg-navy text-white rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium">
                                    Learn More
                                </button>
                            </NavLink>
                        </div>
                    </div>
                    <div className="relative">
                        <img
                            src="https://png.pngtree.com/png-clipart/20230918/ourmid/pngtree-photo-men-doctor-physician-chest-smiling-png-image_10132895.png"
                            alt="Healthcare professionals reviewing medical information"
                            className="relative z-10 w-full h-auto"
                        />
                    </div>
                </div>
            </section>

            {/* Popular Specializations Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="max-w-6xl mx-auto text-center space-y-6">
                    <h2 className="text-4xl font-bold text-[#161617]">Our Specialty</h2>
                    <p className="text-gray-600 text-lg">We provide the world class services with the best medical team!</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {specializations.map((specialization) => (
                          <div
                          key={specialization.name}
                          className="group relative p-8 rounded-2xl bg-white 
                            hover:bg-gradient-to-b hover:from-[#8aa1c6] hover:to-[#0A2647] transition-all duration-300
                            shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-transparent to-transparent group-hover:opacity-0 transition-opacity duration-300" />
                        
                          <div className="relative space-y-4 flex flex-col items-center">
                            {/* Icon Container */}
                            <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
                              <img
                                src={specialization.icon || "/placeholder.svg"}
                                alt={`${specialization.name} icon`}
                                className="w-6 h-6 group-hover:filter group-hover:brightness-0 group-hover:invert group-hover:contrast-200 transition-all duration-300"
                              />
                            </div>
                        
                            {/* Title */}
                            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white text-center">
                              {specialization.name}
                            </h3>
                        
                            {/* Description */}
                            <p className="text-gray-600 text-sm text-center group-hover:text-white/90">
                              {specialization.description}
                            </p>
                          </div>
                        </div>
                        
                          

                        ))}
                    </div>
                </div>
            </section>

            {/* Key Features Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-bold text-[#161617]">Key Features</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Experience healthcare reimagined with our innovative features designed to make your medical journey
                            seamless.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group relative p-8 rounded-2xl bg-gradient-to-b from-white to-white 
                hover:from-[#8aa1c6] hover:to-[#0A2647] transition-all duration-300
                shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                <div
                                    className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${feature.color} 
                group-hover:opacity-0 transition-opacity duration-300`}
                                />

                                <div className="relative space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
                                        <feature.icon className="w-6 h-6 text-[#3b82f6] group-hover:text-white transition-colors duration-300" />
                                    </div>

                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white">{feature.title}</h3>

                                    <p className="text-gray-600 group-hover:text-white/90">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />

        </div>
    );
}