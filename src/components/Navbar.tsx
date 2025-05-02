import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <header className="border-b border-grain-beige/30">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-grain-brown rounded-full"></div>
          <span className="font-serif font-bold text-xl text-grain-dark">GrainLink</span>
        </Link>
        <nav>
          <ul className="flex items-center space-x-8">
            <li>
              <Link to="/" className="text-grain-dark hover:text-grain-brown transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/about" className="text-grain-dark hover:text-grain-brown transition-colors">About</Link>
            </li>
            <li>
              <Link to="/login" className="bg-grain-brown text-white px-4 py-2 rounded-md font-medium hover:bg-grain-dark transition-colors">
                Login
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;