import { BrowserRouter, createBrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Device from "./pages/Device";
import Layout from "./pages/Layout";

const basename = (import.meta.env.VITE_BASE_URL ?? '/hyttynen/').replace(/\/$/, '');

const App = () => {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="device/:deviceId" element={<Device />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;