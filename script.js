// --- Configuration & Data ---

const SONG_LIST = [
    {
        title: "Konna Netlaka",
        artist: "Fairuz",
        url: "songs_to_use/track_konna.m4a",
        art: "photos_to_use/photo_1.webp",
        lyrics: [
            { time: 22.00, text: "كنا نتلاقى من عشية\nKenna netla'a men 'ashiyye" },
            { time: 27.12, text: "ونقعد على الجسر العتيق\nW ne'od 'ala el-jisr el-'atee'" },
            { time: 32.39, text: "وتنزل على السهل الضبابة\nW tenzal 'ala es-sahl ed-dababe" },
            { time: 37.56, text: "تمحي المدى وتمحي الطريق\nTemhi el-mada w temhi et-taree'" },
            { time: 42.62, text: "ما حدا يعرف بمطرحنا\nMa hada ya'ref b matrahna" },
            { time: 47.73, text: "غير السما وورق تشرين\nGher es-sama w wara' Tishreen" },
            { time: 53.05, text: "ويقلي بحبك أنا بحبك\nW ye'elli bhebbek ana bhebbek" },
            { time: 58.30, text: "ويهرب فينا الغيم الحزين\nW yehrab feena el-ghaym el-hazeen" },
            { time: 63.01, text: "يا سنيني اللي رح ترجعيلي\nYa sneeni elli rah terja'ili" },
            { time: 67.84, text: "رجعيلي شي مرة ارجعيلي\nRaj'ili shi marra erja'ili" },
            { time: 72.90, text: "وانسيني ع باب الطفولة\nW enseeni 'a bab et-tfoole" },
            { time: 78.24, text: "تأركض بشمس الطرقات\nTa-orkod b shams et-tor'aat" },
            { time: 83.32, text: "يا سنيني اللي رح ترجعيلي\nYa sneeni elli rah terja'ili" },
            { time: 88.57, text: "رجعيلي شي مرة ارجعيلي\nRaj'ili shi marra erja'ili" },
            { time: 93.81, text: "ورديلي ضحكاتي اللي راحوا\nW raddili dehkaati elli raaho" },
            { time: 99.03, text: "اللي بعدا بزوايا الساحات\nElli ba'da b zawaya es-saahaat" },
            { time: 125.82, text: "بتذكر شو حكيوا عليّ\nBetzakkar shoo hakyo 'alayyi" },
            { time: 130.93, text: "لما نطرت وأنت نسيت\nLamma natart w enta nseet" },
            { time: 136.11, text: "وصار الشتي ينزل عليّ\nW saar esh-sheti yenzal 'alayyi" },
            { time: 141.15, text: "وإجا الصيف وانت ما جيت\nW eja es-seif w enta ma jeet" },
            { time: 145.78, text: "يا سنيني اللي رح ترجعيلي\nYa sneeni elli rah terja'ili" },
            { time: 151.00, text: "رجعيلي شي مرة ارجعيلي\nRaj'ili shi marra erja'ili" },
            { time: 155.98, text: "وانسيني ع باب الطفولة\nW enseeni 'a bab et-tfoole" },
            { time: 161.08, text: "تأركض بشمس الطرقات\nTa-orkod b shams et-tor'aat" },
            { time: 166.35, text: "يا سنيني اللي رح ترجعيلي\nYa sneeni elli rah terja'ili" },
            { time: 171.54, text: "رجعيلي شي مرة ارجعيلي\nRaj'ili shi marra erja'ili" },
            { time: 176.69, text: "ورديلي ضحكاتي اللي راحوا\nW raddili dehkaati elli raaho" },
            { time: 181.94, text: "اللي بعدا بزوايا الساحات\nElli ba'da b zawaya es-saahaat" }
        ]
    },
    {
        title: "Wahdon",
        artist: "Fairuz",
        url: "songs_to_use/track_wahdon.m4a",
        art: "photos_to_use/photo_3.jpg",
        lyrics: [
            { time: 47.08, text: "وحدن بيبقوا متل زهر البيلسان\nWahdon byeb'o metel zahr el-baylasaan" },
            { time: 61.14, text: "وحدهن بيقطفوا اوراق الزمان\nWahdon byeqtfo awraa' ez-zamaan" },
            { time: 72.48, text: "بيسكروا الغابي\nByeskaro el-ghaabi" },
            { time: 76.72, text: "بيضلهن متل الشتي يدقوا على ابوابي\nByedallon metel esh-sheti yed'o 'ala abwaabi" },
            { time: 88.05, text: "يا زمان\nYa zamaan" },
            { time: 93.16, text: "يا عشب داشر فوق هالحيطان\nYa 'eshb daasher faw' hal-heetaan" },
            { time: 102.11, text: "ضويت ورد الليل ع كتابي\nDawwayt ward el-leil 'a ktaabi" },
            { time: 110.45, text: "برج الحمام مسور وعالي\nBorj el-hamaam msawwar w 'aali" },
            { time: 119.45, text: "هج الحمام بقيت لحالي\nHaj el-hamaam b'eet la haali" },
            { time: 129.94, text: "يا ناطرين التلج ما عاد بدكن ترجعوا\nYa naatreen et-talj ma 'aad badkon terja'o" },
            { time: 140.48, text: "صرخ عليهن بالشتي يا ديب بلكي بيسمعوا\nSrakh 'alayhon besh-sheti ya deeb, balki byesma'o" },
            { time: 195.14, text: "وحدن بيبقوا متل هالغيم العتيق\nWahdon byeb'o metel hal-ghaym el-'atee'" },
            { time: 207.89, text: "وحدهن وجوهن وعتم الطريق\nWahdon wjouhon w 'atem et-taree'" },
            { time: 220.12, text: "عم يقطعوا الغابي\n'Am ye't'o el-ghaabi" },
            { time: 224.54, text: "وبإيدهن متل الشتي يدقوا البكي\nW b'eedhon metel esh-sheti yed'o el-beki" },
            { time: 230.99, text: "وهني على ابوابي\nW henni 'ala abwaabi" },
            { time: 236.75, text: "يا زمان\nYa zamaan" },
            { time: 242.03, text: "من عمر فيي العشب عالحيطان\nMen 'omer fiyyi el-'eshb 'al-heetaan" },
            { time: 250.43, text: "من قبل ما صار الشجر عالي\nMen abel ma saar esh-shajar 'aali" },
            { time: 259.18, text: "ضوي قناديل وأنطر صحابي\nDawwi anadeel w ontor sahaabi" },
            { time: 267.85, text: "مرقوا فلوا بقيت ع بابي لحالي\nMar'o fallo b'eet 'a baabi la haali" },
            { time: 279.05, text: "يا رايحين والتلج ما عاد بدكن ترجعوا\nYa rayheen w et-talj ma 'aad badkon terja'o" },
            { time: 289.87, text: "صرخ عليهن بالشتي يا ديب بلكي بيسمعوا\nSrakh 'alayhon besh-sheti ya deeb, balki byesma'o" },
            { time: 302.93, text: "يا رايحين والتلج ما عاد بدكن ترجعوا\nYa rayheen w et-talj ma 'aad badkon terja'o" },
            { time: 312.82, text: "صرخ عليهن بالشتي يا ديب بلكي بيسمعوا\nSrakh 'alayhon besh-sheti ya deeb, balki byesma'o" }
        ]
    },
    {
        title: "Kan Andna Tahoun",
        artist: "Fairuz",
        url: "songs_to_use/track_tahoun.m4a",
        art: "photos_to_use/photo_icon.webp",
        lyrics: [
            { time: 0, text: "(Intro...)" },
            { time: 15, text: "Kan a'ndna tahoun 'a nabe' l may..." },
            { time: 22, text: "Qedamo shaihat shams w fey" },
            { time: 28, text: "W jeddi kan yet-han lal hay..." },
            { time: 35, text: "Qamh wa sahariyyeh..." },
            { time: 42, text: "W teb'a l biyout, byout..." },
            { time: 48, text: "Teqtelna l ohiyeh..." },
            { time: 55, text: "Sahar el layali..." },
            { time: 60, text: "Ya habeeb el qalb..." }
        ]
    },
    {
        title: "Ya Ana Ya Ana",
        artist: "Fairuz",
        url: "songs_to_use/track_yaana.m4a",
        art: "photos_to_use/photo_youtube.webp",
        lyrics: [
            { time: 29.73, text: "يا أنا يا أنا أنا وياك صرنا القصص الغريبة\nYa ana ya ana, ana wiyak, serna el-qasas el-ghareebi" },
            { time: 34.84, text: "يا أنا يا أنا أنا وياك وانسرقت مكاتيبي\nYa ana ya ana, ana wiyak, w ensara'et makateebi" },
            { time: 39.78, text: "وعرفوا انك حبيبي، وعرفوا انك حبيبي\nW 'erfo ennak habeebi, w 'erfo ennak habeebi" },
            { time: 53.66, text: "يا أنا يا أنا هرب الصيف هربت عناقيد الزينة\nYa ana ya ana, harab es-seif, harabit 'ana'eed ez-zeeni" },
            { time: 58.63, text: "وإذا ضيعني الهوى شي صيف بقلبك بتلاقيني\nW iza dayya'ni el-hawa shi seif, b'albak btla'ini" },
            { time: 63.97, text: "وخبيني ولا تخبيني وخبيني ولا تخبيني\nW khabbini w la tkhabbini, w khabbini w la tkhabbini" },
            { time: 77.12, text: "لياليك بعينيي شبابيك مضويي\nLayalik b'einiyye shababeek mdawiyye" },
            { time: 82.86, text: "سفرني حبيبي سفرني بلياليك\nSafferni habeebi, safferni b layalik" },
            { time: 87.61, text: "وأنا قول لا تنسى على طول لا تنسى\nW ana 'ool la tensa, 'ala tool la tensa" },
            { time: 92.57, text: "وعيونك تاخدني وتوعدني بلياليك، لياليك\nW 'younak takhodni w tou'edni b layalik, layalik" },
            { time: 103.23, text: "تركوا تركوا سهر البال والعاشق لم جناحه\nTarako tarako sahar el-baal, wel-'ashe' lam jnaaho" },
            { time: 107.66, text: "تركوا أساميهن عالباب على كتب الدمع وراحوا\nTarako asamiyyon 'al-baab, 'ala kteb ed-dam' w raaho" },
            { time: 112.87, text: "نسيوا بعضن وارتاحوا، نسيوا بعضن وارتاحوا\nNesyo ba'don w ertaaho, nesyo ba'don w ertaaho" },
            { time: 126.61, text: "يا أنا يا أنا، يا أنا يا أنا، يا أنا يا أنا\nYa ana ya ana, ya ana ya ana, ya ana ya ana" },
            { time: 134.79, text: "أنا وياك\nAna wiyyak" }
        ]
    },
    {
        title: "Ahwak",
        artist: "Fairuz",
        url: "songs_to_use/track_ahwak.m4a",
        art: "photos_to_use/photo_2.webp",
        lyrics: [
            { time: 39.44, text: "أهواك، أهواك، أهواك بلا أمل\nAhwaak, ahwaak, ahwaak bila amal" },
            { time: 49.49, text: "وعيونك، وعيونك تبسم لي\nW 'younak, w 'younak tabsam li" },
            { time: 58.99, text: "وورودك تغريني بشهيات القبل\nW wroodak taghreeni b shahiyyaat el-qobal" },
            { time: 69.00, text: "آه وورودك تغريني بشهيات القبل\nAah w wroodak taghreeni b shahiyyaat el-qobal" },
            { time: 99.39, text: "أهواك ولي قلب، بغرامك يلتهب\nAhwaak w li qalb, b gharaamak yaltahib" },
            { time: 109.69, text: "تدنيه فيقترب، تقصيه فيغترب\nTudneeh fa yaqtarib, tuqseeh fa yaghtarib" },
            { time: 120.20, text: "في الظلمة يكتئب، ويهدهده التعب\nFi ez-zulma yakta'ib, w yuhadhiduh et-ta'ab" },
            { time: 129.95, text: "فيذوب وينسكب، آه كالدمع من المقل\nFayazoob w yansakib, aah kad-dam' min el-muqal" },
            { time: 140.91, text: "أهواك، أهواك، أهواك بلا أمل\nAhwaak, ahwaak, ahwaak bila amal" },
            { time: 171.41, text: "وورودك تغريني بشهيات القبل\nW wroodak taghreeni b shahiyyaat el-qobal" },
            { time: 202.05, text: "في السهرة أنتظر، ويطول بي السهر\nFi es-sahra antazir, w yatool biya es-sahar" },
            { time: 211.56, text: "فيسائلني القمر، يا حلوة ما الخبر\nFayusaa'iluni el-qamar, ya helwa ma el-khabar" },
            { time: 221.79, text: "فأجيبه والقلب، قد تيمه الحب\nFa ujeebuhu wal-qalb, qad tayyamahu el-hubb" },
            { time: 232.04, text: "يا بدر أنا السبب، آه أحببت بلا أمل\nYa badr ana es-sabab, aah ahbabtu bila amal" },
            { time: 242.20, text: "أهواك، أهواك، أهواك بلا أمل\nAhwaak, ahwaak, ahwaak bila amal" },
            { time: 252.19, text: "وعيونك، وعيونك تبسم لي\nW 'younak, w 'younak tabsam li" },
            { time: 263.43, text: "وورودك تغريني بشهيات القبل\nW wroodak taghreeni b shahiyyaat el-qobal" },
            { time: 272.68, text: "وورودك تغريني بشهيات القبل\nW wroodak taghreeni b shahiyyaat el-qobal" }
        ]
    },
    {
        title: "Fayeq Ya Hawa",
        artist: "Fairuz",
        url: "songs_to_use/track_fayeq.m4a",
        art: "photos_to_use/photo_3.webp",
        lyrics: [
            { time: 0, text: "(Instrumental...)" },
            { time: 15, text: "Fayeq ya hawa..." },
            { time: 22, text: "Khileena sawa..." },
            { time: 28, text: "Layali l eid..." },
            { time: 35, text: "W ahl l hayy..." },
            { time: 42, text: "Ma yerja' l hawa..." },
            { time: 50, text: "Fayeq ya hawa..." }
        ]
    },
    {
        title: "Ba'adak Ala Bali",
        artist: "Fairuz",
        url: "songs_to_use/track_baadak.m4a",
        art: "photos_to_use/photo_icon.webp",
        lyrics: [
            { time: 0, text: "(String intro...)" },
            { time: 45, text: "Ba'adak ala bali..." },
            { time: 53, text: "Ya qamar l helween..." },
            { time: 62, text: "Zar'et l asami..." },
            { time: 70, text: "W ba'adak ala bali" },
            { time: 80, text: "Talat mawasem..." },
            { time: 90, text: "W ma jabo l mawasem..." },
            { time: 100, text: "Ba'adak ala bali" }
        ]
    },
    {
        title: "Bektob Esmak Ya Habibi",
        artist: "Fairuz",
        url: "songs_to_use/track_bektob.m4a",
        art: "photos_to_use/photo_youtube.webp",
        lyrics: [
            { time: 0, text: "(Upbeat intro...)" },
            { time: 18, text: "Bektob esmak ya habibi..." },
            { time: 25, text: "A' l hawr l a'atik..." },
            { time: 32, text: "Btekteb esmi ya habibi..." },
            { time: 39, text: "A' raml al tareeq..." },
            { time: 45, text: "W bokra betshatti el dindi..." },
            { time: 52, text: "A'l qosa al majrouhi..." },
            { time: 60, text: "Beyb'a esmak ya habibi..." },
            { time: 68, text: "We byemhi esmi..." }
        ]
    },
    {
        title: "Sa'alouni El Nass",
        artist: "Fairuz",
        url: "songs_to_use/track_saalouni.m4a",
        art: "photos_to_use/photo_2.webp",
        lyrics: [
            { time: 0, text: "(Orchestral intro...)" },
            { time: 30, text: "Sa'alouni el nass..." },
            { time: 38, text: "Annak ya habibi..." },
            { time: 45, text: "Ketbou l Makateeb..." },
            { time: 54, text: "W akhadha l hawa..." },
            { time: 62, text: "Bayeez ezz el nawm..." },
            { time: 70, text: "Bethebni ya habibi..." },
            { time: 78, text: "Sa'alouni el nass" }
        ]
    },
    {
        title: "Aandi Thiqa Fik",
        artist: "Fairuz",
        url: "songs_to_use/track_thiqa.m4a",
        art: "photos_to_use/photo_1.webp",
        lyrics: [
            { time: 0, text: "(Smooth intro...)" },
            { time: 14, text: "Aandi thiqa fik..." },
            { time: 22, text: "Aandi amal fik..." },
            { time: 30, text: "Bta'ref leh..." },
            { time: 38, text: "Li'anno ma fi gheirak..." },
            { time: 48, text: "W ana w yak..." },
            { time: 56, text: "Aandi thiqa fik..." },
            { time: 65, text: "Ya ghawali, ya ghawali..." },
            { time: 75, text: "Aandi amal fik" }
        ]
    }
];

