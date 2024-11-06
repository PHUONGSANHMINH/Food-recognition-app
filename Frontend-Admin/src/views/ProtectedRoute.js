import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("access_token");
      setIsAuthenticated(!!token); // true nếu token tồn tại, ngược lại false
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
