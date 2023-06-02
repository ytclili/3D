import { Routes, Route } from 'react-router-dom';
import Olympic from './pages/Olympic/index';
import Island from './pages/Island/index';
import Explorer from './pages/Explorer';
import Virtual from './pages/virtual';
function App() {
    return (
        <Routes>
            <Route
                path="/olympic"
                element={<Olympic />}
            />
            <Route
                path="/explorer"
                element={<Explorer />}
            />
            <Route
                path="/island"
                element={<Island />}
            />
            <Route
                path="/"
                element={<Virtual />}
            />
        </Routes>
    );
}
export default App;
