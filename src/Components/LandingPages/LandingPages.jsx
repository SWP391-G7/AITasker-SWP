import React from 'react'
import './LandingPages.css'
import { Search, MessageSquare, BarChart3, GitFork, Cpu, FileEdit, Users, ShieldCheck, Star, ChevronLeft, ChevronRight } from 'lucide-react'

// Import expert headshots
import expertSarah from './image/expert_sarah.png'
import expertMarcus from './image/expert_marcus.png'
import expertElena from './image/expert_elena.png'
import expertDavid from './image/expert_david.png'

const LandingPages = () => {
  const handleSearch = (e) => {
    e.preventDefault()
  }

  const services = [
    {
      icon: <MessageSquare size={24} className="text-primary" />,
      bg: "rgba(59, 130, 246, 0.1)",
      title: "Custom Chatbots",
      desc: "Intelligent conversational agents tailored to your business knowledge",
      tags: ["NLP", "Support"]
    },
    {
      icon: <BarChart3 size={24} className="text-success" />,
      bg: "rgba(16, 185, 129, 0.1)",
      title: "Data Analytics",
      desc: "Predictive modeling and deep insights from your structured data.",
      tags: ["Prediction", "BI"]
    },
    {
      icon: <GitFork size={24} className="text-info" />,
      bg: "rgba(6, 182, 212, 0.1)",
      title: "Workflow Auto",
      desc: "Connect systems and automate repetitive tasks with AI agents.",
      tags: ["RPA", "Integration"]
    },
    {
      icon: <Cpu size={24} className="text-danger" />,
      bg: "rgba(239, 68, 68, 0.1)",
      title: "ML Models",
      desc: "Bespoke machine learning models trained on proprietary datasets.",
      tags: ["Training", "Vision"]
    }
  ]

  const experts = [
    {
      img: expertSarah,
      name: "Dr. Sarah Chen",
      role: "Senior ML Engineer",
      rating: "4.9",
      rate: "$120/hr"
    },
    {
      img: expertMarcus,
      name: "Marcus Johnson",
      role: "NLP Specialist",
      rating: "5.0",
      rate: "$95/hr"
    },
    {
      img: expertElena,
      name: "Elena Rodriguez",
      role: "AI Automation Expert",
      rating: "4.8",
      rate: "$85/hr"
    },
    {
      img: expertDavid,
      name: "David Kim",
      role: "Computer Vision Eng",
      rating: "4.9",
      rate: "$110/hr"
    }
  ]

  return (
    <div className="landing-wrapper">
      {/* 1. Hero Section */}
      <section className="hero-section d-flex align-items-center justify-content-center min-vh-100">
        <div className="container text-center hero-content">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-9">
              <h1 className="hero-title mb-4">
                Automate Your Business with <br />
                <span className="gradient-text">Top AI Experts</span>
              </h1>
              
              <p className="hero-description lead mb-5">
                The premium B2B marketplace for custom AI solutions, from advanced 
                machine learning models to intelligent workflow automation.
              </p>
              
              <form className="search-box-wrapper mx-auto mb-5 d-flex align-items-center" onSubmit={handleSearch}>
                <div className="search-icon-container ms-3 me-2">
                  <Search size={20} className="search-icon" />
                </div>
                <input 
                  type="text" 
                  className="form-control search-input shadow-none border-0 bg-transparent text-white" 
                  placeholder="What AI solution do you need? (e.g. LLM integration)" 
                  required
                />
                <button type="submit" className="btn search-button py-2 px-4 me-1 fw-bold rounded-pill">
                  Search
                </button>
              </form>
              
              <div className="cta-wrapper d-flex flex-sm-row flex-column justify-content-center gap-3">
                <button className="btn btn-primary btn-lg fw-bold rounded-3 px-4 py-3">
                  Hire an Expert
                </button>
                <button className="btn btn-secondary btn-lg fw-bold rounded-3 px-4 py-3">
                  Post a Job
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Services Section */}
      <section className="services-section py-5">
        <div className="container px-3 px-sm-5">
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div className="text-start">
              <h2 className="section-title fw-extrabold mb-2 text-white">Popular Services</h2>
              <p className="section-subtitle text-muted mb-0">In-demand AI capabilities for enterprise</p>
            </div>
            <a href="#services" className="view-all-link fw-bold text-decoration-none d-flex align-items-center gap-1">
              View all services <span className="arrow-icon">→</span>
            </a>
          </div>
          
          <div className="row g-4">
            {services.map((svc, idx) => (
              <div key={idx} className="col-12 col-sm-6 col-lg-3">
                <div className="service-card p-4 h-100 d-flex flex-column align-items-start text-start">
                  <div className="service-icon-box mb-4 d-flex align-items-center justify-content-center" style={{ backgroundColor: svc.bg }}>
                    {svc.icon}
                  </div>
                  <h3 className="service-card-title fw-bold mb-2">{svc.title}</h3>
                  <p className="service-card-desc text-muted mb-4">{svc.desc}</p>
                  <div className="service-tags mt-auto d-flex gap-2">
                    {svc.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="service-tag px-3 py-1 rounded-pill">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="how-it-works-section py-5 text-center">
        <div className="container px-3 px-sm-5 py-4">
          <h2 className="section-title fw-extrabold mb-2 text-white">How It Works</h2>
          <p className="section-subtitle text-muted mb-5">Streamlined procurement for AI talent</p>
          
          <div className="position-relative mt-5">
            {/* Horizontal Line connecting badges */}
            <div className="timeline-line d-none d-lg-block"></div>
            
            <div className="row justify-content-between g-5 position-relative z-2">
              <div className="col-12 col-lg-4 text-center">
                <div className="timeline-badge-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                  <FileEdit size={20} className="text-primary" />
                </div>
                <h3 className="step-title fw-bold mb-3">1. Post a Job</h3>
                <p className="step-desc text-muted px-lg-4">
                  Describe your AI project requirements, timeline, and budget.
                </p>
              </div>
              
              <div className="col-12 col-lg-4 text-center">
                <div className="timeline-badge-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                  <Users size={20} className="text-primary" />
                </div>
                <h3 className="step-title fw-bold mb-3">2. Match with Experts</h3>
                <p className="step-desc text-muted px-lg-4">
                  Review proposals from vetted AI specialists and data scientists.
                </p>
              </div>
              
              <div className="col-12 col-lg-4 text-center">
                <div className="timeline-badge-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                  <ShieldCheck size={20} className="text-primary" />
                </div>
                <h3 className="step-title fw-bold mb-3">3. Safely Pay via Escrow</h3>
                <p className="step-desc text-muted px-lg-4">
                  Funds are securely held until you approve the delivered work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Experts Section */}
      <section className="experts-section py-5">
        <div className="container px-3 px-sm-5 py-4">
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div className="text-start">
              <h2 className="section-title fw-extrabold mb-2 text-white">Featured Experts</h2>
              <p className="section-subtitle text-muted mb-0">Top-rated professionals ready to hire</p>
            </div>
            <div className="carousel-nav d-none d-sm-flex gap-2">
              <button className="carousel-btn d-flex align-items-center justify-content-center" aria-label="Previous">
                <ChevronLeft size={20} />
              </button>
              <button className="carousel-btn d-flex align-items-center justify-content-center" aria-label="Next">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="row g-4">
            {experts.map((exp, idx) => (
              <div key={idx} className="col-12 col-sm-6 col-lg-3">
                <div className="expert-card p-4 h-100 text-center d-flex flex-column align-items-center">
                  <div className="expert-avatar-wrapper mb-4 position-relative">
                    <img src={exp.img} alt={exp.name} className="expert-avatar-img" />
                    <div className="expert-rating px-2 py-1 rounded-pill d-flex align-items-center gap-1 shadow">
                      <Star size={12} className="text-warning fill-warning" />
                      <span>{exp.rating}</span>
                    </div>
                  </div>
                  <h3 className="expert-name fw-bold mb-1">{exp.name}</h3>
                  <p className="expert-role text-muted mb-4">{exp.role}</p>
                  
                  <div className="expert-footer w-100 mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                    <span className="expert-rate fw-bold">{exp.rate}</span>
                    <button className="btn btn-hire px-3 py-2 fw-semibold rounded-3 text-white">
                      Hire Me
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="footer-section py-5 mt-5">
        <div className="container px-3 px-sm-5">
          <div className="footer-divider mb-5"></div>
          <div className="row align-items-center justify-content-between g-4">
            <div className="col-12 col-md-3 text-center text-md-start">
              <span className="footer-brand fw-extrabold fs-4">AITasker</span>
            </div>
            
            <div className="col-12 col-md-6">
              <div className="d-flex flex-wrap justify-content-center gap-4 footer-links">
                <a href="#privacy" className="footer-link text-muted text-decoration-none">Privacy Policy</a>
                <a href="#terms" className="footer-link text-muted text-decoration-none">Terms of Service</a>
                <a href="#help" className="footer-link text-muted text-decoration-none">Help Center</a>
                <a href="#api" className="footer-link text-muted text-decoration-none">API Documentation</a>
              </div>
            </div>
            
            <div className="col-12 col-md-3 text-center text-md-end text-muted copyright-text">
              © 2026 AITasker. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPages
