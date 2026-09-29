import { Link, Navigate, Route, Routes } from 'react-router-dom';

import ApplyPage from './pages/ApplyPage';
import JobDetailPage from './pages/JobDetailPage';
import JobsPage from './pages/JobsPage';
import NotFoundPage from './pages/NotFoundPage';
import SuccessPage from './pages/SuccessPage';

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="wordmark" to="/jobs" aria-label="Fieldwork home">
          <span className="wordmark-mark">F</span>
          <span>fieldwork</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/jobs">Find a role</Link>
        </nav>
        <span className="header-note">Thoughtful work. Better futures.</span>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/jobs" replace />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
          <Route path="/jobs/:jobId/apply" element={<ApplyPage />} />
          <Route path="/jobs/:jobId/success" element={<SuccessPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <span>Fieldwork <span aria-hidden="true">/</span> Work with purpose</span>
        <span>Made for the next good thing.</span>
      </footer>
    </div>
  );
}

export default App
