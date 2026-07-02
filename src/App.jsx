import { useEffect } from 'react';
import { AdminApp } from './admin/AdminApp';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WhatsAppButton } from './components/layout/WhatsAppButton';
import { SplashScreen } from './components/layout/SplashScreen';

// Page Imports
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Team } from './pages/Team';
import { TeamDetail } from './pages/TeamDetail';
import { Careers } from './pages/Careers';
import { Blog } from './pages/Blog';
import { BlogDetail } from './pages/BlogDetail';
import { Contact } from './pages/Contact';
import { Consultation } from './pages/Consultation';

// Scroll to top helper on page transitions
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only scroll to top if there is no hash in the URL (which we handle in specific pages)
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Admin Panel ── completely separate layout, no Navbar/Footer */}
        <Route path="/osi-console/*" element={<AdminApp />} />

        {/* ── Public Marketing Site ── */}
        <Route
          path="/*"
          element={
            <>
              <SplashScreen />
              <ScrollToTop />
              <div className="flex flex-col min-h-screen bg-white">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/team/:id" element={<TeamDetail />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogDetail />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/consultation" element={<Consultation />} />
                  </Routes>
                </main>
                <WhatsAppButton />
                <Footer />
              </div>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
