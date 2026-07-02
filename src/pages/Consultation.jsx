import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Clock, Briefcase, Building2, Phone, Mail, User, FileText } from 'lucide-react';
import { publicApi } from '../lib/publicApi';

const ENQUIRY_TYPES = [
  'Project Consultancy',
  'DPR Preparation',
  'Structural Design',
  'Road Safety Audit',
  'Water Supply & Distribution',
  'Surveying & Mapping',
  'Construction Management',
  'Other',
];

const CONTACT_TIMES = [
  'Morning (9 AM – 12 PM)',
  'Afternoon (12 PM – 3 PM)',
  'Evening (3 PM – 6 PM)',
  'Anytime',
];

const INITIAL = {
  fullName: '',
  phoneNumber: '',
  emailAddress: '',
  organisationName: '',
  enquiryType: 'Project Consultancy',
  preferredContactTime: '',
  description: '',
};

export function Consultation() {
  const [form, setForm]           = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await publicApi.post('/feedback/createResponse', form);
      setSuccess(true);
      setForm(INITIAL);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Something went wrong. Please try again or call us directly.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    'w-full px-4 py-2.5 border border-brand-border rounded-lg text-sm font-body text-brand-black bg-white focus:outline-none focus:border-brand-green transition-colors placeholder:text-brand-gray/50';
  const labelCls =
    'text-xs font-semibold text-brand-black uppercase tracking-wider font-body flex items-center gap-1.5 mb-1';

  return (
    <div className="flex flex-col w-full">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative py-20 bg-brand-black text-white text-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 select-none pointer-events-none"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1581094271901-8022df4466f9?auto=format&fit=crop&q=80&w=1600&h=400')` }}
        />
        <div className="relative z-10 px-4 md:px-8 max-w-4xl mx-auto">
          <div className="inline-block px-3 py-1 bg-brand-green/20 text-brand-green text-xs font-bold font-body uppercase tracking-wider rounded-full mb-4">
            Free Initial Consultation
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-display mb-4">
            Request a Consultation
          </h1>
          <p className="font-body text-base text-gray-300 max-w-xl mx-auto">
            Describe your project requirements and one of our directors will get back to you within one business day.
          </p>
        </div>
      </section>

      {/* ── Form section ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="px-4 md:px-8 lg:px-16 max-w-5xl mx-auto">

          {success ? (
            /* ── Success state ── */
            <div className="text-center py-16 flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={48} className="text-brand-green" />
              </div>
              <h2 className="text-3xl font-bold font-display text-brand-black mb-3">Request Submitted!</h2>
              <p className="font-body text-brand-gray text-base max-w-md mb-8">
                Thank you for reaching out. We've received your consultation request and our team will contact you at the preferred time.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-3 border border-brand-border rounded-lg text-sm font-semibold font-body text-brand-black hover:border-brand-green hover:text-brand-green transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">

              {/* ── Left: info panel ── */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-bold font-display text-brand-black mb-2">How It Works</h2>
                  <p className="text-sm font-body text-brand-gray leading-relaxed">
                    Fill in the form and our engineering team will review your requirements and respond within 24 hours.
                  </p>
                </div>
                {[
                  { icon: FileText, step: '01', title: 'Submit the Form', desc: 'Describe your project scope and requirements.' },
                  { icon: Clock,    step: '02', title: 'We Review',        desc: 'A director reviews your enquiry and prepares an initial response.' },
                  { icon: Phone,    step: '03', title: 'We Contact You',   desc: 'We call or email at your preferred time to discuss further.' },
                ].map(({ icon: Icon, step, title, desc }) => (
                  <div key={step} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-brand-green" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-brand-gray uppercase tracking-wider font-body">Step {step}</p>
                      <p className="text-sm font-bold font-display text-brand-black">{title}</p>
                      <p className="text-xs font-body text-brand-gray mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Right: form ── */}
              <div className="lg:col-span-8 bg-brand-bg/40 border border-brand-border/60 rounded-xl p-8 flex flex-col gap-5">
                <h2 className="text-xl font-bold font-display text-brand-black border-b border-brand-border/60 pb-4 mb-1">
                  Consultation Request Form
                </h2>

                {/* Row 1: Name + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="fullName" className={labelCls}>
                      <User size={12} /> Full Name *
                    </label>
                    <input id="fullName" name="fullName" type="text" required value={form.fullName} onChange={handleChange} placeholder="e.g. Rajesh Kumar" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className={labelCls}>
                      <Phone size={12} /> Phone Number *
                    </label>
                    <input id="phoneNumber" name="phoneNumber" type="tel" required value={form.phoneNumber} onChange={handleChange} placeholder="e.g. +91 98765 43210" className={inputCls} />
                  </div>
                </div>

                {/* Row 2: Email + Organisation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="emailAddress" className={labelCls}>
                      <Mail size={12} /> Email Address *
                    </label>
                    <input id="emailAddress" name="emailAddress" type="email" required value={form.emailAddress} onChange={handleChange} placeholder="e.g. rajesh@org.in" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="organisationName" className={labelCls}>
                      <Building2 size={12} /> Organisation
                    </label>
                    <input id="organisationName" name="organisationName" type="text" value={form.organisationName} onChange={handleChange} placeholder="e.g. PWD Maharashtra" className={inputCls} />
                  </div>
                </div>

                {/* Row 3: Enquiry type + Contact time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="enquiryType" className={labelCls}>
                      <Briefcase size={12} /> Enquiry Type
                    </label>
                    <select id="enquiryType" name="enquiryType" value={form.enquiryType} onChange={handleChange} className={inputCls}>
                      {ENQUIRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="preferredContactTime" className={labelCls}>
                      <Clock size={12} /> Preferred Contact Time
                    </label>
                    <select id="preferredContactTime" name="preferredContactTime" value={form.preferredContactTime} onChange={handleChange} className={inputCls}>
                      <option value="">Select a time slot</option>
                      {CONTACT_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className={labelCls}>
                    <FileText size={12} /> Project Requirements *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={5}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your project scope, location, budget range, and any key challenges or requirements…"
                    className={`${inputCls} resize-y`}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm font-body text-red-700">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-brand-green hover:bg-brand-green-hover text-white text-sm font-bold font-body rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Submit Consultation Request
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-brand-gray font-body">
                  Your details are kept confidential and used only to respond to your enquiry.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default Consultation;
