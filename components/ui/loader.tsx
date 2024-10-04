import React from 'react';
import { Dog } from 'lucide-react';

const Loader = ({ size = 24, className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Dog size={size} className="animate-bounce text-primary" />
    </div>
  );
};

export default Loader;