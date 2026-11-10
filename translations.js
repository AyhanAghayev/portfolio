'use strict';

const pageTranslations = [
  ['.skip', 'Layihələrə keç', 'Перейти к проектам'],
  ['.mast-label', 'Portfel', 'Портфолио'],
  ['.mast-link', 'Əlaqə', 'Контакты'],
  ['.role', 'Backend proqramçısı', 'Бэкенд-разработчик'],
  ['.lead', 'Sosial tətbiqlər və real vaxt xidmətləri üçün backend hazırlayıram. Layihələrimə .NET sosial platforması və dinləyicilər arasında musiqi səsləndirilməsini sinxronlaşdıran Go serveri daxildir.', 'Разрабатываю серверную часть социальных приложений и сервисов реального времени. Среди моих проектов — социальная платформа на .NET и сервер на Go, который синхронизирует музыку у слушателей.'],
  ['.actions .primary', 'Layihələrə bax', 'Посмотреть проекты'],
  ['.actions .secondary', 'Əlaqə saxla', 'Связаться'],
  ['#work .section-head .label', '01 / LAYİHƏLƏR', '01 / ПРОЕКТЫ'],
  ['#work-title', 'Seçilmiş layihələr.', 'Избранные проекты.'],
  ['.aside', '05 LAYİHƏ', '05 ПРОЕКТОВ'],
  ['#experience > div > .label', '02 / TƏCRÜBƏ VƏ TƏHSİL', '02 / ОПЫТ И ОБРАЗОВАНИЕ'],
  ['#experience-title', 'Təcrübə və təhsil.', 'Опыт и образование.'],
  ['.timeline article:nth-child(1) .label', 'İYUN – SENTYABR 2024 / BAKI', 'ИЮНЬ – СЕНТЯБРЬ 2024 / БАКУ'],
  ['.timeline article:nth-child(1) h3', 'Texniki dəstək üzrə təcrübəçi', 'Стажёр службы технической поддержки'],
  ['.timeline li:nth-child(1)', 'Active Directory jurnallarında autentifikasiya problemlərini araşdırdım və PowerShell ilə həftədə 6-dan çox insidenti həll etdim.', 'Анализировал журналы Active Directory и устранял более шести проблем с аутентификацией в неделю с помощью PowerShell.'],
  ['.timeline li:nth-child(2)', 'İstifadəçi hesablarını, giriş icazələrini və fayl serverlərinin strukturunu idarə etdim.', 'Управлял учётными записями, правами доступа и структурой файловых серверов.'],
  ['.timeline li:nth-child(3)', 'Avadanlıq nasazlıqlarını müəyyən etdim və təkrarlanan dəstək işlərini PowerShell ilə avtomatlaşdırmağa kömək etdim.', 'Диагностировал неисправности оборудования и помогал автоматизировать повторяющиеся задачи поддержки с помощью PowerShell.'],
  ['.timeline article:nth-child(2) .label', 'NOYABR 2025 – 30 OKTYABR 2026', 'НОЯБРЬ 2025 – 30 ОКТЯБРЯ 2026'],
  ['.timeline article:nth-child(2) h3', 'Full-stack veb ixtisaslaşması və süni intellekt', 'Full-stack веб-разработка и ИИ'],
  ['.timeline article:nth-child(2) .org', 'Holberton School Azerbaijan · Peşəkar proqram', 'Holberton School Azerbaijan · Профессиональная программа'],
  ['.timeline article:nth-child(3) .label', 'FEVRAL 2026 – 6 İYUL 2026', 'ФЕВРАЛЬ 2026 – 6 ИЮЛЯ 2026'],
  ['.timeline article:nth-child(3) h3', 'Veb proqramlaşdırma və süni intellekt', 'Веб-разработка и ИИ'],
  ['.timeline article:nth-child(4) .label', 'SENTYABR 2023 – İNDİYƏDƏK', 'СЕНТЯБРЬ 2023 – НАСТОЯЩЕЕ ВРЕМЯ'],
  ['.timeline article:nth-child(4) h3', 'Kompüter elmləri üzrə bakalavr', 'Бакалавриат по компьютерным наукам'],
  ['#skills > div > .label', '03 / BACARIQLAR', '03 / НАВЫКИ'],
  ['#skills-title', 'Texniki bacarıqlar.', 'Технические навыки.'],
  ['.skill-list div:nth-child(1) dt', 'BACKEND', 'БЭКЕНД'],
  ['.skill-list div:nth-child(2) dt', 'FRONTEND', 'ФРОНТЕНД'],
  ['.skill-list div:nth-child(3) dt', 'ALƏTLƏR', 'ИНСТРУМЕНТЫ'],
  ['.skill-list div:nth-child(4) dt', 'DİLLƏR', 'ЯЗЫКИ'],
  ['.skill-list div:nth-child(4) dd', 'Azərbaycan dili (ana dili), ingilis dili (yüksək), rus dili (orta)', 'Азербайджанский (родной), английский (продвинутый), русский (средний)'],
  ['#contact > div > .label', '04 / ƏLAQƏ', '04 / КОНТАКТЫ'],
  ['#contact-title', 'Əlaqə saxlayaq.', 'Связаться со мной.'],
  ['.contact-links a:first-child span', 'E-poçt', 'Почта'],
  ['.footer > span', 'BACKEND PROQRAMLAŞDIRMA / BAKI', 'БЭКЕНД-РАЗРАБОТКА / БАКУ'],
  ['.footer a:last-child', 'Yuxarı qayıt ↑', 'Наверх ↑'],
  ['.dock a:nth-child(1)', 'Ana səhifə', 'Главная'],
  ['.dock a:nth-child(2)', 'Layihələr', 'Проекты'],
  ['.dock a:nth-child(3)', 'Təcrübə', 'Опыт'],
  ['.dock a:nth-child(4)', 'Bacarıqlar', 'Навыки'],
  ['.dock a:nth-child(5)', 'Əlaqə', 'Контакты']
];

