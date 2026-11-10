'use strict';
const projects = {
  musea: {
    title:'Musea', type:'Full-stack social platform',
    description:'A social website where users can create accounts, interact, and upload images.',
    points:['Built the .NET backend to support concurrent users.','Implemented user authentication and authorization.','Designed and managed the SQL database.'],
    tags:['.NET','SQL','Authentication']
  },
  streaming: {
    title:'Real-Time Music Streaming', type:'Synchronized playback server',
    description:'A Go server that keeps connected listeners in sync with the host’s music playback.',
    points:['Handled concurrent client connections in real time.','Implemented playback synchronization, reducing desynchronization by more than 90%.'],
    tags:['Go','Concurrency','Real-time systems']
  },
  markov: {
    title:'Markov AI', type:'Probabilistic generation',
    description:'An experiment in generating probabilistic outputs with a Markov chain.',
    points:['Implemented state transitions and probability calculations from scratch.'],
    tags:['Markov chains','Probability','Algorithms']
  },
  bfrost: {
    title:'BFrost', type:'University club platform',
    description:'A campus platform where students can discover clubs by interest, join communities, and register for events.',
    points:['Supports open membership and organizer approval for private clubs.','Keeps club discussions, polls, messages, and shared wikis in one place.'],
    tags:['Club discovery','Event registration','Community'],
    screenshot:'bfrost.jpg', url:'https://bfrost.club/az'
  },
  autoglass: {
    title:'Auto Glass', type:'Automotive services website',
    description:'An Azerbaijani-language site for a Baku auto glass and detailing studio. Visitors can compare services, see completed work, and contact the studio.',
    points:['Service pages cover glass repair, replacement, and detailing.','Before-and-after sliders show the results of past repairs.','Phone and WhatsApp links give visitors a way to request an assessment.'],
    tags:['Service catalog','Before-and-after gallery'],
    screenshot:'auto-glass.jpg', url:'https://autoglass.az'
  }
};
const buttons = [...document.querySelectorAll('[data-project]')];
const projectIndex = document.querySelector('.index');
const language = document.querySelector('#language');
const translatedNodes = pageTranslations.map(([selector, az, ru]) => {
  const node = document.querySelector(selector);
  return {node, en:node.innerHTML, az, ru};
});
const localeLabels = {
  en: {language:'Language', technologies:'Technologies', projects:'Projects', navigation:'Portfolio sections', visit:'Visit project', screenshot:'homepage screenshot', title:'Backend Developer'},
  az: {language:'Dil', technologies:'Texnologiyalar', projects:'Layihələr', navigation:'Portfel bölmələri', visit:'Layihəyə keç', screenshot:'ana səhifəsinin ekran görüntüsü', title:'Backend proqramçısı'},
  ru: {language:'Язык', technologies:'Технологии', projects:'Проекты', navigation:'Разделы портфолио', visit:'Открыть проект', screenshot:'— снимок главной страницы', title:'Бэкенд-разработчик'}
};
let selectedProject = 0;
function moveProjectHighlight() {
  const button = buttons[selectedProject];
  projectIndex.style.setProperty('--active-top', button.offsetTop + 'px');
  projectIndex.style.setProperty('--active-height', button.offsetHeight + 'px');
}
let locale = 'en';
function updateList(selector, values) {
  const items = values.map(value => {
    const item = document.createElement('li');
    item.textContent = value;
    return item;
  });
  document.querySelector(selector).replaceChildren(...items);
}
function projectCopy(key) {
  const {type, description, points, tags} = projects[key];
  return projectTranslations[key][locale] ?? [type, description, points, tags];
}
function renderProject() {
  const key = buttons[selectedProject].dataset.project;
  const entry = projects[key];
  const [type, description, points, tags] = projectCopy(key);
  document.querySelector('#case-type').textContent = '0' + (selectedProject+1) + ' / ' + type.toLocaleUpperCase(locale);
  document.querySelector('#case-title').textContent = entry.title;
  document.querySelector('#case-description').textContent = description;
  updateList('#case-points', points);
  updateList('#case-tags', tags);
  const screenshot = document.querySelector('#case-screenshot');
  screenshot.hidden = !entry.screenshot;
  if (entry.screenshot) {
    screenshot.src = entry.screenshot;
    screenshot.alt = entry.title + ' ' + localeLabels[locale].screenshot;
  } else {
    screenshot.removeAttribute('src');
    screenshot.alt = '';
  }
  const link = document.querySelector('#case-link');
  link.hidden = !entry.url;
  link.textContent = localeLabels[locale].visit + ' ↗';
  if (entry.url) link.href = entry.url;
  else link.removeAttribute('href');
}
buttons.forEach((button,index) => button.addEventListener('click', () => {
  if (selectedProject === index) return;
  selectedProject = index;
  buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  moveProjectHighlight();
  renderProject();
  if (matchMedia('(max-width:760px)').matches) document.querySelector('#project').scrollIntoView({block:'nearest'});
}));

function setLanguage(value) {
  locale = Object.hasOwn(localeLabels, value) ? value : 'en';
  language.value = locale;
  document.documentElement.lang = locale;
  const labels = localeLabels[locale];
  document.title = 'Ayhan Ağayev — ' + labels.title;
  language.setAttribute('aria-label', labels.language);
  document.querySelector('.skill-ticker').setAttribute('aria-label', labels.technologies);
  document.querySelector('.index').setAttribute('aria-label', labels.projects);
  document.querySelector('.dock').setAttribute('aria-label', labels.navigation);
  for (const translation of translatedNodes) {
    const {node, en} = translation;
    node.innerHTML = en;
    if (locale === 'en') continue;
    const copy = translation[locale];
    // Keep decorative arrows and sub-labels; only swap the leading text.
    if (node.querySelector(':scope > span[aria-hidden], :scope > small')) node.firstChild.textContent = copy + ' ';
    else node.textContent = copy;
  }
  buttons.forEach(button => {
    button.querySelector('small').textContent = projectCopy(button.dataset.project)[0];
  });
  renderProject();
}
// Storage can throw when blocked (privacy settings, some embedded views).
function savedLanguage() {
  try { return localStorage.getItem('portfolio-language'); } catch { return null; }
}
language.addEventListener('change', () => {
  setLanguage(language.value);
  try { localStorage.setItem('portfolio-language', locale); } catch {}
});
setLanguage(savedLanguage());
moveProjectHighlight();
projectIndex.classList.add('has-highlight');
const indexSize = new ResizeObserver(moveProjectHighlight);
buttons.forEach(button => indexSize.observe(button));

const track = document.querySelector('.skill-track');
const repeatedSkills = track.firstElementChild.cloneNode(true);
repeatedSkills.setAttribute('aria-hidden', 'true');
track.append(repeatedSkills);

const dock = [...document.querySelectorAll('.dock a')];
const sections = dock.slice(1).map(link => document.querySelector(link.hash)).reverse();
function updateDock() {
  const cutoff = innerHeight * .38;
  const atEnd = scrollY > 0 && Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 1;
  const active = atEnd ? sections[0].id : sections.find(section => section.getBoundingClientRect().top < cutoff)?.id || 'top';
  dock.forEach(link => {
    if (link.hash === '#'+active) link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', updateDock, {passive:true});
window.addEventListener('resize', updateDock);
updateDock();
