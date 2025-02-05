import React, { useState } from 'react';

const ReviewModal = ({ isOpen, onClose }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleRatingChange = (rate) => {
        setRating(rate);
    };

    const handleSubmit = () => {
        // Handle review submission (could be an API call, etc.)
        console.log(`Rating: ${rating}, Comment: ${comment}`);
        onClose(); // Close modal after submitting the review
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold text-navy mb-4">Write a Review</h2>

                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, index) => (
                        <span
                            key={index}
                            className={`text-2xl cursor-pointer ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            onClick={() => handleRatingChange(index + 1)}
                        >
                            ★
                        </span>
                    ))}
                </div>

                {/* Review Comment */}
                <textarea
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="4"
                    placeholder="Write your comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                ></textarea>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        className="bg-navy text-white px-6 py-2 rounded-md mr-2"
                    >
                        Submit Review
                    </button>
                    <button
                        onClick={onClose}
                        className="border border-gray-300 px-4 py-2 rounded-md text-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
