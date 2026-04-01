import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserShield,
  FaBookOpen,
  FaChartLine,
  FaRobot,
  FaClipboardCheck,
  FaArrowRight,
  FaChevronDown,
  FaStar,
  FaShieldAlt,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";
import PublicNavbar from "../../components/public/PublicNavbar";
import PublicFooter from "../../components/public/PublicFooter";
import "../../styles/public/home.css";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const previewData = {
  student: {
    label: "Étudiant",
    title: "Suivez vos cours et votre progression",
    subtitle:
      "Une vue simple pour reprendre les leçons, passer des quiz et visualiser l’avancement.",
    stats: [
      { label: "Cours actifs", value: "08" },
      { label: "Progression", value: "72%" },
      { label: "Quiz réussis", value: "14" },
    ],
    cards: [
      "Reprendre Algorithmique",
      "Quiz JavaScript aujourd’hui",
      "Recommandation personnalisée",
    ],
  },
  teacher: {
    label: "Enseignant",
    title: "Gérez vos cours et vos étudiants",
    subtitle:
      "Créez des contenus, publiez des quiz et observez les performances de vos classes.",
    stats: [
      { label: "Cours publiés", value: "12" },
      { label: "Étudiants", value: "186" },
      { label: "Taux complétion", value: "81%" },
    ],
    cards: [
      "Créer un nouveau cours",
      "Corriger les résultats du quiz",
      "Suivi de la classe M1",
    ],
  },
  admin: {
    label: "Admin",
    title: "Supervisez la plateforme en temps réel",
    subtitle:
      "Gardez une vue globale sur les utilisateurs, les contenus et l’activité générale.",
    stats: [
      { label: "Utilisateurs", value: "542" },
      { label: "Cours", value: "58" },
      { label: "Disponibilité", value: "99.9%" },
    ],
    cards: [
      "Gestion des comptes",
      "Contrôle des contenus",
      "Surveillance activité plateforme",
    ],
  },
};

const faqs = [
  {
    q: "Qu’est-ce que BrainUP ?",
    a: "BrainUP est une plateforme e-learning moderne qui réunit étudiants, enseignants et administrateurs dans un seul environnement clair, intelligent et évolutif.",
  },
  {
    q: "Qui peut utiliser la plateforme ?",
    a: "Les étudiants pour apprendre, les enseignants pour publier et suivre, et les administrateurs pour superviser l’ensemble de la plateforme.",
  },
  {
    q: "Puis-je suivre ma progression ?",
    a: "Oui. Les étudiants voient l’avancement de leurs cours, les quiz réalisés et les contenus à reprendre.",
  },
  {
    q: "Les enseignants peuvent-ils créer des quiz ?",
    a: "Oui. Les enseignants peuvent créer des cours, ajouter des leçons, publier des quiz et suivre les résultats.",
  },
  {
    q: "Y a-t-il une assistance intelligente ?",
    a: "Oui. BrainUP peut intégrer recommandations, chatbot d’assistance et outils d’aide pour améliorer l’expérience utilisateur.",
  },
];

