const syllableConsonants = [
  "b","c","d","f","g","h","j","k","l","m","n","p","q","r","s","t","v","w","x","y","z"
];

const syllables = syllableConsonants.flatMap(letter => [
  { display: `${letter}a`, label: "suku kata a", sound: `${letter}a`, audioKeys: [`${letter}a`] },
  { display: `${letter}i`, label: "suku kata i", sound: `${letter}i`, audioKeys: [`${letter}i`] },
  { display: `${letter}u`, label: "suku kata u", sound: `${letter}u`, audioKeys: [`${letter}u`] },
  { display: `${letter}ǝ`, label: "suku kata e pepet", sound: `${letter}ə`, audioKeys: [`${letter}ǝ`, `${letter}ə`, `${letter}e-pepet`, `${letter}e_pepet`, `${letter}e pepet`] },
  { display: `${letter}e`, label: "suku kata e taling", sound: `${letter}e`, audioKeys: [`${letter}e`, `${letter}e-taling`, `${letter}e_taling`, `${letter}e taling`] },
  { display: `${letter}o`, label: "suku kata o", sound: `${letter}o`, audioKeys: [`${letter}o`] }
]);

const vowels = [
  { display: "a", label: "vokal a", sound: "a", audioKeys: ["a"] },
  { display: "i", label: "vokal i", sound: "i", audioKeys: ["i"] },
  { display: "u", label: "vokal u", sound: "u", audioKeys: ["u"] },
  { display: "o", label: "vokal o", sound: "o", audioKeys: ["o"] },
  { display: "ǝ", label: "e pepet", sound: "e pepet", audioKeys: ["ǝ", "e-pepet", "e_pepet", "e pepet", "pepet"] },
  { display: "e", label: "e taling", sound: "e taling", audioKeys: ["e", "e-taling", "e_taling", "e taling", "taling"] }
];

const consonants = [
  "b","c","d","f","g","h","j","k","l","m","n","p","q","r","s","t","v","w","x","y","z"
].map(letter => ({
  display: letter,
  label: `konsonan ${letter}`,
  sound: letter,
  audioKeys: [letter]
}));

let voices = [];
let currentAudio = null;

/*
  ==========================================
  PERMANENT AUDIO MP3 SENDIRI
  ==========================================
  1. Letakkan fail MP3 dalam folder "audio".
     Contoh struktur:
     - index.html
     - audio/a.mp3
     - audio/ba.mp3
     - audio/e-pepet.mp3

  2. Masukkan nama fail MP3 dalam object permanentAudio di bawah.
     Key mesti ikut huruf/suku kata pada kad.
     Contoh:
       a: "audio/a.mp3"
       b: "audio/b.mp3"
       ba: "audio/ba.mp3"
       "ǝ": "audio/e-pepet.mp3"
       "bǝ": "audio/b-pepet.mp3"

  3. Sistem akan cuba mainkan MP3 dahulu.
     Jika MP3 belum ada / gagal dimuatkan, suara browser akan digunakan semula.
*/
const permanentAudio = {
  // VOKAL
  // a: "audio/a.mp3",
  // i: "audio/i.mp3",
  // u: "audio/u.mp3",
  // o: "audio/o.mp3",
  // "ǝ": "audio/e-pepet.mp3",
  // e: "audio/e-taling.mp3",

  // KONSONAN
  // b: "audio/b.mp3",
  // c: "audio/c.mp3",
  // d: "audio/d.mp3",

  // SUKU KATA
  // ba: "audio/ba.mp3",
  // bi: "audio/bi.mp3",
  // bu: "audio/bu.mp3",
  // "bǝ": "audio/b-pepet.mp3",
  // be: "audio/be.mp3",
  // bo: "audio/bo.mp3"
};

let customAudio = { ...permanentAudio };

function speak(text){
  if(!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ms-MY";
  utter.rate = 0.72;
  utter.pitch = 1.08;
  utter.volume = 1;
  speechSynthesis.speak(utter);
}

function normaliseAudioKey(value){
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/ə/g, "ǝ")
    .replace(/\s+/g, " ")
    .replace(/_/g, "-");
}

function getAudioSource(data){
  const possibleKeys = [
    ...(data.audioKeys || []),
    data.display,
    data.sound
  ]
    .filter(Boolean)
    .map(key => String(key));

  const audioMap = new Map();
  Object.entries(customAudio).forEach(([key, src]) => {
    if(src) audioMap.set(normaliseAudioKey(key), src);
  });

  for(const key of possibleKeys){
    const direct = customAudio[key];
    if(direct) return direct;

    const normalised = audioMap.get(normaliseAudioKey(key));
    if(normalised) return normalised;
  }
  return "";
}

function playSound(data){
  const audioSrc = getAudioSource(data);

  if('speechSynthesis' in window) speechSynthesis.cancel();

  if(currentAudio){
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if(audioSrc){
    currentAudio = new Audio(audioSrc);
    currentAudio.play().catch(() => {
      speak(data.sound);
    });
    return;
  }

  speak(data.sound);
}

const cardDecorations = ["🐻","🦊","🐰","🐼","🐸","🦁","🐧","🦋","🌈","⭐","🎈","🍭","🚀","🧸","🎨","🍎"];

function makeCard(item, onClickExtra=null){
  const data = typeof item === 'object'
    ? item
    : { display: item, label: "suku kata", sound: item, audioKeys: [item] };

  const card = document.createElement('button');
  card.className = 'syllableCard';
  const code = String(data.display || data.sound || "").split("").reduce((sum, char)=>sum + char.charCodeAt(0), 0);
  const sticker = cardDecorations[code % cardDecorations.length];
  card.innerHTML = `<span class="cardSticker" aria-hidden="true">${sticker}</span><span class="cardText">${data.display}</span><span class="cardLabel">${data.label} • klik untuk dengar</span>`;
  card.setAttribute('aria-label', `${data.label} ${data.display}`);
  card.addEventListener('click', ()=>{
    card.classList.add('playing');
    setTimeout(()=>card.classList.remove('playing'), 360);
    playSound(data);
    if(typeof onClickExtra === 'function') onClickExtra(data.display);
  });
  return card;
}

function shuffle(arr){
  return arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
}







const vowelGrid = document.getElementById('vowelGrid');
const consonantGrid = document.getElementById('consonantGrid');
const learnGrid = document.getElementById('learnGrid');

function renderSoundCards(){
  vowels.forEach(v => {
    vowelGrid.appendChild(makeCard(v));
  });

  consonants.forEach(c => {
    consonantGrid.appendChild(makeCard(c));
  });

  syllables.forEach(s => {
    learnGrid.appendChild(makeCard(s));
  });
}
renderSoundCards();