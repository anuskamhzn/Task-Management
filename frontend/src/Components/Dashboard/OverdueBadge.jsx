import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const OverdueBadge = () => (
  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
    <span className="mr-1"><FaExclamationTriangle /></span> Overdue
  </span>
);

export default OverdueBadge;