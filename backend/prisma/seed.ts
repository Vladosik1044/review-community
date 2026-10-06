import { PrismaClient, WorkType, Role, ReviewStatus, ListStatus, ReportStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed...');

  // ЖАНРЫ
  const genresData = [
    { name: 'Фантастика', slug: 'fantasy' },
    { name: 'Драма', slug: 'drama' },
    { name: 'Триллер', slug: 'thriller' },
    { name: 'Комедия', slug: 'comedy' },
    { name: 'Приключения', slug: 'adventure' },
  ];

  for (const g of genresData) {
    await prisma.genre.upsert({ where: { slug: g.slug }, update: {}, create: g });
  }

  // ПОЛЬЗОВАТЕЛИ
  const passwordHash = await bcrypt.hash('password123', 10);

  const usersData = [
    { email: 'admin@reviews.local', username: 'admin', role: Role.ADMIN },
    { email: 'moder@reviews.local', username: 'moderator', role: Role.MODERATOR },
    { email: 'user@reviews.local', username: 'user', role: Role.USER },
  ];

  const users = [];
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash },
    });
    users.push(user);
  }

  const [admin, moderator, regularUser] = users;

  // ПРОИЗВЕДЕНИЯ
  const worksData = [
    // ФИЛЬМЫ
    {
      title: 'Эхо Пустоты',
      originalTitle: 'Echo of the Void',
      type: WorkType.MOVIE,
      releaseYear: 2022,
      duration: 128,
      creator: 'Анна Соколова',
      coverUrl: '/covers/01-echo-void.jpg',
      description: 'Одинокий астронавт уже третий год несёт вахту на заброшенной исследовательской станции на краю Солнечной системы. Однажды он ловит сигнал, которого не должно существовать: частота совпадает с записью его собственного голоса, сделанной много лет назад. Чем ближе он к разгадке, тем сильнее стирается граница между реальностью и воспоминаниями. Станция начинает вести себя странно, а в отражениях появляются лица, которых там быть не может. Чтобы понять, что происходит, герою придётся заглянуть в самые тёмные уголки собственной памяти — и решить, что страшнее: неизвестность снаружи или правда внутри.',
      genres: ['fantasy', 'thriller'],
    },
    {
      title: 'Последний Свидетель',
      originalTitle: 'The Last Witness',
      type: WorkType.MOVIE,
      releaseYear: 2020,
      duration: 114,
      creator: 'Игорь Волков',
      coverUrl: '/covers/02-last-witness.jpg',
      description: 'Следователь Илья Дёмин получает в работу дело двадцатилетней давности — убийство, которое так и не было раскрыто. Единственный свидетель, старик по фамилии Крамер, всё это время отказывался говорить. Теперь он согласен дать показания, но с одним условием: разговор должен состояться с глазу на глаз. Чем больше деталей всплывает, тем яснее становится: правда способна разрушить не только карьеру следователя, но и жизни всех, кто причастен к делу. Илья оказывается перед выбором — закрыть дело тихо или довести его до конца, даже если конец перечеркнёт всё, во что он верил.',
      genres: ['thriller', 'drama'],
    },
    {
      title: 'Дорога Домой',
      originalTitle: 'The Way Home',
      type: WorkType.MOVIE,
      releaseYear: 2019,
      duration: 141,
      creator: 'Мария Лебедева',
      coverUrl: '/covers/03-way-home.jpg',
      description: 'Отец и сын, не разговаривавшие десять лет, вынуждены вместе отправиться через всю страну. Повод печальный: бабушке исполняется девяносто, и она хочет увидеть их обоих. По дороге ломается машина, заканчиваются деньги, случаются нелепые ссоры и неожиданные примирения. Через маленькие города, случайные попутчики и старые семейные истории герои постепенно вспоминают, кем были друг для друга. Это тёплая и честная драма о том, что настоящий дом — не место на карте, а люди, которые рядом.',
      genres: ['drama', 'adventure'],
    },
    {
      title: 'Несерьёзные Люди',
      originalTitle: 'Unserious People',
      type: WorkType.MOVIE,
      releaseYear: 2021,
      duration: 98,
      creator: 'Павел Крайнов',
      coverUrl: '/covers/04-unserious-people.jpg',
      description: 'Три друга, каждый из которых давно устал от своей скучной работы, решают открыть агентство по решению любых проблем. Идея кажется гениальной ровно до первого заказа: пожилая клиентка просит найти её пропавшего кота. С этого момента всё идёт кувырком — погони за сомнительными личностями, случайное похищение, неожиданное наследство и один очень нервный полицейский. Каждый новый поворот сюжета делает ситуацию только абсурднее, но друзья не сдаются. Лёгкая комедия о том, что иногда всё идёт не по плану — и именно поэтому становится интереснее.',
      genres: ['comedy'],
    },
    // КНИГИ
    {
      title: 'Хроники Пепла',
      originalTitle: 'Chronicles of Ash',
      type: WorkType.BOOK,
      releaseYear: 2018,
      pages: 512,
      creator: 'Дмитрий Соколов',
      coverUrl: '/covers/05-chronicles-of-ash.jpg',
      description: 'После Великого Пожара мир разделился на города-крепости и выжженные пустоши. Внутри крепостей люди живут по строгим правилам, а за стенами царит хаос. Юная картограф Нэйра получает заказ нарисовать карту легендарного города, где, по преданиям, сохранились семена жизни. Путешествие через мёртвые земли превращается в череду встреч с выжившими, бандитами и пророками. Чем дальше она идёт, тем сильнее понимает: правда о прошлом опаснее, чем любые чудовища снаружи. История о надежде, потере и цене знания, которое не каждому стоит находить.',
      genres: ['fantasy', 'adventure'],
    },
    {
      title: 'Тихий Берег',
      originalTitle: 'The Quiet Shore',
      type: WorkType.BOOK,
      releaseYear: 2015,
      pages: 384,
      creator: 'Елена Морозова',
      coverUrl: '/covers/06-quiet-shore.jpg',
      description: 'После смерти мужа Анна переезжает в старый дом у моря — подальше от городской суеты и от собственного горя. Здесь всё иначе: медленный ритм, шум прибоя, соседи, у каждого из которых своя история. Постепенно Анна знакомится с рыбаками, старухой-художницей, мальчиком, который боится воды. Через эти встречи она учится заново слышать себя и находить смысл в мелочах. Медленная, атмосферная проза о принятии, одиночестве и умении начинать заново, когда кажется, что уже поздно.',
      genres: ['drama'],
    },
    {
      title: 'Игра в Молчание',
      originalTitle: 'The Silence Game',
      type: WorkType.BOOK,
      releaseYear: 2020,
      pages: 448,
      creator: 'Артём Гончаров',
      coverUrl: '/covers/07-silence-game.jpg',
      description: 'Психолог Марк Верейский получает пациентку, которая не разговаривает уже три года. Никаких травм, никаких диагнозов — просто молчание. Чтобы её понять, ему приходится нарушить все собственные правила: читать чужие дневники, идти на контакт с людьми из её прошлого, ставить под сомнение свой профессионализм. Чем ближе разгадка, тем яснее становится, что молчание — это не пустота, а способ говорить. Напряжённый психологический триллер о границах разума, эмпатии и о том, что иногда правда лежит не там, где её ищут.',
      genres: ['thriller'],
    },
    {
      title: 'Путешествие на Юг',
      originalTitle: 'Journey South',
      type: WorkType.BOOK,
      releaseYear: 2012,
      pages: 320,
      creator: 'Николай Ветров',
      coverUrl: '/covers/08-journey-south.jpg',
      description: 'Двое друзей, Макс и Денис, решают доехать автостопом до южного моря. С собой — только рюкзак, чувство юмора и абсолютное отсутствие плана. По дороге они теряют документы, попадают в странные компании, работают грузчиками на рынке и влюбляются в случайных попутчиц. Каждый день приносит новую нелепую историю, но именно из этих мелочей складывается путешествие, о котором потом хочется рассказывать. Ироничная книга о свободе, дружбе и о том, что путь иногда важнее цели.',
      genres: ['adventure', 'comedy'],
    },
    // ИГРЫ
    {
      title: 'Последний Рубеж',
      originalTitle: 'The Last Frontier',
      type: WorkType.GAME,
      releaseYear: 2023,
      creator: 'Nordwind Studio',
      coverUrl: '/covers/09-last-frontier.jpg',
      description: 'После глобальной катастрофы человечество отступило в немногочисленные поселения, разделённые пустошами и враждой. Игрок берёт на себя роль одинокого скитальца, который находит руины старого города и решает построить здесь новое общество. Нужно исследовать территории, собирать ресурсы, заключать союзы и принимать решения, от которых зависит судьба десятков людей. Каждый выбор имеет последствия: одни поселенцы уходят, другие приходят, а старые враги не дремлют. Атмосферная RPG о лидерстве, ответственности и цене компромиссов.',
      genres: ['fantasy', 'adventure'],
    },
    {
      title: 'Тени Прошлого',
      originalTitle: 'Shadows of the Past',
      type: WorkType.GAME,
      releaseYear: 2021,
      creator: 'Silent Room Games',
      coverUrl: '/covers/10-shadows-of-past.jpg',
      description: 'Детектив Алекс Райт расследует серию убийств, каждое из которых пугающе напоминает события двадцатилетней давности — те, что он пытается забыть. Улики ведут в места, где он вырос, к людям, которых он бросил. Чтобы найти убийцу, ему придётся снова пережить собственное прошлое и ответить на вопрос, который он избегал всю жизнь. Игра предлагает несколько концовок в зависимости от решений игрока. Психологический триллер о памяти, вине и невозможности убежать от себя.',
      genres: ['thriller', 'drama'],
    },
    {
      title: 'Путь Героя',
      originalTitle: "Hero's Path",
      type: WorkType.GAME,
      releaseYear: 2019,
      creator: 'Bright Forge',
      coverUrl: '/covers/11-hero-path.jpg',
      description: 'Юный кузнец Кайл мечтает о подвигах, но вынужден день за днём работать в мастерской отца. Когда из храма похищают древний артефакт, именно его отправляют в путь — потому что больше некому. По дороге он встречает наёмников, магов и простых крестьян, каждый из которых меняет его представление о мире. Классическое фэнтези-приключение с исследованием, боями и моральным выбором. История о том, что героем становятся не по рождению, а по поступкам.',
      genres: ['fantasy', 'adventure'],
    },
    {
      title: 'Весёлый Квест',
      originalTitle: 'The Funny Quest',
      type: WorkType.GAME,
      releaseYear: 2020,
      creator: 'Pixel Clouds',
      coverUrl: '/covers/12-funny-quest.jpg',
      description: 'Ленивый программист Стас однажды засыпает за ноутбуком и просыпается внутри собственного незаконченного квеста. Мир вокруг — набор багов, недоработанных локаций и персонажей с кривыми диалогами. Чтобы выбраться, ему придётся пройти все уровни, которые он так и не доделал. На пути — злые NPC, бесконечные туториалы и босс, который требует объяснить, почему его так и не добавили в финальную версию. Пародийная комедия о мире видеоигр и о том, что иногда лучше доделывать начатое.',
      genres: ['comedy', 'adventure'],
    },
  ];

  const works = [];
  for (const w of worksData) {
    const { genres: genreSlugs, ...workData } = w;
    const work = await prisma.work.create({
      data: {
        ...workData,
        genres: {
          create: genreSlugs.map((slug) => ({ genre: { connect: { slug } } })),
        },
      },
    });
    works.push(work);
  }

  // ОЦЕНКИ
  const ratingsData = [
    { userId: regularUser.id, workId: works[0].id, value: 9 },
    { userId: moderator.id, workId: works[0].id, value: 8 },
    { userId: admin.id, workId: works[0].id, value: 10 },
    { userId: regularUser.id, workId: works[1].id, value: 7 },
    { userId: moderator.id, workId: works[1].id, value: 8 },
    { userId: regularUser.id, workId: works[2].id, value: 9 },
    { userId: admin.id, workId: works[3].id, value: 7 },
    { userId: regularUser.id, workId: works[4].id, value: 10 },
    { userId: moderator.id, workId: works[4].id, value: 9 },
    { userId: regularUser.id, workId: works[5].id, value: 8 },
    { userId: admin.id, workId: works[6].id, value: 9 },
    { userId: moderator.id, workId: works[7].id, value: 7 },
    { userId: regularUser.id, workId: works[8].id, value: 10 },
    { userId: moderator.id, workId: works[9].id, value: 8 },
    { userId: admin.id, workId: works[10].id, value: 9 },
  ];

  for (const r of ratingsData) {
    await prisma.rating.upsert({
      where: { userId_workId: { userId: r.userId, workId: r.workId } },
      update: {},
      create: r,
    });
  }

  // РЕЦЕНЗИИ
  const reviewsData = [
    {
      title: 'Атмосфера, которая не отпускает',
      text: 'Отличный пример того, как малыми средствами можно создать большое напряжение. Актёрская игра на высоте, а финал заставляет пересмотреть весь фильм заново.',
      userId: regularUser.id,
      workId: works[0].id,
      status: ReviewStatus.PUBLISHED,
      hasSpoiler: false,
      likes: 14,
    },
    {
      title: 'Медленно, но верно',
      text: 'Первый час кажется затянутым, но потом понимаешь, что это была подготовка. Второй акт — сильнейший.',
      userId: moderator.id,
      workId: works[0].id,
      status: ReviewStatus.PUBLISHED,
      hasSpoiler: false,
      likes: 6,
    },
    {
      title: 'История о правде',
      text: 'Редкий случай, когда триллер говорит не только о преступлении, но и о человеке. Рекомендую.',
      userId: admin.id,
      workId: works[1].id,
      status: ReviewStatus.PUBLISHED,
      hasSpoiler: false,
      likes: 9,
    },
    {
      title: 'Хочу больше таких книг',
      text: 'Атмосферная проза, живые герои, честный финал. Читается за два вечера.',
      userId: regularUser.id,
      workId: works[4].id,
      status: ReviewStatus.PENDING,
      hasSpoiler: false,
      likes: 0,
    },
    {
      title: 'Спойлер: кто убийца',
      text: 'Раскрою главную интригу сюжета, потому что не могу молчать.',
      userId: moderator.id,
      workId: works[6].id,
      status: ReviewStatus.PENDING,
      hasSpoiler: true,
      likes: 0,
    },
  ];

  const reviews = [];
  for (const r of reviewsData) {
    const review = await prisma.review.create({ data: r });
    reviews.push(review);
  }

  // КОММЕНТАРИИ
  const commentsData = [
    { text: 'Согласен, финал переворачивает всё.', userId: moderator.id, reviewId: reviews[0].id },
    { text: 'А мне показалось, что первый акт как раз лучший.', userId: admin.id, reviewId: reviews[0].id },
    { text: 'Добавил в список, спасибо.', userId: regularUser.id, reviewId: reviews[2].id },
  ];

  for (const c of commentsData) {
    await prisma.comment.create({ data: c });
  }

  // СПИСКИ
  await prisma.list.create({
    data: {
      name: 'Хочу посмотреть',
      userId: regularUser.id,
      isPublic: true,
      items: {
        create: [
          { workId: works[2].id, status: ListStatus.WANT },
          { workId: works[3].id, status: ListStatus.WANT },
        ],
      },
    },
  });

  await prisma.list.create({
    data: {
      name: 'Прочитано в этом году',
      userId: moderator.id,
      isPublic: true,
      items: {
        create: [
          { workId: works[4].id, status: ListStatus.DONE },
          { workId: works[5].id, status: ListStatus.DONE },
        ],
      },
    },
  });

   // ЖАЛОБА
  await prisma.report.create({
    data: {
      reason: 'Спойлер без предупреждения',
      status: ReportStatus.OPEN,
      userId: regularUser.id,
      reviewId: reviews[4].id,
    },
  });

  // ИТОГИ
  const counts = {
    genres: await prisma.genre.count(),
    users: await prisma.user.count(),
    works: await prisma.work.count(),
    ratings: await prisma.rating.count(),
    reviews: await prisma.review.count(),
    comments: await prisma.comment.count(),
    lists: await prisma.list.count(),
    reports: await prisma.report.count(),
  };

  console.log('✅ Seed завершён:');
  console.log(counts);
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });