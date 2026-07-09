(function () {
  const languages = [
    { code: "ru", label: "RU", name: "Русский", htmlLang: "ru" },
    { code: "kz", label: "KZ", name: "Қазақша", htmlLang: "kk" },
    { code: "en", label: "EN", name: "English", htmlLang: "en" },
    { code: "uz", label: "UZ", name: "O'zbekcha", htmlLang: "uz" }
  ];

  const common = {
    ru: {
      nav: {
        about: "О компании",
        programs: "Программы",
        countries: "Страны",
        services: "Услуги",
        reviews: "Отзывы",
        cases: "Кейсы",
        faq: "FAQ",
        contacts: "Контакты",
        home: "Главная"
      },
      countries: { china: "Китай", turkey: "Турция", italy: "Италия", title: "Страны" },
      footer: {
        copy: "Помогаем поступить за рубеж и пройти путь до адаптации в кампусе.",
        contacts: "Контакты",
        countries: "Страны"
      },
      form: {
        eyebrow: "Бесплатная консультация",
        title: "Получите план поступления",
        copy: "Заполните форму, чтобы эксперт UniQ связался с вами и подсказал лучший маршрут.",
        close: "Закрыть",
        name: "Имя",
        namePlaceholder: "Ваше имя",
        phone: "Телефон",
        phonePlaceholder: "+7 (___) ___-__-__",
        grade: "Класс или уровень",
        grades: ["11 класс", "Выпускник колледжа", "Студент"],
        country: "Страна",
        submit: "Отправить",
        successTitle: "Заявка принята",
        successText: "Эксперт свяжется с вами и расскажет о подходящих программах."
      },
      languageAria: "Выбрать язык, сейчас"
    },
    kz: {
      nav: {
        about: "Компания туралы",
        programs: "Бағдарламалар",
        countries: "Елдер",
        services: "Қызметтер",
        reviews: "Пікірлер",
        cases: "Кейстер",
        faq: "FAQ",
        contacts: "Байланыс",
        home: "Басты бет"
      },
      countries: { china: "Қытай", turkey: "Түркия", italy: "Италия", title: "Елдер" },
      footer: {
        copy: "Шетелге оқуға түсуге және кампуста бейімделуге дейінгі жолды бірге өтеміз.",
        contacts: "Байланыс",
        countries: "Елдер"
      },
      form: {
        eyebrow: "Тегін кеңес",
        title: "Оқуға түсу жоспарын алыңыз",
        copy: "Форманы толтырыңыз, UniQ сарапшысы сізбен байланысып, ең тиімді бағытты ұсынады.",
        close: "Жабу",
        name: "Атыңыз",
        namePlaceholder: "Атыңызды жазыңыз",
        phone: "Телефон",
        phonePlaceholder: "+7 (___) ___-__-__",
        grade: "Сынып немесе деңгей",
        grades: ["11 сынып", "Колледж түлегі", "Студент"],
        country: "Ел",
        submit: "Жіберу",
        successTitle: "Өтінім қабылданды",
        successText: "Сарапшы сізбен байланысып, қолайлы бағдарламалар туралы айтып береді."
      },
      languageAria: "Тілді таңдау, қазіргі тіл"
    },
    en: {
      nav: {
        about: "About",
        programs: "Programs",
        countries: "Countries",
        services: "Services",
        reviews: "Reviews",
        cases: "Cases",
        faq: "FAQ",
        contacts: "Contacts",
        home: "Home"
      },
      countries: { china: "China", turkey: "Turkey", italy: "Italy", title: "Countries" },
      footer: {
        copy: "We help students enter universities abroad and stay close until campus adaptation.",
        contacts: "Contacts",
        countries: "Countries"
      },
      form: {
        eyebrow: "Free consultation",
        title: "Get an admission plan",
        copy: "Fill out the form and a UniQ expert will contact you with the best route.",
        close: "Close",
        name: "Name",
        namePlaceholder: "Your name",
        phone: "Phone",
        phonePlaceholder: "+7 (___) ___-__-__",
        grade: "Grade or level",
        grades: ["11th grade", "College graduate", "Student"],
        country: "Country",
        submit: "Send",
        successTitle: "Request received",
        successText: "An expert will contact you and explain suitable programs."
      },
      languageAria: "Choose language, current language"
    },
    uz: {
      nav: {
        about: "Kompaniya haqida",
        programs: "Dasturlar",
        countries: "Davlatlar",
        services: "Xizmatlar",
        reviews: "Sharhlar",
        cases: "Keyslar",
        faq: "FAQ",
        contacts: "Aloqa",
        home: "Bosh sahifa"
      },
      countries: { china: "Xitoy", turkey: "Turkiya", italy: "Italiya", title: "Davlatlar" },
      footer: {
        copy: "Chet elga o'qishga kirish va kampusga moslashishgacha bo'lgan yo'lni birga o'tamiz.",
        contacts: "Aloqa",
        countries: "Davlatlar"
      },
      form: {
        eyebrow: "Bepul konsultatsiya",
        title: "Qabul rejasini oling",
        copy: "Formani to'ldiring, UniQ eksperti siz bilan bog'lanib, eng mos yo'nalishni aytadi.",
        close: "Yopish",
        name: "Ism",
        namePlaceholder: "Ismingiz",
        phone: "Telefon",
        phonePlaceholder: "+7 (___) ___-__-__",
        grade: "Sinf yoki daraja",
        grades: ["11-sinf", "Kollej bitiruvchisi", "Talaba"],
        country: "Davlat",
        submit: "Yuborish",
        successTitle: "Ariza qabul qilindi",
        successText: "Ekspert siz bilan bog'lanib, mos dasturlar haqida aytib beradi."
      },
      languageAria: "Tilni tanlash, hozirgi til"
    }
  };

  const pages = {
    turkey: {
      ru: {
        seo: {
          title: "Обучение в Турции - UniQ",
          description: "Поступление в университеты Турции с UniQ: зачисление без экзаменов, языковой год, подбор программ и полное сопровождение."
        },
        hero: {
          crumb: "Страны / Турция",
          eyebrow: "Обучение в Турции",
          title: "Зачисление в лучшие высшие учебные заведения Турции",
          lead: "Подходит студентам, которым нужна доступная стоимость, понятные требования и международный диплом рядом с Казахстаном.",
          cta: "Узнать шанс поступления",
          compare: "Сравнить с Италией",
          compareSlug: "italy",
          panelLabel: "Первый год",
          panelTitle: "курсы турецкого языка",
          panelText: "Помогаем выбрать университет, подготовить документы и пройти зачисление без лишней бюрократии.",
          stats: [
            ["Без экзаменов", "поступление по документам"],
            ["11 класс", "или диплом колледжа"],
            ["Язык", "можно начать с подготовки"]
          ]
        },
        overview: {
          eyebrow: "Почему Турция",
          title: "Современное образование, комфортная адаптация и сильная студенческая среда",
          cards: [
            ["Высокое качество образования", "Университеты предлагают программы на турецком и английском, а дипломы признаются за пределами страны."],
            ["Удобное расположение", "Турция близка по перелету и культуре, поэтому студентам проще привыкнуть к новой среде."],
            ["Разнообразие направлений", "Можно подобрать медицину, инженерию, бизнес, IT, гуманитарные и творческие специальности."],
            ["Многокультурная среда", "В университетах учатся студенты из разных стран, что помогает развить язык и круг знакомств."]
          ]
        },
        programs: {
          eyebrow: "Программа",
          title: "Поступление без сложных вступительных экзаменов",
          cards: [
            ["Маршрут 01", "Частичное покрытие затрат", ["Подбор университета под средний балл", "Зачисление без YOS для подходящих программ", "План бюджета до подачи документов"]],
            ["Маршрут 02", "Языковая подготовка", ["Старт без свободного турецкого", "Подготовка к учебной среде", "Помощь с адаптацией в кампусе"]]
          ]
        },
        requirements: {
          eyebrow: "Требования",
          title: "Что нужно для подачи",
          copy: "UniQ помогает собрать документы, проверить сроки и выбрать университеты, где профиль студента выглядит сильнее.",
          items: [
            ["Аттестат или диплом колледжа", "Зачисление возможно после 11 класса или колледжа."],
            ["Хороший средний балл", "Средний балл влияет на выбор университета, программы и скидки."],
            ["Язык можно подтянуть", "Для многих маршрутов можно начать с языковой подготовки."]
          ]
        },
        cta: {
          eyebrow: "Следующий шаг",
          title: "Подберем университет в Турции под оценки, бюджет и сроки",
          copy: "После консультации вы получите понятный маршрут: документы, дедлайны, язык и ориентир по стоимости.",
          button: "Получить консультацию"
        }
      },
      kz: {
        seo: {
          title: "Түркияда оқу - UniQ",
          description: "UniQ арқылы Түркия университеттеріне түсу: емтихансыз қабылдау, тілдік дайындық, бағдарлама таңдау және толық сүйемелдеу."
        },
        hero: {
          crumb: "Елдер / Түркия",
          eyebrow: "Түркияда оқу",
          title: "Түркияның үздік жоғары оқу орындарына түсу",
          lead: "Қолжетімді оқу құны, түсінікті талаптар және Қазақстанға жақын халықаралық диплом қажет студенттерге қолайлы бағыт.",
          cta: "Түсу мүмкіндігін білу",
          compare: "Италиямен салыстыру",
          compareSlug: "italy",
          panelLabel: "Бірінші жыл",
          panelTitle: "түрік тілі курстары",
          panelText: "Университет таңдауға, құжат дайындауға және қабылдау кезеңінен артық әбігерсіз өтуге көмектесеміз.",
          stats: [
            ["Емтихансыз", "құжат бойынша түсу"],
            ["11 сынып", "немесе колледж дипломы"],
            ["Тіл", "дайындықтан бастауға болады"]
          ]
        },
        overview: {
          eyebrow: "Неге Түркия",
          title: "Заманауи білім, жайлы бейімделу және мықты студенттік орта",
          cards: [
            ["Сапалы білім", "Университеттер түрік және ағылшын тілдерінде бағдарламалар ұсынады, диплом елден тыс жерде де танылады."],
            ["Ыңғайлы орналасу", "Түркия ұшу уақыты мен мәдениеті жағынан жақын, сондықтан студентке жаңа ортаға үйрену жеңіл."],
            ["Бағыттардың көптігі", "Медицина, инженерия, бизнес, IT, гуманитарлық және шығармашылық мамандықтарды таңдауға болады."],
            ["Көпмәдениетті орта", "Университеттерде әр елден келген студенттер оқиды, бұл тіл мен таныстық шеңберін дамытуға көмектеседі."]
          ]
        },
        programs: {
          eyebrow: "Бағдарлама",
          title: "Күрделі қабылдау емтихандарынсыз түсу",
          cards: [
            ["Бағыт 01", "Шығынның бір бөлігін жабу", ["Орташа балға сай университет таңдау", "Қолайлы бағдарламаларға YOS емтиханынсыз түсу", "Құжат тапсырғанға дейін бюджет жоспары"]],
            ["Бағыт 02", "Тілдік дайындық", ["Түрік тілін еркін білмей-ақ бастау", "Оқу ортасына дайындалу", "Кампуста бейімделуге көмек"]]
          ]
        },
        requirements: {
          eyebrow: "Талаптар",
          title: "Өтініш беруге не қажет",
          copy: "UniQ құжаттарды жинауға, мерзімдерді тексеруге және студент профилі мықты көрінетін университеттерді таңдауға көмектеседі.",
          items: [
            ["Аттестат немесе колледж дипломы", "11 сыныптан немесе колледжден кейін түсуге болады."],
            ["Жақсы орташа балл", "Орташа балл университет, бағдарлама және жеңілдік таңдауға әсер етеді."],
            ["Тілді жақсартуға болады", "Көп бағытта оқуды тілдік дайындықтан бастауға болады."]
          ]
        },
        cta: {
          eyebrow: "Келесі қадам",
          title: "Түркиядағы университетті бағаңызға, бюджетіңізге және мерзіміңізге сай таңдаймыз",
          copy: "Кеңестен кейін құжаттар, мерзімдер, тіл және шамамен оқу құны бойынша түсінікті маршрут аласыз.",
          button: "Кеңес алу"
        }
      },
      en: {
        seo: {
          title: "Study in Turkey - UniQ",
          description: "Admission to Turkish universities with UniQ: enrollment without exams, language year, program matching and full support."
        },
        hero: {
          crumb: "Countries / Turkey",
          eyebrow: "Study in Turkey",
          title: "Admission to leading higher education institutions in Turkey",
          lead: "A strong fit for students who need accessible tuition, clear requirements and an international diploma close to Kazakhstan.",
          cta: "Check admission chances",
          compare: "Compare with Italy",
          compareSlug: "italy",
          panelLabel: "First year",
          panelTitle: "Turkish language courses",
          panelText: "We help choose a university, prepare documents and pass admission without unnecessary bureaucracy.",
          stats: [
            ["No exams", "document-based admission"],
            ["11th grade", "or college diploma"],
            ["Language", "you can start with preparation"]
          ]
        },
        overview: {
          eyebrow: "Why Turkey",
          title: "Modern education, smooth adaptation and a strong student environment",
          cards: [
            ["High-quality education", "Universities offer programs in Turkish and English, and diplomas are recognized outside the country."],
            ["Convenient location", "Turkey is close by flight and culture, so students adapt to the new environment faster."],
            ["Wide choice of fields", "You can choose medicine, engineering, business, IT, humanities and creative specialties."],
            ["Multicultural environment", "Students from different countries study together, which helps improve language and build connections."]
          ]
        },
        programs: {
          eyebrow: "Program",
          title: "Admission without difficult entrance exams",
          cards: [
            ["Route 01", "Partial cost coverage", ["University matching by average score", "Admission without YOS for suitable programs", "Budget planning before document submission"]],
            ["Route 02", "Language preparation", ["Start without fluent Turkish", "Preparation for the study environment", "Support with campus adaptation"]]
          ]
        },
        requirements: {
          eyebrow: "Requirements",
          title: "What you need to apply",
          copy: "UniQ helps collect documents, check deadlines and choose universities where the student's profile looks stronger.",
          items: [
            ["School certificate or college diploma", "Admission is possible after 11th grade or college."],
            ["Good average score", "The average score affects university choice, program options and discounts."],
            ["Language can be improved", "Many routes can start with language preparation."]
          ]
        },
        cta: {
          eyebrow: "Next step",
          title: "We will match a Turkish university to your grades, budget and timeline",
          copy: "After consultation you will get a clear route: documents, deadlines, language and cost estimate.",
          button: "Get consultation"
        }
      },
      uz: {
        seo: {
          title: "Turkiyada o'qish - UniQ",
          description: "UniQ bilan Turkiya universitetlariga kirish: imtihonsiz qabul, til tayyorgarligi, dastur tanlash va to'liq kuzatuv."
        },
        hero: {
          crumb: "Davlatlar / Turkiya",
          eyebrow: "Turkiyada o'qish",
          title: "Turkiyaning yetakchi oliy ta'lim muassasalariga qabul",
          lead: "Qulay narx, tushunarli talablar va Qozog'istonga yaqin xalqaro diplom kerak bo'lgan talabalar uchun mos yo'nalish.",
          cta: "Qabul imkoniyatini bilish",
          compare: "Italiya bilan solishtirish",
          compareSlug: "italy",
          panelLabel: "Birinchi yil",
          panelTitle: "turk tili kurslari",
          panelText: "Universitet tanlash, hujjat tayyorlash va ortiqcha byurokratiyasiz qabul jarayonidan o'tishga yordam beramiz.",
          stats: [
            ["Imtihonsiz", "hujjatlar orqali qabul"],
            ["11-sinf", "yoki kollej diplomi"],
            ["Til", "tayyorgarlikdan boshlash mumkin"]
          ]
        },
        overview: {
          eyebrow: "Nega Turkiya",
          title: "Zamonaviy ta'lim, qulay moslashuv va kuchli talabalar muhiti",
          cards: [
            ["Sifatli ta'lim", "Universitetlar turk va ingliz tillarida dasturlar taklif qiladi, diplomlar mamlakat tashqarisida ham tan olinadi."],
            ["Qulay joylashuv", "Turkiya parvoz va madaniyat jihatidan yaqin, shuning uchun talabalar yangi muhitga tezroq moslashadi."],
            ["Yo'nalishlar ko'p", "Tibbiyot, muhandislik, biznes, IT, gumanitar va ijodiy mutaxassisliklarni tanlash mumkin."],
            ["Ko'p madaniyatli muhit", "Universitetlarda turli davlatlardan talabalar o'qiydi, bu til va tanishlar doirasini rivojlantiradi."]
          ]
        },
        programs: {
          eyebrow: "Dastur",
          title: "Murakkab kirish imtihonlarisiz qabul",
          cards: [
            ["Yo'nalish 01", "Xarajatlarning bir qismini qoplash", ["O'rtacha ball bo'yicha universitet tanlash", "Mos dasturlar uchun YOS imtihonisiz qabul", "Hujjat topshirishdan oldin budjet rejasi"]],
            ["Yo'nalish 02", "Til tayyorgarligi", ["Turk tilini erkin bilmasdan boshlash", "O'quv muhitiga tayyorlanish", "Kampusga moslashishda yordam"]]
          ]
        },
        requirements: {
          eyebrow: "Talablar",
          title: "Ariza topshirish uchun nima kerak",
          copy: "UniQ hujjatlarni yig'ish, muddatlarni tekshirish va talaba profili kuchliroq ko'rinadigan universitetlarni tanlashga yordam beradi.",
          items: [
            ["Attestat yoki kollej diplomi", "11-sinf yoki kollejdan keyin qabul mumkin."],
            ["Yaxshi o'rtacha ball", "O'rtacha ball universitet, dastur va chegirmalar tanloviga ta'sir qiladi."],
            ["Tilni yaxshilash mumkin", "Ko'p yo'nalishlarda o'qishni til tayyorgarligidan boshlash mumkin."]
          ]
        },
        cta: {
          eyebrow: "Keyingi qadam",
          title: "Turkiyadagi universitetni baholaringiz, budjetingiz va muddatingizga mos tanlaymiz",
          copy: "Konsultatsiyadan keyin hujjatlar, muddatlar, til va taxminiy narx bo'yicha aniq yo'nalish olasiz.",
          button: "Konsultatsiya olish"
        }
      }
    },
    china: {
      ru: {
        seo: {
          title: "Обучение в Китае - UniQ",
          description: "Поступление в университеты Китая с UniQ: гранты, языковой год, сопровождение, документы, кампус и адаптация."
        },
        hero: {
          crumb: "Страны / Китай",
          eyebrow: "Обучение в Китае",
          title: "Грант со стипендией до 220 000 тг в месяц в университетах Китая",
          lead: "UniQ помогает пройти маршрут от выбора программы до заселения в кампус: документы, подача, языковая подготовка и адаптация после прилета.",
          cta: "Оставить заявку",
          compare: "Сравнить с Турцией",
          compareSlug: "turkey",
          panelLabel: "Первый год",
          panelTitle: "курс китайского языка",
          panelText: "Готовим к учебной среде, документам, кампусу и бытовым вопросам до старта основной программы.",
          stats: [
            ["Без экзаменов", "зачисление по документам"],
            ["HSK 3", "если уже знаете китайский"],
            ["Гранты", "обучение, проживание, стипендия"]
          ]
        },
        overview: {
          eyebrow: "Почему Китай",
          title: "Сильный выбор для студентов, которым нужен грант и международный диплом",
          cards: [
            ["Широкий выбор программ", "Можно подобрать направление от гуманитарных специальностей до инженерии, медицины, IT и бизнеса."],
            ["Доступная стоимость", "Стоимость обучения и проживания ниже многих европейских направлений, а гранты снижают бюджет семьи."],
            ["Культура и язык", "Языковой год помогает мягко войти в учебу, привыкнуть к кампусу и быстрее адаптироваться."],
            ["Сопровождение на месте", "Команда помогает с прилетом, общежитием, SIM-картой, банковской картой и первыми неделями."]
          ]
        },
        programs: {
          eyebrow: "Программы",
          title: "Форматы поступления для иностранных студентов",
          cards: [
            ["Программа 01", "Правительственный грант", ["Бесплатное обучение", "Бесплатное проживание", "Ежемесячная стипендия"]],
            ["Программа 02", "Полный грант с проживанием", ["Подбор университета под профиль", "Подача документов", "Поддержка до заселения"]],
            ["Программа 03", "Частичный грант", ["Бесплатное или сниженное обучение", "Оптимальный вариант по бюджету", "Контроль дедлайнов"]]
          ]
        },
        requirements: {
          eyebrow: "Требования",
          title: "Что подготовить студенту",
          copy: "Точный список зависит от университета и программы, но базовый маршрут обычно строится вокруг этих пунктов.",
          items: [
            ["Аттестат 11 класса или диплом колледжа", "Нужен официальный документ об окончании учебного заведения с хорошими оценками."],
            ["Базовый английский", "Для старта не обязательно идеально знать английский, достаточно базового уровня."],
            ["Китайский язык", "Если студент уже знает китайский, могут понадобиться результаты HSK 3."]
          ]
        },
        cta: {
          eyebrow: "Следующий шаг",
          title: "Узнайте, какой грант в Китае подходит под ваш профиль",
          copy: "Разберем оценки, язык, бюджет и сроки поступления, а затем соберем понятный план действий.",
          button: "Получить консультацию"
        }
      },
      kz: {
        seo: {
          title: "Қытайда оқу - UniQ",
          description: "UniQ арқылы Қытай университеттеріне түсу: гранттар, тілдік жыл, құжаттар, кампус және бейімделу бойынша сүйемелдеу."
        },
        hero: {
          crumb: "Елдер / Қытай",
          eyebrow: "Қытайда оқу",
          title: "Қытай университеттерінде айына 220 000 теңгеге дейін стипендиясы бар грант",
          lead: "UniQ бағдарлама таңдаудан кампусқа орналасуға дейінгі жолды бірге өтеді: құжат, өтініш, тілдік дайындық және келгеннен кейін бейімделу.",
          cta: "Өтінім қалдыру",
          compare: "Түркиямен салыстыру",
          compareSlug: "turkey",
          panelLabel: "Бірінші жыл",
          panelTitle: "қытай тілі курсы",
          panelText: "Негізгі бағдарлама басталғанға дейін оқу ортасына, құжаттарға, кампусқа және тұрмыстық сұрақтарға дайындаймыз.",
          stats: [
            ["Емтихансыз", "құжат бойынша қабылдау"],
            ["HSK 3", "қытай тілін білсеңіз"],
            ["Гранттар", "оқу, тұру, стипендия"]
          ]
        },
        overview: {
          eyebrow: "Неге Қытай",
          title: "Грант пен халықаралық диплом қажет студенттер үшін мықты таңдау",
          cards: [
            ["Бағдарламалар таңдауы кең", "Гуманитарлық бағыттан инженерия, медицина, IT және бизнеске дейін бағдар таңдауға болады."],
            ["Қолжетімді құн", "Оқу және тұру құны көптеген еуропалық бағыттардан төмен, ал грант отбасы бюджетін азайтады."],
            ["Мәдениет және тіл", "Тілдік жыл оқу процесіне жұмсақ кіруге, кампусқа үйренуге және тез бейімделуге көмектеседі."],
            ["Орнында сүйемелдеу", "Команда ұшып келу, жатақхана, SIM-карта, банк картасы және алғашқы апталар бойынша көмектеседі."]
          ]
        },
        programs: {
          eyebrow: "Бағдарламалар",
          title: "Шетелдік студенттерге арналған түсу форматтары",
          cards: [
            ["Бағдарлама 01", "Үкіметтік грант", ["Тегін оқу", "Тегін тұру", "Ай сайынғы стипендия"]],
            ["Бағдарлама 02", "Тұрумен толық грант", ["Профильге сай университет таңдау", "Құжат тапсыру", "Орналасуға дейін қолдау"]],
            ["Бағдарлама 03", "Ішінара грант", ["Тегін немесе жеңілдетілген оқу", "Бюджетке сай оңтайлы нұсқа", "Мерзімдерді бақылау"]]
          ]
        },
        requirements: {
          eyebrow: "Талаптар",
          title: "Студент не дайындауы керек",
          copy: "Нақты тізім университет пен бағдарламаға байланысты, бірақ негізгі маршрут әдетте осы тармақтардан тұрады.",
          items: [
            ["11 сынып аттестаты немесе колледж дипломы", "Жақсы бағалары бар оқу орнын аяқтағанын растайтын ресми құжат қажет."],
            ["Базалық ағылшын тілі", "Бастау үшін ағылшын тілін мінсіз білу міндетті емес, базалық деңгей жеткілікті."],
            ["Қытай тілі", "Студент қытай тілін білсе, HSK 3 нәтижелері қажет болуы мүмкін."]
          ]
        },
        cta: {
          eyebrow: "Келесі қадам",
          title: "Қытайдағы қай грант сіздің профиліңізге сай келетінін анықтайық",
          copy: "Баға, тіл, бюджет және түсу мерзімдерін талдап, түсінікті әрекет жоспарын құрамыз.",
          button: "Кеңес алу"
        }
      },
      en: {
        seo: {
          title: "Study in China - UniQ",
          description: "Admission to Chinese universities with UniQ: grants, language year, support, documents, campus and adaptation."
        },
        hero: {
          crumb: "Countries / China",
          eyebrow: "Study in China",
          title: "Grant with a monthly scholarship up to 220,000 KZT at Chinese universities",
          lead: "UniQ guides students from program choice to campus settlement: documents, application, language preparation and adaptation after arrival.",
          cta: "Leave a request",
          compare: "Compare with Turkey",
          compareSlug: "turkey",
          panelLabel: "First year",
          panelTitle: "Chinese language course",
          panelText: "We prepare students for the academic environment, documents, campus and daily questions before the main program starts.",
          stats: [
            ["No exams", "document-based admission"],
            ["HSK 3", "if you already know Chinese"],
            ["Grants", "tuition, housing, scholarship"]
          ]
        },
        overview: {
          eyebrow: "Why China",
          title: "A strong choice for students who need a grant and an international diploma",
          cards: [
            ["Wide choice of programs", "You can choose fields from humanities to engineering, medicine, IT and business."],
            ["Accessible cost", "Tuition and living costs are lower than many European routes, and grants reduce the family budget."],
            ["Culture and language", "A language year helps students enter studies smoothly, get used to campus and adapt faster."],
            ["Support on site", "The team helps with arrival, dormitory, SIM card, bank card and the first weeks."]
          ]
        },
        programs: {
          eyebrow: "Programs",
          title: "Admission formats for international students",
          cards: [
            ["Program 01", "Government grant", ["Free tuition", "Free housing", "Monthly scholarship"]],
            ["Program 02", "Full grant with housing", ["University matching by profile", "Document submission", "Support until settlement"]],
            ["Program 03", "Partial grant", ["Free or reduced tuition", "Best option for the budget", "Deadline control"]]
          ]
        },
        requirements: {
          eyebrow: "Requirements",
          title: "What the student should prepare",
          copy: "The exact list depends on the university and program, but the basic route usually includes these points.",
          items: [
            ["11th grade certificate or college diploma", "An official graduation document with good grades is required."],
            ["Basic English", "Perfect English is not required at the start, a basic level is enough."],
            ["Chinese language", "If the student already knows Chinese, HSK 3 results may be needed."]
          ]
        },
        cta: {
          eyebrow: "Next step",
          title: "Find out which China grant fits your profile",
          copy: "We will review grades, language, budget and admission timing, then build a clear action plan.",
          button: "Get consultation"
        }
      },
      uz: {
        seo: {
          title: "Xitoyda o'qish - UniQ",
          description: "UniQ bilan Xitoy universitetlariga kirish: grantlar, til yili, hujjatlar, kampus va moslashuv bo'yicha kuzatuv."
        },
        hero: {
          crumb: "Davlatlar / Xitoy",
          eyebrow: "Xitoyda o'qish",
          title: "Xitoy universitetlarida oyiga 220 000 KZT gacha stipendiyali grant",
          lead: "UniQ dastur tanlashdan kampusga joylashishgacha bo'lgan yo'lni kuzatadi: hujjatlar, ariza, til tayyorgarligi va kelgandan keyingi moslashuv.",
          cta: "Ariza qoldirish",
          compare: "Turkiya bilan solishtirish",
          compareSlug: "turkey",
          panelLabel: "Birinchi yil",
          panelTitle: "xitoy tili kursi",
          panelText: "Asosiy dastur boshlanishidan oldin o'quv muhiti, hujjatlar, kampus va maishiy savollarga tayyorlaymiz.",
          stats: [
            ["Imtihonsiz", "hujjatlar orqali qabul"],
            ["HSK 3", "xitoy tilini bilsangiz"],
            ["Grantlar", "o'qish, turar joy, stipendiya"]
          ]
        },
        overview: {
          eyebrow: "Nega Xitoy",
          title: "Grant va xalqaro diplom kerak bo'lgan talabalar uchun kuchli tanlov",
          cards: [
            ["Dasturlar tanlovi keng", "Gumanitar yo'nalishlardan muhandislik, tibbiyot, IT va biznesgacha yo'nalish tanlash mumkin."],
            ["Qulay narx", "O'qish va yashash xarajatlari ko'plab Yevropa yo'nalishlaridan past, grantlar esa oila budjetini kamaytiradi."],
            ["Madaniyat va til", "Til yili o'qishga yumshoq kirish, kampusga o'rganish va tezroq moslashishga yordam beradi."],
            ["Joyida kuzatuv", "Jamoa kelish, yotoqxona, SIM-karta, bank kartasi va ilk haftalarda yordam beradi."]
          ]
        },
        programs: {
          eyebrow: "Dasturlar",
          title: "Xalqaro talabalar uchun qabul formatlari",
          cards: [
            ["Dastur 01", "Hukumat granti", ["Bepul o'qish", "Bepul turar joy", "Oylik stipendiya"]],
            ["Dastur 02", "Turar joy bilan to'liq grant", ["Profilga mos universitet tanlash", "Hujjat topshirish", "Joylashishgacha qo'llab-quvvatlash"]],
            ["Dastur 03", "Qisman grant", ["Bepul yoki arzonlashtirilgan o'qish", "Budjetga mos eng yaxshi variant", "Muddatlarni nazorat qilish"]]
          ]
        },
        requirements: {
          eyebrow: "Talablar",
          title: "Talaba nimalarni tayyorlashi kerak",
          copy: "Aniq ro'yxat universitet va dasturga bog'liq, lekin asosiy yo'nalish odatda shu bandlardan iborat.",
          items: [
            ["11-sinf attestati yoki kollej diplomi", "Yaxshi baholar bilan o'quv muassasasini tugatganini tasdiqlovchi rasmiy hujjat kerak."],
            ["Bazaviy ingliz tili", "Boshlash uchun ingliz tilini mukammal bilish shart emas, bazaviy daraja yetarli."],
            ["Xitoy tili", "Talaba xitoy tilini bilsa, HSK 3 natijalari kerak bo'lishi mumkin."]
          ]
        },
        cta: {
          eyebrow: "Keyingi qadam",
          title: "Xitoydagi qaysi grant profilingizga mos kelishini aniqlaymiz",
          copy: "Baholar, til, budjet va qabul muddatlarini ko'rib chiqib, aniq harakat rejasini tuzamiz.",
          button: "Konsultatsiya olish"
        }
      }
    },
    italy: {
      ru: {
        seo: {
          title: "Обучение в Италии - UniQ",
          description: "Поступление в университеты Италии с UniQ: грант на весь период обучения, IELTS 6.0, GPA, программы бакалавриата и магистратуры."
        },
        hero: {
          crumb: "Страны / Италия",
          eyebrow: "Обучение в Италии",
          title: "Грант на весь период обучения в престижных университетах Италии",
          lead: "Италия подходит студентам с сильной академической базой: европейский диплом, международная среда и возможность стажировок в компаниях Европы.",
          cta: "Проверить GPA и IELTS",
          compare: "Сравнить с Китаем",
          compareSlug: "china",
          panelLabel: "Ключевые условия",
          panelTitle: "IELTS 6.0 и GPA 3.0+",
          panelText: "Поможем понять, подходит ли профиль для бакалавриата, магистратуры и грантовых программ.",
          stats: [
            ["Грант", "на весь период обучения"],
            ["IELTS 6.0", "для прямого поступления"],
            ["Стажировки", "в европейских компаниях"]
          ]
        },
        overview: {
          eyebrow: "Почему Италия",
          title: "Европейская траектория для студентов с хорошей успеваемостью",
          cards: [
            ["Мировые университеты", "Итальянские вузы предлагают сильные программы, международные связи и академическую среду."],
            ["Грант на обучение", "Студенты из Казахстана могут претендовать на поддержку, которая покрывает расходы на учебу."],
            ["Европейский диплом", "Диплом открывает карьерные возможности в разных странах и усиливает международный профиль."],
            ["Стажировки", "Практика в европейских компаниях помогает получить опыт и понять рынок до выпуска."]
          ]
        },
        programs: {
          eyebrow: "Программы",
          title: "Бакалавриат и магистратура с полным покрытием обучения",
          cards: [
            ["Бакалавриат", "Для первого высшего образования", ["Полное покрытие обучения", "Зачисление с IELTS 6.0", "GPA 3.0 и выше", "Грант на весь период"]],
            ["Магистратура", "Для усиления специальности", ["Полное покрытие обучения", "Зачисление с IELTS 6.0", "GPA 3.5 и выше", "Подбор программы под опыт"]]
          ]
        },
        requirements: {
          eyebrow: "Требования",
          title: "Что важно проверить заранее",
          copy: "По Италии особенно важны академические показатели и подтверждение английского языка.",
          items: [
            ["GPA выше 3.0", "Для магистратуры сильнее смотрится GPA 3.5 и выше."],
            ["IELTS 6.0", "Нужен тем, кто хочет поступать без потери года на языковые курсы."],
            ["Документы и дедлайны", "Сроки зависят от университета, уровня и грантовой программы."]
          ]
        },
        cta: {
          eyebrow: "Следующий шаг",
          title: "Проверим, подходит ли ваш GPA под Италию",
          copy: "Оценим балл, английский, уровень образования и предложим реалистичный список университетов.",
          button: "Получить консультацию"
        }
      },
      kz: {
        seo: {
          title: "Италияда оқу - UniQ",
          description: "UniQ арқылы Италия университеттеріне түсу: бүкіл оқу кезеңіне грант, IELTS 6.0, GPA, бакалавриат және магистратура бағдарламалары."
        },
        hero: {
          crumb: "Елдер / Италия",
          eyebrow: "Италияда оқу",
          title: "Италияның беделді университеттерінде бүкіл оқу кезеңіне грант",
          lead: "Италия академиялық базасы мықты студенттерге қолайлы: еуропалық диплом, халықаралық орта және Еуропа компанияларында тағылымдама мүмкіндігі.",
          cta: "GPA және IELTS тексеру",
          compare: "Қытаймен салыстыру",
          compareSlug: "china",
          panelLabel: "Негізгі шарттар",
          panelTitle: "IELTS 6.0 және GPA 3.0+",
          panelText: "Профиліңіз бакалавриат, магистратура және гранттық бағдарламаларға сәйкес келе ме, соны түсінуге көмектесеміз.",
          stats: [
            ["Грант", "бүкіл оқу кезеңіне"],
            ["IELTS 6.0", "тікелей түсу үшін"],
            ["Тағылымдама", "еуропалық компанияларда"]
          ]
        },
        overview: {
          eyebrow: "Неге Италия",
          title: "Үлгерімі жақсы студенттерге арналған еуропалық бағыт",
          cards: [
            ["Әлемдік университеттер", "Италия университеттері мықты бағдарламалар, халықаралық байланыстар және академиялық орта ұсынады."],
            ["Оқуға грант", "Қазақстандық студенттер оқу шығынын жабатын қолдауға үміткер бола алады."],
            ["Еуропалық диплом", "Диплом әр елдегі мансап мүмкіндіктерін ашып, халықаралық профильді күшейтеді."],
            ["Тағылымдама", "Еуропалық компаниялардағы практика тәжірибе жинауға және нарықты ертерек түсінуге көмектеседі."]
          ]
        },
        programs: {
          eyebrow: "Бағдарламалар",
          title: "Оқу ақысын толық жабатын бакалавриат және магистратура",
          cards: [
            ["Бакалавриат", "Алғашқы жоғары білім үшін", ["Оқу ақысын толық жабу", "IELTS 6.0 арқылы түсу", "GPA 3.0 және жоғары", "Бүкіл оқу кезеңіне грант"]],
            ["Магистратура", "Мамандықты күшейту үшін", ["Оқу ақысын толық жабу", "IELTS 6.0 арқылы түсу", "GPA 3.5 және жоғары", "Тәжірибеге сай бағдарлама таңдау"]]
          ]
        },
        requirements: {
          eyebrow: "Талаптар",
          title: "Нені алдын ала тексеру маңызды",
          copy: "Италия бағыты үшін академиялық көрсеткіштер мен ағылшын тілін растау әсіресе маңызды.",
          items: [
            ["GPA 3.0-ден жоғары", "Магистратура үшін GPA 3.5 және жоғары болғаны мықтырақ көрінеді."],
            ["IELTS 6.0", "Тілдік курсқа жыл жоғалтпай түскісі келетін студенттерге қажет."],
            ["Құжаттар және мерзімдер", "Мерзімдер университетке, деңгейге және гранттық бағдарламаға байланысты."]
          ]
        },
        cta: {
          eyebrow: "Келесі қадам",
          title: "GPA көрсеткішіңіз Италияға сай келе ме, тексереміз",
          copy: "Бағаңызды, ағылшын деңгейін және білім деңгейін бағалап, шынайы университеттер тізімін ұсынамыз.",
          button: "Кеңес алу"
        }
      },
      en: {
        seo: {
          title: "Study in Italy - UniQ",
          description: "Admission to Italian universities with UniQ: grant for the full study period, IELTS 6.0, GPA, bachelor and master programs."
        },
        hero: {
          crumb: "Countries / Italy",
          eyebrow: "Study in Italy",
          title: "Grant for the full study period at prestigious Italian universities",
          lead: "Italy suits students with a strong academic base: European diploma, international environment and internship opportunities in European companies.",
          cta: "Check GPA and IELTS",
          compare: "Compare with China",
          compareSlug: "china",
          panelLabel: "Key conditions",
          panelTitle: "IELTS 6.0 and GPA 3.0+",
          panelText: "We help understand whether the profile fits bachelor, master and grant programs.",
          stats: [
            ["Grant", "for the full study period"],
            ["IELTS 6.0", "for direct admission"],
            ["Internships", "in European companies"]
          ]
        },
        overview: {
          eyebrow: "Why Italy",
          title: "A European route for students with strong academic results",
          cards: [
            ["World universities", "Italian universities offer strong programs, international links and an academic environment."],
            ["Study grant", "Students from Kazakhstan can apply for support that covers study costs."],
            ["European diploma", "The diploma opens career opportunities in different countries and strengthens the international profile."],
            ["Internships", "Practice in European companies helps gain experience and understand the market before graduation."]
          ]
        },
        programs: {
          eyebrow: "Programs",
          title: "Bachelor and master programs with full tuition coverage",
          cards: [
            ["Bachelor", "For first higher education", ["Full tuition coverage", "Admission with IELTS 6.0", "GPA 3.0 and above", "Grant for the full period"]],
            ["Master", "To strengthen the specialty", ["Full tuition coverage", "Admission with IELTS 6.0", "GPA 3.5 and above", "Program matching by experience"]]
          ]
        },
        requirements: {
          eyebrow: "Requirements",
          title: "What to check in advance",
          copy: "For Italy, academic indicators and English language confirmation are especially important.",
          items: [
            ["GPA above 3.0", "For master's programs, GPA 3.5 and above looks stronger."],
            ["IELTS 6.0", "Needed for students who want admission without losing a year to language courses."],
            ["Documents and deadlines", "Deadlines depend on the university, level and grant program."]
          ]
        },
        cta: {
          eyebrow: "Next step",
          title: "We will check whether your GPA fits Italy",
          copy: "We will assess grades, English level and education level, then suggest a realistic university list.",
          button: "Get consultation"
        }
      },
      uz: {
        seo: {
          title: "Italiyada o'qish - UniQ",
          description: "UniQ bilan Italiya universitetlariga kirish: butun o'qish davriga grant, IELTS 6.0, GPA, bakalavr va magistratura dasturlari."
        },
        hero: {
          crumb: "Davlatlar / Italiya",
          eyebrow: "Italiyada o'qish",
          title: "Italiyaning nufuzli universitetlarida butun o'qish davriga grant",
          lead: "Italiya akademik bazasi kuchli talabalar uchun mos: Yevropa diplomi, xalqaro muhit va Yevropa kompaniyalarida amaliyot imkoniyati.",
          cta: "GPA va IELTS tekshirish",
          compare: "Xitoy bilan solishtirish",
          compareSlug: "china",
          panelLabel: "Asosiy shartlar",
          panelTitle: "IELTS 6.0 va GPA 3.0+",
          panelText: "Profilingiz bakalavr, magistratura va grant dasturlariga mos kelishini tushunishga yordam beramiz.",
          stats: [
            ["Grant", "butun o'qish davriga"],
            ["IELTS 6.0", "to'g'ridan-to'g'ri qabul uchun"],
            ["Amaliyot", "Yevropa kompaniyalarida"]
          ]
        },
        overview: {
          eyebrow: "Nega Italiya",
          title: "Yaxshi o'zlashtirishga ega talabalar uchun Yevropa yo'nalishi",
          cards: [
            ["Jahon universitetlari", "Italiya universitetlari kuchli dasturlar, xalqaro aloqalar va akademik muhit taklif qiladi."],
            ["O'qish granti", "Qozog'istonlik talabalar o'qish xarajatlarini qoplaydigan yordamga nomzod bo'lishi mumkin."],
            ["Yevropa diplomi", "Diplom turli davlatlarda karyera imkoniyatlarini ochadi va xalqaro profilni kuchaytiradi."],
            ["Amaliyot", "Yevropa kompaniyalaridagi amaliyot tajriba olish va bozorni bitiruvdan oldin tushunishga yordam beradi."]
          ]
        },
        programs: {
          eyebrow: "Dasturlar",
          title: "O'qish to'lovini to'liq qoplaydigan bakalavr va magistratura",
          cards: [
            ["Bakalavr", "Birinchi oliy ta'lim uchun", ["O'qish to'lovini to'liq qoplash", "IELTS 6.0 bilan qabul", "GPA 3.0 va yuqori", "Butun davr uchun grant"]],
            ["Magistratura", "Mutaxassislikni kuchaytirish uchun", ["O'qish to'lovini to'liq qoplash", "IELTS 6.0 bilan qabul", "GPA 3.5 va yuqori", "Tajriba bo'yicha dastur tanlash"]]
          ]
        },
        requirements: {
          eyebrow: "Talablar",
          title: "Oldindan nimani tekshirish muhim",
          copy: "Italiya yo'nalishida akademik ko'rsatkichlar va ingliz tilini tasdiqlash ayniqsa muhim.",
          items: [
            ["GPA 3.0 dan yuqori", "Magistratura uchun GPA 3.5 va yuqori bo'lsa kuchliroq ko'rinadi."],
            ["IELTS 6.0", "Til kurslariga yil yo'qotmasdan kirishni istagan talabalar uchun kerak."],
            ["Hujjatlar va muddatlar", "Muddatlar universitet, daraja va grant dasturiga bog'liq."]
          ]
        },
        cta: {
          eyebrow: "Keyingi qadam",
          title: "GPA ko'rsatkichingiz Italiyaga mos kelishini tekshiramiz",
          copy: "Baholaringiz, ingliz tili va ta'lim darajangizni baholab, real universitetlar ro'yxatini taklif qilamiz.",
          button: "Konsultatsiya olish"
        }
      }
    }
  };

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const slug = window.location.pathname.split("/").filter(Boolean)[0] || "china";
  const page = pages[slug];
  if (!page) return;

  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const getLangFromUrl = () => new URLSearchParams(window.location.search).get("lang");
  const getLang = (requested) => (page[requested] ? requested : "ru");
  const resolveInitialLang = async () => {
    const fallback = getLang(getLangFromUrl() || localStorage.getItem("uniqu-lang") || "ru");
    if (!window.UniqGeoLanguage) return fallback;

    const detected = await window.UniqGeoLanguage.detectDefaultLanguage({
      available: Object.keys(page),
      fallback: "ru"
    });

    return getLang(detected || fallback);
  };

  let currentLang = "ru";

  const withLang = (path, hash = "") => {
    const url = new URL(path, window.location.origin);
    url.searchParams.set("lang", currentLang);
    url.hash = hash;
    return `${url.pathname}${url.search}${url.hash}`;
  };

  const externalUrl = () => `https://uniqu.kz/${slug}`;

  const text = (selector, value, root = document) => {
    const element = qs(selector, root);
    if (element && value !== undefined) element.textContent = value;
  };

  const setButton = (button, label, icon = "arrow-right") => {
    if (!button) return;
    button.innerHTML = `${escapeHtml(label)} <i data-lucide="${escapeHtml(icon)}"></i>`;
  };

  const ensureMeta = (selector, createAttributes) => {
    let element = qs(selector);
    if (!element) {
      element = document.createElement("meta");
      Object.entries(createAttributes).forEach(([key, value]) => element.setAttribute(key, value));
      document.head.appendChild(element);
    }
    return element;
  };

  const renderSeo = (copy) => {
    document.title = copy.seo.title;
    ensureMeta('meta[name="description"]', { name: "description" }).setAttribute("content", copy.seo.description);
    ensureMeta('meta[property="og:title"]', { property: "og:title" }).setAttribute("content", copy.seo.title);
    ensureMeta('meta[property="og:description"]', { property: "og:description" }).setAttribute("content", copy.seo.description);
    ensureMeta('meta[property="og:url"]', { property: "og:url" }).setAttribute("content", `${externalUrl()}?lang=${currentLang}`);

    let canonical = qs('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = externalUrl();

    qsa('link[rel="alternate"][data-country-page]').forEach((item) => item.remove());
    languages.forEach((language) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = language.htmlLang;
      link.href = `${externalUrl()}?lang=${language.code}`;
      link.dataset.countryPage = "true";
      document.head.appendChild(link);
    });

    const defaultLink = document.createElement("link");
    defaultLink.rel = "alternate";
    defaultLink.hreflang = "x-default";
    defaultLink.href = `${externalUrl()}?lang=ru`;
    defaultLink.dataset.countryPage = "true";
    document.head.appendChild(defaultLink);
  };

  const renderLanguages = (shared) => {
    const current = languages.find((language) => language.code === currentLang) || languages[0];
    qsa(".lang-switcher").forEach((switcher) => {
      switcher.innerHTML = `
        <button class="lang-current" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="${escapeHtml(shared.languageAria)} ${escapeHtml(current.name)}">
          <span>${escapeHtml(current.label)}</span>
          <i data-lucide="chevron-down"></i>
        </button>
        <div class="lang-menu" role="listbox" aria-label="${escapeHtml(shared.languageAria)}">
          ${languages
            .map((language) => {
              const active = language.code === currentLang;
              return `<button class="lang-option${active ? " is-active" : ""}" type="button" role="option" aria-selected="${active}" data-country-lang="${escapeHtml(language.code)}">
                <span>${escapeHtml(language.name)}</span>
                <small>${escapeHtml(language.label)}</small>
              </button>`;
            })
            .join("")}
        </div>
      `;

      const currentButton = qs(".lang-current", switcher);
      currentButton?.addEventListener("click", () => {
        const shouldOpen = !switcher.classList.contains("is-open");
        qsa(".lang-switcher.is-open").forEach((item) => item.classList.remove("is-open"));
        switcher.classList.toggle("is-open", shouldOpen);
        currentButton.setAttribute("aria-expanded", String(shouldOpen));
      });
    });

    qsa(".mobile-lang-switcher").forEach((switcher) => {
      switcher.innerHTML = languages
        .map(
          (language) =>
            `<button class="lang-option${language.code === currentLang ? " is-active" : ""}" type="button" data-country-lang="${escapeHtml(language.code)}">${escapeHtml(language.label)}</button>`
        )
        .join("");
    });

    qsa("[data-country-lang]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextLang = button.dataset.countryLang;
        if (!nextLang || !page[nextLang]) return;
        currentLang = nextLang;
        localStorage.setItem("uniqu-lang", currentLang);
        const url = new URL(window.location.href);
        url.searchParams.set("lang", currentLang);
        history.replaceState(null, "", url);
        render();
        qs("[data-menu]")?.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  };

  const renderNav = (shared) => {
    const navLinks = [
      ["about", "#about"],
      ["programs", "#programs"],
      ["countries", "#countries"],
      ["services", "#services"],
      ["reviews", "#reviews"],
      ["cases", "#cases"],
      ["faq", "#faq"],
      ["contacts", "#contacts"]
    ];

    qsa(".desktop-nav a").forEach((link, index) => {
      const [key, hash] = navLinks[index] || [];
      if (!key) return;
      link.textContent = shared.nav[key];
      link.href = withLang("/", hash);
    });

    const mobileItems = [
      ["home", ""],
      ["programs", "#programs"],
      ["countries", "#countries"],
      ["services", "#services"],
      ["reviews", "#reviews"],
      ["contacts", "#contacts"]
    ];

    qsa(".mobile-menu > a").forEach((link, index) => {
      const [key, hash] = mobileItems[index] || [];
      if (!key) return;
      link.textContent = shared.nav[key];
      link.href = withLang("/", hash);
    });

    qsa(".logo").forEach((logo) => {
      logo.href = withLang("/");
    });
  };

  const renderHero = (copy, shared) => {
    text(".country-crumb", copy.hero.crumb);
    const crumb = qs(".country-crumb");
    if (crumb) crumb.href = withLang("/", "#countries");
    text(".country-hero__content .eyebrow", copy.hero.eyebrow);
    text(".country-hero h1", copy.hero.title);
    text(".country-hero__content > p:not(.eyebrow)", copy.hero.lead);
    setButton(qs(".country-hero__actions .primary-button"), copy.hero.cta);
    const compare = qs(".country-hero__actions .ghost-link");
    if (compare) {
      compare.textContent = copy.hero.compare;
      compare.href = withLang(`/${copy.hero.compareSlug || "china"}`);
    }
    text(".country-hero__panel span", copy.hero.panelLabel);
    text(".country-hero__panel strong", copy.hero.panelTitle);
    text(".country-hero__panel p", copy.hero.panelText);
    qsa(".country-hero__stats article").forEach((item, index) => {
      const stat = copy.hero.stats[index];
      if (!stat) return;
      text("strong", stat[0], item);
      text("span", stat[1], item);
    });
    document.body.dataset.countryName = shared.countries[slug] || "";
  };

  const renderCards = (selector, cards) => {
    qsa(selector).forEach((card, index) => {
      const item = cards[index];
      if (!item) return;
      text("h3", item[0], card);
      text("p", item[1], card);
    });
  };

  const renderPrograms = (copy) => {
    text(".country-programs .eyebrow", copy.programs.eyebrow);
    text(".country-programs h2", copy.programs.title);
    qsa(".country-program-card").forEach((card, index) => {
      const item = copy.programs.cards[index];
      if (!item) return;
      text("small", item[0], card);
      text("h3", item[1], card);
      const list = qs("ul", card);
      if (list) list.innerHTML = item[2].map((point) => `<li>${escapeHtml(point)}</li>`).join("");
    });
  };

  const renderRequirements = (copy) => {
    text(".country-requirements__intro .eyebrow", copy.requirements.eyebrow);
    text(".country-requirements__intro h2", copy.requirements.title);
    text(".country-requirements__intro p:not(.eyebrow)", copy.requirements.copy);
    qsa(".country-requirements__list article").forEach((item, index) => {
      const row = copy.requirements.items[index];
      if (!row) return;
      text("strong", row[0], item);
      text("p", row[1], item);
    });
  };

  const renderCta = (copy) => {
    text(".country-cta__text .eyebrow", copy.cta.eyebrow);
    text(".country-cta h2", copy.cta.title);
    text(".country-cta p:not(.eyebrow)", copy.cta.copy);
    setButton(qs(".country-cta .primary-button"), copy.cta.button);
  };

  const renderFooter = (shared) => {
    text(".footer > div:first-child p", shared.footer.copy);
    const headings = qsa(".footer h3");
    if (headings[0]) headings[0].textContent = shared.footer.contacts;
    if (headings[1]) headings[1].textContent = shared.footer.countries;

    const footerLinks = qsa(".footer > div:last-child a");
    const countryOrder = ["china", "turkey", "italy"];
    footerLinks.forEach((link, index) => {
      const countrySlug = countryOrder[index];
      if (countrySlug) {
        link.textContent = shared.countries[countrySlug];
        link.href = withLang(`/${countrySlug}`);
        return;
      }
      link.textContent = shared.nav.faq;
      link.href = withLang("/", "#faq");
    });
  };

  const renderForm = (shared) => {
    text(".modal .eyebrow", shared.form.eyebrow);
    text("#modal-title", shared.form.title);
    text(".modal__panel > p:not(.eyebrow)", shared.form.copy);
    qs(".modal__close")?.setAttribute("aria-label", shared.form.close);

    const form = qs("#leadForm");
    if (form) {
      form.innerHTML = `
        <label>${escapeHtml(shared.form.name)}<input name="name" type="text" placeholder="${escapeHtml(shared.form.namePlaceholder)}" required /></label>
        <label>${escapeHtml(shared.form.phone)}<input name="phone" type="tel" placeholder="${escapeHtml(shared.form.phonePlaceholder)}" required /></label>
        <label>${escapeHtml(shared.form.grade)}<select name="grade">${shared.form.grades.map((grade) => `<option>${escapeHtml(grade)}</option>`).join("")}</select></label>
        <label>${escapeHtml(shared.form.country)}<input name="country" type="text" value="${escapeHtml(shared.countries[slug])}" /></label>
        <button class="primary-button" type="submit">${escapeHtml(shared.form.submit)} <i data-lucide="send"></i></button>
      `;
    }

    text(".success-state h3", shared.form.successTitle);
    text(".success-state p", shared.form.successText);
  };

  function render() {
    const shared = common[currentLang] || common.ru;
    const copy = page[currentLang] || page.ru;
    document.documentElement.lang = languages.find((language) => language.code === currentLang)?.htmlLang || currentLang;
    renderSeo(copy);
    renderLanguages(shared);
    renderNav(shared);
    renderHero(copy, shared);
    text(".country-overview .eyebrow", copy.overview.eyebrow);
    text(".country-overview h2", copy.overview.title);
    renderCards(".country-page-card", copy.overview.cards);
    renderPrograms(copy);
    renderRequirements(copy);
    renderCta(copy);
    renderFooter(shared);
    renderForm(shared);
    window.initMotionSystem?.();
    if (window.lucide) window.lucide.createIcons();
  }

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || event.target.closest(".lang-switcher")) return;
    qsa(".lang-switcher.is-open").forEach((switcher) => {
      switcher.classList.remove("is-open");
      qs(".lang-current", switcher)?.setAttribute("aria-expanded", "false");
    });
  });

  const init = async () => {
    currentLang = await resolveInitialLang();
    render();
  };

  init();
})();
