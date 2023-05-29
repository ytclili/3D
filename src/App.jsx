import { Routes, Route } from 'react-router-dom';
import Olympic from './pages/Olympic/index';
import Island from './pages/Island/index';
import Explorer from './pages/Explorer';
function App() {
    return (
        <Routes>
            <Route
                path="/olympic"
                element={<Olympic />}
            />
            <Route
                path="/"
                element={<Explorer />}
            />
            <Route
                path="/island"
                element={<Island />}
            />
        </Routes>
    );
}
export default App;