const projectTranslations = {
  bfrost: {
    az: ['Universitet klubları platforması','Tələbələr maraqlarına uyğun klublar tapa, icmalara qoşula və tədbirlərə qeydiyyatdan keçə bilirlər.',['Açıq klublara birbaşa qoşulmaq, qapalı klublara isə təşkilatçı təsdiqi ilə üzv olmaq mümkündür.','Müzakirələr, sorğular, mesajlar və klub vikiləri bir yerdədir.'],['Klub axtarışı','Tədbir qeydiyyatı','İcma']],
    ru: ['Платформа университетских клубов','Студенты могут находить клубы по интересам, вступать в сообщества и записываться на мероприятия.',['В открытые клубы можно вступить сразу, а в закрытые — с одобрения организатора.','Обсуждения, опросы, сообщения и вики клубов собраны в одном месте.'],['Поиск клубов','Запись на мероприятия','Сообщества']]
  },
  autoglass: {
    az: ['Avtomobil xidmətləri saytı','Bakıda avtoşüşə və deteylinq studiyası üçün sayt. Ziyarətçilər xidmətləri müqayisə edə, görülmüş işlərə baxa və studiya ilə əlaqə saxlaya bilirlər.',['Xidmət səhifələri şüşə təmiri, dəyişdirilməsi və deteylinqi əhatə edir.','İnteraktiv əvvəl və sonra qalereyası təmir nəticələrini göstərir.','Telefon və WhatsApp vasitəsilə ilkin qiymətləndirmə istəmək mümkündür.'],['Xidmət kataloqu','Əvvəl və sonra qalereyası']],
    ru: ['Сайт автосервиса','Сайт бакинской студии автостекла и детейлинга. Посетители могут сравнить услуги, посмотреть выполненные работы и связаться со студией.',['Страницы услуг охватывают ремонт и замену стёкол, а также детейлинг.','Слайдеры «до и после» показывают результаты ремонта.','По телефону или в WhatsApp можно запросить предварительную оценку.'],['Каталог услуг','Галерея «до и после»']]
  },
  musea: {
    az: ['Full-stack sosial platforma','İstifadəçilərin hesab aça, ünsiyyət qura və şəkil yükləyə bildiyi sosial sayt.',['Eyni vaxtda bir neçə istifadəçiyə xidmət etmək üçün .NET backend hazırladım.','Autentifikasiya və giriş icazələrini tətbiq etdim.','SQL verilənlər bazasını layihələndirdim və idarə etdim.'],['.NET','SQL','Autentifikasiya']],
    ru: ['Full-stack социальная платформа','Социальный сайт с регистрацией, общением и загрузкой изображений.',['Разработал бэкенд на .NET для одновременной работы пользователей.','Реализовал аутентификацию и управление доступом.','Спроектировал и администрировал базу данных SQL.'],['.NET','SQL','Аутентификация']]
  },
  streaming: {
    az: ['Sinxron səsləndirmə serveri','Dinləyicilərin musiqisini aparıcının səsləndirməsi ilə sinxron saxlayan Go serveri.',['Eyni vaxtda qoşulan müştərilərin bağlantılarını real vaxtda idarə etdim.','Sinxronlaşdırma ilə səsləndirmə fərqini 90%-dən çox azaltdım.'],['Go','Paralel icra','Real vaxt sistemləri']],
    ru: ['Сервер синхронного воспроизведения','Сервер на Go синхронизирует воспроизведение музыки у слушателей с ведущим.',['Реализовал обработку одновременных подключений в реальном времени.','Синхронизация сократила рассогласование воспроизведения более чем на 90%.'],['Go','Конкурентность','Системы реального времени']]
  },
  markov: {
    az: ['Ehtimala əsaslanan generasiya','Markov zənciri ilə ehtimala əsaslanan nəticələr yaratmaq üçün eksperiment.',['Vəziyyətlər arasında keçidləri və ehtimal hesablamalarını sıfırdan yazdım.'],['Markov zəncirləri','Ehtimal','Alqoritmlər']],
    ru: ['Вероятностная генерация','Эксперимент по генерации результатов с помощью цепи Маркова.',['Реализовал переходы между состояниями и расчёт вероятностей с нуля.'],['Цепи Маркова','Вероятность','Алгоритмы']]
  }
};
