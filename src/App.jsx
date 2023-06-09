import { Routes, Route } from 'react-router-dom';
import Olympic from './pages/Olympic/index';
import Island from './pages/Island/index';
import Explorer from './pages/Explorer';
import Virtual from './pages/virtual';
import WebGLVirtual from './pages/virtual - 副本';
import ComicPage from './pages/comic';
import Shadow from './pages/shadow';

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
                path="/comic"
                element={<ComicPage />}
            />
            <Route
                path="/"
                element={<Shadow/>}
            >
            </Route>
             <Route
                path="/webGLVirtual"
                element={<WebGLVirtual />}
            />
            {/* <Route
                path="/"
                element={<Virtual />}
            /> */}
        </Routes>
    );
}
export default App;
