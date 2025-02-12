import React, { useRef, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import Footer from './footer';
import ReviewModal from './review';


const Profile = () => {
    const [activeTab, setActiveTab] = useState("SUMMARY");
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    // Create references for sections
    const summaryRef = useRef(null);
    const reviewsRef = useRef(null);
    const locationRef = useRef(null);
    const navRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (navRef.current) {
                const offsetTop = navRef.current.offsetTop;
                if (window.scrollY > offsetTop) {
                    navRef.current.classList.add("sticky-nav");
                } else {
                    navRef.current.classList.remove("sticky-nav");
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        let targetRef;
        switch (tab) {
            case "SUMMARY":
                targetRef = summaryRef;
                break;
            case "PATIENT REVIEWS":
                targetRef = reviewsRef;
                break;
            case "LOCATIONS":
                targetRef = locationRef;
                break;
            default:
                return;
        }
        targetRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    // Track the sticky navigation state
    const [isSticky, setIsSticky] = useState(false);

    // Check when the navigation element is in the viewport
    useEffect(() => {
        const handleScroll = () => {
            if (navRef.current) {
                const offsetTop = navRef.current.offsetTop;
                setIsSticky(window.scrollY > offsetTop); // Set sticky state based on scroll position
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleReviewClick = () => {
        setIsReviewOpen(true); // Open the modal when the button is clicked
    };

    const handleCloseReviewModal = () => {
        setIsReviewOpen(false); // Close the modal
    };

    const doctor = {
        name: "Dr. Arun Sharma, MD",
        specialization: "Adolescent Medicine, Pediatrics",
        practiceName: "Kids Care Pediatric Associates",
        streetAddress: "Baluwatar",
        city: "Kathmandu",
        state: "Nepal",
        //zipCode: "11563",
        phone: "Edit Profile",
        status: "Open Now",
        rating: 4,
        reviewsCount: 11,
        description: `Dr. Arun Sharma, M.D., F.A.A.P. is a graduate of the State University of New York at Downstate Medical Center. 
          He completed his internship and residency at the Schneider Children's Hospital of the Long Island Jewish Medical Center. 
          Dr. Feinstein has been in pediatric practice since 1986 at this present location. He is a member of the Academy of Pediatrics, 
          the Nassau Pediatric Society, the Nassau County Medical Society, and the New York State Medical Society. 
          Dr. Feinstein is a Diplomate of the American Board of Bariatric Physicians, specializing in weight loss management.`,
        acceptingPatients: true,
        website: "#",
        email: "Arunsharma@gmail.com",
        phone: "Edit Profile",
        imageUrl: "https://hips.hearstapps.com/hmg-prod/images/portrait-of-a-happy-young-doctor-in-his-clinic-royalty-free-image-1661432441.jpg",
        quickFacts: {
            experience: "8 Years Of Experience",
            // languages: ["English", "Spanish"],
            // comments: 3,
            expertise: 7,
            hospitalAffiliations: 1,
            medicalCenter: "LI Jewish Medical Center",
            specialties: 2,
            // boardCertifications: 2,
            locations: 1,
        },
        patientPerspective: {
            onTime: true,
            bedsideManner: true,
        },
        patientPerspective: {
            onTime: true,
            bedsideManner: true,
        },
        reviews: {
            overall: 4,
            totalRatings: 11,
            //totalComments: 3,
            //waitTime: "11 minutes",
            reviewList: [
                {
                    date: "July 26th, 2015",
                    rating: 5,
                    comment: "Excellent and caring doctor! They don't get any better than him.",
                },
                {
                    date: "May 8th, 2012",
                    rating: 5,
                    comment:
                        "i recommend anyone to this office. i love everyone, becing that i was a patient since 10yrs old now 26 with two children of my own. they go to him. i however do not like the new female doctor there like really. she doesn't really have bed side manners, and always seem in a rush. and if something was wrong with ur insurance she will not see you. No sympathy. i had insurance the card just wasn't sent yet. However Dr. Feinstein saw me and...",
                },
            ],
        },
    }


    return (
        <div className="bg-gray-100 min-h-screen flex flex-col ">
            {/* Navbar */}
            <nav className="bg-navy text-white p-4 shadow-md w-full">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Logo */}
                    <NavLink to="/">
                        <div className="text-lg font-bold">DocConnect</div>
                    </NavLink>

                    {/* Centered Navbar Items */}
                    <ul className="flex space-x-6">
                        <li><a href="/" className="hover:underline">Home</a></li>
                        <li><a href="/browse" className="hover:underline">Browse</a></li>
                        <li><a href="/about" className="hover:underline">About Us</a></li>
                    </ul>

                    {/* Right Side: Notification Icon, User Image, and Name */}
                    <div className="flex items-center space-x-4">
                        {/* Notification Icon */}
                        <div className="relative cursor-pointer">
                            <FaBell size={24} />
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center space-x-2 cursor-pointer">
                            <img
                                src="https://randomuser.me/api/portraits/men/75.jpg"
                                alt="User"
                                className="w-8 h-8 rounded-full"
                            />
                            <span className="text-sm font-medium">Dr. Arun Sharma</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Doctor Profile Section */}
            <main className="container mx-auto px-4 py-8">
                <div className="overflow-hidden rounded-lg bg-white shadow-md">
                    <div className="border-b bg-navye-50 p-6">
                        <div className="flex flex-col items-start gap-6 md:flex-row">
                            <img
                                src={doctor.imageUrl || "/placeholder.svg"}
                                alt="Doctor profile"
                                className="h-48 w-48 rounded-lg border-4 border-white object-cover shadow-lg"
                            />
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-navy">{doctor.name}</h1>
                                <p className="mt-2 text-lg text-gray-600">{doctor.specialization}</p>
                                <p className="mt-1 text-gray-500">{doctor.city}, {doctor.state}</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`text-2xl ${i < doctor.rating ? "text-yellow-400" : "text-gray-300"}`}>
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500">({doctor.reviewsCount} reviews)</span>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-4">
                                    {doctor.status === "Open Now" && (
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                                            ● Open Now
                                        </span>
                                    )}
                                    {doctor.acceptingPatients && (
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                            ✓ Accepting New Patients
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">

                                <button className="rounded-md border border-navy px-6 py-3 text-lg font-semibold text-navy hover:bg-navy hover:text-white">
                                    {doctor.phone}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6 p-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">About</h2>
                            <p className="mt-2 text-gray-600 leading-relaxed">{doctor.description}</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
                            <div className="mt-2 space-y-2">
                                <p className="text-gray-600">
                                    Email:{" "}
                                    <a href={`mailto:${doctor.email}`} className="text-navy hover:underline">
                                        {doctor.email}
                                    </a>
                                </p>
                                <p className="text-gray-600">
                                    Website:{" "}
                                    <a href={doctor.website} className="text-navy hover:underline">
                                        Visit Website
                                    </a>
                                </p>
                            </div>
                        </div>
                        {/* <div className="rounded-lg bg-purple-50 p-4 text-center">
                            <p className="text-navy">
                                We would love to make a difference for you.{" "}
                            </p>
                        </div> */}

                        {/* Navigation Tabs */}
                        <div className="border-b">
                            <div
                                ref={navRef}
                                className={`bg-white shadow-md ${isSticky ? "fixed top-0 left-0 w-full z-50" : ""}`}
                            >
                                <div className="flex space-x-8 px-6">
                                    {["SUMMARY",  "LOCATIONS"].map((tab, index) => (
                                        <button
                                            key={tab}
                                            onClick={() => handleTabClick(tab)}
                                            className={`border-b-2 px-1 py-4 text-sm font-medium ${activeTab === tab
                                                ? "border-blue-500 text-blue-500"
                                                : "border-transparent text-gray-500 hover:text-gray-700"
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8 p-6">
                            {/* Quick Facts Section */}
                            <div ref={summaryRef}>
                                <h2 className="text-2xl font-semibold text-navy">Quick Facts</h2>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-navy-600">📅</span>
                                        <span>{doctor.quickFacts.experience}</span>
                                    </div>
                                    {/* <div className="flex items-center gap-3">
                                        <span className="text-navy">🗣️</span>
                                        <span>Speaks {doctor.quickFacts.languages.join(", ")}</span>
                                    </div> */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-navy">💼</span>
                                        <span>{doctor.quickFacts.expertise} Areas Of Expertise</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-navy">🏥</span>
                                        <span>{doctor.quickFacts.hospitalAffiliations} Hospital Affiliation</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-navy">🏫</span>
                                        <span>{doctor.quickFacts.medicalCenter}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-navy">👨‍⚕️</span>
                                        <span>{doctor.quickFacts.specialties} Specialties</span>
                                    </div>
                                    {/* <div className="flex items-center gap-3">
                                        <span className="text-navy">📜</span>
                                        <span>{doctor.quickFacts.boardCertifications} Board Certifications</span>
                                    </div> */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-navy">📍</span>
                                        <span>{doctor.quickFacts.locations} Location</span>
                                    </div>
                                </div>
                            </div>
                            {/* Patients' Perspective Section */}
                            <div>
                                <h2 className="text-2xl font-semibold text-navy">Patients' Perspective</h2>
                                <div className="mt-4 space-y-3">
                                    {doctor.patientPerspective.onTime && (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <span>✓</span>
                                            <span>On-time consultations</span>
                                        </div>
                                    )}
                                    {doctor.patientPerspective.bedsideManner && (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <span>✓</span>
                                            <span>Good bedside manner</span>
                                        </div>
                                    )}
                                    <p className="mt-4 text-sm text-gray-600">
                                        Based on patient feedback.{" "}
                                        <a href="#" className="text-navy hover:underline">
                                            Read the reviews
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="border-t pt-6">
                                    <div ref={reviewsRef}>
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-2xl font-semibold text-navy">Dr. Feinstein's Ratings and Reviews</h2>
                                            <button onClick={handleReviewClick} className="bg-navy text-white px-6 py-2 rounded-md border-2 border-transparent hover:bg-transparent hover:text-navy hover:border-navy">
                                                Write a Review
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-6xl font-bold">{doctor.reviews.overall}</span>
                                            <div>
                                                <div className="flex text-yellow-400 mb-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span
                                                            key={i}
                                                            className={`text-2xl ${i < doctor.reviews.overall ? "text-yellow-400" : "text-gray-300"}`}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-gray-600">
                                                    {doctor.reviews.totalRatings} Ratings
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-semibold">{doctor.reviews.totalRatings} RATINGS & REVIEWS</h3>
                                    </div>

                                    <div className="space-y-6">
                                        {doctor.reviews.reviewList.map((review, index) => (
                                            <div key={index} className="border-b pb-6">
                                                <div className="flex text-yellow-400 mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={`${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}>
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-gray-600 mb-2">{review.date}</p>
                                                <p className="text-gray-700">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div ref={locationRef}>
                                    <h2 className="text-2xl font-semibold text-navy">Location</h2>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-semibold text-navy">
                                            <a href="#" className="hover:underline">
                                                {doctor.practiceName}
                                            </a>
                                        </h3>
                                        <p className="text-gray-700">{doctor.streetAddress}</p>
                                        <p className="text-gray-700">
                                            {doctor.city}, {doctor.state} {doctor.zipCode}
                                        </p>
                                        <p className="text-gray-700">
                                            Tel:{" "}
                                            <a href={`tel:${doctor.phone}`} className="text-navy hover:underline">
                                                {doctor.phone}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {/* Review Modal */}
            <ReviewModal isOpen={isReviewOpen} onClose={handleCloseReviewModal} />
            <Footer />
        </div>
    );
};

export default Profile;