const COMPLIMENTS = [
    "I know you like to write rather than talk about your feelings",
    "Your smile lights up the entire world.",
    "You are a masterpiece of soft-heartedness.",
    "Every word you say sounds like a melody.",
    "Your voice still rings in my ears.",
    "You make the world a softer place.",
    "Being with you feels like walking through a blooming garden.",
    "Your presence brings peace to my heart.",
    "I could listen to your voice forever."
];

const LILY_GALLERY = [
    { src: "photos_to_use/photo_5.webp", text: "I know you like to write rather than talk about your feelings" },
    { src: "photos_to_use/photo_6.webp", text: "Every time it rains it gives a different feeling." },
    { src: "photos_to_use/photo_7.webp", text: "Fairuz's voice is the sound of home." },
    { src: "photos_to_use/photo_star.webp", text: "eyes like stars" },
    { src: "photos_to_use/photo_youtube.webp", text: "I could listen to your voice forever." },
    { src: "photos_to_use/photo_icon.webp", text: "Every word you say sounds like a melody." }
];

const BACKGROUND_THOUGHTS = [
    "loves reading under the rain",
    "loves coffee and quiet mornings",
    "loves lilies more than roses",
    "loves old Fairuz songs at sunrise",
    "loves getting lost in nature",
    "romanticizes cloudy days",
    "soft soul with a wild heart",
    "finds peace in bookstores and cafés",
    "moonlight, music, and silence",
    "poetry hidden in ordinary things",
    "autumn-hearted",
    "collects sunsets like memories",
    "loves handwritten letters",
    "tea, rain, and overthinking",
    "lives for slow mornings",
    "floral dresses and messy thoughts",
    "feels at home near trees and oceans",
    "vintage soul",
    "soft spoken, deeply feeling",
    "in love with calm places",
    "soul full of music and nature",
    "gardens, books, and Fairuz",
    "gentle energy",
    "healing through nature and music",
    "made of coffee, rain, and poetry"
];

