import React, { useState, useEffect, useRef } from 'react';
// Import NavLink for navigation links that can have an active state, Link for simple links, and useNavigate for programmatic navigation.
import { NavLink, Link, useNavigate } from 'react-router-dom';
// Import useAuth hook from AuthContext to access authentication state (isAuthenticated, user) and logout function.
import { useAuth } from '../context/AuthContext';

/**
 * @function Navbar
 * @description The main navigation bar component for the application.
 * It displays navigation links, the application brand, and authentication-related options
 * (login/register or user profile dropdown with logout).
 *
 * @returns {JSX.Element} The rendered navigation bar.
 */
function Navbar() {
  // Destructure authentication state and functions from AuthContext.
  const { isAuthenticated, user, logout } = useAuth();
  // Hook for programmatic navigation, used for redirecting after logout.
  const navigate = useNavigate();
  // State to manage the visibility of the user profile dropdown menu.
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Ref to the dropdown container, used to detect clicks outside the dropdown to close it.
  const dropdownRef = useRef(null);

  /**
   * Handles the user logout process.
   * Calls the logout function from AuthContext, closes the dropdown, and navigates to the login page.
   */
  const handleLogout = () => {
    logout(); // Clear authentication state.
    setIsDropdownOpen(false); // Ensure dropdown is closed after logout.
    navigate('/login'); // Redirect user to the login page.
  };

  /**
   * Toggles the visibility of the user profile dropdown menu.
   */
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Effect to handle closing the dropdown when a click occurs outside of it.
  useEffect(() => {
    /**
     * Checks if a click event occurred outside the dropdown menu.
     * If so, it closes the dropdown.
     * @param {MouseEvent} event - The mousedown event.
     */
    const handleClickOutside = (event) => {
      // If the dropdownRef is set and the clicked target is not within the dropdown element.
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false); // Close the dropdown.
      }
    };
    // Add event listener for mousedown events on the document.
    document.addEventListener('mousedown', handleClickOutside);
    // Cleanup function: remove the event listener when the component unmounts or dependencies change.
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount.

  /**
   * Helper function to determine the CSS class for NavLink components based on their active state.
   * @param {Object} props - Props provided by NavLink.
   * @param {boolean} props.isActive - Boolean indicating if the link is currently active.
   * @returns {string} Returns 'active' if the link is active, otherwise an empty string.
   */
  const navLinkClass = ({ isActive }) => isActive ? 'active' : '';

  return (
    <nav className="main-navbar">
      {/* Application brand/logo linking to the homepage. */}
      <div className="navbar-brand">
        <Link to="/">Conciertix</Link>
      </div>
      {/* Main navigation links. */}
      <div className="navbar-links">
        <NavLink to="/" className={navLinkClass} end>Home</NavLink> {/* `end` prop ensures active class only on exact match for root path */}
        <NavLink to="/calendar" className={navLinkClass}>Calendar</NavLink>
        {/* Additional general navigation links can be added here. */}
      </div>
      {/* Authentication section: displays user menu or login/register links. */}
      <div className="navbar-auth-section">
        {isAuthenticated ? (
          // If user is authenticated, display the user menu dropdown.
          <div className="user-menu-container" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="user-menu-trigger"
              aria-expanded={isDropdownOpen} // Accessibility: indicates if dropdown is expanded.
              aria-haspopup="true" // Accessibility: indicates the button opens a menu.
            >
              {/* Display user's email or username, or 'User Profile' as fallback. */}
              {user?.email || user?.username || 'User Profile'}
              {/* Arrow icon indicating dropdown state. */}
              <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} aria-hidden="true">▼</span>
            </button>
            {/* Conditional rendering of the dropdown menu. */}
            {isDropdownOpen && (
              <ul className="user-dropdown-menu" role="menu"> {/* Semantic list for menu items. */}
                <li role="none"><NavLink to="/user/my-reservations" role="menuitem" className={navLinkClass} onClick={() => setIsDropdownOpen(false)}>My Reservations</NavLink></li>
                <li role="none"><NavLink to="/user/profile" role="menuitem" className={navLinkClass} onClick={() => setIsDropdownOpen(false)}>My Profile</NavLink></li>
                {/* Conditional link to Admin Panel if the user is an admin. */}
                {user?.isAdmin && ( // Check if user object has an isAdmin property (ensure this is provided by AuthContext).
                  <li role="none"><NavLink to="/admin" role="menuitem" className={navLinkClass} onClick={() => setIsDropdownOpen(false)}>Admin Panel</NavLink></li>
                )}
                <li role="none"><button onClick={handleLogout} className="logout-button-dropdown" role="menuitem">Logout</button></li>
              </ul>
            )}
          </div>
        ) : (
          // If user is not authenticated, display Login and Register links.
          <div className="auth-links">
            <NavLink to="/login" className={({isActive}) => navLinkClass({isActive}) + " btn-login"}>Login</NavLink>
            <NavLink to="/register" className={({isActive}) => navLinkClass({isActive}) + " btn-register"}>Register</NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;