import { getDailyPanchang } from 'panchang-ts';

const masaMap = {
    'Chaitra': 'चैत्र', 'Vaishakha': 'वैशाख', 'Jyeshtha': 'ज्येष्ठ', 'Ashadha': 'आषाढ़', 
    'Shravana': 'श्रावण', 'Bhadrapada': 'भाद्रपद', 'Ashvina': 'आश्विन', 'Kartika': 'कार्तिक',
    'Margashirsha': 'मार्गशीर्ष', 'Pausha': 'पौष', 'Magha': 'माघ', 'Phalguna': 'फाल्गुन'
};
const pakshaMap = {
    'Shukla': 'शुक्ल पक्ष', 'Krishna': 'कृष्ण पक्ष'
};
const tithiMap = {
    'Pratipada': 'प्रतिपदा', 'Dwitiya': 'द्वितीया', 'Tritiya': 'तृतीया', 'Chaturthi': 'चतुर्थी',
    'Panchami': 'पंचमी', 'Shashthi': 'षष्ठी', 'Saptami': 'सप्तमी', 'Ashtami': 'अष्टमी',
    'Navami': 'नवमी', 'Dashami': 'दशमी', 'Ekadashi': 'एकादशी', 'Dwadashi': 'द्वादशी',
    'Trayodashi': 'त्रयोदशी', 'Chaturdashi': 'चतुर्दशी', 'Purnima': 'पूर्णिमा', 'Amavasya': 'अमावस्या'
};

export function getTodayPanchang() {
    try {
        const p = getDailyPanchang(new Date(), { latitude: 28.6139, longitude: 77.2090 }, { timezone: 'Asia/Kolkata' });
        const masaEng = p.calendar.chandramasa.name;
        const pakshaEng = p.angas.tithis[0].paksha;
        const tithiNameFull = p.angas.tithis[0].name;
        const tithiEng = tithiNameFull.replace(pakshaEng + ' ', '').trim();
        
        const masaHi = masaMap[masaEng] || masaEng;
        const pakshaHi = pakshaMap[pakshaEng] || pakshaEng;
        const tithiHi = tithiMap[tithiEng] || tithiEng;
        
        const daysInHindi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
        const todayHindi = daysInHindi[new Date().getDay()];
        
        return {
            tithi: `${masaHi} ${pakshaHi}, ${tithiHi}`,
            samvat: `विक्रम संवत ${p.calendar.samvat.vikramSamvat} • ${todayHindi}`
        };
    } catch (error) {
        console.error("Error generating panchang:", error);
        return null;
    }
}