const MEMORIES = [
    { title: "Reason 01", text: "The way you listen with your whole heart.", bg: "photos_to_use/photo_bg1.jpg" },
    { title: "Reason 02", text: "Your kindness to everyone you meet.", bg: "photos_to_use/photo_bg2.jpg" },
    { title: "Reason 03", text: "The soft light you bring into every room.", bg: "photos_to_use/photo_5.webp" },
    { title: "Reason 04", text: "How you make even the smallest moments magical.", bg: "photos_to_use/photo_6.webp" },
    { title: "Reason 05", text: "Because your soul is as beautiful as a garden.", bg: "photos_to_use/photo_7.webp" },
    { title: "Reason 06", text: "You are simply unforgettable.", bg: "photos_to_use/photo_star.webp" }
];

const MOODS = {
    spring: {
        video: "background_vids/5cec5d39-fa82-4c6d-9678-ca778989b43d.mp4",
        colors: {
            deepRed: "#743014",
            gold: "#84592B",
            cream: "#E8D1A7"
        }
    },
    autumn: {
        video: "background_vids/7a39f797-9609-4028-9c09-847d428d7d7e.mp4",
        colors: {
            deepRed: "#743014",
            gold: "#84592B",
            cream: "#E8D1A7"
        }
    },
    rainy: {
        video: "background_vids/921d8ee6-4a10-4918-8069-c12b7a45dc0e.mp4",
        colors: {
            deepRed: "#2b1a14",
            gold: "#442D1C",
            cream: "#c5d1d1" // Muted rainy cream
        }
    }
};

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    initVisitTracking();
    initMessageWidget();
    initTimeGreeting();
    initIntro();
    initPetals();
    initFloatingWords();
    initMusicPlayer();
    initLilies();
    initNotes();
    initMemories();
    initMoods();
});

