import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiLink2,
  FiUser,
  FiLogOut,
  FiHome,
  FiBarChart2,
  FiLogIn,
  FiUserPlus,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    try {
      logout();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <FiLink2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-blue-600">
                LinkShrink
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center">
            <div className="flex space-x-4">
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center"
              >
                <FiHome className="mr-1" /> Home
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center"
                  >
                    <FiBarChart2 className="mr-1" /> Dashboard
                  </Link>

                  <div className="relative ml-3">
                    <div className="flex items-center">
                      <div className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium flex items-center">
                        <FiUser className="mr-1" /> {user.username}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 flex items-center"
                      >
                        <FiLogOut className="mr-1" /> Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center"
                  >
                    <FiLogIn className="mr-1" /> Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center"
                  >
                    <FiUserPlus className="mr-1" /> Sign up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            >
              <span className="sr-only">
                {isMenuOpen ? "Close menu" : "Open menu"}
              </span>
              {isMenuOpen ? (
                <FiX className="h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-lg">
          <div className="pt-2 pb-3 space-y-1 px-4">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <FiHome className="mr-2" /> Home
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiBarChart2 className="mr-2" /> Dashboard
                </Link>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="px-3 py-2 text-base font-medium text-gray-600 flex items-center">
                    <FiUser className="mr-2" /> Signed in as{" "}
                    <span className="font-bold ml-1">{user.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="mt-2 w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 flex items-center"
                  >
                    <FiLogOut className="mr-2" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiLogIn className="mr-2" /> Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center my-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiUserPlus className="mr-2" /> Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
