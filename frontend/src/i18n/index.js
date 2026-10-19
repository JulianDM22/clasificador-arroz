/**
 * @file index.js (i18n)
 * @description Internacionalización con i18next: español (por defecto) e inglés. El idioma
 *              elegido se recuerda en localStorage y se refleja en el atributo lang del documento
 *              (criterio CA-07.2).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import es from './es.json';
import en from './en.json';

/** Idiomas disponibles. */
export const IDIOMAS = ['es', 'en'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { es: { translation: es }, en: { translation: en } },
    fallbackLng: 'es',
    supportedLngs: IDIOMAS,
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    interpolation: { escapeValue: false }, // React ya escapa el texto
    detection: { order: ['localStorage', 'navigator'], lookupLocalStorage: 'clasificador.idioma', caches: ['localStorage'] },
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});
document.documentElement.lang = i18n.resolvedLanguage || 'es';

export default i18n;
