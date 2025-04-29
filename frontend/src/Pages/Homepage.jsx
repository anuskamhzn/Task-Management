import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import TestimonialsAndFooter from '../Components/Footer/Footer';
import FeaturesSection from '../Components/Homepage/Features';
import { motion } from "framer-motion"
import { FaArrowRight } from "react-icons/fa"

import aboutImage from '../img/about.jpg';
import homeImg from '../img/home.png';

const Homepage = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [auth, setAuth] = useAuth();

    // Check if token exists in localStorage
    useEffect(() => {
        const storedData = localStorage.getItem('auth');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData.token && parsedData.user) {
                setIsLoggedIn(true);
                setAuth(parsedData); // This sets auth.user.role
            }
        }
    }, []);


    // Handle navigation to the register page
    const handleSignUpClick = () => {
        navigate('/register');
    };
    // Handle sign out logic
    const handleSignOutClick = () => {
        // Clear localStorage and update the auth state
        localStorage.removeItem('auth');
        setIsLoggedIn(false);
        navigate('/'); // Redirect to homepage or any page you'd like
    };

    return (
        <div className="font-sans">
            {/* Navbar */}
            <nav className="flex justify-between items-center p-6 bg-white border-b">
                <NavLink to="/" className="text-2xl font-bold text-purple-600">
                    TaskiFY
                </NavLink>
                <ul className="flex space-x-6">
                    <li>
                        <NavLink to="/" className="text-gray-600 hover:text-purple-600 transition-colors">
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <a href="#about" className="text-gray-600 hover:text-purple-600 transition-colors">
                            About
                        </a>
                    </li>
                    <li>
                        <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
                            Features
                        </a>
                    </li>
                    {isLoggedIn && auth?.user?.role && (
                        <li>
                            <a
                                href={auth.user.role === 'Admin' ? '/dashboard/admin' : '/dashboard/user'}
                                className="text-gray-600 hover:text-purple-600 transition-colors"
                            >
                                Dashboard
                            </a>
                        </li>
                    )}
                </ul>
                <div>
                    {isLoggedIn ? (
                        <button
                            onClick={handleSignOutClick}
                            className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <NavLink
                            to="/login"
                            className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Login
                        </NavLink>
                    )}
                </div>
            </nav>


            {/* Main Content */}
            <main className="container mx-auto px-6 py-16">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                    {/* Left Content */}
                    <div className="flex-1 text-left max-w-2xl pl-8">
                        {/* <div className="inline-block px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-medium mb-6">
              TRENDIEST TAILWIND TEMPLATES
            </div> */}
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                            Organize Your Tasks, Simplify Your Life
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            TaskiFY helps you stay on top of your work and achieve more, effortlessly.
                            Whether you're managing personal projects or collaborating with a team, TaskiFY is your go-to tool for organization and productivity.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => navigate("/register")}
                                className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                            >
                                Get Started Now
                            </button>
                        </div>
                    </div>

                    {/* Right Content - Image */}
                    <div className="flex-1 relative">
                        <div className="relative z-10">
                            <img
                                src={homeImg}
                                alt="Dashboard Preview"
                                className="w-full h-auto rounded-lg shadow-2xl"
                            />
                        </div>
                        {/* Background Decorative Elements */}
                        <div className="absolute -top-4 -right-4 w-full h-full bg-purple-100 rounded-lg -z-10"></div>
                        <div className="absolute -bottom-4 -left-4 w-full h-full bg-blue-100 rounded-lg -z-20"></div>
                    </div>
                </div>
            </main>


            {/* About Section */}
            <section id="about" className="relative py-24 overflow-hidden">
                {/* Background with gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-30 to-gray-60" />

                <div className="relative max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl font-bold text-gray-900 mb-4"
                        >
                            About TaskiFY
                        </motion.h2>
                        <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-center gap-16">
                        {/* Left Column: Image with Animation */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            className="lg:w-3/5 relative"
                        >
                            <div className="relative">
                                {/* Decorative elements */}
                                <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full -z-10" />
                                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/5 rounded-full -z-10" />

                                {/* Main image */}
                                <img
                                    src={aboutImage}
                                    className="w-full rounded-2xl shadow-2xl"
                                />
                            </div>
                        </motion.div>

                        {/* Right Column: Content */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            className="lg:w-2/5 space-y-6"
                        >
                            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Streamline Your Workflow</h3>

                            <div className="space-y-6">
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    TaskiFY is a powerful task management tool that helps individuals and teams stay organized and
                                    productive. Whether you're managing personal tasks or collaborating with your team, TaskiFY is designed
                                    to streamline your workflow and keep you on track.
                                </p>

                                <div className="pl-4 border-l-4 border-primary">
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        With an intuitive and easy-to-use interface, TaskiFY allows you to track tasks, set deadlines, assign
                                        responsibilities, and collaborate with your team—all in one place.
                                    </p>
                                </div>

                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Take control of your productivity, streamline your processes, and stay organized effortlessly with
                                    TaskiFY.
                                </p>
                            </div>

                            {/* CTA Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-8 px-8 py-4 bg-primary text-white rounded-full font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
                            >
                                Get Started
                                <FaArrowRight className="w-4 h-4" />
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className=" bg-gray-100 py-3">
                <FeaturesSection />
            </section>
            <TestimonialsAndFooter />

        </div>
    );
}

export default Homepage;