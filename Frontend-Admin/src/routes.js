import Index from "views/Index.js";
import Login from "views/Login.js";
import AddRecipe from "views/AddRecipe.js";
import Recipes from "views/Recipes.js";
import VersionsCSV from "views/VersionCSV.js";
import AcceptRecipe from "views/ApproveRecipe.js";
import UpdateRecipe from "views/UpdateRecipe.js";

var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/admin",
    displayInSidebar: true,
  },
  {
    path: "/recipes/add-recipe",
    name: "AddRecipe",
    icon: "ni ni-single-02 text-yellow",
    component: <AddRecipe />,
    layout: "/admin",
    displayInSidebar: false,
  },
  {
    path: "/recipes/update-recipe/:id",
    name: "Update Recipe",
    icon: "ni ni-single-02 text-yellow",
    component: <UpdateRecipe />,
    layout: "/admin",
    displayInSidebar: false,
  },
  {
    path: "/recipes",
    name: "Recipes",
    icon: "ni ni-single-copy-04 text-green",
    component: <Recipes />,
    layout: "/admin",
    displayInSidebar: true,
  },
  {
    path: "/accept-recipes",
    name: "Unapproved Recipes",
    icon: "ni ni-check-bold text-red",
    component: <AcceptRecipe />,
    layout: "/admin",
    displayInSidebar: true,
  },
  {
    path: "/versions-csv",
    name: "Versions CSV",
    icon: "ni ni-money-coins text-gray",
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
