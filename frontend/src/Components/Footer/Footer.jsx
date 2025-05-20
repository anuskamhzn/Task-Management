
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaGoogle, FaTwitter, FaLinkedinIn, FaGithub } from "react-icons/fa";

import PropTypes from "prop-types";

function TestimonialCard({ quote, author, role, image }) {
  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <img src={image || "/placeholder.svg"} alt={author} className="w-16 h-16 rounded-full mb-6" />
      <p className="text-lg text-gray-600 text-center mb-6 leading-relaxed">"{quote}"</p>
      <div className="text-center">
        <div className="font-semibold text-gray-900">{author}</div>
        <div className="text-sm text-gray-500">{role}</div>
      </div>
    </div>
  );
}

TestimonialCard.propTypes = {
  quote: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  image: PropTypes.string,
};

export default function TestimonialsAndFooter() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if token exists in localStorage
  useEffect(() => {
    const storedData = localStorage.getItem("auth");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (parsedData.token) {
        setIsLoggedIn(true);
      }
    }
  }, []);

  // Handle sign-out logic
  const handleSignOutClick = () => {
    localStorage.removeItem("auth");
    setIsLoggedIn(false);
    navigate("/"); // Redirect to the homepage or any desired page
  };

  const testimonials = [
    {
      quote:
        "TaskiFY revolutionized the way I manage my tasks. I am now more productive and organized than ever before!",
      author: "John Doe",
      role: "Project Manager",
      image: "https://st4.depositphotos.com/5934840/23454/v/380/depositphotos_234542254-stock-illustration-man-profile-smiling-cartoon-vector.jpg",
    },
    {
      quote:
        "This tool is a lifesaver for teams. We’ve been able to improve our workflows and meet deadlines consistently.",
      author: "Jane Smith",
      role: "Team Lead",
      image: "https://i.pinimg.com/1200x/60/31/25/6031253da1d85e65d4e3d1ba0cff44b4.jpg",
    },
  ];

  const socialLinks = [
    { icon: FaFacebookF, href: "#" },
    { icon: FaTwitter, href: "#" },
    { icon: FaGoogle, href: "#" },
    { icon: FaLinkedinIn, href: "#" },
    { icon: FaGithub, href: "#" },
  ];

  const footerLinks = [
    { text: "About", href: "#" },
    { text: "Features", href: "#" },
    { text: "Blog", href: "#" },
    { text: "Pricing", href: "#" },
    { text: "Partners", href: "#" },
    { text: "Help", href: "#" },
    { text: "Terms", href: "#" },
  ];

  return (
    <>
      {/* Testimonials Section */}
      {/* <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Customer Testimonials</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Read what others are saying about our product. Our happy customers share their experiences using TaskiFY.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center">
            <div className="flex gap-6 mb-8">
              {socialLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <a
                    key={index}
                    href={link.href}
                    className="text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8">
              {footerLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  {link.text}
                </a>
              ))}
            </nav>
            <div className="text-center text-sm text-gray-600">
              <p>&copy; 2025 TaskiFY. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
