import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { OrganizationProvider } from './context';
import { Layout } from './components';
import { Organizations, Events, Resources, Attendees, Reports } from './pages';

function App() {
  return (
    <OrganizationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Organizations />} />
            <Route path="events" element={<Events />} />
            <Route path="resources" element={<Resources />} />
            <Route path="attendees" element={<Attendees />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </OrganizationProvider>
  );
}

export default App;
