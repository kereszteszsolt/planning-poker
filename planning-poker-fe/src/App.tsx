import "./App.css";
import HomeScreen from "./features/HomeScreen.tsx";
import AboutScreen from "./features/AboutScreen.tsx";
import RoomScreen from "./features/RoomScreen.tsx";
import MessageScreen from "./features/MessageScreen.tsx";
import Navbar from "./shared/Navbar.tsx";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { SocketProvider } from "./SocketProvider.tsx";

function Layout() {
  return (
    <>
      <Navbar />
      <div className="h-[calc(100vh-60px)] w-[768px] mx-auto pt-5">
        <Outlet />
      </div>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: "room/:roomId", element: <RoomScreen /> },
      { path: "message/:messageType", element: <MessageScreen /> },
      { path: "about", element: <AboutScreen /> },
      { path: "*", element: <HomeScreen /> },
    ],
  },
]);

function App() {
  return (
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  );
}

export default App;
