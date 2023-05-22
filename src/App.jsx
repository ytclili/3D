import { Routes, Route } from "react-router-dom";
import Olympic from "./pages/Olympic/index";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Olympic />} />
    </Routes>
  );
}
export default App;
