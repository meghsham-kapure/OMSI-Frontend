import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, LayoutGrid, List, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SectionHeader } from '../ui/SectionHeader';
import { publicApi } from '../../lib/publicApi';

const CARD_LIMIT = 12;
const TABLE_PAGE_SIZE = 15;

const statusColors = {
  Finished: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Ongoing: 'bg-sky-50 text-sky-700 border border-sky-200',
  Upcoming: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const STATUSES = ['All', 'Upcoming', 'Ongoing', 'Finished'];
const CATEGORIES = ['All', 'Transportation', 'Water', 'Structural', 'Construction', 'Surveying'];

export function ProjectsGrid({
  limit,
  featuredOnly = false,
  interactiveFilters = true,
  showHeader = true,
  initialStatus = 'All'
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  // Table-only filters
  const [tableStatus, setTableStatus] = useState(initialStatus);
  const [tableCategory, setTableCategory] = useState('All');
  // 'card' | 'table'
  const [viewMode, setViewMode] = useState('card');
  const [tablePage, setTablePage] = useState(1);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await publicApi.get('/project/getAllProjects?limit=100');
        const data = res.data?.data?.projects || [];
        setProjects(data.filter(p => p.isLive));
      } catch (err) {
        console.error('Failed to fetch projects', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // Reset page whenever table filters or view mode change
  useEffect(() => { setTablePage(1); }, [tableStatus, tableCategory, viewMode]);

  // ── Card view: all live projects (featured-only capped at CARD_LIMIT) ───────
  let cardSource = featuredOnly ? projects.filter(p => p.isFeatured) : projects.filter(p => p.isFeatured);
  if (limit) cardSource = cardSource.slice(0, limit);
  const cardList = cardSource.slice(0, CARD_LIMIT);

  // ── Table view: apply inline filters, then paginate ──────────────────────
  let tableFiltered = projects;
  if (tableStatus !== 'All') tableFiltered = tableFiltered.filter(p => p.status === tableStatus);
  if (tableCategory !== 'All') tableFiltered = tableFiltered.filter(p => p.category === tableCategory);
  const totalTablePages = Math.max(1, Math.ceil(tableFiltered.length / TABLE_PAGE_SIZE));
  const tableList = tableFiltered.slice(
    (tablePage - 1) * TABLE_PAGE_SIZE,
    tablePage * TABLE_PAGE_SIZE
  );

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    return new Date(isoStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // ── Shared select style ───────────────────────────────────────────────────
  const selectCls = `
    h-8 pl-3 pr-8 rounded-lg border border-brand-border bg-white text-xs font-semibold
    font-body text-brand-gray appearance-none cursor-pointer
    hover:border-brand-green focus:border-brand-green focus:outline-none transition-colors
  `;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">

        {showHeader && (
          <SectionHeader
            tag="Our Portfolio"
            title="Building Civil Infrastructure That Lasts"
            subtitle="Explore our diverse range of engineering works, from coastal expressways and rural bridges to water distribution grids under federal schemes."
          />
        )}

        {/* ── Top bar: just the view toggle ───────────────────────────────── */}
        {interactiveFilters && (
          <div className="flex justify-end mb-8">
            <div className="flex items-center gap-1 bg-brand-bg border border-brand-border rounded-lg p-1 shadow-sm">
              <button
                id="toggle-card-view"
                onClick={() => setViewMode('card')}
                title="Card View"
                className={`w-9 h-9 flex items-center justify-center rounded-md transition-all duration-200 ${viewMode === 'card'
                  ? 'bg-white shadow text-brand-green border border-brand-border/60'
                  : 'text-brand-gray hover:text-brand-green hover:bg-white/60'
                  }`}
              >
                <LayoutGrid size={17} />
              </button>
              <button
                id="toggle-table-view"
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`w-9 h-9 flex items-center justify-center rounded-md transition-all duration-200 ${viewMode === 'table'
                  ? 'bg-white shadow text-brand-green border border-brand-border/60'
                  : 'text-brand-gray hover:text-brand-green hover:bg-white/60'
                  }`}
              >
                <List size={17} />
              </button>
            </div>
          </div>
        )}

        {/* ── Content ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green" />
          </div>
        ) : (
          <>
            {/* ══ CARD VIEW ═════════════════════════════════════════════════ */}
            {(!interactiveFilters || viewMode === 'card') && (
              <>
                {featuredOnly ? (
                  /* Homepage: simple 3-col grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cardList.map(project => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                ) : (
                  /* Projects page: 3×4 grid, featured only */
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold font-display text-brand-black">Featured Projects</h3>
                      <span className="text-xs text-brand-gray font-body bg-brand-bg border border-brand-border px-3 py-1 rounded-full">
                        Showing {cardList.length} of {projects.filter(p => p.isFeatured).length} featured
                      </span>
                    </div>
                    {cardList.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {cardList.map(project => (
                          <ProjectCard key={project._id} project={project} compact />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-brand-border rounded-lg bg-brand-bg">
                        <p className="font-body text-brand-gray text-base">No featured projects to display.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ══ TABLE VIEW ════════════════════════════════════════════════ */}
            {interactiveFilters && viewMode === 'table' && (
              <div>
                {/* Table header row: title + inline filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-bold font-display text-brand-black">All Projects Directory</h3>
                    <p className="text-xs text-brand-gray font-body mt-0.5">
                      {tableFiltered.length} project{tableFiltered.length !== 1 ? 's' : ''}
                      {(tableStatus !== 'All' || tableCategory !== 'All') && ' (filtered)'}
                    </p>
                  </div>

                  {/* Inline filter controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-gray font-body">
                      <Filter size={13} className="text-brand-green" />
                      Filter:
                    </span>

                    {/* Status select */}
                    <div className="relative">
                      <select
                        value={tableStatus}
                        onChange={e => setTableStatus(e.target.value)}
                        className={selectCls}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-brand-gray">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                    </div>

                    {/* Category select */}
                    <div className="relative">
                      <select
                        value={tableCategory}
                        onChange={e => setTableCategory(e.target.value)}
                        className={selectCls}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-brand-gray">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                    </div>

                    {/* Clear filters pill — visible only when a filter is active */}
                    {(tableStatus !== 'All' || tableCategory !== 'All') && (
                      <button
                        onClick={() => { setTableStatus('All'); setTableCategory('All'); }}
                        className="text-xs font-semibold text-brand-gray hover:text-brand-green font-body border border-brand-border bg-brand-bg rounded-lg px-3 h-8 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {tableFiltered.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-brand-border rounded-lg bg-brand-bg">
                    <p className="font-body text-brand-gray text-base">No projects match the selected filters.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto bg-white border border-brand-border rounded-xl shadow-sm">
                      <table className="w-full text-left border-collapse min-w-[780px]">
                        <thead>
                          <tr className="bg-brand-bg text-brand-gray text-xs uppercase tracking-wider font-body border-b border-brand-border">
                            <th className="p-4 font-semibold">Title & Details</th>
                            <th className="p-4 font-semibold">Category</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Location</th>
                            <th className="p-4 font-semibold">Client</th>
                            <th className="p-4 font-semibold">Start Date</th>
                            <th className="p-4 font-semibold"></th>
                          </tr>
                        </thead>
                        <tbody className="text-sm font-body divide-y divide-brand-border/50">
                          {tableList.map(p => (
                            <tr key={p._id} className="hover:bg-brand-bg/40 transition-colors group">
                              <td className="p-4 max-w-[260px]">
                                <Link
                                  to={`/projects/${p._id}`}
                                  className="font-bold text-brand-black hover:text-brand-green block mb-0.5 leading-snug line-clamp-2"
                                >
                                  {p.title}
                                </Link>
                                <span className="text-xs text-brand-gray block">
                                  {p.teamLeader && `Leader: ${p.teamLeader}`}
                                  {p.teamLeader && p.budget && ' · '}
                                  {p.budget && `Budget: ${p.budget}`}
                                </span>
                              </td>
                              <td className="p-4 text-brand-black whitespace-nowrap">{p.category}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="p-4 text-brand-gray whitespace-nowrap">{p.location}</td>
                              <td className="p-4 text-brand-gray whitespace-nowrap">{p.client}</td>
                              <td className="p-4 text-brand-gray whitespace-nowrap">{formatDate(p.startDate)}</td>
                              <td className="p-4">
                                <Link
                                  to={`/projects/${p._id}`}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-xs font-bold text-brand-green hover:text-brand-green-hover whitespace-nowrap"
                                >
                                  View <ArrowRight size={12} />
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* ── Pagination ──────────────────────────────────────── */}
                    {totalTablePages > 1 && (
                      <div className="mt-6 flex items-center justify-between">
                        <p className="text-xs text-brand-gray font-body">
                          Page <span className="font-semibold text-brand-black">{tablePage}</span> of{' '}
                          <span className="font-semibold text-brand-black">{totalTablePages}</span>
                          {' · '}
                          {(tablePage - 1) * TABLE_PAGE_SIZE + 1}–{Math.min(tablePage * TABLE_PAGE_SIZE, tableFiltered.length)} of {tableFiltered.length}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setTablePage(p => Math.max(1, p - 1))}
                            disabled={tablePage === 1}
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-brand-border bg-white text-brand-gray hover:text-brand-green hover:border-brand-green disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <ChevronLeft size={16} />
                          </button>

                          {Array.from({ length: totalTablePages }, (_, i) => i + 1)
                            .filter(n => n === 1 || n === totalTablePages || Math.abs(n - tablePage) <= 1)
                            .reduce((acc, n, i, arr) => {
                              if (i > 0 && n - arr[i - 1] > 1) acc.push('…');
                              acc.push(n);
                              return acc;
                            }, [])
                            .map((item, i) =>
                              item === '…' ? (
                                <span key={`ellipsis-${i}`} className="text-brand-gray text-sm px-1">…</span>
                              ) : (
                                <button
                                  key={item}
                                  onClick={() => setTablePage(item)}
                                  className={`w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-semibold font-body transition-all ${tablePage === item
                                    ? 'bg-brand-green text-white border-brand-green shadow'
                                    : 'border-brand-border bg-white text-brand-gray hover:text-brand-green hover:border-brand-green'
                                    }`}
                                >
                                  {item}
                                </button>
                              )
                            )}

                          <button
                            onClick={() => setTablePage(p => Math.min(totalTablePages, p + 1))}
                            disabled={tablePage === totalTablePages}
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-brand-border bg-white text-brand-gray hover:text-brand-green hover:border-brand-green disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* View All CTA (homepage limited mode) */}
        {limit && projects.length > limit && (
          <div className="text-center mt-12">
            <Button variant="primary" to="/projects" className="flex items-center gap-2 mx-auto">
              View All Projects
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Project Card sub-component ───────────────────────────────────────────────
function ProjectCard({ project, compact = false }) {
  return (
    <Card className="flex flex-col h-full overflow-hidden p-0 group/card">
      <div className={`relative ${compact ? 'h-44' : 'h-56'} w-full overflow-hidden bg-brand-bg`}>
        {project.images && project.images.length > 0 ? (
          <img
            src={project.images[0].url}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-gray bg-gray-100 text-sm font-body">
            No Image
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge type="status">{project.status}</Badge>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
          <Badge type="category">{project.category}</Badge>
        </div>

        <h3 className={`font-bold font-display text-brand-black mb-2 line-clamp-2 hover:text-brand-green transition-colors ${compact ? 'text-base' : 'text-xl'}`}>
          <Link to={`/projects/${project._id}`}>{project.title}</Link>
        </h3>

        {!compact && (
          <p className="font-body text-sm text-brand-gray leading-relaxed mb-4 line-clamp-3">
            {project.description}
          </p>
        )}

        <div className="mt-auto border-t border-brand-border/60 pt-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-brand-gray font-body">
            <MapPin size={12} className="text-brand-green shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-brand-black font-body">
              Budget: <span className="text-brand-green">{project.budget}</span>
            </span>
            <Link
              to={`/projects/${project._id}`}
              className="font-body text-xs font-bold text-brand-green hover:text-brand-green-hover flex items-center gap-1 group/btn"
            >
              Details
              <ArrowRight size={11} className="group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ProjectsGrid;
