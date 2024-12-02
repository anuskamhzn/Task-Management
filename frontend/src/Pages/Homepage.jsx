import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';

const Homepage = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if token exists in localStorage
    useEffect(() => {
        const storedData = localStorage.getItem('auth');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData.token) {
                setIsLoggedIn(true);
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
            <nav className="flex justify-between items-center p-6 bg-blue-700 text-white">
                <div className="text-2xl font-bold">TaskiFY</div>
                <ul className="flex space-x-6">
                    <li>
                        <NavLink to="/" className="hover:text-blue-200">
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <a href="#about" className="hover:text-blue-200">
                            About
                        </a>
                    </li>
                    <li>
                        <a href="#features" className="hover:text-blue-200">
                            Features
                        </a>
                    </li>
                    {/* Conditionally render the Dashboard link based on login status */}
                    {isLoggedIn && (
                        <li>
                            <a href="/dashboard" className="hover:text-blue-200">
                                Dashboard
                            </a>
                        </li>
                    )}
                </ul>
                <div>
                    {/* Conditionally render the button based on login status */}
                    {isLoggedIn ? (
                        <button
                            onClick={handleSignOutClick}
                            className="px-4 py-2 bg-white text-blue-600 font-bold rounded-md hover:bg-gray-100"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <NavLink
                            to="/login"
                            className="px-4 py-2 bg-white text-blue-600 font-bold rounded-md hover:bg-gray-100"
                        >
                            Login
                        </NavLink>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <div className="text-center">
                {/* Hero Section */}
                <div className="relative w-full h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://miro.com/blog/wp-content/uploads/2017/06/kanban-illustration.png')" }}>
                    <div className="absolute inset-0 bg-black opacity-50"></div> {/* Dark overlay for text contrast */}

                    <div className="relative z-10 flex items-center justify-center h-full text-center text-white px-6">
                        <div>
                            <h1 className="text-5xl font-bold mb-4">Organize Your Tasks, Simplify Your Life</h1>
                            <p className="text-lg mb-6">
                                TaskiFY helps you stay on top of your work and achieve more, effortlessly.
                            </p>
                            {/* Only show "Get Started" button if the user is not logged in */}
                            {!isLoggedIn && (
                                <button
                                    onClick={() => navigate('/register')}
                                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
                                >
                                    Get Started
                                </button>
                            )}
                        </div>
                    </div>
                </div>


                {/* About Section */}
                <section id="about" className="mt-16 bg-white py-12">
                    <div className="max-w-6xl mx-auto px-4">
                        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                            About TaskiFY
                        </h2>
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
                            {/* Left Column: Image */}
                            <div className="lg:w-3/4">
                                <img
                                    src="https://media.geeksforgeeks.org/wp-content/uploads/20240427182308/How-to-Manage-Tasks.webp"
                                    alt="TaskiFY Interface"
                                    className="w-full rounded-lg shadow-lg"
                                />
                            </div>

                            {/* Right Column: Text */}
                            <div className="lg:w-1/2 text-center lg:text-left">
                                <p className="text-lg text-gray-600 mb-4">
                                    TaskiFY is a powerful task management tool that helps individuals and teams stay organized and productive. Whether you're managing personal tasks or collaborating with your team, TaskiFY is designed to streamline your workflow and keep you on track.
                                </p>
                                <p className="text-lg text-gray-600 mb-6">
                                    With an intuitive and easy-to-use interface, TaskiFY allows you to track tasks, set deadlines, assign responsibilities, and collaborate with your team—all in one place. Its flexibility ensures that it works for all kinds of projects, from small tasks to large-scale team initiatives.
                                </p>


                                <p className="text-lg text-gray-600 mb-6">
                                    With TaskiFY, managing your daily tasks has never been easier. Take control of your productivity, streamline your processes, and stay organized effortlessly.
                                </p>

                                {/* Call to Action Button */}
                                <div className="text-center lg:text-left">
                                    <button
                                        onClick={() => window.scrollTo(0, document.body.scrollHeight)}
                                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
                                    >
                                        Start Organizing Today
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Features Section */}
                <section id="features" className="mt-16 bg-gray-100 py-12">
                    <div className="max-w-6xl mx-auto px-4">
                        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
                            Key Features of TaskiFY
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {/* Feature 1: Task Prioritization */}
                            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                                <div className="mb-4">
                                    <img
                                        src="https://via.placeholder.com/60?text=Prioritize"
                                        alt="Task Prioritization Icon"
                                        className="w-16 h-16 mx-auto mb-4"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Task Prioritization</h3>
                                <p className="text-gray-600">
                                    Easily organize and prioritize your tasks with customizable tags, due dates, and priority levels. Stay focused on what matters most.
                                </p>
                            </div>

                            {/* Feature 2: Collaborative Work */}
                            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                                <div className="mb-4">
                                    <img
                                        src="https://via.placeholder.com/60?text=Teamwork"
                                        alt="Collaborative Work Icon"
                                        className="w-16 h-16 mx-auto mb-4"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Collaborative Work</h3>
                                <p className="text-gray-600">
                                    Collaborate with your team in real-time. Share tasks, deadlines, and updates instantly to keep everyone on the same page.
                                </p>
                            </div>

                            {/* Feature 3: Progress Tracking */}
                            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                                <div className="mb-4">
                                    <img
                                        src="https://via.placeholder.com/60?text=Progress"
                                        alt="Progress Tracking Icon"
                                        className="w-16 h-16 mx-auto mb-4"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Progress Tracking</h3>
                                <p className="text-gray-600">
                                    Track your progress with visual charts, graphs, and reports. Get insights into your productivity and stay motivated.
                                </p>
                            </div>

                            {/* Feature 4: Task Reminders */}
                            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                                <div className="mb-4">
                                    <img
                                        src="https://via.placeholder.com/60?text=Reminder"
                                        alt="Task Reminder Icon"
                                        className="w-16 h-16 mx-auto mb-4"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Task Reminders</h3>
                                <p className="text-gray-600">
                                    Never miss a deadline again. Set personalized reminders for tasks and receive notifications to stay on top of your schedule.
                                </p>
                            </div>

                            {/* Feature 5: Customizable Dashboards */}
                            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                                <div className="mb-4">
                                    <img
                                        src="https://via.placeholder.com/60?text=Dashboard"
                                        alt="Customizable Dashboard Icon"
                                        className="w-16 h-16 mx-auto mb-4"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Customizable Dashboards</h3>
                                <p className="text-gray-600">
                                    Tailor your workspace with customizable dashboards. Choose the features and data you want to see at a glance.
                                </p>
                            </div>

                            {/* Feature 6: Mobile App */}
                            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                                <div className="mb-4">
                                    <img
                                        src="https://via.placeholder.com/60?text=Mobile"
                                        alt="Mobile App Icon"
                                        className="w-16 h-16 mx-auto mb-4"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Mobile App</h3>
                                <p className="text-gray-600">
                                    Stay productive on the go. Access your tasks and collaborate with your team anytime, anywhere using our mobile app.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Testimonials Section */}
                <section className="mt-16 py-12 bg-blue-50">
                    <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">What Our Users Say</h2>
                    <div className="flex justify-center gap-12">
                        <div className="w-96 bg-white shadow-lg rounded-lg p-6">
                            <p className="text-lg text-gray-600 mb-4">
                                "TaskiFY has revolutionized the way we work. It keeps our team aligned and focused."
                            </p>
                            <div className="text-gray-800 font-semibold">John Doe</div>
                            <div className="text-sm text-gray-500">Product Manager</div>
                        </div>
                        <div className="w-96 bg-white shadow-lg rounded-lg p-6">
                            <p className="text-lg text-gray-600 mb-4">
                                "A simple but powerful tool. My productivity has improved drastically!"
                            </p>
                            <div className="text-gray-800 font-semibold">Jane Smith</div>
                            <div className="text-sm text-gray-500">Freelancer</div>
                        </div>
                    </div>
                </section>

                {/* Call to Action (CTA) */}
                <section className="mt-16 py-12 bg-blue-800 text-white text-center border-b border-white">
                    <h2 className="text-3xl font-semibold mb-4">Get Started with TaskiFY Today</h2>
                    <p className="text-lg mb-6">Sign up now to begin organizing your tasks and collaborating with your team.</p>
                    {!isLoggedIn && (
                        <button
                            onClick={handleSignUpClick}
                            className="px-6 py-3 bg-white text-blue-600 font-bold rounded-md hover:bg-gray-100"
                        >
                            Sign Up Now
                        </button>
                    )}
                </section>
            </div>

            {/* Footer */}
            <footer className="bg-blue-800 text-white text-center py-4">
                <p>&copy; 2024 TaskiFY. All Rights Reserved.</p>
                <p className="text-sm">
                    <NavLink to="/privacy" className="hover:text-blue-300">Privacy Policy</NavLink> |
                    <NavLink to="/terms" className="hover:text-blue-300"> Terms of Service</NavLink>
                </p>
            </footer>
        </div>
    );
}

export default Homepage;
