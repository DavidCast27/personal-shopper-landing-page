import type { Lang } from './lang'

type Dict = Record<string, string>

const en: Dict = {
  'aria.lang_selector': 'Language selector',
  'breadcrumb.home': 'Home',
  'breadcrumb.blog': 'Blog',

  'article.author': 'Author',

  'empty.blog.title': 'No articles yet',
  'empty.blog.description': 'We’re preparing content. Please check back soon.',
  'empty.services.title': 'No services available yet',
  'empty.services.description': 'We’re getting our services ready. Please check back soon.',
  'empty.faq.title': 'No FAQs yet',
  'empty.faq.description': 'We’re compiling common questions. Please check back soon.',
  'empty.testimonials.title': 'No testimonials yet',
  'empty.testimonials.description': 'We’re collecting feedback. Please check back soon.',

  'contact.success.title': 'Thank you',
  'contact.success.heading': 'Thank you! ',
  'contact.success.description': 'We received your message and will get back to you soon.',
  'contact.success.back': 'Back to Home',
}

const es: Dict = {
  'aria.lang_selector': 'Selector de idioma',
  'breadcrumb.home': 'Inicio',
  'breadcrumb.blog': 'Blog',

  'article.author': 'Autor',

  'empty.blog.title': 'Aún no hay artículos',
  'empty.blog.description': 'Estamos preparando contenido para el blog. Vuelve pronto.',
  'empty.services.title': 'Aún no hay servicios disponibles',
  'empty.services.description': 'Estamos preparando nuestros servicios. Vuelve pronto.',
  'empty.faq.title': 'Aún no hay preguntas frecuentes',
  'empty.faq.description': 'Estamos recopilando preguntas comunes. Vuelve pronto.',
  'empty.testimonials.title': 'Aún no hay testimonios',
  'empty.testimonials.description': 'Estamos recopilando opiniones. Vuelve pronto.',

  'contact.success.title': '¡Gracias!',
  'contact.success.heading': '¡Gracias!',
  'contact.success.description': 'Hemos recibido tu mensaje y te contactaremos pronto.',
  'contact.success.back': 'Volver al inicio',
}

const fr: Dict = {
  'aria.lang_selector': 'Sélecteur de langue',
  'breadcrumb.home': 'Accueil',
  'breadcrumb.blog': 'Blog',

  'article.author': 'Auteur',

  'empty.blog.title': 'Aucun article pour le moment',
  'empty.blog.description': 'Nous préparons du contenu. Revenez bientôt.',
  'empty.services.title': 'Aucun service pour le moment',
  'empty.services.description': 'Nous préparons nos services. Revenez bientôt.',
  'empty.faq.title': 'Aucune FAQ pour le moment',
  'empty.faq.description': 'Nous rassemblons les questions fréquentes. Revenez bientôt.',
  'empty.testimonials.title': 'Aucun témoignage pour le moment',
  'empty.testimonials.description': 'Nous recueillons des avis. Revenez bientôt.',

  'contact.success.title': 'Merci',
  'contact.success.heading': 'Merci !',
  'contact.success.description': 'Nous avons reçu votre message et vous répondrons bientôt.',
  'contact.success.back': 'Retour à l’accueil',
}

const D: Record<Lang, Dict> = { en, es, fr }

export function t(lang: Lang, key: keyof typeof en & string): string {
  const dict = D[lang] || en
  return dict[key] ?? en[key] ?? key
}
