import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext'; // <--- The path has been corrected to the .js file.

// 2. Create the provider component. This will wrap your entire application.
export const AuthProvider = ({ children }) => {
    // State to hold the user's authentication token
    const [token, setToken] = useState(localStorage.getItem('token'));
    // State to determine if a user is authenticated
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // State to hold user data (e.g., username, ID)
    const [user, setUser] = useState(null);
    // State to track if the auth check is complete
    const [authLoading, setAuthLoading] = useState(true);

    // This useEffect hook runs whenever the token changes.
    // It verifies the token and fetches user data.
    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                // In a real app, you would make an API call to a protected route
                // to verify the token and get user data.
                try {
                    // This is a placeholder for your actual API call
                    // const res = await axios.get('/api/auth', { headers: { 'x-auth-token': token } });
                    
                    // For this example, we'll simulate a successful verification
                    // In your backend, the API would return user details
                    const fakeUserResponse = {
                        _id: 'sampleUserId123',
                        username: 'JaneDoe',
                        email: 'jane@example.com'
                    };

                    setUser(fakeUserResponse);
                    setIsAuthenticated(true);
                } catch (err) {
                    // Token is invalid or expired
                    console.error("Token verification failed:", err);
                    localStorage.removeItem('token');
                    setToken(null);
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
            setAuthLoading(false);
        };
        verifyToken();
    }, [token]);

    // Function to handle login. This is called after a successful login API call.
    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    // Function to handle logout.
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
    };

    // The value object contains all the state and functions that will be available to
    // all components wrapped by the provider.
    const value = {
        token,
        isAuthenticated,
        user,
        authLoading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
