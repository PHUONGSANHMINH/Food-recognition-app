import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AsyncStorage from "../AsyncStorageHelper";
import axios from "axios";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      let token = await AsyncStorage.getItem("access_token");
      if (!token) {
        token = await refreshToken();
      }
      setIsAuthenticated(!!token); // true nếu token tồn tại, ngược lại false
    };

    const refreshToken = async () => {
      try {
        const refresh_token = await AsyncStorage.getItem("refresh_token");
        if (refresh_token) {
          const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN;
          const response = await axios.post(`${apiDomain}/api/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${refresh_token}`,
            },
          });
          const { access_token } = response.data;

          await AsyncStorage.setItem("access_token", access_token);

          return access_token;
        }
      } catch (error) {
        console.error("Failed to refresh access token", error);
        return null;
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // Trong khi chờ kiểm tra xác thực
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" />;
};

export default ProtectedRoute;