// --- Time Greeting ---

function initTimeGreeting() {
    const greeting = document.getElementById('time-greeting');
    if (!greeting) return;

    const hour = new Date().getHours();
    let text = 'Good morning cutie';

    if (hour >= 12 && hour < 18) {
        text = 'Good afternoon cutie';
    } else if (hour >= 18 || hour < 5) {
        text = 'Good night cutie';
    }

    greeting.textContent = text;
}

// --- Visit Tracking ---

function initVisitTracking() {
    const visitor = getTrackedVisitor(true);
    const payload = {
        visitor_id: visitor.id,
        visit_count: String(visitor.visitCount),
        first_seen: visitor.firstSeen,
        last_seen: visitor.lastSeen,
        path: window.location.pathname + window.location.search,
        page_title: document.title,
        referrer: document.referrer || 'direct',
        language: navigator.language || 'unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
        screen: `${window.screen.width}x${window.screen.height}`,
        user_agent: navigator.userAgent
    };

    submitVisit(payload);
}

function getTrackedVisitor(shouldCountVisit = false) {
    const storageKey = 'lisa_visit_tracker';
    const now = new Date().toISOString();
    let visitor = null;

    try {
        visitor = JSON.parse(localStorage.getItem(storageKey) || 'null');
    } catch (error) {
        visitor = null;
    }

    if (!visitor || !visitor.id) {
        visitor = {
            id: createVisitorId(),
            firstSeen: now,
            visitCount: 0
        };
    }

    if (shouldCountVisit) {
        visitor.visitCount += 1;
    }
    visitor.lastSeen = now;

    try {
        localStorage.setItem(storageKey, JSON.stringify(visitor));
    } catch (error) {
        // Tracking should never interrupt the page if storage is unavailable.
    }

    return visitor;
}

