import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wrench, BarChart3, FileText } from 'lucide-react';

const Header = () => {
  const location = useLocation();

  return (
    <header className="bg-[#e30613] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Wrench className="h-6 w-6 text-[#e30613]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">HILTI</h1>
              <p className="text-red-100 text-sm">Fleet Management</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'bg-red-700 text-white' 
                  : 'text-red-100 hover:text-white hover:bg-red-700'
              }`}
            >
              <Wrench className="h-4 w-4" />
              <span>Fleet Builder</span>
            </Link>
            <Link
              to="/analysis"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/analysis' 
                  ? 'bg-red-700 text-white' 
                  : 'text-red-100 hover:text-white hover:bg-red-700'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Project Analysis</span>
            </Link>
            <Link
              to="/proposal"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/proposal' 
                  ? 'bg-red-700 text-white' 
                  : 'text-red-100 hover:text-white hover:bg-red-700'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Fleet Proposal</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;