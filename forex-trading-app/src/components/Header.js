import React from 'react';

function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center text-white">
        <h1 className="text-3xl font-bold">Forex Trading Signals</h1>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="#form" className="hover:underline">Form</a></li>
            <li><a href="#chart" className="hover:underline">Chart</a></li>
            <li><a href="#metrics" className="hover:underline">Metrics</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