function createVisitorId() {
    if (window.crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    const randomPart = Math.random().toString(36).slice(2);
    return `visitor_${Date.now()}_${randomPart}`;
}

function submitVisit(payload) {
    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
        const blob = new Blob([body], {
            type: 'application/json'
        });
        const queued = navigator.sendBeacon('/.netlify/functions/visits', blob);
        if (queued) return;
    }

    fetch('/.netlify/functions/visits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body,
        keepalive: true
    }).catch(() => {
        // Ignore network errors; visit tracking is best effort.
    });
}

// --- Message Widget ---

const MESSAGE_CACHE_KEY = 'lisa_shared_messages_cache';

function initMessageWidget() {
    const launcher = document.getElementById('message-launcher');
    const panel = document.getElementById('message-panel');
    const closeButton = document.getElementById('close-message-panel');
    const form = document.getElementById('visitor-message-form');
    const input = document.getElementById('visitor-message-input');
    const status = document.getElementById('message-status');

    if (!launcher || !panel || !form || !input) return;

    launcher.addEventListener('click', async () => {
        panel.classList.remove('hidden');
        await loadVisitorMessages();
        input.focus();
    });

    closeButton.addEventListener('click', () => {
        panel.classList.add('hidden');
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        const visitor = getTrackedVisitor();
        const message = {
            id: `local_${Date.now()}`,
            visitorId: visitor.id,
            text,
            author: 'visitor',
            createdAt: new Date().toISOString()
        };

        addCachedMessage(message);
        renderMessageThread(getCachedMessages());
        input.value = '';
        status.textContent = 'Sending...';

        try {
            await sendVisitorMessage(visitor, text);
            status.textContent = 'Sent';
        } catch (error) {
            status.textContent = 'Saved here. I will keep trying when you reopen this.';
        }
    });

    setInterval(() => {
        if (!panel.classList.contains('hidden')) {
            loadVisitorMessages();
        }
    }, 15000);
}

