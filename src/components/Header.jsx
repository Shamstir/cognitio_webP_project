import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import companyLogo from "../assets/company-logo.svg";
import companyLogoSmall from "../assets/company-logo-small.svg";
import toast from "react-hot-toast";
import axios from "axios";

function Header({ isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState(""); // 'educator' or 'user'
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const accessToken = localStorage.getItem("accessToken");
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!accessToken) return;
      try {
        // Attempt to fetch educator details
        const educatorResponse = await axios.get(
          "http://127.0.0.1:8000/api/v1/educator/getDetails/",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        console.log(educatorResponse.data.message);
        
        if (educatorResponse.data?.message?.courses) {
          setUserName("Educator");
          setUserType("Educator");
          return;
        }
      } catch (error) {
        console.warn("Educator endpoint failed, trying user endpoint...", error);
      }

      // If educator call fails, try the user endpoint
      try {
        const userResponse = await axios.get(
          "http://127.0.0.1:8000/api/v1/users/getDetails/",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }

        );
        console.log(userResponse.data.message.name)
        
        
        if (userResponse.data.message.name) {
          setUserName("User");
          setUserType("User");
          console.log(userName);
          console.log(userType);
          
          
        }
      } catch (error) {
        console.error("Error fetching user details from both endpoints:", error);
      }
    };

    if (isAuthenticated) {
      fetchUserDetails();
    }
  }, [accessToken, isAuthenticated]);

  

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <header className="h-18 bg-[#1a1a1c] fixed top-0 left-0 min-w-screen text-xl text-white flex justify-between items-center px-5 mb-4 z-50">
        <Link to="/">
          <img className="h-8 hidden sm:block" src={companyLogo} alt="Company Logo" />
          <img className="h-8 sm:h-12 sm:hidden scale-65" src={companyLogoSmall} alt="Company Logo Small" />
        </Link>
        <ul className="flex gap-x-5 items-center relative">
          {isAuthenticated ? (
            <li className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="cursor-pointer border-green-300 border-2 py-1 px-2 focus:outline-none mr-2 rounded-xl"
              >
                {userName || "User"}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-black text-white rounded shadow-lg z-50">
                  <button
                    onClick={() => navigate(userType === "Educator" ? "/profile" : "/myProfile")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    {userType === "Educator" ? "Profile" : "User Dashboard"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Log out
                  </button>
                </div>
              )}
            </li>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/signup">Sign up</Link>
              </li>
            </>
          )}
        </ul>
      </header>
    </div>
  );
}

export default Header;
