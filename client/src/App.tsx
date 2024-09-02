import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
// pages
import Home from "./pages/Home";
import Events from "./pages/Events";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import WelcomePage from "./pages/WelcomePage";
import ProtectedRoutes from "./components/ProtectedRoutes";
import ErrorPage from "./pages/ErrorPage";
import LoadingPage from "./pages/LoadingPage";
import Calendar from "./pages/Calendar";
// layouts
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import Pomodoro from "./pages/Pomodoro";
import Notes from "./pages/Notes";
import Editor from "./pages/Editor";


// Per come è impostata la nostra app tutte le route devono stare dentro ad una route che fa da
// padre a tutte le altre senza aggiungere layout o path
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<LoadingPage />} errorElement={<ErrorPage />}>
      <Route path="/" element={<WelcomePage />} />
      <Route element={<ProtectedRoutes />}>
        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
<<<<<<< Updated upstream
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notes" element={<Home />} />
=======
          <Route path="/calendar" element={<Home />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/editor/:id?" element={<Editor />} />

>>>>>>> Stashed changes
        </Route>
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
    </Route>
  )
);

function App() {
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