async function sendVisitorMessage(visitor, text) {
    const payload = {
        visitor_id: visitor.id,
        text
    };

    try {
        const response = await fetch('/.netlify/functions/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) return;
    } catch (error) {
        // Fall through to the Netlify Forms backup below.
    }

    const fallbackPayload = {
        'form-name': 'message-tracker',
        visitor_id: visitor.id,
        message: text,
        created_at: new Date().toISOString(),
        path: window.location.pathname + window.location.search,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
        user_agent: navigator.userAgent
    };

    const fallbackResponse = await fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(fallbackPayload).toString()
    });

    if (!fallbackResponse.ok) {
        throw new Error('Message failed');
    }
}

async function loadVisitorMessages() {
    const thread = document.getElementById('message-thread');
    if (!thread) return;

    try {
        const response = await fetch('/.netlify/functions/messages');
        if (!response.ok) throw new Error('Could not load messages');

        const data = await response.json();
        const messages = mergeMessages(getCachedMessages(), data.messages || []);
        setCachedMessages(messages);
        renderMessageThread(messages);
    } catch (error) {
        const cachedMessages = getCachedMessages();
        renderMessageThread(cachedMessages);
    }
}

function renderMessageThread(messages) {
    const thread = document.getElementById('message-thread');
    if (!thread) return;

    thread.innerHTML = '';

    if (!messages.length) {
        const empty = document.createElement('p');
        empty.className = 'message-empty';
        empty.textContent = 'No messages yet. Send one and it will appear here.';
        thread.appendChild(empty);
        return;
    }

    messages.forEach((message) => {
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${message.author === 'admin' ? 'from-admin' : 'from-visitor'}`;
        bubble.textContent = message.author === 'admin' ? `Me: ${message.text}` : `Visitor: ${message.text}`;
        thread.appendChild(bubble);
    });

    thread.scrollTop = thread.scrollHeight;
}

function getCachedMessages() {
    try {
        return JSON.parse(localStorage.getItem(MESSAGE_CACHE_KEY) || '[]');
    } catch (error) {
        return [];
    }
}

function setCachedMessages(messages) {
    try {
        localStorage.setItem(MESSAGE_CACHE_KEY, JSON.stringify(messages.slice(-100)));
    } catch (error) {
        // Ignore storage errors; the live request path still works.
    }
}

function addCachedMessage(message) {
    setCachedMessages(mergeMessages(getCachedMessages(), [message]));
}

function mergeMessages(currentMessages, incomingMessages) {
    const messages = [...currentMessages];

    incomingMessages.forEach((message) => {
        const exists = messages.some((cached) => {
            if (cached.id && message.id && cached.id === message.id) return true;
            return cached.text === message.text &&
                cached.author === message.author &&
                Math.abs(new Date(cached.createdAt) - new Date(message.createdAt)) < 5000;
        });

        if (!exists) messages.push(message);
    });

    return messages
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .slice(-100);
}

// --- Floating Background Words ---
function initFloatingWords() {
    const container = document.getElementById('floating-words-container');
    if (!container) return;

    function spawnWord() {
        const text = BACKGROUND_THOUGHTS[Math.floor(Math.random() * BACKGROUND_THOUGHTS.length)];
        const el = document.createElement('div');
        el.className = 'floating-word';
        el.textContent = text;

        // Random position between 10% and 80% to keep it comfortably on screen
        const top = Math.random() * 80 + 10;
        const left = Math.random() * 80 + 10;

        el.style.top = `${top}vh`;
        el.style.left = `${left}vw`;

        // Slight random rotation for natural feel
        const rotation = (Math.random() - 0.5) * 10;
        el.style.transform = `rotate(${rotation}deg)`;

        container.appendChild(el);

        // Remove after animation completes (12s matching CSS)
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 12000);
    }

    // Spawn periodically
    setInterval(spawnWord, 3500);

    // Spawn a couple immediately so it's not empty at load
    spawnWord();
    setTimeout(spawnWord, 1500);
}

function initMoods() {
    const video = document.getElementById('bg-video');
    const buttons = document.querySelectorAll('.mood-btn');

    function setMood(moodKey) {
        const mood = MOODS[moodKey];
        if (!mood) return;

        // Fade out video
        video.style.opacity = '0';

        setTimeout(() => {
            video.src = mood.video;
            video.load();
            video.play();
            video.style.opacity = '0.6';

            // Update UI
            buttons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mood === moodKey);
            });

            // Subtle theme color tweak if needed (e.g. for rainy)
            if (moodKey === 'rainy') {
                document.documentElement.style.setProperty('--cream', '#c5d1d1');
            } else {
                document.documentElement.style.setProperty('--cream', '#E8D1A7');
            }
        }, 800);
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => setMood(btn.dataset.mood));
    });

    // Default mood
    setMood('spring');
}

// --- 1. Opening Screen Animation ---

function initIntro() {
    const lines = [
        "You are the most beautiful soul I know.",
        "You are cute, kind, soft-hearted, and unforgettable.",
        "This little place was made only for you."
    ];
    let currentLine = 0;

    function typeLine(lineIndex) {
        if (lineIndex >= lines.length) {
            document.getElementById('open-world-btn').classList.add('visible');
            return;
        }

        const el = document.getElementById(`intro-line-${lineIndex + 1}`);
        const text = lines[lineIndex];
        let charIndex = 0;

        const interval = setInterval(() => {
            el.textContent += text[charIndex];
            charIndex++;
            if (charIndex >= text.length) {
                clearInterval(interval);
                setTimeout(() => typeLine(lineIndex + 1), 1000);
            }
        }, 50);
    }

    typeLine(0);

    document.getElementById('open-world-btn').addEventListener('click', () => {
        document.getElementById('opening-screen').classList.add('fade-out');
        document.getElementById('main-content').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('main-content').classList.add('visible');
        }, 100);
    });
}

// --- 2. Petals Animation ---

function initPetals() {
    const canvas = document.getElementById('petal-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const petals = [];
    const petalCount = 30;

    class Petal {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = -20;
            this.size = Math.random() * 10 + 5;
            this.speed = Math.random() * 1 + 0.5;
            this.angle = Math.random() * 360;
            this.spin = Math.random() * 0.05;
        }

        update() {
            this.y += this.speed;
            this.x += Math.sin(this.y / 50) * 0.5;
            this.angle += this.spin;
            if (this.y > canvas.height) {
                this.y = -20;
                this.x = Math.random() * canvas.width;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = '#f3c6c6'; // --soft-pink
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < petalCount; i++) {
        petals.push(new Petal());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petals.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// --- 3. Music Player ---

let activeSongIndex = 0;
const audioEl = document.getElementById('main-audio');

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function initMusicPlayer() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const karaokeToggle = document.getElementById('karaoke-toggle');

    // Load initial song
    loadSong(0);

    playPauseBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', () => loadSong(activeSongIndex - 1));
    nextBtn.addEventListener('click', () => loadSong(activeSongIndex + 1));

    progressBar.addEventListener('input', (e) => {
        const seekTime = (audioEl.duration / 100) * e.target.value;
        if (!isNaN(seekTime)) audioEl.currentTime = seekTime;
    });

    karaokeToggle.addEventListener('click', () => {
        document.getElementById('karaoke-overlay').classList.remove('hidden');
        renderLyrics();
    });

    document.getElementById('close-karaoke').addEventListener('click', () => {
        document.getElementById('karaoke-overlay').classList.add('hidden');
    });

    audioEl.addEventListener('timeupdate', () => {
        updateLyrics();

        // Update progress bar
        if (!isNaN(audioEl.duration)) {
            const progress = (audioEl.currentTime / audioEl.duration) * 100;
            progressBar.value = progress;
            document.getElementById('current-time').textContent = formatTime(audioEl.currentTime);
            document.getElementById('total-time').textContent = "-" + formatTime(audioEl.duration - audioEl.currentTime);
        }
    });

    // When song ends, auto play next
    audioEl.addEventListener('ended', () => {
        loadSong(activeSongIndex + 1);
        audioEl.play();
    });
}

function loadSong(index) {
    if (index < 0) index = SONG_LIST.length - 1;
    if (index >= SONG_LIST.length) index = 0;

    activeSongIndex = index;
    const song = SONG_LIST[index];
    audioEl.src = song.url;
    document.getElementById('current-song-title').textContent = song.title;
    document.getElementById('current-artist').textContent = song.artist;
    document.getElementById('album-art').src = song.art;

    // Reset progress details
    document.getElementById('progress-bar').value = 0;
    document.getElementById('current-time').textContent = "0:00";
    document.getElementById('total-time').textContent = "0:00";

    renderLyrics();
}

function togglePlay() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (audioEl.paused) {
        audioEl.play();
        playPauseBtn.textContent = '⏸';
    } else {
        audioEl.pause();
        playPauseBtn.textContent = '▶';
    }
}

// --- 4. Karaoke Logic ---

// Parse LRC/IRC format into [{time, text}, ...]
function parseLRC(text) {
    const lines = text.split(/\r?\n/);
    const result = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const match = line.match(timeRegex);
        if (!match) continue;

        const mins = parseInt(match[1]);
        const secs = parseInt(match[2]);
        const ms = parseInt(match[3]);
        const totalSeconds = mins * 60 + secs + ms / 1000;
        const lyricText = match[4].trim();

        if (!lyricText) continue;

        // If same timestamp as previous, merge lines (Arabic + romanized on same cue)
        if (result.length > 0 && Math.abs(result[result.length - 1].time - totalSeconds) < 0.1) {
            result[result.length - 1].text += '\n' + lyricText;
        } else {
            result.push({ time: totalSeconds, text: lyricText });
        }
    }
    return result;
}

function renderLyrics() {
    const container = document.getElementById('lyrics-container');
    container.innerHTML = '';
    // Reset scroll position
    container.style.transform = 'translateY(0)';
    const song = SONG_LIST[activeSongIndex];
    song.lyrics.forEach((lyric, index) => {
        const div = document.createElement('div');
        div.className = 'lyric-line';
        div.id = `lyric-${index}`;
        // Support multi-line cues (Arabic + romanized stacked)
        lyric.text.split('\n').forEach((part, i) => {
            const span = document.createElement('span');
            span.textContent = part;
            // Style alternate lines: first=Arabic (larger), second=romanized (smaller, dimmer)
            if (i === 1) {
                span.style.display = 'block';
                span.style.fontSize = '1.1rem';
                span.style.opacity = '0.7';
                span.style.fontFamily = "'Cormorant Garamond', serif";
                span.style.letterSpacing = '0.05em';
            } else {
                span.style.display = 'block';
            }
            div.appendChild(span);
        });
        container.appendChild(div);
    });
}

function updateLyrics() {
    const song = SONG_LIST[activeSongIndex];
    if (!song.lyrics) return;

    const container = document.getElementById('lyrics-container');
    const overlay = document.getElementById('karaoke-overlay');
    const currentTime = audioEl.currentTime;

    song.lyrics.forEach((lyric, index) => {
        const el = document.getElementById(`lyric-${index}`);
        if (!el) return;

        if (currentTime >= lyric.time && (index === song.lyrics.length - 1 || currentTime < song.lyrics[index + 1].time)) {
            el.className = 'lyric-line active';

            // Mathematically translate container upward for smooth scrolling
            const overlayCenter = overlay.clientHeight / 2;
            const elOffset = el.offsetTop + (el.clientHeight / 2);
            container.style.transform = `translateY(${overlayCenter - elOffset}px)`;
        } else if (currentTime > lyric.time) {
            el.className = 'lyric-line faded';
        } else {
            el.className = 'lyric-line';
        }
    });
}

// --- 5. Lily Swipeable Gallery ---

function initLilies() {
    const gallery = document.getElementById('lily-gallery');
    if (!gallery) return;

    LILY_GALLERY.forEach(item => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.innerHTML = `
            <img src="${item.src}" alt="Lily" class="gallery-img">
            <p class="gallery-text">${item.text}</p>
        `;
        gallery.appendChild(card);
    });
}

// --- 6. Notes Section ---

function initNotes() {
    const saveBtn = document.getElementById('save-note');
    const input = document.getElementById('note-input');
    const grid = document.getElementById('notes-grid');

    saveBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text) return;

        const note = {
            id: Date.now(),
            text: text,
            date: new Date().toLocaleString()
        };

        const notes = JSON.parse(localStorage.getItem('my_memories') || '[]');
        notes.unshift(note);
        localStorage.setItem('my_memories', JSON.stringify(notes));

        input.value = '';
        renderNotes();
    });

    function renderNotes() {
        grid.innerHTML = '';
        const notes = JSON.parse(localStorage.getItem('my_memories') || '[]');
        notes.forEach(note => {
            const card = document.createElement('div');
            card.className = 'note-card';
            card.style.setProperty('--rotation', Math.random().toString());
            card.innerHTML = `
                <button class="delete-note" onclick="deleteNote(${note.id})">&times;</button>
                <div class="date">${note.date}</div>
                <div class="content">${note.text}</div>
            `;
            grid.appendChild(card);
        });
    }

    window.deleteNote = (id) => {
        let notes = JSON.parse(localStorage.getItem('my_memories') || '[]');
        notes = notes.filter(n => n.id !== id);
        localStorage.setItem('my_memories', JSON.stringify(notes));
        renderNotes();
    };

    renderNotes();
}

// --- 7. Memory Cards Injection ---

function initMemories() {
    const grid = document.querySelector('.memory-grid');
    MEMORIES.forEach(m => {
        const card = document.createElement('div');
        card.className = 'flip-card';
        card.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-front" style="background: url('${m.bg}') center/cover">${m.title}</div>
                <div class="flip-card-back">${m.text}</div>
            </div>
        `;
        grid.appendChild(card);
    });

    document.getElementById('replay-magic').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => location.reload(), 800);
    });
}
