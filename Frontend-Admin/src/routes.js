/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Index from "views/Index.js";
import Login from "views/Login.js";
import AddRecipe from "views/AddRecipe.js";
import Recipes from "views/Recipes.js";
import VersionsCSV from "views/VersionCSV.js";

var routes = [
  {
    path: "/index",
    name: "Management",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/admin",
    displayInSidebar: true,
  },
  // {
  //   path: "/icons",
  //   name: "Icons",
  //   icon: "ni ni-planet text-blue",
  //   component: <Icons />,
  //   layout: "/admin",
  // },
  // {
  //   path: "/maps",
  //   name: "Maps",
  //   icon: "ni ni-pin-3 text-orange",
  //   component: <Maps />,
  //   layout: "/admin",
  // },
  {
    path: "/recipes/add-recipe",
    name: "AddRecipe",
    icon: "ni ni-single-02 text-yellow",
    component: <AddRecipe />,
    layout: "/admin",
    displayInSidebar: false,
  },
  {
    path: "/recipes",
    name: "Recipes",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Recipes />,
    layout: "/admin",
    displayInSidebar: true,
  },
  {
    path: "/versions-csv",
    name: "VersionsCSV",
    icon: "ni ni-bullet-list-67 text-red",
    component: <VersionsCSV />,
    layout: "/admin",
    displayInSidebar: true,
  },
  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: <Login />,
    layout: "/auth",
    displayInSidebar: false,
  },
  // {
  //   path: "/register",
  //   name: "Register",
  //   icon: "ni ni-circle-08 text-pink",
  //   component: <Register />,
  //   layout: "/auth",
  // },
];
export default routes;