const testimonials = [
  {
    name: "Sophie Martin",
    role: "Étudiante",
    text: "L’interface est claire et agréable. Je retrouve mes cours rapidement et je vois immédiatement ma progression.",
  },
  {
    name: "Thomas Dubois",
    role: "Enseignant",
    text: "La gestion des cours et des quiz est beaucoup plus fluide. J’ai une meilleure vue sur mes étudiants.",
  },
  {
    name: "Amine R.",
    role: "Administrateur",
    text: "La plateforme donne une vision globale propre et moderne. Elle est simple à superviser et à faire évoluer.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("student");
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return;

    try {
      const user = JSON.parse(rawUser);

      if (user?.role === "etudiant") {
        navigate("/student/dashboard", { replace: true });
      } else if (user?.role === "enseignant") {
        navigate("/teacher/dashboard", { replace: true });
      } else if (user?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Erreur lecture user :", error);
    }
  }, [navigate]);

  const activePreview = useMemo(() => previewData[activeView], [activeView]);

  return (
    <div className="home-page">
      <div className="home-bg-orb home-bg-orb--one" />
      <div className="home-bg-orb home-bg-orb--two" />
      <div className="home-bg-grid" />

      <PublicNavbar />

      <main className="home-main">
        <section className="home-hero">
          <motion.div
            className="home-hero__content"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <span className="home-badge">
              <FaShieldAlt />
              Plateforme intelligente e-learning
            </span>

            <h1 className="home-hero__title">
              Une plateforme élégante pour
              <span> apprendre, enseigner et administrer</span>
            </h1>

            <p className="home-hero__text">
              BrainUP centralise les cours, quiz, suivis et espaces de gestion
              dans une interface moderne, fluide et agréable à utiliser.
            </p>

            <div className="home-hero__actions">
              <Link to="/inscription" className="home-btn home-btn--primary">
                Créer un compte
              </Link>
              <a href="#preview" className="home-btn home-btn--secondary">
                Découvrir la plateforme
              </a>
            </div>

            <div className="home-hero__mini-stats">
              <div className="home-mini-card">
                <FaUsers />
                <div>
                  <strong>+500</strong>
                  <span>Utilisateurs actifs</span>
                </div>
              </div>
              <div className="home-mini-card">
                <FaBookOpen />
                <div>
                  <strong>+50</strong>
                  <span>Cours disponibles</span>
                </div>
              </div>
              <div className="home-mini-card">
                <FaRobot />
                <div>
                  <strong>24/7</strong>
                  <span>Assistance et accès</span>
                </div>
              </div>
            </div>
          </motion.div>

        
        </section>

        <motion.section
          id="features"
          className="home-section"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
        >
          <div className="home-section__head">
            <span className="home-section__eyebrow">Fonctionnalités</span>
            <h2>Tout le nécessaire dans une seule plateforme</h2>
            <p>
              Une expérience claire pour apprendre, enseigner et administrer sans
              complexité inutile.
            </p>
          </div>

          <div className="home-features">
            {[
              {
                icon: <FaBookOpen />,
                title: "Cours en ligne",
                desc: "Accédez aux leçons, ressources et contenus pédagogiques à tout moment.",
              },
              {
                icon: <FaClipboardCheck />,
                title: "Quiz interactifs",
                desc: "Évaluez les connaissances avec des quiz fluides et bien structurés.",
              },
              {
                icon: <FaChartLine />,
                title: "Suivi de progression",
                desc: "Mesurez l’avancement et gardez une vision claire des performances.",
              },
              {
                icon: <FaRobot />,
                title: "Aide intelligente",
                desc: "Ajoutez assistance, recommandations et support conversationnel.",
              },
            ].map((item, index) => (
              <motion.article
                key={index}
                className="home-feature-card"
                variants={fadeUp}
              >
                <div className="home-feature-card__icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="roles"
          className="home-section home-section--alt"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
        >
          <div className="home-section__head">
            <span className="home-section__eyebrow">Profils</span>
            <h2>Un espace différent pour chaque utilisateur</h2>
            <p>
              BrainUP distingue clairement l’expérience étudiant, enseignant et
              administrateur.
            </p>
          </div>

          <div className="home-roles">
            <motion.article className="home-role-card" variants={fadeUp}>
              <div className="home-role-card__icon">
                <FaGraduationCap />
              </div>
              <h3>Étudiants</h3>
              <p>
                Suivre les cours, consulter les leçons, passer les quiz et voir
                la progression globale.
              </p>
              <Link to="/inscription" className="home-role-card__link">
                Commencer <FaArrowRight />
              </Link>
            </motion.article>

            <motion.article className="home-role-card" variants={fadeUp}>
              <div className="home-role-card__icon">
                <FaChalkboardTeacher />
              </div>
              <h3>Enseignants</h3>
              <p>
                Créer des cours, publier du contenu, ajouter des quiz et suivre
                la performance des étudiants.
              </p>
              <Link to="/inscription" className="home-role-card__link">
                Enseigner <FaArrowRight />
              </Link>
            </motion.article>

            <motion.article className="home-role-card" variants={fadeUp}>
              <div className="home-role-card__icon">
                <FaUserShield />
              </div>
              <h3>Administrateurs</h3>
              <p>
                Superviser les utilisateurs, la plateforme, les contenus et
                l’activité générale.
              </p>
              <Link to="/login" className="home-role-card__link">
                Administrer <FaArrowRight />
              </Link>
            </motion.article>
          </div>
        </motion.section>

        <motion.section
          id="preview"
          className="home-section home-section--preview"
          initial="hidden"
          whileInView="visible"
          variants={stagger}
          viewport={{ once: true, amount: 0.18 }}
        >
          <div className="home-section__head">
            <span className="home-section__eyebrow">Aperçu</span>
            <h2>Switch entre les 3 vues</h2>
            <p>
              Découvrez une vision simplifiée des espaces étudiant, enseignant et
              administrateur.
            </p>
          </div>

          <div className="preview-switch">
            <button
              className={`preview-switch__btn ${
                activeView === "student" ? "is-active" : ""
              }`}
              onClick={() => setActiveView("student")}
              type="button"
            >
              Étudiant
            </button>
            <button
              className={`preview-switch__btn ${
                activeView === "teacher" ? "is-active" : ""
              }`}
              onClick={() => setActiveView("teacher")}
              type="button"
            >
              Enseignant
            </button>
            <button
              className={`preview-switch__btn ${
                activeView === "admin" ? "is-active" : ""
              }`}
              onClick={() => setActiveView("admin")}
              type="button"
            >
              Admin
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              className="preview-panel"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35 }}
            >
              <div className="preview-panel__info">
                <span className="preview-panel__tag">{activePreview.label}</span>
                <h3>{activePreview.title}</h3>
                <p>{activePreview.subtitle}</p>

                <div className="preview-panel__stats">
                  {activePreview.stats.map((stat, idx) => (
                    <div key={idx} className="preview-stat">
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="preview-panel__screen">
                <div className="screen-mock">
                  <div className="screen-mock__top">
                    <div className="screen-mock__dots">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="screen-mock__tabs">
                      <span className="is-active">{activePreview.label}</span>
                      <span>Dashboard</span>
                      <span>Analytics</span>
                    </div>
                  </div>

                  <div className="screen-mock__body">
                    <aside className="screen-mock__side">
                      <span />
                      <span />
                      <span />
                      <span />
                    </aside>

                    <div className="screen-mock__main">
                      <div className="screen-mock__hero" />

                      <div className="screen-mock__kpis">
                        <span />
                        <span />
                        <span />
                      </div>

                      <div className="screen-mock__list">
                        {activePreview.cards.map((item, idx) => (
                          <div key={idx} className="screen-mock__list-item">
                            <div className="screen-mock__list-mark">
                              <FaCheckCircle />
                            </div>
                            <div className="screen-mock__list-text">
                              <strong>{item}</strong>
                              <span>
                                Vue simplifiée de l’espace{" "}
                                {activePreview.label.toLowerCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.section>

        <motion.section
          id="faq"
          className="home-section home-section--faq"
          initial="hidden"
          whileInView="visible"
          variants={stagger}
          viewport={{ once: true, amount: 0.18 }}
        >
          <div className="home-section__head">
            <span className="home-section__eyebrow">FAQ</span>
            <h2>Questions fréquentes</h2>
            <p>Des réponses simples aux questions les plus importantes.</p>
          </div>

          <div className="faq-list">
            {faqs.map((item, index) => {
              const isOpen = openFaq === index;

              return (
                <motion.div
                  key={index}
                  className={`faq-item ${isOpen ? "is-open" : ""}`}
                  variants={fadeUp}
                >
                  <button
                    type="button"
                    className="faq-item__question"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  >
                    <span>{item.q}</span>
                    <FaChevronDown className="faq-item__icon" />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        className="faq-item__answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <p>{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          className="home-section home-section--testimonials"
          initial="hidden"
          whileInView="visible"
          variants={stagger}
          viewport={{ once: true, amount: 0.18 }}
        >
          <div className="home-section__head">
            <span className="home-section__eyebrow">Témoignages</span>
            <h2>Ils aiment déjà l’expérience BrainUP</h2>
            <p>
              Une interface pensée pour être utile, moderne et agréable au
              quotidien.
            </p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((item, index) => (
              <motion.article
                key={index}
                className="testimonial-card"
                variants={fadeUp}
              >
                <div className="testimonial-card__stars">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>

                <p className="testimonial-card__text">“{item.text}”</p>

                <div className="testimonial-card__user">
                  <div className="testimonial-card__avatar">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="home-cta"
          initial="hidden"
          whileInView="visible"
          variants={fadeUp}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="home-cta__box">
            <h2>Rejoignez BrainUP aujourd’hui</h2>
            <p>
              Une plateforme claire, responsive et évolutive pour vos besoins
              pédagogiques.
            </p>

            <div className="home-cta__actions">
              <Link to="/inscription" className="home-btn home-btn--primary">
                Créer un compte
              </Link>
              <Link to="/login" className="home-btn home-btn--secondary">
                Connexion
              </Link>
            </div>
          </div>
        </motion.section>
      </main>

      <PublicFooter />
    </div>
  );
}