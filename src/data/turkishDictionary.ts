import { toTurkishUpper } from '../utils/turkish';

/**
 * Doğrulanmış Türkçe bonus kelime listesi.
 *
 * Bonus kontrolü bu açıkça tanımlanmış kelime listesiyle sınırlıdır.
 * İlk liste VikiSözlük kaynaklı kelime listesinden ve önceki bölüm verilerinden
 * derlenmiştir. Yeni bölüm hedefleri ayrıca TDK 12. baskı başlıklarıyla eşleştirilir.
 * Kaynak ve üretim adımları README.md dosyasında açıklanmıştır.
 */
const RAW_VERIFIED_TURKISH_WORDS = `
abartılı abartma abd abla acaba acayip acele aceleci acemi acı acıklı acılı acımasız acil
acilen aciz açacak açan açar açgözlü açık açıkça açıkçası açıklama açıklayan açıklık açılış
açım açlık açma açmak ada adak adalet adaletsiz adam adama aday adem adet adım adına adi adil
adlı adli adrenalin adres aferin afiyet agresif ağa ağabey ağaç ağı ağır ağırbaşlı ağırlamak
ağırlık ağız ağlama ağlamak ağrı ağustos aha ahbap ahlak ahlaki ahlaksız ahşap aile ait ajan
akademi akademik akar akciğer akı akıl akıllı akıllıca aklı akma akort akraba aksam aksi aksine
aksiyon akşam akşamdan akşamki akşamları akşamüstü aktar aktif aktivite aktör aktris alacak
alakalı alakasız alan alarm alay alaycı albay albüm alçak aldatıcı aldatmaca aldatmak aldırma
alem alet alev alfa alfabetik algoritma alıcı alık alıkoymak alın alındı alınma alıntı alış
alışık alışkın alıştırma alim alkış alkolik alkollü alma almak alo alt altı altın altıncı
altmış altüst alüminyum ama amaç amaçlı aman amanın amatör amber ambulans amca ameliyat amerikan
amil amin amir amiral amma ana anahtar analiz anaokulu anca ancak anestezi anı anında ani
aniden anlam anlama anlamak anlamlı anlamsız anlaşılma anlaşma anlaşmak anlatma anlatmak anlayış
anlayışlı anlık anma anne annelik anormal ant antik antika antlaşma antrenman apaçık apartman
aptalca aptallık ara araba araban aracı araç aralık aralıksız arama aramak arap araştırma
arazi argo arı arılar arıza ari arjantin ark arka arkadaş arkadaşça arma armağan art artı
artık artırmak artış arz arzu asa asal asansör ası asıl asılı asır asi asil asistan asit asker
askerlik asla aslan asma aspirin ast astar asteğmen astım astronomi astronot astsubay aşağı
aşağılık aşama aşar aşçı aşı aşık aşırı aşk aşkın ata atak ateş ateşin ateşkes ateşleme ateşli
atık atılgan atım atış atik atkı atlama atlamak atlatmak atlı atma atmak atmosfer atom avans
avantaj avantajlı avcı avlanmak avro avuç avukat avukatlık aya ayak ayakkabı ayaklı ayakta
ayar ayarlama aydınlık ayı ayık ayın ayıp ayırma ayırmak ayin aykırı aylak aylık ayna aynen
aynı ayni ayrı ayrıca ayrıcalık ayrılık ayrılma ayrılmak ayrıntı ayrıntılı ayyaş azaltmak
azar azgın azı azıcık aziz baba babacık babalık bacak bacaklı bağ bağı bağımlı bağımsız bağır
bağırma bağırmak bağırsak bağış bağlamak bağlantı bağlayıcı bağlı bağlılık bahane bahar baharatlı
bahçe bahis bahsetme bahşiş bakan bakanlık bakarak bakıcı bakıcılık bakım bakır bakış bakire
bakma bakmak bal balayı bale balık balıkçı balıklama balina balistik balo balon balta bambaşka
bana banka bant banyo bar barbekü barda bardak bardan barı barış barışçıl bari barikat bariz
barmen barmenlik baron barut bas basın basınç basit basitçe basket basketbol baskı baskın
basma basmak bastı bastırmak baş başarı başarılı başarısız başarmak başbakan başçavuş başıboş
başında başka başkan başkanlık başkası başlama başlamak başlatma başlatmak başlı başlık başta
baştan başüstüne başvuru bataklık batı batıl batman battaniye bay bayağı bayan baygın bayrak
bayraktar bayram bazen bazı bebek becermek bedava bedavaya bedel beden bekar bekçi bekleme
beklemek bel bela belediye beleş belge belgesel belgi belirgin belirli belirsiz belirten belirtmek
belki belli ben bence bencilce bende benden benimki benzemez benzer benzeri benzerlik benzersiz
benzin beraber berbat bereketli beri bertaraf besbelli besin beslemek beslenme beş beşinci
beşlik beta beter beton bey beyan beyaz beyefendi beyin beyinsiz beyninde beyzbol bez bıçak
bırakma bırakmak biber biçim biftek bilardo bildirmek bile bilek bilet bilezik bilge bilgelik
bilgi bilgin bilhassa bilim bilimsel bilinç bilinçli bilindik bilinen bilir bilmek bin bina
binbaşı bindi binlerce binmek bir birader biraz birazcık birazdan birçok birden birebir birer
bireysel biri biricik birileri birim birinci birisi birkaç birleşik birleşme birlik birlikte
birtakım bisiklet bisküvi bit bitirmek bitki bitkin bitmek biyoloji biz bizde bizden bize
bizimki bizzat blok blöf bodrum boğa boks boksör bol bolca bomba bomboş borç borçlu borsa
boru boş boşaltmak boşanma boşanmak boşluk boşuna bot boy boya boylu boynuzlu boyun boyunca
boyut boyutlu bozma bozmak bozucu bozuk bozukluk böbrek böcek böcekler böğürtlen bölge bölgesel
bölmek bölük bölüm böyle böylece böylesi böylesine bravo bucaksız buçuk budala bugün bugünkü
bugünlük buğday buhar bul bulanık bulaşıcı bulaşık bulaşmak bulma bulmak bulunmak buluş buluşma
buluşmak bulut buna bunaltıcı bunca bunda bundan bunlar burada buradan buralı burası burs
burun but buyrun buz buzlu büro bürokrasi bütçe bütün büyü büyücü büyük büyükelçi büyüklük
büyülü büyüme büyümek büyütmek cadde cadı cahil cam can cana canavar canlı caz cazip cehennem
ceket cenaze centilmen cep cephane cerrah cerrahi cesaret cesaretli ceset cesur cesurca cevap
cevapsız ceviz ceza cici cidden ciddi cihaz cilt cin cinsel cinsiyet cips cömert cömertlik
cuma cüce cümle cüret cüzdan çaba çabucak çabuk çadır çağ çağırmak çağrı çak çakal çakar çakı
çakır çakma çakmak çal çalacak çalar çalıntı çalış çalışkan çalışma çalışmak çalma çalmak
çam çamaşır çamur çan çanta çaplı çapraz çar çardak çare çaresiz çark çarpan çarpıcı çarpışma
çarşamba çarşı çatal çatı çatışma çatlak çavuş çay çaylak çek çekecek çeker çeki çekici çekiç
çekilmek çekim çekingen çekinme çekirdek çekme çekmek çektirmek çelik çelişkili çember çene
çeşit çeşitli çete çetin çeviri çevirme çevirmek çevirmen çevre çevrili çeyrek çığlık çıkacak
çıkan çıkar çıkarım çıkarma çıkarmak çıkartma çıkartmak çıkın çıkış çıkma çıkmak çıkmaz çıktı
çılgın çılgınca çıplak çıra çiçek çift çiftçi çiftçilik çifte çiftleşme çiftlik çiğ çikolata
çilek çim çip çirkin çivi çizgi çizik çizim çoban çocuk çocukça çocukluk çoğu çok çoklu çoktan
çoktandır çorap çorba çöl çöp çöplük çörek çöz çözmek çözüm çubuk çukur çuval çünkü çürük
dadı dağ dağınık dağıtım dağıtmak daha dahası dahi dahil daim daima dair daire dakika dal
dalga dalış dam damar damat damla dana dandik danışman dans dansçı dar dara darbe data dava
davet davetiye davetli davetsiz davranış davranma davul dayalı dayanıklı dayanışma dayı dede
dedektif dedikodu def defa defter değer değerli değersiz değil değiş değişik değişim değişken
değişmek değişmez dehşet dek dekan deli delice delik delikanlı delil delilik delta deme demek
demin demir demokrasi demokrat deneme denemek deney deneyim deneyimli deneysel denge dengesiz
deniz denizaltı denizci denk denli departman depo depolama deprem dere derece dergi deri derin
derinden derinlik derken ders dert desen destansı destek detay dev devam devamlı devasa deve
devirmek devlet devre devrim devrimci devriye deyim dış dışarı diğer diğeri dijital dik diken
dikiş dikkat dikkatli dikkatsiz dil dilek dileme dilemek dilim dimi din dinamit dindar dinleme
dinlemek dinlenme dinlenmek dinleyici diplomasi direk direkt direktör direniş diri disiplin
disipline disk diş dişçi dişi diye diyet diz dizayn dize dizi doğa doğacak doğaçlama doğal
doğan doğaüstü doğru doğruca doğrudan doğrulama doğruluk doğrusu doğu doğum doğurmak doğuştan
doktor doktora doktorluk doku dokunaklı dokunma dokunmak dokuz dolap dolar dolaşmak dolayı
doldurmak dolu dolunay dolusu domates domuz don donanma dondurma dost dostça dostluk dosya
doz dönem döner dönme dönmek dönüm dönüş dönüşüm dördüncü dört dövme dövüş dövüşmek drama
dramatik dua duble dudak dul duman durak durma durmadan durmak durum duruşma duş duvar duy
duyar duyarlı duygu duygusal duygusuz duymak duyurmak duyuru düello düğme düğün dük dümdüz
dümen dün dünden dünkü dünya dünyada dürüst düş düşkün düşman düşmanca düşme düşmek düşük
düşün düşünce düşünme düşünmek düşünür düşürmek düşüş düz düzeltme düzen düzenleme düzenli
düzensiz düzey düzgün düzine ebediyen ebeveyn edebiyat edepsiz eder edilmek edinmek edip efendi
efendim efsane efsanevi egzersiz egzotik eğer eğitim eğitimli eğlence eğlenmek ehliyet ejder
ejderha ekim ekip eklemek ekmek ekonomi ekonomik ekran ekselans eksi eksik eksiksiz ekstra
ela elbet elbette elbise elbiseli elçi elde elden eldiven elektrik eleman eleştiri elim eliyle
elli elma elmas elveda elzem emanet emek emekli emeklilik emin emir emlak emniyet emniyetli
enayi ender endişe endişeli endüstri enerji enfes engel engelli enjekte enstrüman enteresan
epey epeyce erek ergen ergenlik erik eril erin erişim erke erkek erkeksi erken erkenden eroin
erotik ertesi erzak esas eser esir eski eskiden esmer esnek espri esrar estetik eşek eşit
eşleşme eşlik eşsiz eşya etek etik etki etkileşim etkili etkin etkinlik etkisiz etli etme
etmek etmen etraf etraflıca ettirmek evcil evet evin evlat evlatlık evlenme evlenmek evli
evlilik evrak evren evrensel evrim evsiz evvel eyalet eylem eylül eyvah eyvallah ezik eziyet
ezme faaliyet fabrika fahişe fakat fakir fal falan fantastik fantezi fare fark farklı farklılık
farz fasulye fatura favori fayda faydalı faydasız fazla fazladan feda federal felaket felç
felsefe fen fena fener festival fevkalade fındık fırın fırlatma fırlatmak fırsat fırtına fırtınalı
fıstık fikir fil filan film filo final finans finansal finanse fincan fiyat fizik fiziksel
flaş flört fon formalite fotoğraf fotokopi fren futbol futbolcu füze galaksi galiba galibiyet
galip gangster garaj garanti garantili gardiyan garip gariplik garson garsonluk gayet gayret
gayri gaz gazete gazeteci gazoz gece geceki geceleri geceleyin gecelik gecikme geç geçen geçer
geçerli geçersiz geçici geçinmek geçirme geçirmek geçiş geçit geçme geçmek geçmez geçmiş gelecek
gelen gelenek geleni gelin gelinlik gelir gelişim gelişme gelişmiş gelme gelmek gemi gen genç
gençlik gene genel general genetik geniş genişleme gerçek gerçekçi gerçeklik gerçekte gerçekten
gerçi gerek gerekli gereksiz gergedan gergin gerginlik geri gerilim gerzek getirme getirmek
gevşek geyik gezegen gezgin gezi gezinti gezmek gıcık gıda gibi gibisi gider giderek gidermek
gidi gidiş girdi giren giriş girişim girme girmek gitar gitgide gitme gitmek gittikçe giyecek
giyinmek giymek giysi gizem gizemli gizlemek gizli gizlice gizlilik global gol golf göbek
göç göçmen göçmenlik göğüs gök gökyüzü göl gölge gömlek gömmek gömülü gönder gönderme göndermek
gönül gönüllü göre görev görevli görgü görkem görkemli görme görmek görmemiş görmez görmüş
görsel görünmek görünmez görüntü görünür görünüşte görüş görüşme görüşmek gösteren gösteri
gösterim gösteriş gösterme götürmek göz gözde göze gözetim gözlem gözlemci gözleme gözlü gözlük
gözlüklü gözyaşı gram grev gri grip grup gurur gururlu gübre gücü gücün güç güçlü güçsüz gül
gülme gülmek gülünç güm gümüş gün günah günaydın günde gündelik gündüz güneş güneşli güney
güneybatı güneydoğu günlerce günlük günü güreş gürültü güven güvence güvenilir güvenli güvenlik
güvenme güvenmek güvercin güverte güya güzel güzelce güzellik haber haberdar habersiz haç
hadi hadisene hafıza hafif hafifçe hafta haftalık hah haham hain hak hakaret hakem hakikaten
hakiki hakim hakkında haklı haksız haksızlık hal hala hale halı hali halim halk halka halt
ham hamile hamle hamur han hangi hangisi hanım hani hap hapis harap hararetli harbi harcama
harcamak hareket hareketli harf harfiyen hariç harika harita hart has hasar hasat hassas hasta
hastalık hastane hat hata hatalı hatıra hatta hatun hava havacılık havadan havai havalı havlu
havuç havuz hay hayal hayalet hayat hayati haydi haydut hayır hayırlı hayli hayran hayranlık
hayret hayvan hayvanat haz hazır hazırlama hazırlık hazine haziran heba hedef hediye hediyelik
hele hem hemen hemfikir hemşire henüz hep hepsi her hergele herhangi herif herkes hesabına
hesap hesaplama hevesli hey heyecan heyecanlı heykel hırsız hırslı hıyar hız hızla hızlı hiç
hiçbir hiçbiri hidrojen hile hindi his hisse hisset hissetme hitap hizmet hizmetçi hizmetli
hobi hoca hokey hop hor horoz hoş hoşça hoşlanmak hoşnut hukuk hurda huysuz huzur huzurlu
huzursuz hücre hücum hüküm hükümdar hüzünlü ırk ırkçı ırkçılık ısı ısırık ıslak ısrar ıssız
ışık iade ibaret icat içecek içeri içim için içinde içki içme içmek içten idam idare iddia
ideal idrar ifade iflas ifşa iğne iğrenç ihbar ihlal ihmal ihtimal ihtişamlı ihtiyaç ihtiyar
ihtiyatlı iken iki ikili ikinci ikiyüzlü ikiz ikna ikram ikramiye ila ilaç ilahi ilan ile
ileri ileride ilerleme iletişim ilgi ilgili ilginç ilham ilişki ilişkin ilk ilkel illa iltifat
ima imal iman imha imparator imza inan inanç inanılmaz inanma inanmak inatçı ince inceleme
inci incitmek indi indirim indirmek inek infaz ini iniş inmek insan insani insanlık insanoğlu
inşa inşaat inşallah intikam ipek iptal ipucu iri iris irtibat isabet isim isimli isimsiz
ispat istasyon istek istekli isteme istemek ister istifa istila istirahat istiridye istismar
istisna isyan işaret işçi işgal işkence işlem işleme işsiz işte itaat itfaiye itfaiyeci itibaren
itici itiraf itiraz iyi iyice iyileşme iyilik iyimser izin izinsiz izlem izleme izlemek izlenim
izole jambon jen jersey jet jimnastik jüri kaba kabadayı kabalık kabile kablo kablolu kablosuz
kabul kaburga kaç kaça kaçak kaçamak kaçar kaçık kaçınmak kaçırma kaçırmak kaçış kaçma kaçmak
kaçta kadar kadeh kader kadın kadim kafa kafadan kafalı kafatası kafe kafeterya kafiyeli kahkaha
kahraman kahvaltı kahve kak kaka kal kala kalan kalça kaldırım kaldırma kaldırmak kale kalem
kalıcı kalın kalıp kalite kaliteli kalitesiz kalkan kalkış kalkışma kalkma kalkmak kalma kalmak
kalmalı kalp kalpli kalsiyum kam kama kamera kameraman kamp kampanya kamu kamuflaj kamyon
kamyonet kan kana kanal kanat kanca kandırma kanepe kanı kanıt kanıtlama kanlı kanser kanun
kaos kap kapak kapalı kapatma kapatmak kapı kapıda kaplan kaplı kapma kapsamlı kaptan kar
kara karakter karamel karamsar karanlık karantina karar kararlı kararsız karate karavan karaya
karbon kardeş kardeşlik kardinal kare kargaşa kargo karı karıma karın karınca karış karışık
karışma karışmak karides karikatür kariyer karlı karma karmaşa karmaşık karnaval karşı karşılık
karşın karşıt kart kartal kas kasa kasaba kasap kase kaset kasım kasırga kasıtlı kaside kast
kasten kasvetli kaşık kat katar katı katılımcı katılmak katlanmak katlı katliam kavga kavrulmuş
kavun kay kaya kayak kaybetme kaybolma kaybolmak kayık kayıp kayıt kayıtlı kayıtsız kaynak
kaynaklı kaz kaza kazak kazan kazanç kazançlı kazanma kazanmak kazara kazı kazık keçi keder
kedi kefalet kefil kehanet kek kel kelebek kelepçeli kelime keman kemer kemik kendi kendince
kendinde kent kere kes keser kesici kesik kesin kesir keskin kesme kesmek kestirme kestirmek
keş keşif keşiş keşke keyif keyifli kez kıç kıdemli kıl kılıç kılık kıllı kımıldama kıpırdama
kır kırıcı kırık kırılgan kırk kırmak kırmızı kısa kısaca kısacası kısım kısıtlama kısıtlı
kıskanç kısmen kış kışın kıt kıta kıyafet kıyak kıyamet kıymetli kız kızartma kızgın kızıl
kızma kibar kibarca kibarlık kibirli kibrit kil kiler kilise kilit kilitli kilo kiloluk kilometre
kim kimi kimlik kimse kimya kin kip kir kira kiralama kiralık kiraz kireç kirli kişi kişilik
kişisel kit kitap kitle klas klasik klinik klişe koca kocama kocaman koç kod kokain kokteyl
koku kokulu kol kola kolay kolayca koloni koltuk kolye koma komedi komedyen komik komiser
komisyon komite komplo komşu komuta komutan komünist konaklama konferans kongre konsantre
konser konserve konsey kont kontes kontrat kontrol konu konuk konum konuş konuşkan konuşma
konuşmacı konuşmak koparmak kopya koridor korkma korkmak korku korkunç korkusuz korkutma korsan
koru koruma korumak korunaklı korunmak koruyucu kostüm koşmak koşu koşun kot kova kovboy kovmak
koy koyacak koyar koyma koymak koyu koyun koz kozmetik kozmik köfte kök köle kömür köpek köprü
kör köstebek köşe kötü kötülük köy köylü kral kraliçe kraliyet krallık kravat kredi krem krema
kremalı krep kreş kristal kritik kriz kucak kudretli kukla kul kulak kule kullanım kullanma
kulübe kulüp kum kuma kumanda kumandalı kumandan kumar kumaş kupa kur kurabiye kural kuralı
kurbağa kurban kurgu kurma kurmak kurnaz kurnazlık kurşun kurt kurtarıcı kurtarma kurtulma
kurtulmak kurtuluş kuru kurucu kurul kurulu kurumsal kuruş kusursuz kuş kuşku kuşkusuz kuşlar
kutlama kutlamak kutlu kutsal kutu kutup kuvvet kuvvetli kuyruk kuyruklu kuzen kuzey kuzeybatı
kuzeydoğu kuzu küçücük küçük küfür kül kültür kültürel kür küre kürek küresel kürk kürtaj
kütüphane labirent laf lahana lake lakin lam lama lamba lan lanet lanetli lap lapa lastik
layık lazer lazım leke leş lezbiyen leziz lezzetli lider liderlik lif liman limon limonata
limuzin lir lira lisans lise liseli liste litre lokma lüks lütfen maalesef maaş macera maç
maça madalya madam madde maddi madem maden mafya magnezyum mağara mağaza mağlup mahalle mahkeme
mahrum mahsur mail makale makarna makas makine makineli makinesi maksimum makul makyaj mal
mala mali malik malum malzeme mama mana manastır manevi mani mankafa manken mantar mantık
mantıklı mantıksal mantıksız manuel manyetik manzara manzaralı maraton marina mark marka market
mars marş mart martı martin martini maruz masa masaj masal maske maskeli mason masum masumiyet
maşa maşallah mat matematik matmazel mavi maya mayıs maymun mayo mazeret mazur mecbur meclis
medeni medeniyet medya medyum meğer mekanik mekanizma mekik mektup melek melez meme memnun
memur men mendil mera merak meraklı mercan merdiven merhaba merhamet merkez mermi mesafe mesafeli
mesai mesaj mesela mesele meslek meşe meşgul meşhur meşru metal meteor metin metre metrelik
metro mevcut mevzu meydan meyilli meyve meyveli mezar mezun mezuniyet mıknatıs mısır mısra
mide mikro mikrofon mikrop miktar mil miligram milimetre millet milli milyar milyarder milyon
milyoner milyonluk mimar minare mine mini minibüs minicik minik minnettar minyatür miras misafir
mit mizah mobilya moda model modellik modern mola monte mor moral morfin motel motor motorlu
mösyö muamele muayene muazzam mucize mucizevi muhabbet muhabir muhafaza muhafız muhakkak muhallebi
muhbir muhtaç muhtemel muhterem muhteşem mum musallat mutabakat mutasyon mutfak mutlak mutlaka
mutlu mutluluk mutsuz muz mücadele mücevher müdahale müdür müfettiş mühendis mühim mühimmat
mükemmel mülk mümkün mürekkep müsaade müsait müstakbel müşterek müşteri mütevazı mütevazi
müthiş müttefik müvekkil müzakere müze müzik müzikal müzisyen nabız nadir nadiren nakavt nakil
nakit nakliye nam nane nankör nar nara narin narkotik nasıl nasılsa nazik nazikçe neden nedense
nefes nefis nefret negatif nehir nem nemli nerede nereden neredeyse neresi nereye nesi nesil
nesne neşe neşeli net ney neyse nezaket nezaketen nice niçin nihai nihayet nine nisan nispeten
nişan nişancı nişanlı nitelikli niye niyet niyetli nokta norm normal nostaljik not nota nova
nöbet nöbetçi numara numaralı nüfus nükleer objektif ocak oda odaklanma odun ofis oğlan oğul
oha oksijen okul okuma okumak okumuş okur okyanus olabilir olacak olağan olamaz olanaksız
olası olasılık olay oldu oldukça olgun olimpiyat olma olmak olmamış olmaz olmuş olumlu olumsuz
olur omlet omuz ona onay onaylamak onbaşı onca onda ondan onlar onlara onlarca onlarda onlardan
onsuz onunki onur onurlu opera operasyon oracıkta orada oradan oral oran orası oraya ordu
organ organik organize organizma orijinal orkestra orman orta ortada ortak ortaklık ortalama
ortalık ortalıkta ortam otel otobüs otomatik otomobil otopsi oturacak oturma oturmak oturmuş
otuz oylama oynama oynamak oysa oyun oyuncak oyuncu oyunculuk öbür ödeme ödemek ödev ödlek
ödül ödünç öfke öfkeli öge öğle öğlen öğrenci öğrenme öğrenmek öğretmek öğretmen öküz öldürme
öldürmek öldürücü ölme ölmek ölmüş ölü ölüm ölümcül ölümlü ölümsüz ömür önce önceden önceki
önceleri öncelik öncelikli öncü önderlik önem önemli önemsiz öneri önlem önlemek önleyici
önünden öpmek öpücük ördek örme örneğin örnek örtbas örümcek öte öteki ötürü övgü öykü öyle
öylece öylesine özel özen özgü özgün özgür özgürce özgürlük özür özürlü paha pahalı paket
pala palavra palyaço pamuk panda panik pantolon panzehir papa papaz papel para paralel paralı
paranoya parasız parazit parça parçacık pardon parfüm park parka parlak parmak parti pas pasaport
pasifik paskalya pasta pastane pastırma paşa pat patates paten patlak patlama patlamak patron
patronluk pay paylaşmak pazar pazarlama pazarlık pek peki pembe pena pencere penguen penis
perde peri perişan personel perşembe peruk pes peşin peşinde petrol peynir peynirli pijama
pike piknik pil pilav piliç pilot pirinç pis pisi piskopos pislik pişman pişmanlık piyango
piyano piyasa pizza plak plaka plan planlama plastik plazma poker polis politik politika pop
popo popüler porno portakal porto post posta postacı pota potasyum poz pozisyon pozitif pratik
prens prenses problem profesör profil program proje prosedür protein protesto protokol prova
psikopat psişik puan puding puro püre radar radikal radyasyon radyo rağmen rahat rahatça rahatlama
rahatlık rahatsız rahibe rahip rakam rakip ram randevu rant rap rapor rastgele rastlantı ray
razı reaksiyon referans rehber rehin rehine reis rekabet rekabetçi reklam rekor renk renkli
resim resmen ressam restoran reşit rezalet rezil rica risk riskli robot roket rol rom roman
romantik romantizm rota rozet röntgen röntgenci röportaj ruh ruhsal ruj rupi rutin rüşvet
rüya saat saatinde saatlerce saatlik sabah sabaha sabahki sabahları sabahtan sabıka sabıkalı
sabır sabırlı sabırsız sabit sabun saç saçı saçlı saçma saçmalama saçmalık sadakat sade sadece
sadık saf sağ sağır sağlam sağlama sağlamak sağlık sağlıklı sağlıksız sağma saha sahi sahiden
sahil sahip sahne sahte sakal sakallı sakat sakın sakınca sakız sakin sakince saklamak saklambaç
saklanma saklanmak saklı sal salakça salata salatalık saldırı salgın salı salim salon salyangoz
sam saman samimi samimiyet samuray san sana sanal sanat sanatçı sanatsal sanayi sancak sandal
sandalye sandık sandviç sanık saniye saniyelik sanki sanma santim santral sap sapan saplantı
sapma sapmak sara saray sarf sarhoş sarı sarılmak sarımsak sarışın sarma sarsıntı saten satıcı
satılık satın satır satış satmak satranç savaş savaşçı savaşmak savcı savcılık savunma savunmak
say sayesinde sayfa saygı saygılı saygın saygınlık saygısız sayı sayılı sayım sayın sayısız
sebep sebepsiz sebze seçenek seçilmiş seçim seçkin seçme seçmek seda sefer seferlik sefil
sekiz sekizinci sekreter sektör sel selam sembol sembolik sempatik sen senaryo senato senatör
sence sende senden sendika sene seneye seninki sent sentetik ser seramik serbest sergi seri
serin sersem serseri sert serum servet servis ses sesli sessiz sessizce sessizlik set sevecen
sever sevgi sevgili sevimli sevişme sevişmek seviye sevk sevmek seyahat seyir seyirci sezon
sıcak sıcaklık sıçan sıçrama sıfır sığ sığınak sığır sık sıkı sıkıca sıkıcı sıkıntı sıkma
sıkmak sıla sınav sınıf sınır sınırlı sınırsız sır sıra sıradan sırasıyla sırf sırt sıska
sıvı sızıntı sigorta sihir sihirbaz sihirli silah silahsız silindir silmek sima sin sincap
sindirim sine sinek sinekler sinema sini sinir sinirli sinirsel sinsi sinsice sinyal sipariş
siper sirk sis sistem sivil sivri siyah siyahi siyasi siz sizce sizde sizden size skandal
skor soda sofistike soğan soğuk sohbet sokak sokma sokmak sol solgun solo solucan soluk solunum
somut son sonbahar sonda sonra sonradan sonraki sonsuz sonsuzluk sonuç sonunda sopa sorma
sormak soru sorumlu sorumsuz sorun sorunlu sorunsuz sos sosis sosyal soy soya soyadı soygun
soylu soyunma sör sörf söyleme söylemek söylenti söz sözcük sözde sözleşme sözlü spagetti
sperm spor sporcu stabil stajyer standart star step sterilize sterlin stop strateji stratejik
stres stresli stüdyo subay suç suçlama suçlamak suçlu suçluluk suçsuz sularında sultan sulu
sunmak sunu sunum surat suratlı suşi sünger süper süpürge süre süreç sürekli süreli sürgün
sürmek sürpriz sürü sürücü sürüngen süslü süt sütçü süvari şafak şah şahane şahıs şahin şahit
şahitlik şahsen şahsi şair şaka şampanya şampiyon şampiyona şan şans şanslı şansölye şantaj
şapka şapşal şarj şarkı şarkıcı şart şartlı şaşırtmak şaşkın şaşkınlık şayet şef şefkat şefkatli
şeftali şehir şeker şekerli şekil şer şeref şerefe şerefli şerif şey şeytani şık şımarık şiddet
şiddetle şiddetli şifre şifreleme şifreli şiir şimdi şimdiden şimdiki şimdilik şimşek şirin
şirket şişe şişko şişman şoför şok şov şöhret şövalye şöyle şubat şuna şundan şunlar şuracıkta
şurada şurası şükran şükür şüphe şüpheli şüphesiz tab tabak taban tabanca tabi tabii tabla
tablo taburcu tabut taciz taç tahammül tahliye tahmin tahminen tahrip tahta tak taka takas
takdim takdir takılı takılmak takım takıntılı takip taklit takma takmak taksi taktik takviye
talep tali talihsiz talimat tam tamam tamamen tamamıyla tamir tamirci tampon tan tane tango
tanı tanıdık tanık tanıklık tanıma tanımak tanımlama tanınmış tanış tanışma tanışmak tanıtım
tanıtmak tank tanrı tanrıça tansiyon tapınak tar taraf taraflı tarafsız tarama tarım tarif
tarih tarihsel tarla tartışma tartışmak tarz tas tasa tasarım tasarımcı tasarruf taş taşıma
taşımak taşınmak taşıyıcı tat tatbikat tatil tatlı tatmin tatsız tav tava tavan tavır tavsiye
tavşan tavuk tayin taze tazminat tebrik tecavüz tecrit tecrübe tecrübeli tedavi tedbirli tedirgin
teğmen tehdit tehlike tehlikeli tek teker tekerlek teklif tekme tekne teknik teknisyen teknoloji
tekrar tel telaffuz telafi telefon telepatik telgraf telsiz temas tembel tembellik temel temelli
temin temiz temizlik temkinli temmuz temsil temsilci ten teneke tenis teori teorik tepe tepki
ter terapi terapist terbiye terbiyeli tercih tercüme tereddüt tereyağı tereyağlı terfi terk
terör terörist ters tersine terslik tertemiz terzi tesadüf tesadüfen teselli tesis tesisatçı
teslim teslimat tespit test testere testi teşebbüs teşekkür teşhis teşkil teşkilat teşvik
tetikçi teyit teyze tez tezahürat tıbbi tık tıkırında tıp tıpkı tıraş tırmanmak tırnak ticaret
ticari tik tilki tim timsah tip tipi tipik tişört titiz titreşim tiyatro tiz tohum tok toka
tokat tokyo tomografi ton top topla toplam toplama toplamak toplanma toplantı toplu topluluk
toplum toplumsal toprak topu torba torna tornavida torpido tost toz tören tövbe trafik trajedi
trajik transfer travma tren tropikal tuğla tuhaf tuhaflık tur tura turist turşu turta turuncu
tutacak tutar tutarak tutku tutkulu tutma tutmak tutsak tutuklu tuvalet tuz tuzak tuzlu tüfek
tüh tükenmez tüm tümör tünaydın tünel tüp tür türlü tütün tüy tüylü ucube ucuz uçak uçar uçmak
uçuş ufacık ufak ufaklık uğra uğraşma uğraşmak uğratmak ukala ulan ulaşım ulaşmak ulaştırma
ultrason ulu ulusal umursamaz umut umutsuz unutma unutmak uslu usta uşak utanç utandırma utangaç
uyandırma uyanık uyarı uyarmak uydu uydurma uygulama uygun uygunsuz uyku uyum uyumak uyumlu
uyuz uzak uzaklaşma uzatma uzay uzaylı uzlaşma uzman uzmanlık uzun uzunca ücret ücretsiz üçlü
üçüncü ülke ümit ümitsiz üniforma ünite ünlü üreme üretim ürkek ürkütücü ürün üst üstat üste
üstelik üstün üstüne üstünlük ütü üvey üye üzere üzeri üzerinde üzerine üzgün üzmek üzücü
üzülme üzüm üzüntü vaat vaaz vadi vaftiz vah vahşi vahşice vajina vaka vakit vaktinde vali
vallahi vampir var vardiya varış varlık varlıklı varmak varsayım vatan vatandaş vay vaz vazgeçme
veba veda vefat vekil velet verdi verecek vergi veri verici verimli verme vermek vesaire veya
vicdan video virüs volkanik votka vurma vurmak vuruş vücut yaban yabancı yabani yağ yağı yağlı
yağmur yahu yak yakacak yakalama yakalanma yakın yakında yakından yakınlık yakışıklı yakıt
yaklaşık yaklaşım yaklaşma yakma yakmak yalan yalancı yalandan yalı yalnız yalnızca yalnızlık
yan yangın yanık yanılsama yanıltıcı yanında yanıt yani yanlış yanlışlık yapay yapı yapım
yapımcı yapış yapışkan yapma yapmacık yapmak yaprak yaptırmak yara yaralı yaramaz yarar yararlı
yarasa yaratıcı yaratık yaratılış yaratmak yarbay yardım yardımcı yargıcı yargıç yargılama
yarı yarım yarın yarınki yarış yarışma yarışmacı yarışmak yas yasa yasak yasal yastık yaş
yaşa yaşam yaşama yaşamak yaşasın yaşlanmak yaşlı yat yatak yataklık yatılı yatırım yatırımcı
yatma yatmak yavaş yavaşça yaver yavru yavşak yay yaya yaygın yayın yaz yazar yazı yazık yazılı
yazılım yazın yazma yazmak yedek yedi yedinci yelken yem yeme yemek yemin yeminli yemiş yen
yenge yengeç yeni yeniden yenileme yenilikçi yenmek yepyeni yer yeraltı yerel yerinde yerine
yerleşim yerli yeşil yetenek yetenekli yeter yeterince yeterli yetersiz yetim yetimhane yetişkin
yetişmek yetki yetkili yığın yıkama yıkıcı yıkım yıkmak yıl yılan yılbaşı yıldırım yıldız
yıldızlı yıllarca yıllık yırtıcı yine yirmi yiyecek yoga yoğun yoğurt yok yoksa yoksun yol
yolcu yolculuk yoldaş yollamak yolsuzluk yoluyla yorgun yorgunluk yorucu yorum yön yönelik
yönetici yönetim yönetmek yönetmen yönlü yöntem yudum yukarı yukarıda yukarıdan yulaf yumruk
yumurta yumuşacık yumuşak yurt yuva yuvarlak yüce yük yükleme yüklenme yüklü yüksek yükseklik
yükseltme yürek yürekli yürekten yürümek yürüyüş yüz yüzbaşı yüzde yüzden yüzlerce yüzlü yüzme
yüzmek yüzük yüzünden yüzüstü yüzyıl zafer zahmet zahmetli zalimce zam zaman zamanı zamanında
zamanla zamanlama zamanlı zamansız zar zarar zararlı zararsız zarf zarfında zarif zaten zavallı
zayıf zayıflık zehir zehirli zeki zekice zemin zen zengin zenginlik zerre zevk zevkli zeytin
zırh zırhlı zihin zihinsel zil zina zincir zinde zira ziyade ziyafet ziyan ziyaret ziyaretçi
zor zorba zorla zorlama zorlamak zorlayıcı zorlu zorluk zorlukla zorunlu züppe
`;

export const VERIFIED_TURKISH_DICTIONARY: ReadonlySet<string> = new Set(
  RAW_VERIFIED_TURKISH_WORDS.split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .map(toTurkishUpper)
);

/**
 * Bir kelimenin doğrulanmış Türkçe sözlükte yer alıp almadığını kontrol eder.
 */
export function isVerifiedTurkishWord(word: string): boolean {
  const normalized = toTurkishUpper(word);
  if ([...normalized].length < 3) return false;
  return VERIFIED_TURKISH_DICTIONARY.has(normalized);
}
