import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Award, BookOpen, FileDown, Shield, Briefcase } from 'lucide-react';
import { publicApi } from '../lib/publicApi';

// Inline dummy data mirror (must stay in sync with TeamGrid's DUMMY_TEAM)
const DUMMY_TEAM = [
  {
    _id: 'leader-1',
    name: 'Er. Ramesh Vaidya',
    designation: 'Chairman & Managing Director',
    qualification: 'B.E. (Civil), M.Tech (Structural), FIE, PMP Certified',
    experience: '38+ years in infrastructure planning, highway engineering, and project execution across Maharashtra, Goa & Karnataka.',
    email: 'r.vaidya@omseva.in',
    phone: '9820011230',
    location: 'Mumbai, Maharashtra',
    isLeader: true,
    isLive: true,
    specializations: ['Highway Engineering', 'Project Finance & DPR', 'Structural Design', 'Contract Management'],
    keyProjects: [
      'NH-66 Coastal Expressway Widening – 42 km (NHAI)',
      'Mumbai-Pune Expressway Maintenance Package – 12 km',
      'Versova-Bandra Sea Link Approach Roads',
    ],
    image: { url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80' },
    resume: null,
  },
  {
    _id: 'leader-2',
    name: 'Er. Sujata Kulkarni',
    designation: 'Director – Water Resources',
    qualification: 'B.E. (Civil), M.E. (Hydraulics), MIE',
    experience: '31 years specialising in irrigation infrastructure, dam safety, and rural water supply schemes under Jal Jeevan Mission.',
    email: 's.kulkarni@omseva.in',
    phone: '9870045678',
    location: 'Pune, Maharashtra',
    isLeader: true,
    isLive: true,
    specializations: ['Hydraulic Engineering', 'Dam Safety Review', 'Rural Water Supply', 'GIS Mapping'],
    keyProjects: [
      'Jalgaon Rural Water Supply – 180 km pipeline (JJM)',
      'Godavari Canal Rehabilitation – Reach 3',
      'Koyna Dam Safety Instrumentation Programme',
    ],
    image: { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
    resume: null,
  },
  {
    _id: 'leader-3',
    name: 'Er. Anil Deshmukh',
    designation: 'Director – Structural & Metro Projects',
    qualification: 'B.E. (Civil), M.Tech (Structures), Ph.D. (IIT Bombay)',
    experience: '27 years in bridge engineering, metro viaducts, and structural rehabilitation with projects across 6 Indian states.',
    email: 'a.deshmukh@omseva.in',
    phone: '9823398765',
    location: 'Mumbai, Maharashtra',
    isLeader: true,
    isLive: true,
    specializations: ['Bridge Design', 'Metro Viaducts', 'Box-Girder Technology', 'Seismic Assessment'],
    keyProjects: [
      'Pune Metro Rail Viaduct – Package C4 (PMRDA)',
      'Thane Creek Bridge Rehabilitation',
      'Bandra-Worli Sea Link Approach Viaduct',
    ],
    image: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
    resume: null,
  },
  {
    _id: 'leader-4',
    name: 'Er. Priya Sawant',
    designation: 'Director – Construction Management',
    qualification: 'B.E. (Civil), M.B.A. (Project Management), PMP, RICS Certified',
    experience: '22 years managing large-scale construction projects, EPC contracts, and quality assurance across urban and semi-urban corridors.',
    email: 'p.sawant@omseva.in',
    phone: '9892267890',
    location: 'Kolhapur, Maharashtra',
    isLeader: true,
    isLive: true,
    specializations: ['EPC Contract Management', 'QA / QC Systems', 'Urban Infrastructure', 'Cost Engineering'],
    keyProjects: [
      'Kolhapur Flyover & Grade Separator (KMC)',
      'Nashik Smart City Road Package – 18 km',
      'Solapur Bypass Widening – Phase II',
    ],
    image: { url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80' },
    resume: null,
  },
];

export function TeamDetail() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchMember() {
      try {
        const res = await publicApi.get('/employee/getAllTeamMembers');
        const teamData = res.data?.data?.teamMembers || [];
        if (teamData.length > 0) {
          const found = teamData.find((m) => m._id === id);
          if (found) {
            setMember(found);
          } else {
            setError('Team member not found.');
          }
        } else {
          // API returned empty — check dummy data
          const dummy = DUMMY_TEAM.find((m) => m._id === id);
          if (dummy) {
            setMember(dummy);
          } else {
            setError('Team member not found.');
          }
        }
      } catch (err) {
        console.error(err);
        // On network error also try dummy data
        const dummy = DUMMY_TEAM.find((m) => m._id === id);
        if (dummy) {
          setMember(dummy);
        } else {
          setError('Failed to fetch team member information.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchMember();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center bg-white min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="py-24 text-center px-4 bg-white min-h-[50vh]">
        <h2 className="text-3xl font-bold font-display text-brand-black mb-4">Profile Not Found</h2>
        <p className="font-body text-brand-gray text-base mb-8">{error || 'The requested team member profile does not exist.'}</p>
        <Link to="/team" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-md text-white bg-brand-green hover:bg-brand-green-hover transition-colors">
          Return to Team
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            to="/team" 
            className="inline-flex items-center gap-2 font-body text-sm font-semibold text-brand-green hover:text-brand-green-hover transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Leadership & Team
          </Link>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Image, Contact & Resume */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="w-full aspect-[4/5] rounded-xl overflow-hidden shadow-md border border-brand-border bg-brand-bg relative">
              {member.image?.url ? (
                <img 
                  src={member.image.url} 
                  alt={member.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-brand-gray">
                  No Photo Available
                </div>
              )}
            </div>

            {/* Quick Contact & Action Box */}
            <div className="bg-brand-bg/50 border border-brand-border/60 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
              <h3 className="text-sm font-bold font-display text-brand-black uppercase tracking-wider border-b border-brand-border/60 pb-2">
                Contact Information
              </h3>
              <div className="flex flex-col gap-3 font-body text-xs text-brand-gray">
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-3 hover:text-brand-green transition-colors duration-200 py-1"
                  title={`Email ${member.name}`}
                >
                  <Mail size={16} className="text-brand-green shrink-0" />
                  <span className="truncate text-sm font-medium">{member.email}</span>
                </a>
                <a
                  href={`tel:+91${member.phone}`}
                  className="flex items-center gap-3 hover:text-brand-green transition-colors duration-200 py-1"
                  title={`Call ${member.name}`}
                >
                  <Phone size={16} className="text-brand-green shrink-0" />
                  <span className="text-sm font-medium">+91 {member.phone}</span>
                </a>
                <div className="flex items-center gap-3 py-1">
                  <MapPin size={16} className="text-brand-green shrink-0" />
                  <span className="text-sm font-medium text-brand-black">{member.location}</span>
                </div>
              </div>

              {member.resume?.url && (
                <a
                  href={member.resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-green hover:bg-brand-green-hover text-white text-sm font-bold rounded-lg shadow-sm transition-colors duration-200 cursor-pointer"
                  title={`Download ${member.name}'s resume`}
                >
                  <FileDown size={16} />
                  <span>Download Resume (PDF)</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Name, Bio, Specializations, Key Projects */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="border-b border-brand-border/60 pb-6">
              <div className="inline-block px-3 py-1 bg-brand-green/10 text-brand-green text-xs font-bold font-body uppercase tracking-wider rounded mb-3">
                {member.isLeader ? 'Board Director' : 'Team Member'}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-display text-brand-black mb-2">
                {member.name}
              </h1>
              <p className="text-lg font-bold text-brand-green font-body uppercase tracking-wider">
                {member.designation}
              </p>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-brand-bg/30 border border-brand-border/40 rounded-xl p-6">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center shrink-0">
                  <BookOpen size={20} className="text-brand-green" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brand-gray tracking-wider uppercase block font-body">Qualifications</span>
                  <span className="font-body text-sm font-semibold text-brand-black leading-snug block mt-0.5">
                    {member.qualification}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center shrink-0">
                  <Briefcase size={20} className="text-brand-green" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brand-gray tracking-wider uppercase block font-body">Professional Experience</span>
                  <span className="font-body text-sm font-semibold text-brand-black leading-snug block mt-0.5">
                    {member.experience}
                  </span>
                </div>
              </div>
            </div>

            {/* Specializations */}
            {member.specializations && member.specializations.length > 0 && (
              <div>
                <h3 className="text-xl font-bold font-display text-brand-black mb-4 flex items-center gap-2">
                  <Award size={20} className="text-brand-green" />
                  Key Specialties & Domains
                </h3>
                <div className="flex flex-wrap gap-2">
                  {member.specializations.map((spec, index) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-white border border-brand-border rounded-lg text-xs font-semibold text-brand-gray font-body shadow-sm"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Projects */}
            {member.keyProjects && member.keyProjects.length > 0 && (
              <div>
                <h3 className="text-xl font-bold font-display text-brand-black mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-brand-green" />
                  Notable Infrastructure Projects Led
                </h3>
                <ul className="flex flex-col gap-3 font-body">
                  {member.keyProjects.map((project, index) => (
                    <li 
                      key={index} 
                      className="flex items-start gap-3 p-4 bg-brand-bg/20 border border-brand-border/40 rounded-lg"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-green shrink-0 mt-1.5" />
                      <span className="text-sm font-semibold text-brand-black">{project}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
export default TeamDetail;
