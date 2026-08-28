<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MAISON LUMIÈRE — Thời Trang Cao Cấp</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Josefin+Sans:wght@100;200;300;400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --gold: #C9A96E;
    --gold-light: #E8CFA0;
    --gold-dark: #8B6914;
    --cream: #FAF7F2;
    --ink: #1A1208;
    --warm-gray: #6B6055;
    --gradient-hero: linear-gradient(135deg, #0D0A07 0%, #1F1409 30%, #2D1E0A 60%, #1A1208 100%);
    --gradient-gold: linear-gradient(135deg, #C9A96E 0%, #E8CFA0 40%, #C9A96E 70%, #A07830 100%);
    --gradient-section: linear-gradient(180deg, #FAF7F2 0%, #F0E8DB 100%);
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Josefin Sans', sans-serif;
    background: var(--ink);
    color: var(--cream);
    overflow-x: hidden;
    cursor: none;
  }

  /* Custom cursor */
  .cursor {
    width: 12px; height: 12px;
    background: var(--gold);
    border-radius: 50%;
    position: fixed; top: 0; left: 0;
    pointer-events: none; z-index: 9999;
    transition: transform 0.15s ease, width 0.3s, height 0.3s, background 0.3s;
    transform: translate(-50%, -50%);
  }
  .cursor-ring {
    width: 36px; height: 36px;
    border: 1px solid rgba(201,169,110,0.5);
    border-radius: 50%;
    position: fixed; top: 0; left: 0;
    pointer-events: none; z-index: 9998;
    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    transform: translate(-50%, -50%);
  }
  body:has(a:hover) .cursor, body:has(button:hover) .cursor { transform: translate(-50%,-50%) scale(2); }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.5rem 4rem;
    transition: background 0.6s ease, padding 0.4s ease;
  }
  nav.scrolled {
    background: rgba(13,10,7,0.92);
    backdrop-filter: blur(20px);
    padding: 1rem 4rem;
    border-bottom: 1px solid rgba(201,169,110,0.15);
  }
  .logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem; font-weight: 300; letter-spacing: 0.4em;
    background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .nav-links { display: flex; gap: 2.5rem; list-style: none; }
  .nav-links a {
    font-size: 0.7rem; letter-spacing: 0.25em; text-decoration: none;
    color: rgba(250,247,242,0.6); transition: color 0.3s;
    position: relative; padding-bottom: 4px;
  }
  .nav-links a::after {
    content: ''; position: absolute; bottom: 0; left: 0;
    width: 0; height: 1px; background: var(--gold);
    transition: width 0.4s ease;
  }
  .nav-links a:hover { color: var(--gold-light); }
  .nav-links a:hover::after { width: 100%; }
  .nav-cta {
    font-size: 0.65rem; letter-spacing: 0.25em;
    border: 1px solid rgba(201,169,110,0.4); padding: 0.6rem 1.8rem;
    background: transparent; color: var(--gold-light);
    cursor: none; transition: all 0.4s; text-transform: uppercase;
  }
  .nav-cta:hover { background: var(--gold); color: var(--ink); border-color: var(--gold); }

  /* HERO */
  .hero {
    min-height: 100vh;
    background: var(--gradient-hero);
    display: flex; align-items: center;
    position: relative; overflow: hidden;
  }
  .hero-bg-pattern {
    position: absolute; inset: 0;
    background-image:
      radial-gradient(ellipse 80% 80% at 80% 50%, rgba(201,169,110,0.07) 0%, transparent 70%),
      radial-gradient(ellipse 40% 60% at 20% 80%, rgba(201,169,110,0.04) 0%, transparent 60%);
  }
  .hero-lines {
    position: absolute; inset: 0;
    background-image: repeating-linear-gradient(
      90deg,
      transparent 0, transparent calc(12.5% - 0.5px),
      rgba(201,169,110,0.04) calc(12.5% - 0.5px), rgba(201,169,110,0.04) 12.5%
    );
  }
  .hero-content {
    position: relative; z-index: 2;
    padding: 0 4rem; max-width: 680px;
    animation: heroReveal 1.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes heroReveal {
    from { opacity: 0; transform: translateY(60px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .hero-eyebrow {
    font-size: 0.65rem; letter-spacing: 0.5em; color: var(--gold);
    margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem;
  }
  .hero-eyebrow::before {
    content: ''; width: 40px; height: 1px; background: var(--gold);
  }
  .hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(4rem, 8vw, 7.5rem);
    font-weight: 300; line-height: 0.92;
    letter-spacing: -0.02em;
    margin-bottom: 1.5rem;
  }
  .hero-title em {
    font-style: italic;
    background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .hero-subtitle {
    font-size: 0.75rem; letter-spacing: 0.2em; color: rgba(250,247,242,0.5);
    line-height: 2; margin-bottom: 3rem; max-width: 380px;
  }
  .hero-buttons { display: flex; gap: 1.5rem; align-items: center; }
  .btn-primary {
    font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase;
    padding: 1.1rem 3rem; cursor: none; text-decoration: none;
    background: var(--gradient-gold); color: var(--ink);
    font-family: 'Josefin Sans', sans-serif; font-weight: 400;
    position: relative; overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
    box-shadow: 0 0 40px rgba(201,169,110,0.2);
  }
  .btn-primary::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, #E8CFA0, #C9A96E);
    opacity: 0; transition: opacity 0.3s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(201,169,110,0.35); }
  .btn-ghost {
    font-size: 0.65rem; letter-spacing: 0.3em;
    color: rgba(250,247,242,0.6); text-decoration: none;
    display: flex; align-items: center; gap: 0.8rem;
    transition: color 0.3s;
  }
  .btn-ghost svg { transition: transform 0.3s; }
  .btn-ghost:hover { color: var(--gold-light); }
  .btn-ghost:hover svg { transform: translateX(5px); }

  /* Hero image collage */
  .hero-visual {
    position: absolute; right: 0; top: 0; bottom: 0; width: 50%;
    overflow: hidden;
    animation: heroVisual 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
  }
  @keyframes heroVisual {
    from { opacity: 0; clip-path: inset(0 0 0 100%); }
    to { opacity: 1; clip-path: inset(0 0 0 0%); }
  }
  .hero-visual-inner {
    position: absolute; inset: 0;
    background:
      linear-gradient(to right, var(--ink) 0%, transparent 20%),
      linear-gradient(135deg, #1C1208 0%, #2D1E0A 40%, #3D2510 60%, #1A1208 100%);
    display: flex; align-items: center; justify-content: center;
  }
  .dress-showcase {
    position: relative; width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
  }
  .dress-silhouette {
    position: absolute;
    animation: floatDress 8s ease-in-out infinite;
  }
  @keyframes floatDress { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-20px) rotate(1deg); } }
  .glow-orb {
    position: absolute; border-radius: 50%;
    filter: blur(80px); pointer-events: none;
    animation: orb 6s ease-in-out infinite;
  }
  @keyframes orb { 0%,100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.2); opacity: 0.5; } }

  /* MARQUEE */
  .marquee-section {
    padding: 1.5rem 0; overflow: hidden;
    border-top: 1px solid rgba(201,169,110,0.15);
    border-bottom: 1px solid rgba(201,169,110,0.15);
    background: linear-gradient(90deg, rgba(201,169,110,0.05) 0%, rgba(201,169,110,0.02) 100%);
  }
  .marquee-track {
    display: flex; gap: 4rem;
    animation: marquee 20s linear infinite;
    white-space: nowrap;
  }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .marquee-item {
    font-size: 0.6rem; letter-spacing: 0.4em;
    color: rgba(201,169,110,0.5); display: flex; align-items: center; gap: 2rem;
  }
  .marquee-dot { width: 3px; height: 3px; background: var(--gold); border-radius: 50%; }

  /* FEATURED */
  .section { padding: 8rem 4rem; }
  .section-header { text-align: center; margin-bottom: 5rem; }
  .section-eyebrow {
    font-size: 0.6rem; letter-spacing: 0.5em; color: var(--gold);
    margin-bottom: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 1.5rem;
  }
  .section-eyebrow::before, .section-eyebrow::after {
    content: ''; flex: 1; max-width: 60px; height: 1px; background: var(--gold); opacity: 0.5;
  }
  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 300;
    line-height: 1.1; letter-spacing: -0.01em;
  }
  .section-title em { font-style: italic; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

  /* PRODUCT GRID */
  .products-section { background: linear-gradient(180deg, #0D0A07 0%, #160F06 100%); }
  .product-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
    margin-top: 4rem;
  }
  .product-card {
    position: relative; overflow: hidden; cursor: none;
    aspect-ratio: 3/4;
  }
  .product-card:first-child { grid-row: span 2; aspect-ratio: auto; }
  .product-bg {
    position: absolute; inset: 0;
    transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .product-card:hover .product-bg { transform: scale(1.06); }
  .product-1 { background: linear-gradient(160deg, #1C1009 0%, #2D1E0A 30%, #3D2A12 60%, #8B6914 100%); }
  .product-2 { background: linear-gradient(160deg, #08111A 0%, #0D1E2B 40%, #1A3040 100%); }
  .product-3 { background: linear-gradient(160deg, #0F0A14 0%, #1E1228 40%, #2D1A3D 100%); }
  .product-4 { background: linear-gradient(160deg, #0A1209 0%, #142012 40%, #1E3020 100%); }
  .product-5 { background: linear-gradient(160deg, #14090A 0%, #240F10 40%, #3D1A1C 100%); }
  .product-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(13,10,7,0.9) 0%, rgba(13,10,7,0.1) 50%, transparent 100%);
    display: flex; flex-direction: column; justify-content: flex-end;
    padding: 2rem;
    opacity: 0.8; transition: opacity 0.4s;
  }
  .product-card:hover .product-overlay { opacity: 1; }
  .product-tag {
    font-size: 0.55rem; letter-spacing: 0.35em; color: var(--gold);
    margin-bottom: 0.5rem;
  }
  .product-name {
    font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 300;
    line-height: 1.1; margin-bottom: 0.5rem;
  }
  .product-price {
    font-size: 0.65rem; letter-spacing: 0.2em;
    color: rgba(250,247,242,0.5);
  }
  .product-cta {
    position: absolute; top: 1.5rem; right: 1.5rem;
    width: 44px; height: 44px; border: 1px solid rgba(201,169,110,0.3);
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%;
    opacity: 0; transform: translateY(-10px);
    transition: all 0.4s;
    background: rgba(13,10,7,0.6); backdrop-filter: blur(10px);
    cursor: none;
  }
  .product-card:hover .product-cta { opacity: 1; transform: translateY(0); }
  .product-cta svg { width: 18px; height: 18px; stroke: var(--gold); }

  /* SVG dress illustrations inside cards */
  .card-illustration {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    opacity: 0.4; pointer-events: none;
    transition: opacity 0.4s, transform 0.6s;
  }
  .product-card:hover .card-illustration { opacity: 0.6; transform: scale(1.03) translateY(-10px); }

  /* STORY SECTION */
  .story-section {
    background: var(--cream);
    color: var(--ink);
    display: grid; grid-template-columns: 1fr 1fr; gap: 0;
    overflow: hidden;
  }
  .story-visual {
    background: linear-gradient(135deg, #2D1E0A 0%, #C9A96E 50%, #8B6914 100%);
    position: relative; overflow: hidden; min-height: 600px;
    display: flex; align-items: center; justify-content: center;
  }
  .story-visual-pattern {
    position: absolute; inset: 0;
    background-image: repeating-conic-gradient(rgba(250,247,242,0.05) 0% 25%, transparent 0% 50%);
    background-size: 40px 40px;
  }
  .story-text {
    padding: 6rem 5rem;
    display: flex; flex-direction: column; justify-content: center;
  }
  .story-text .section-eyebrow { justify-content: flex-start; color: var(--gold-dark); }
  .story-text .section-eyebrow::before { display: none; }
  .story-text .section-eyebrow::after { display: none; }
  .story-text .section-title { color: var(--ink); }
  .story-body {
    font-family: 'Cormorant Garamond', serif; font-size: 1.15rem;
    line-height: 1.9; color: #6B6055; margin: 2rem 0;
    font-weight: 300;
  }
  .story-stats {
    display: flex; gap: 3rem; margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(107,96,85,0.2);
  }
  .stat-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.5rem; font-weight: 300; color: var(--ink); line-height: 1;
  }
  .stat-num span { background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .stat-label { font-size: 0.6rem; letter-spacing: 0.3em; color: var(--warm-gray); margin-top: 0.4rem; }

  /* FEATURES STRIP */
  .features-strip {
    background: var(--ink);
    display: grid; grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid rgba(201,169,110,0.1);
    border-bottom: 1px solid rgba(201,169,110,0.1);
  }
  .feature-item {
    padding: 3.5rem 2.5rem;
    border-right: 1px solid rgba(201,169,110,0.1);
    text-align: center;
    transition: background 0.4s;
  }
  .feature-item:last-child { border-right: none; }
  .feature-item:hover { background: rgba(201,169,110,0.04); }
  .feature-icon {
    width: 48px; height: 48px; margin: 0 auto 1.5rem;
    border: 1px solid rgba(201,169,110,0.3); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
  }
  .feature-icon svg { width: 22px; height: 22px; stroke: var(--gold); fill: none; }
  .feature-title { font-size: 0.75rem; letter-spacing: 0.2em; color: var(--cream); margin-bottom: 0.7rem; }
  .feature-desc { font-size: 0.6rem; letter-spacing: 0.1em; color: rgba(250,247,242,0.35); line-height: 1.8; }

  /* COLLECTION HERO */
  .collection-hero {
    min-height: 90vh;
    background: linear-gradient(135deg, #0A0F18 0%, #0D1620 25%, #151F30 50%, #1A1208 75%, #0D0A07 100%);
    position: relative; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    text-align: center;
  }
  .collection-hero-bg {
    position: absolute; inset: 0;
    background-image:
      radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,169,110,0.08) 0%, transparent 70%),
      radial-gradient(circle at 20% 20%, rgba(100,120,201,0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(201,169,110,0.05) 0%, transparent 50%);
  }
  .collection-hero-content { position: relative; z-index: 2; padding: 4rem; }
  .collection-season {
    display: inline-block; margin-bottom: 2rem;
    font-size: 0.6rem; letter-spacing: 0.5em;
    border: 1px solid rgba(201,169,110,0.3); padding: 0.6rem 2rem;
    color: var(--gold);
  }
  .collection-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(3.5rem, 8vw, 8rem); font-weight: 300;
    line-height: 0.95; letter-spacing: -0.02em;
    margin-bottom: 2rem;
  }
  .collection-title em { font-style: italic; display: block; color: var(--gold-light); }
  .collection-desc {
    max-width: 480px; margin: 0 auto 3rem;
    font-size: 0.75rem; letter-spacing: 0.15em; line-height: 2;
    color: rgba(250,247,242,0.45);
  }
  .collection-cta-group { display: flex; gap: 1rem; justify-content: center; }

  /* TESTIMONIALS */
  .testimonials-section {
    background: linear-gradient(180deg, #FAF7F2 0%, #F0E8DB 100%);
    color: var(--ink); padding: 8rem 4rem;
  }
  .testimonials-section .section-title { color: var(--ink); }
  .testimonials-section .section-eyebrow { color: var(--gold-dark); }
  .testimonials-section .section-eyebrow::before,
  .testimonials-section .section-eyebrow::after { background: var(--gold-dark); }
  .testimonial-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 4rem; }
  .testimonial-card {
    padding: 2.5rem; position: relative;
    border: 1px solid rgba(107,96,85,0.15);
    background: rgba(255,255,255,0.5);
    backdrop-filter: blur(10px);
    transition: transform 0.4s, box-shadow 0.4s;
  }
  .testimonial-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(107,96,85,0.15); }
  .testimonial-quote {
    font-family: 'Cormorant Garamond', serif; font-size: 4rem;
    color: var(--gold); line-height: 0.5; margin-bottom: 1.5rem; font-style: italic;
  }
  .testimonial-text {
    font-family: 'Cormorant Garamond', serif; font-size: 1.15rem;
    line-height: 1.8; color: var(--warm-gray); font-style: italic; font-weight: 300;
    margin-bottom: 2rem;
  }
  .testimonial-author { font-size: 0.6rem; letter-spacing: 0.3em; color: var(--warm-gray); }
  .testimonial-stars { color: var(--gold-dark); margin-bottom: 0.5rem; font-size: 0.7rem; }

  /* NEWSLETTER */
  .newsletter-section {
    padding: 8rem 4rem;
    background: var(--gradient-hero);
    text-align: center; position: relative; overflow: hidden;
  }
  .newsletter-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 80% at 50% 50%, rgba(201,169,110,0.06) 0%, transparent 70%);
  }
  .newsletter-section .section-title { font-size: clamp(2rem, 4vw, 3.5rem); }
  .newsletter-form {
    display: flex; gap: 0; margin: 3rem auto 0; max-width: 480px;
    border: 1px solid rgba(201,169,110,0.3);
  }
  .newsletter-input {
    flex: 1; padding: 1.1rem 1.5rem;
    background: transparent; border: none; outline: none;
    font-family: 'Josefin Sans', sans-serif; font-size: 0.7rem; letter-spacing: 0.15em;
    color: var(--cream);
  }
  .newsletter-input::placeholder { color: rgba(250,247,242,0.3); }
  .newsletter-submit {
    padding: 0 2rem; background: var(--gradient-gold);
    border: none; cursor: none;
    font-family: 'Josefin Sans', sans-serif; font-size: 0.6rem; letter-spacing: 0.3em;
    color: var(--ink); font-weight: 400; text-transform: uppercase;
    transition: opacity 0.3s;
  }
  .newsletter-submit:hover { opacity: 0.85; }
  .newsletter-note { font-size: 0.58rem; letter-spacing: 0.2em; color: rgba(250,247,242,0.25); margin-top: 1.2rem; }

  /* FOOTER */
  footer {
    background: #06040303;
    border-top: 1px solid rgba(201,169,110,0.1);
    padding: 5rem 4rem 2rem;
  }
  .footer-top {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 4rem;
    margin-bottom: 4rem;
  }
  .footer-brand .logo { font-size: 1.2rem; display: block; margin-bottom: 1.2rem; }
  .footer-tagline { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 0.95rem; color: rgba(250,247,242,0.3); line-height: 1.8; }
  .footer-col-title { font-size: 0.6rem; letter-spacing: 0.4em; color: var(--gold); margin-bottom: 1.5rem; }
  .footer-links { list-style: none; }
  .footer-links li { margin-bottom: 0.8rem; }
  .footer-links a { font-size: 0.65rem; letter-spacing: 0.15em; color: rgba(250,247,242,0.4); text-decoration: none; transition: color 0.3s; }
  .footer-links a:hover { color: var(--gold-light); }
  .footer-bottom {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 2rem; border-top: 1px solid rgba(201,169,110,0.08);
    font-size: 0.55rem; letter-spacing: 0.2em; color: rgba(250,247,242,0.2);
  }

  /* SCROLL ANIMATIONS */
  .reveal {
    opacity: 0; transform: translateY(40px);
    transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.35s; }
  .reveal-delay-4 { transition-delay: 0.5s; }

  /* LOADING */
  .page-loader {
    position: fixed; inset: 0; z-index: 9000;
    background: var(--ink);
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 1.5rem;
    transition: opacity 0.8s ease, visibility 0.8s ease;
  }
  .page-loader.hidden { opacity: 0; visibility: hidden; }
  .loader-logo {
    font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 300;
    letter-spacing: 0.5em;
    background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: loaderPulse 1.5s ease-in-out infinite;
  }
  @keyframes loaderPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
  .loader-bar { width: 200px; height: 1px; background: rgba(201,169,110,0.15); position: relative; overflow: hidden; }
  .loader-bar::after {
    content: ''; position: absolute; inset: 0;
    background: var(--gradient-gold);
    animation: loadProgress 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  @keyframes loadProgress { from { transform: translateX(-100%); } to { transform: translateX(0); } }

  @media (max-width: 1024px) {
    nav { padding: 1.5rem 2rem; }
    .nav-links { display: none; }
    .section { padding: 5rem 2rem; }
    .product-grid { grid-template-columns: 1fr 1fr; }
    .product-card:first-child { grid-row: auto; }
    .story-section { grid-template-columns: 1fr; }
    .story-visual { min-height: 350px; }
    .features-strip { grid-template-columns: 1fr 1fr; }
    .testimonial-grid { grid-template-columns: 1fr; }
    .footer-top { grid-template-columns: 1fr 1fr; }
    .hero-visual { display: none; }
    .hero-content { max-width: 100%; }
  }
</style>
</head>
<body>

<!-- LOADER -->
<div class="page-loader" id="loader">
  <div class="loader-logo">MAISON LUMIÈRE</div>
  <div class="loader-bar"></div>
</div>

<!-- CURSOR -->
<div class="cursor" id="cursor"></div>
<div class="cursor-ring" id="cursorRing"></div>

<!-- NAV -->
<nav id="nav">
  <div class="logo">MAISON LUMIÈRE</div>
  <ul class="nav-links">
    <li><a href="#collection">BỘ SƯU TẬP</a></li>
    <li><a href="#story">CÂU CHUYỆN</a></li>
    <li><a href="#featured">SẢN PHẨM</a></li>
    <li><a href="#contact">LIÊN HỆ</a></li>
  </ul>
  <button class="nav-cta">Đặt Hàng Ngay</button>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-bg-pattern"></div>
  <div class="hero-lines"></div>
  <div class="hero-content">
    <div class="hero-eyebrow">BỘ SƯU TẬP 2025</div>
    <h1 class="hero-title">
      Nghệ Thuật<br>
      <em>May Đo</em><br>
      Thuần Việt
    </h1>
    <p class="hero-subtitle">Mỗi đường may là một tuyên ngôn. Mỗi trang phục là một tác phẩm nghệ thuật được chế tác từ sự hoàn hảo thuần túy và vẻ đẹp vượt thời gian.</p>
    <div class="hero-buttons">
      <a href="#featured" class="btn-primary">Khám Phá Bộ Sưu Tập</a>
      <a href="#story" class="btn-ghost">
        Câu Chuyện Của Chúng Tôi
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
    </div>
  </div>

  <div class="hero-visual">
    <div class="hero-visual-inner">
      <!-- Glow orbs -->
      <div class="glow-orb" style="width:300px;height:300px;background:rgba(201,169,110,0.12);top:20%;left:30%;animation-delay:-2s;"></div>
      <div class="glow-orb" style="width:200px;height:200px;background:rgba(139,105,20,0.1);bottom:20%;right:20%;animation-delay:-4s;"></div>
      <!-- Dress SVG -->
      <div class="dress-silhouette">
        <svg width="320" height="560" viewBox="0 0 320 560" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="dressGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.9"/>
              <stop offset="40%" stop-color="#E8CFA0" stop-opacity="0.95"/>
              <stop offset="70%" stop-color="#C9A96E" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#8B6914" stop-opacity="0.7"/>
            </linearGradient>
            <linearGradient id="dressShade" x1="0%" y1="0%" x2="60%" y2="100%">
              <stop offset="0%" stop-color="rgba(250,247,242,0.15)"/>
              <stop offset="100%" stop-color="rgba(13,10,7,0.4)"/>
            </linearGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          <!-- Body -->
          <path d="M160 20 C145 20 130 30 125 50 L110 100 C100 110 95 125 92 140 L80 200 C75 220 72 240 70 260 L60 350 C55 380 50 410 48 440 L42 510 C40 520 42 530 48 535 L272 535 C278 530 280 520 278 510 L272 440 C270 410 265 380 260 350 L250 260 C248 240 245 220 240 200 L228 140 C225 125 220 110 210 100 L195 50 C190 30 175 20 160 20Z" fill="url(#dressGold)"/>
          <path d="M160 20 C145 20 130 30 125 50 L110 100 C100 110 95 125 92 140 L80 200 C75 220 72 240 70 260 L60 350 C55 380 50 410 48 440 L42 510 C40 520 42 530 48 535 L272 535 C278 530 280 520 278 510 L272 440 C270 410 265 380 260 350 L250 260 C248 240 245 220 240 200 L228 140 C225 125 220 110 210 100 L195 50 C190 30 175 20 160 20Z" fill="url(#dressShade)"/>

          <!-- Neckline -->
          <path d="M130 50 C140 45 150 42 160 42 C170 42 180 45 190 50" stroke="rgba(250,247,242,0.6)" stroke-width="1" fill="none"/>

          <!-- Waist detail -->
          <path d="M85 195 C105 188 125 184 160 184 C195 184 215 188 235 195" stroke="rgba(250,247,242,0.3)" stroke-width="0.5" fill="none"/>
          <path d="M82 202 C102 195 122 191 160 191 C198 191 218 195 238 202" stroke="rgba(250,247,242,0.2)" stroke-width="0.5" fill="none"/>

          <!-- Fabric texture lines -->
          <path d="M120 120 C118 180 115 240 110 300" stroke="rgba(250,247,242,0.15)" stroke-width="0.8" fill="none"/>
          <path d="M140 110 C138 170 136 230 132 290" stroke="rgba(250,247,242,0.1)" stroke-width="0.8" fill="none"/>
          <path d="M180 110 C182 170 184 230 188 290" stroke="rgba(250,247,242,0.1)" stroke-width="0.8" fill="none"/>
          <path d="M200 120 C202 180 205 240 210 300" stroke="rgba(250,247,242,0.15)" stroke-width="0.8" fill="none"/>

          <!-- Skirt flare lines -->
          <path d="M80 310 C60 380 50 430 45 480" stroke="rgba(250,247,242,0.1)" stroke-width="0.8" fill="none"/>
          <path d="M240 310 C260 380 270 430 275 480" stroke="rgba(250,247,242,0.1)" stroke-width="0.8" fill="none"/>

          <!-- Decorative embroidery at waist -->
          <g transform="translate(140, 185)" filter="url(#glow)">
            <circle cx="20" cy="0" r="2" fill="rgba(232,207,160,0.8)"/>
            <circle cx="30" cy="-3" r="1.5" fill="rgba(232,207,160,0.6)"/>
            <circle cx="10" cy="-3" r="1.5" fill="rgba(232,207,160,0.6)"/>
            <path d="M0 0 Q10 -8 20 0 Q30 -8 40 0" stroke="rgba(232,207,160,0.5)" stroke-width="0.5" fill="none"/>
          </g>

          <!-- Shoulder line -->
          <path d="M115 52 L105 98" stroke="rgba(250,247,242,0.3)" stroke-width="0.8"/>
          <path d="M205 52 L215 98" stroke="rgba(250,247,242,0.3)" stroke-width="0.8"/>
        </svg>
      </div>
    </div>
  </div>

  <!-- Scroll indicator -->
  <div style="position:absolute;bottom:3rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
    <div style="font-size:0.55rem;letter-spacing:0.4em;color:rgba(201,169,110,0.5);">CUỘN XUỐNG</div>
    <div style="width:1px;height:50px;background:linear-gradient(to bottom, rgba(201,169,110,0.5), transparent);animation:scrollIndicator 1.5s ease-in-out infinite;">
    </div>
  </div>
  <style>@keyframes scrollIndicator{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}51%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}</style>
</section>

<!-- MARQUEE -->
<div class="marquee-section">
  <div class="marquee-track" id="marqueeTrack">
    <span class="marquee-item">THỜI TRANG CAO CẤP <span class="marquee-dot"></span></span>
    <span class="marquee-item">MAY ĐO RIÊNG <span class="marquee-dot"></span></span>
    <span class="marquee-item">VẢI NHẬP KHẨU <span class="marquee-dot"></span></span>
    <span class="marquee-item">THIẾT KẾ ĐỘC QUYỀN <span class="marquee-dot"></span></span>
    <span class="marquee-item">THỜI TRANG CAO CẤP <span class="marquee-dot"></span></span>
    <span class="marquee-item">MAY ĐO RIÊNG <span class="marquee-dot"></span></span>
    <span class="marquee-item">VẢI NHẬP KHẨU <span class="marquee-dot"></span></span>
    <span class="marquee-item">THIẾT KẾ ĐỘC QUYỀN <span class="marquee-dot"></span></span>
    <span class="marquee-item">THỜI TRANG CAO CẤP <span class="marquee-dot"></span></span>
    <span class="marquee-item">MAY ĐO RIÊNG <span class="marquee-dot"></span></span>
    <span class="marquee-item">VẢI NHẬP KHẨU <span class="marquee-dot"></span></span>
    <span class="marquee-item">THIẾT KẾ ĐỘC QUYỀN <span class="marquee-dot"></span></span>
  </div>
</div>

<!-- PRODUCTS -->
<section class="products-section section" id="featured">
  <div class="section-header reveal">
    <div class="section-eyebrow">SẢN PHẨM NỔI BẬT</div>
    <h2 class="section-title">Những Tuyệt Tác<br><em>Được Chọn Lọc</em></h2>
  </div>

  <div class="product-grid">
    <!-- Card 1 - Large -->
    <div class="product-card reveal">
      <div class="product-bg product-1">
        <div class="card-illustration">
          <svg width="240" height="400" viewBox="0 0 240 400" fill="none">
            <defs>
              <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.8"/>
                <stop offset="100%" stop-color="#E8CFA0" stop-opacity="0.4"/>
              </linearGradient>
            </defs>
            <path d="M120 20 C108 20 96 28 92 44 L80 80 C72 88 68 100 66 112 L56 160 C52 175 50 192 48 208 L38 280 C34 304 30 330 28 356 L22 395 L218 395 L212 356 C210 330 206 304 202 280 L192 208 C190 192 188 175 184 160 L174 112 C172 100 168 88 160 80 L148 44 C144 28 132 20 120 20Z" fill="url(#g1)"/>
            <path d="M90 44 C100 38 110 35 120 35 C130 35 140 38 150 44" stroke="rgba(250,247,242,0.5)" stroke-width="1" fill="none"/>
            <path d="M60 155 C75 148 95 144 120 144 C145 144 165 148 180 155" stroke="rgba(250,247,242,0.2)" stroke-width="0.5" fill="none"/>
          </svg>
        </div>
      </div>
      <div class="product-overlay">
        <div class="product-tag">BỘ SƯU TẬP ĐÊM</div>
        <div class="product-name">Đầm Dạ Hội<br>Lumière Noir</div>
        <div class="product-price">TỪ 8.500.000 ₫</div>
      </div>
      <div class="product-cta">
        <svg viewBox="0 0 24 24" stroke-width="1.5"><path d="M12 5v14M5 12l7 7 7-7" fill="none"/></svg>
      </div>
    </div>

    <!-- Card 2 -->
    <div class="product-card reveal reveal-delay-1">
      <div class="product-bg product-2">
        <div class="card-illustration">
          <svg width="160" height="260" viewBox="0 0 160 260" fill="none">
            <defs>
              <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#6B8FBF" stop-opacity="0.7"/>
                <stop offset="100%" stop-color="#A0C4E8" stop-opacity="0.4"/>
              </linearGradient>
            </defs>
            <path d="M80 15 C72 15 64 20 60 30 L52 58 C46 64 43 72 42 80 L36 116 L28 170 L22 230 L138 230 L132 170 L124 116 L118 80 C117 72 114 64 108 58 L100 30 C96 20 88 15 80 15Z" fill="url(#g2)"/>
            <path d="M58 30 C65 26 72 24 80 24 C88 24 95 26 102 30" stroke="rgba(160,196,232,0.5)" stroke-width="0.8" fill="none"/>
          </svg>
        </div>
      </div>
      <div class="product-overlay">
        <div class="product-tag">THANH LỊCH</div>
        <div class="product-name">Áo Blazer<br>Bleu Minuit</div>
        <div class="product-price">TỪ 4.200.000 ₫</div>
      </div>
      <div class="product-cta">
        <svg viewBox="0 0 24 24" stroke-width="1.5"><path d="M12 5v14M5 12l7 7 7-7" fill="none"/></svg>
      </div>
    </div>

    <!-- Card 3 -->
    <div class="product-card reveal reveal-delay-2">
      <div class="product-bg product-3">
        <div class="card-illustration">
          <svg width="160" height="260" viewBox="0 0 160 260" fill="none">
            <defs>
              <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#9B7FC0" stop-opacity="0.7"/>
                <stop offset="100%" stop-color="#C4A8E8" stop-opacity="0.4"/>
              </linearGradient>
            </defs>
            <path d="M80 15 C68 15 58 22 54 36 L44 72 C36 82 32 94 30 106 L22 152 L16 212 L144 212 L138 152 L130 106 C128 94 124 82 116 72 L106 36 C102 22 92 15 80 15Z" fill="url(#g3)"/>
            <path d="M54 36 C62 30 70 27 80 27 C90 27 98 30 106 36" stroke="rgba(196,168,232,0.5)" stroke-width="0.8" fill="none"/>
          </svg>
        </div>
      </div>
      <div class="product-overlay">
        <div class="product-tag">SANG TRỌNG</div>
        <div class="product-name">Đầm Midi<br>Violet Dusk</div>
        <div class="product-price">TỪ 5.800.000 ₫</div>
      </div>
      <div class="product-cta">
        <svg viewBox="0 0 24 24" stroke-width="1.5"><path d="M12 5v14M5 12l7 7 7-7" fill="none"/></svg>
      </div>
    </div>

    <!-- Card 4 -->
    <div class="product-card reveal reveal-delay-1">
      <div class="product-bg product-4">
        <div class="card-illustration">
          <svg width="160" height="260" viewBox="0 0 160 260" fill="none">
            <defs>
              <linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#7AB87A" stop-opacity="0.7"/>
                <stop offset="100%" stop-color="#A8D4A8" stop-opacity="0.4"/>
              </linearGradient>
            </defs>
            <path d="M80 12 C68 12 58 20 54 32 L46 62 C38 70 34 82 32 94 L26 132 L20 200 L140 200 L134 132 L128 94 C126 82 122 70 114 62 L106 32 C102 20 92 12 80 12Z" fill="url(#g4)"/>
          </svg>
        </div>
      </div>
      <div class="product-overlay">
        <div class="product-tag">MÙA HÈ</div>
        <div class="product-name">Váy Liền<br>Vert Émeraude</div>
        <div class="product-price">TỪ 3.600.000 ₫</div>
      </div>
      <div class="product-cta">
        <svg viewBox="0 0 24 24" stroke-width="1.5"><path d="M12 5v14M5 12l7 7 7-7" fill="none"/></svg>
      </div>
    </div>

    <!-- Card 5 -->
    <div class="product-card reveal reveal-delay-2">
      <div class="product-bg product-5">
        <div class="card-illustration">
          <svg width="160" height="260" viewBox="0 0 160 260" fill="none">
            <defs>
              <linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#C07070" stop-opacity="0.7"/>
                <stop offset="100%" stop-color="#E8A8A8" stop-opacity="0.4"/>
              </linearGradient>
            </defs>
            <path d="M80 14 C68 14 58 21 55 34 L47 66 C40 74 36 86 34 98 L28 138 L22 205 L138 205 L132 138 L126 98 C124 86 120 74 113 66 L105 34 C102 21 92 14 80 14Z" fill="url(#g5)"/>
          </svg>
        </div>
      </div>
      <div class="product-overlay">
        <div class="product-tag">ĐẶC BIỆT</div>
        <div class="product-name">Đầm Cocktail<br>Rose Rubis</div>
        <div class="product-price">TỪ 6.900.000 ₫</div>
      </div>
      <div class="product-cta">
        <svg viewBox="0 0 24 24" stroke-width="1.5"><path d="M12 5v14M5 12l7 7 7-7" fill="none"/></svg>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES STRIP -->
<div class="features-strip">
  <div class="feature-item reveal">
    <div class="feature-icon">
      <svg viewBox="0 0 24 24" stroke-width="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    </div>
    <div class="feature-title">CHẤT LIỆU CAO CẤP</div>
    <div class="feature-desc">Vải nhập khẩu trực tiếp từ Milan và Paris</div>
  </div>
  <div class="feature-item reveal reveal-delay-1">
    <div class="feature-icon">
      <svg viewBox="0 0 24 24" stroke-width="1"><circle cx="12" cy="8" r="3"/><path d="M20.6 14.4C20 12.4 18.3 11 16.3 11H7.7c-2 0-3.7 1.4-4.3 3.4L2 20h20l-1.4-5.6z"/></svg>
    </div>
    <div class="feature-title">MAY ĐO RIÊNG</div>
    <div class="feature-desc">Mỗi sản phẩm được tạo ra chỉ dành cho bạn</div>
  </div>
  <div class="feature-item reveal reveal-delay-2">
    <div class="feature-icon">
      <svg viewBox="0 0 24 24" stroke-width="1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
    <div class="feature-title">GIAO HÀNG TOÀN QUỐC</div>
    <div class="feature-desc">Vận chuyển nhanh tới 63 tỉnh thành</div>
  </div>
  <div class="feature-item reveal reveal-delay-3">
    <div class="feature-icon">
      <svg viewBox="0 0 24 24" stroke-width="1"><path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z"/><path d="M12 6v6l4 2"/></svg>
    </div>
    <div class="feature-title">BẢO HÀNH TRỌN ĐỜI</div>
    <div class="feature-desc">Cam kết chất lượng và dịch vụ hậu mãi</div>
  </div>
</div>

<!-- STORY -->
<section class="story-section" id="story">
  <div class="story-visual">
    <div class="story-visual-pattern"></div>
    <svg width="220" height="380" viewBox="0 0 220 380" fill="none" style="position:relative;z-index:1;opacity:0.85">
      <defs>
        <linearGradient id="storyGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FAF7F2" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#E8CFA0" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#FAF7F2" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <path d="M110 18 C96 18 83 26 79 42 L66 82 C56 92 51 106 49 120 L37 174 L28 244 L20 345 L200 345 L192 244 L183 174 L171 120 C169 106 164 92 154 82 L141 42 C137 26 124 18 110 18Z" fill="url(#storyGold)" opacity="0.3"/>
      <path d="M110 18 C96 18 83 26 79 42 L66 82 C56 92 51 106 49 120 L37 174 L28 244 L20 345 L200 345 L192 244 L183 174 L171 120 C169 106 164 92 154 82 L141 42 C137 26 124 18 110 18Z" stroke="rgba(250,247,242,0.6)" stroke-width="1" fill="none"/>
      <path d="M79 42 C90 36 100 33 110 33 C120 33 130 36 141 42" stroke="rgba(250,247,242,0.5)" stroke-width="0.8" fill="none"/>
      <path d="M40 170 C58 163 78 159 110 159 C142 159 162 163 180 170" stroke="rgba(250,247,242,0.3)" stroke-width="0.5" fill="none"/>
      <!-- Decorative diamonds -->
      <path d="M110 155 L118 163 L110 171 L102 163Z" stroke="rgba(250,247,242,0.7)" stroke-width="0.5" fill="rgba(250,247,242,0.15)"/>
      <path d="M110 158 L115 163 L110 168 L105 163Z" fill="rgba(250,247,242,0.3)"/>
      <circle cx="130" cy="163" r="2" fill="rgba(250,247,242,0.4)"/>
      <circle cx="90" cy="163" r="2" fill="rgba(250,247,242,0.4)"/>
    </svg>
    <div style="position:absolute;bottom:3rem;left:3rem;right:3rem;text-align:center;">
      <div style="font-family:'Cormorant Garamond',serif;font-size:0.85rem;font-style:italic;color:rgba(250,247,242,0.6);letter-spacing:0.2em;line-height:2;">"Vẻ đẹp là ngôn ngữ<br>không cần dịch thuật"</div>
    </div>
  </div>
  <div class="story-text">
    <div class="section-eyebrow reveal">CÂU CHUYỆN CỦA CHÚNG TÔI</div>
    <h2 class="section-title reveal reveal-delay-1">Hành Trình<br>Từ <em>Đam Mê</em><br>Đến Kinh Điển</h2>
    <p class="story-body reveal reveal-delay-2">Maison Lumière được khai sinh năm 2008 tại Hà Nội bởi NTK Linh Phương với niềm tin rằng phụ nữ Việt xứng đáng với những trang phục cao cấp nhất thế giới — được tạo ra ngay trên đất nước mình.</p>
    <p class="story-body reveal reveal-delay-3">Mỗi chiếc váy là hành trình 60–120 giờ thủ công tỉ mỉ, từ bàn tay của những người thợ lành nghề nhất Việt Nam, với vải được tuyển chọn từ những nhà máy danh tiếng nhất châu Âu.</p>
    <div class="story-stats reveal reveal-delay-4">
      <div>
        <div class="stat-num"><span>15+</span></div>
        <div class="stat-label">NĂM KINH NGHIỆM</div>
      </div>
      <div>
        <div class="stat-num"><span>3.200+</span></div>
        <div class="stat-label">KHÁCH HÀNG VIP</div>
      </div>
      <div>
        <div class="stat-num"><span>42</span></div>
        <div class="stat-label">GIẢI THƯỞNG</div>
      </div>
    </div>
  </div>
</section>

<!-- COLLECTION HERO -->
<section class="collection-hero" id="collection">
  <div class="collection-hero-bg"></div>
  <!-- floating gold particles -->
  <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;" id="particleContainer"></div>
  <div class="collection-hero-content">
    <div class="collection-season reveal">THU ĐÔNG 2025</div>
    <h2 class="collection-title reveal reveal-delay-1">
      Nuit<br>
      <em>Dorée</em>
    </h2>
    <p class="collection-desc reveal reveal-delay-2">Bộ sưu tập lấy cảm hứng từ ánh hoàng kim của những buổi chiều tà Hà Nội — nơi ánh sáng và bóng tối giao thoa, tạo nên vẻ đẹp huyền hoặc không thể quên.</p>
    <div class="collection-cta-group reveal reveal-delay-3">
      <a href="#featured" class="btn-primary">Xem Toàn Bộ Bộ Sưu Tập</a>
      <a href="#" class="btn-ghost">
        Lookbook 2025
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="testimonials-section" id="reviews">
  <div class="section-header reveal">
    <div class="section-eyebrow">CẢM NHẬN KHÁCH HÀNG</div>
    <h2 class="section-title">Họ Nói Gì<br>Về <em>Chúng Tôi</em></h2>
  </div>
  <div class="testimonial-grid">
    <div class="testimonial-card reveal">
      <div class="testimonial-quote">"</div>
      <p class="testimonial-text">Chiếc váy cưới của tôi hoàn hảo đến từng chi tiết. Đội ngũ tại Maison Lumière đã biến giấc mơ thành hiện thực. Tôi cảm thấy như một nữ hoàng trong ngày trọng đại nhất của đời mình.</p>
      <div class="testimonial-stars">★★★★★</div>
      <div class="testimonial-author">NGUYỄN MAI ANH — HÀ NỘI</div>
    </div>
    <div class="testimonial-card reveal reveal-delay-1">
      <div class="testimonial-quote">"</div>
      <p class="testimonial-text">Chất liệu vải và đường may thực sự đẳng cấp thế giới. Tôi đã mặc nhiều thương hiệu quốc tế nhưng Maison Lumière cho tôi cảm giác trân trọng và được chăm sóc hơn bất kỳ nơi nào.</p>
      <div class="testimonial-stars">★★★★★</div>
      <div class="testimonial-author">TRẦN THU HƯƠNG — HỒ CHÍ MINH</div>
    </div>
    <div class="testimonial-card reveal reveal-delay-2">
      <div class="testimonial-quote">"</div>
      <p class="testimonial-text">Dịch vụ tư vấn tận tình, quy trình may đo chuyên nghiệp. Bộ suit tôi đặt đã nhận được vô số lời khen ngợi trong buổi tiệc công ty. Đây là đầu tư xứng đáng nhất của năm.</p>
      <div class="testimonial-stars">★★★★★</div>
      <div class="testimonial-author">LÊ BÍCH NGỌC — ĐÀ NẴNG</div>
    </div>
  </div>
</section>

<!-- NEWSLETTER -->
<section class="newsletter-section" id="contact">
  <div class="newsletter-bg"></div>
  <div style="position:relative;z-index:1;">
    <div class="section-eyebrow reveal" style="justify-content:center;">TIN TỨC & ƯU ĐÃI</div>
    <h2 class="section-title reveal reveal-delay-1">Nhận Thông Tin<br><em>Độc Quyền</em></h2>
    <p style="font-size:0.7rem;letter-spacing:0.15em;color:rgba(250,247,242,0.4);margin-top:1.5rem;" class="reveal reveal-delay-2">Đăng ký để nhận bộ sưu tập mới nhất, ưu đãi thành viên và lời mời dự các sự kiện riêng tư.</p>
    <form class="newsletter-form reveal reveal-delay-3" onsubmit="return false;">
      <input type="email" class="newsletter-input" placeholder="địa chỉ email của bạn">
      <button class="newsletter-submit">ĐĂNG KÝ</button>
    </form>
    <p class="newsletter-note reveal reveal-delay-4">Chúng tôi tôn trọng quyền riêng tư của bạn. Hủy đăng ký bất cứ lúc nào.</p>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-top">
    <div class="footer-brand">
      <span class="logo">MAISON LUMIÈRE</span>
      <p class="footer-tagline">Nơi nghệ thuật may mặc<br>gặp gỡ linh hồn người phụ nữ Việt.</p>
    </div>
    <div>
      <div class="footer-col-title">BỘ SƯU TẬP</div>
      <ul class="footer-links">
        <li><a href="#">Đầm Dạ Hội</a></li>
        <li><a href="#">Váy Cưới</a></li>
        <li><a href="#">Áo Dài Cách Tân</a></li>
        <li><a href="#">Trang Phục Công Sở</a></li>
        <li><a href="#">Ready-to-Wear</a></li>
      </ul>
    </div>
    <div>
      <div class="footer-col-title">DỊCH VỤ</div>
      <ul class="footer-links">
        <li><a href="#">May Đo Riêng</a></li>
        <li><a href="#">Tư Vấn Phong Cách</a></li>
        <li><a href="#">Sửa Chữa & Chỉnh Sửa</a></li>
        <li><a href="#">Cho Thuê Trang Phục</a></li>
        <li><a href="#">Gói Thành Viên VIP</a></li>
      </ul>
    </div>
    <div>
      <div class="footer-col-title">LIÊN HỆ</div>
      <ul class="footer-links">
        <li><a href="#">24 Tràng Tiền, Hoàn Kiếm, Hà Nội</a></li>
        <li><a href="#">+84 24 3456 7890</a></li>
        <li><a href="#">contact@maisonlumiere.vn</a></li>
        <li><a href="#">T2–T7: 9:00 – 19:00</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2025 MAISON LUMIÈRE. ALL RIGHTS RESERVED.</span>
    <span>THIẾT KẾ VỚI ♡ TẠI HÀ NỘI</span>
  </div>
</footer>

<script>
  // Loader
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('loader').classList.add('hidden');
    }, 2000);
  });

  // Cursor
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
    setTimeout(() => {
      cursorRing.style.left = mouseX + 'px';
      cursorRing.style.top = mouseY + 'px';
    }, 80);
  });

  // Nav scroll
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(r => observer.observe(r));

  // Particles
  const container = document.getElementById('particleContainer');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      background:rgba(201,169,110,${Math.random() * 0.4 + 0.1});
      border-radius:50%;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation: particleFloat ${Math.random() * 8 + 6}s ease-in-out ${Math.random() * 5}s infinite;
    `;
    container.appendChild(p);
  }
  const style = document.createElement('style');
  style.textContent = `@keyframes particleFloat {
    0%,100% { transform: translateY(0) translateX(0); opacity: 0.3; }
    25% { transform: translateY(-30px) translateX(15px); opacity: 0.7; }
    50% { transform: translateY(-15px) translateX(-10px); opacity: 0.5; }
    75% { transform: translateY(-40px) translateX(5px); opacity: 0.8; }
  }`;
  document.head.appendChild(style);

  // Smooth parallax on hero
  window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scroll = window.scrollY;
    if (scroll < window.innerHeight) {
      const heroContent = document.querySelector('.hero-content');
      if (heroContent) heroContent.style.transform = `translateY(${scroll * 0.25}px)`;
    }
  });
</script>
</body>
</html>