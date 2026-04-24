"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const express_1 = __importDefault(require("express"));
const projects_1 = require("./data/projects");
const site_1 = require("./data/site");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
// Resolve views/public relative to project root (works for both `tsx` and compiled `dist`).
const ROOT = node_path_1.default.resolve(__dirname, '..');
app.set('view engine', 'pug');
app.set('views', node_path_1.default.join(ROOT, 'src', 'views'));
// Static assets (images, css, htmx, app.js)
app.use(express_1.default.static(node_path_1.default.join(ROOT, 'public'), { maxAge: '1h', etag: true }));
// Form-encoded body parser for the contact form
app.use(express_1.default.urlencoded({ extended: false, limit: '32kb' }));
const baseLocals = {
    site: {
        url: site_1.SITE_URL,
        name: site_1.SITE_NAME,
        title: site_1.SITE_TITLE,
        description: site_1.SITE_DESCRIPTION,
        contactEmail: site_1.CONTACT_EMAIL,
    },
    navLinks: site_1.navLinks,
    heroStats: site_1.heroStats,
    skills: site_1.skills,
    experience: site_1.experience,
    highlights: site_1.highlights,
    socialLinks: site_1.socialLinks,
    projects: projects_1.projects,
    year: new Date().getFullYear(),
};
const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebSite',
            '@id': `${site_1.SITE_URL}/#website`,
            url: site_1.SITE_URL,
            name: site_1.SITE_TITLE,
            description: site_1.SITE_DESCRIPTION,
            inLanguage: 'en-US',
        },
        {
            '@type': 'Person',
            '@id': `${site_1.SITE_URL}/#person`,
            name: 'Umais Ali',
            url: site_1.SITE_URL,
            jobTitle: 'SEO Executive',
            description: 'SEO strategist and executor with 5+ years of experience helping businesses build organic search channels that compound over time.',
            knowsAbout: [
                'Search Engine Optimization',
                'Technical SEO',
                'Content Strategy',
                'Keyword Research',
                'Link Building',
                'Google Analytics',
                'Google Search Console',
                'SEO Audits',
                'Site Migration',
                'Core Web Vitals',
            ],
            sameAs: site_1.socialLinks.map((l) => l.href),
        },
        {
            '@type': 'ProfilePage',
            '@id': `${site_1.SITE_URL}/#profilepage`,
            url: site_1.SITE_URL,
            name: site_1.SITE_TITLE,
            isPartOf: { '@id': `${site_1.SITE_URL}/#website` },
            about: { '@id': `${site_1.SITE_URL}/#person` },
            mainEntity: { '@id': `${site_1.SITE_URL}/#person` },
            inLanguage: 'en-US',
        },
    ],
};
app.get('/', (_req, res) => {
    res.render('index', { ...baseLocals, jsonLd });
});
// HTMX: return a single project's modal markup for inline injection.
app.get('/projects/:id', (req, res) => {
    const id = Number(req.params.id);
    const project = projects_1.projects.find((p) => p.id === id);
    if (!project) {
        res.status(404).send('Project not found');
        return;
    }
    const index = projects_1.projects.findIndex((p) => p.id === id);
    res.render('partials/project-modal-content', {
        project,
        hasPrev: index > 0,
        hasNext: index < projects_1.projects.length - 1,
        prevId: index > 0 ? projects_1.projects[index - 1].id : null,
        nextId: index < projects_1.projects.length - 1 ? projects_1.projects[index + 1].id : null,
    });
});
// ── Contact form ────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
app.post('/contact', (req, res) => {
    const body = req.body;
    const name = (body.name ?? '').toString().trim();
    const email = (body.email ?? '').toString().trim();
    const message = (body.message ?? '').toString().trim();
    const honeypot = (body.website ?? '').toString().trim();
    // Silently accept honeypot hits to avoid signaling bots.
    if (honeypot.length > 0) {
        res.render('partials/contact-success', { name: name || 'there' });
        return;
    }
    const errors = {};
    if (name.length < 2 || name.length > 80)
        errors.name = 'Please enter your name (2–80 characters).';
    if (!EMAIL_RE.test(email) || email.length > 200)
        errors.email = 'Please enter a valid email address.';
    if (message.length < 10 || message.length > 4000)
        errors.message = 'Please write a message between 10 and 4000 characters.';
    if (Object.keys(errors).length > 0) {
        res.status(422).render('partials/contact-form', {
            values: { name, email, message },
            errors,
        });
        return;
    }
    // In a real deployment this would dispatch via SMTP / a transactional API.
    // For now we log and respond with the success fragment HTMX will swap in.
    console.log('[contact] new message', { name, email, length: message.length });
    res.render('partials/contact-success', { name });
});
// 404 fallback
app.use((_req, res) => {
    res.status(404).render('404', baseLocals);
});
app.listen(PORT, () => {
    console.log(`▸ umais-ali listening on http://localhost:${PORT}`);
});
