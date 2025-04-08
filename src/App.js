import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "./context/AuthContext";

// --- Admin Pages ---
import AdminLogin from "./pages/adminLogin";
import AdminDashboard from "./pages/adminDashboard";
import AdminUsersPage from "./pages/adminUsersPage";
import AdminRecipesPage from "./pages/adminRecipesPage";

// --- User Pages ---
import Index from "./pages/Users/Index";
import UserLoginPage from "./pages/Users/Login";
import Register from "./pages/Users/Register";
import Home from "./pages/Users/Home";
import Profile from "./pages/Users/Profile";
import ProtectedRoute from "./components/users/ProtectedRoute";
import UserLayout from "./components/users/UserLayout";
import RecipeDetail from "./pages/Users/RecipeDetail";

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/recipes" element={<AdminRecipesPage />} />

            {/* User Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<UserLoginPage />} />
            <Route path="/register" element={<Register />} />
            <Route element={<UserLayout />}>
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>}/>
              <Route path="/recipes/:id" element={<RecipeDetail />} />
            </Route>
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;