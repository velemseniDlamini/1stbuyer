export type LanguageCode = 'en' | 'zu' | 'nso' | 'ts' | 've'

export const languages: { code: LanguageCode; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'zu', label: 'isiZulu', nativeLabel: 'isiZulu' },
  { code: 'nso', label: 'Sepedi', nativeLabel: 'Sepedi' },
  { code: 'ts', label: 'Xitsonga', nativeLabel: 'Xitsonga' },
  { code: 've', label: 'Tshivenda', nativeLabel: 'Tshivenda' },
]

type Dict = Record<LanguageCode, string>

// Machine-assisted translations — accurate enough for a working real-time
// demo, but not professionally verified. Anything touching legal rights or
// financial terms (the "Know Your Rights" content especially) should get a
// human review pass by a speaker of each language before real users rely on
// it for legal understanding.
const dictionary: Record<string, Dict> = {
  'nav.home': { en: 'Home', zu: 'Ikhaya', nso: 'Gae', ts: 'Ekaya', ve: 'Hayani' },
  'nav.journey': { en: 'Journey', zu: 'Uhambo', nso: 'Leeto', ts: 'Riendzo', ve: 'Lwendo' },
  'nav.explore': { en: 'Explore', zu: 'Hlola', nso: 'Hlahloba', ts: 'Kambisisa', ve: 'Ṱolisisa' },
  'nav.profile': { en: 'Profile', zu: 'Iphrofayela', nso: 'Profaele', ts: 'Phurofayili', ve: 'Phurofaili' },
  'nav.chat': { en: 'Ask Guardian', zu: 'Buza uGuardian', nso: 'Botšiša Guardian', ts: 'Vutisa Guardian', ve: 'Vhudzisa Guardian' },

  'common.save': { en: 'Save', zu: 'Londoloza', nso: 'Boloka', ts: 'Hlayisa', ve: 'Vulunga' },
  'common.cancel': { en: 'Cancel', zu: 'Khansela', nso: 'Khansela', ts: 'Kanhelela', ve: 'Khansela' },
  'common.continue': { en: 'Continue', zu: 'Qhubeka', nso: 'Tšwela pele', ts: 'Ya emahlweni', ve: 'Bvela phanda' },
  'common.saving': { en: 'Saving…', zu: 'Iyalondoloza…', nso: 'E a boloka…', ts: 'Ya hlayisa…', ve: 'Khou vulunga…' },
  'common.required': { en: 'Required', zu: 'Kuyadingeka', nso: 'E a nyakega', ts: 'Swi laveka', ve: 'Zwi a ṱoḓea' },
  'common.add': { en: 'Add', zu: 'Engeza', nso: 'Oketša', ts: 'Engetela', ve: 'Engedza' },
  'common.remove': { en: 'Remove', zu: 'Susa', nso: 'Tloša', ts: 'Susa', ve: 'Bvisa' },

  'home.greeting': { en: 'Good day', zu: 'Sawubona', nso: 'Thobela', ts: 'Avuxeni', ve: 'Ndaa' },
  'home.creditScore': { en: 'Credit Score', zu: 'Amanani okuboleka', nso: 'Sekoro sa mokitima', ts: 'Xibalo xa nkolo', ve: 'Ndeme ya mashomo' },
  'home.buyingPower': { en: 'Buying Power', zu: 'Amandla okuthenga', nso: 'Matla a go reka', ts: 'Amandla yo xava', ve: 'Maanḓa a u renga' },
  'home.journey': { en: 'Journey', zu: 'Uhambo', nso: 'Leeto', ts: 'Riendzo', ve: 'Lwendo' },
  'home.saved': { en: 'Saved', zu: 'Okulondoloziwe', nso: 'Tše bolokilwego', ts: 'Leswi hlayisiweke', ve: 'Zwo vulungwaho' },
  'home.chooseCar': { en: 'Choose your car', zu: 'Khetha imoto yakho', nso: 'Kgetha koloi ya gago', ts: 'Hlawula movha wa wena', ve: 'Khetha goloi yau' },

  'knowYourself.title': { en: 'Know yourself', zu: 'Zazi', nso: 'Itsebe', ts: 'Tiṭivisa', ve: 'Ḓivhe iwe muṋe' },
  'knowYourself.subtitle': {
    en: 'A real affordability picture — your income, your expenses, your reality.',
    zu: 'Isithombe seqiniso sokukwazi ukukhokha — imali engenayo, izindleko, iqiniso lakho.',
    nso: 'Seswantšho sa nnete sa go kgona go lefa — letseno la gago, ditshenyagalelo tša gago, nnete ya gago.',
    ts: 'Xifaniso xa xiviri xa vuswikoti byo hakela — mali ya wena, mahakelo ya wena, xiviri xa wena.',
    ve: 'Tshifanyiso tsha vhukuma tsha u kwanisa u badela — mbadelo yau, mashudu au, vhukuma hau.',
  },
  'knowYourself.netIncome': { en: 'Net monthly income (take-home pay)', zu: 'Imali engenayo ngenyanga (emva kokususa intela)', nso: 'Letseno la kgwedi ka moka (ka morago ga lekgetho)', ts: 'Mali ya n\'weti hinkwayo (endzhaku ka thekisi)', ve: 'Mbadelo ya ṅwedzi yoṱhe (nga murahu ha thekisi)' },
  'knowYourself.expenses': { en: 'Monthly expenses', zu: 'Izindleko zanyanga zonke', nso: 'Ditshenyagalelo tša kgwedi', ts: 'Mahakelo ya n\'weti', ve: 'Mashudu a ṅwedzi' },
  'knowYourself.addExpense': { en: 'Add expense', zu: 'Engeza indleko', nso: 'Oketša tshenyagalelo', ts: 'Engetela ndzhaku', ve: 'Engedza tshinḓila' },
  'knowYourself.dob': { en: 'Date of birth', zu: 'Usuku lokuzalwa', nso: 'Letšatši la matswalo', ts: 'Siku ro velekiwa', ve: 'Ḓuvha ḽa u bebwa' },
  'knowYourself.licenseDate': { en: 'License issued', zu: 'Ilayisensi ikhishwe', nso: 'Laesense e ntšhitšwe', ts: 'Layisense yi humeleriwile', ve: 'Laisenisi yo bviswa' },
  'knowYourself.employment': { en: 'Employment status', zu: 'Isimo somsebenzi', nso: 'Boemo bja mošomo', ts: 'Xiyimo xa ntirho', ve: 'Vhuimo ha mushumo' },
  'knowYourself.missingFields': {
    en: 'A few things are still missing before this step can be marked complete:',
    zu: 'Kusekhona okuncane okusilele ngaphambi kokuba lesi sinyathelo sigcwaliswe:',
    nso: 'Go sa na le dilo tše nnyane tše di sa lego gona pele kgato ye e ka tlatšwa:',
    ts: 'Ku ha ri na swilo swintsongo leswi pfumalekaka emahlweni ko xiya nyikelo leyi yi hetile:',
    ve: 'Hu kha ḓi na zwithu zwiṱuku zwine zwa vha zwi songo vhonala hu sa athu vhonala uri tshigogo tshi ḓadzea:',
  },
  'knowYourself.complete': { en: 'All set — Know Yourself is complete', zu: 'Konke kulungile — Zazi kuqediwe', nso: 'Ka moka go lokile — Itsebe e feditšwe', ts: 'Hinkwaswo swi lulamile — Tiṭivisa yi helile', ve: 'Zwoṱhe zwo tou vha zwavhuḓi — Ḓivhe iwe muṋe zwo fhela' },

  'knowRights.title': { en: 'Know your rights', zu: 'Yazi amalungelo akho', nso: 'Itsebe ditokelo tša gago', ts: 'Tiṭivisa timfanelo ta wena', ve: 'Ḓivhe pfanelo dzau' },
  'knowRights.acknowledge': {
    en: 'I have read and understood my rights as a consumer and credit user in South Africa.',
    zu: 'Ngizifundile futhi ngiyawaqonda amalungelo ami njengomthengi nomsebenzisi wesikweletu eNingizimu Afrika.',
    nso: 'Ke badile gomme ke kwešiša ditokelo tša ka bjalo ka moreki le modiriši wa mokitima ka Afrika Borwa.',
    ts: 'Ndzi swi hlayile naswona ndzi swi twisisa timfanelo ta mina tanihi muxavi na mutirhisi wa nkoloto eAfrika Dzonga.',
    ve: 'Ndo vhala nda pfesesa pfanelo dzanga sa muḓura na mushumisi wa mashudu Afrika Tshipembe.',
  },
  'knowRights.continueButton': { en: 'I understand — continue', zu: 'Ngiyaqonda — qhubeka', nso: 'Kea kwešiša — tšwela pele', ts: 'Ndzi twisisa — ya emahlweni', ve: 'Ndi a pfesesa — bvela phanda' },

  'insurance.chooseVehicle': {
    en: 'Choose a car in Explore to quote insurance for it',
    zu: 'Khetha imoto ku-Explore ukuze uthole isilinganiso somshwalense wayo',
    nso: 'Kgetha koloi go Explore go hwetša tekanyetšo ya inšorense',
    ts: 'Hlawula movha eka Explore leswaku u kuma xiviko xa inshuwarense',
    ve: 'Khetha goloi kha Explore u itela u wana muelo wa inshurensi',
  },
}

export function translate(key: string, lang: LanguageCode): string {
  const entry = dictionary[key]
  if (!entry) return key
  return entry[lang] || entry.en
}

export function hasTranslation(key: string): boolean {
  return key in dictionary
}
