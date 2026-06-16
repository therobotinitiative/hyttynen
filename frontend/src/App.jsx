import { BrowserRouter, createBrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Device from "./pages/Device";

const basename = (import.meta.env.VITE_BASE_URL ?? '/hyttynen/').replace(/\/$/, '');

const App = () => {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" index element={<Home />} />
        <Route path="/device/:deviceId" element={<Device />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;