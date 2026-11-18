// Curated exclusions shared by the offline Turkish puzzle generator.
export const EXCLUDED_WORDS: ReadonlySet<string> = new Set(`
abd acaba adama adana adi aferin afet afrika afyon ağrı ağustos ahlaksız ahmak ahmet akort aksaray
akşamdan alçak aldatıcı aldı ali alkol alkolik alkolizm allah alman almanca alo ama aman amasya amazon
amcık amerika amerikan amın amigo amin amk ancak anevrizma ankara antalya aort aport aptal aptalca
aptallık aralık arap arapça arda ardahan argo arslan artık artvin asla asya aşağılık atma avrupa
ayaklanma aydın aynı ayrıca ayrımcılık ayşe ayyaş bağı bahis bakın bakire bakma balıkesir bana bar
barda barı bari bartın başka başkası başsavcı batman batu bayburt bazen bazı belki ben bence bencil
bencillik bende benden beni benim benimki beren beri berk berlin beyninde bıçak bıçaklama bildi bile
bilecik bilir bingöl bir bira biraz birçok biri birisi birkaç biseksüel bitlis biz bizde bizden bize
bizi bizim bok boktan bolu bomba böyle böylece bravo brezilya bu budala buğra bul bulma buna bunak
bundan bunlar bunu burada buradan burak burası buraya burayı burda burdur bursa buse bütün büyücü
cadı cami can casus casusluk cehennem cem cenaze cenk cennet ceren ceset cin cinayet cinsel cinsellik
cuma cumartesi çalış çanakkale çankırı çarşamba çete çıkacak çıkan çıkma çıplak çıplaklık çin çince
çingene çinli çiş çok çorum çünkü da daha dahi dangalak dava davacı dayak de dedi defne değil değiş
delilik deme demek deniz denizli denli deprem depresyon dışkı diğer dilara dinsiz diyarbakır diye
doğan dokunma domuz döl dönme dul durdu durma durun düşmanlık düzce ece eda edirne efe efendim ege
eğer ekim elazığ elbet elbette elif elim emine emre enayi enkaz erin ermeni eroin erotik erzurum
esir eskişehir esrar eşek etme etmek etti evet evin eylül eyvah ezik facia fahişe fahişelik fakat
falan fatma feci felaket felç fer fidye filan fişek frank fransız fransızca fuhuş galiba gavur gaza
gaziantep geçme geldi gelen geleni gelme gene genelev gerçekte gerçi gerek geri gerizekalı gerzek
gibi giren giresun girme gitme gitti gizem gladyatör gökhan gönder gördü göre görmek göt gülme gümüşhane
günah hacı hadi haham hain hakan hakaret hâkim hakkari hala halbuki halt hamilelik hangisi hani hapis
hapishane hasan hastalık hatice hatta havra haydi hayır haysiyetsiz haziran hele hem hemen henüz
hep hepimiz hepiniz hepsi her herhalde herkes hey hırsız hırsızlık hıyar hiç hiçbir hint hintli hortlak
hüseyin ığdır ırz ısparta iblis ibne ibrahim için içinde idam iflas iğrenç ihanet iken ile imam inan
infaz ingiliz ingilizce intihar intikam irak iran irem isa ise ismail ismet ispanyol ispanyolca istanbul
istedi ister işkence işte it italyan italyanca izmir japon japonca kaan kaç kaçık kaçırılma kaçırma
kaçma kaçta kadar kafir kahpe kahramanmaraş kahrolası kahrolsun kaka kal kaldı kalkma kaltak kana
kanada kanama kancık kanka kanlı kanser karaborsa karabük karaman karaya kardinal karıma kars karşı
kasım kastamonu katil katliam kavga kayseri kaza kemal kendi ker kerem kerhane kes keşke kez kırıkkale
kırklareli kırşehir kışkırtma kıyım kızılderili kızma kilis kilise kim kimi kimisi kimse kimyasal
kip kocaeli kokain kokteyl konuş konya kore korece koreli korkak korkma koşun koyma köle kör kötürüm
kuduz kumar kumarbaz kumarhane kuran kurşun kusmuk küfür kürt küstah küstahlık kütahya lakin lan
lanet lanetli lazım likör lina londra lütfen madem mahkeme mahkum malatya manisa mankafa manyak marihuana
mars mart mayın mayıs maymun meğer mehmet meksika melis meme merhaba mermi mersin mert merve meryem
mesela mesih meydanda meyhane mezar mezarlık mı mısır mi mira mistik moron moruk moskova muğla muhalefet
murat musa mustafa muş namussuz narkotik nasıl ne neden nefret nerede nereden neresi nereye nesi
nevşehir niğde nisan nitekim niye nur o ocak okan olacak olamaz olan olarak oldu olma olmadan olmak
olmaz olmuş olsun olunca olur ona onda ondan onlar onlara onlarınki onu onun onunki orada orası oraya
orayı orda ordu orgazm orosbu orospu osman osmaniye osur osuruk oturacak oysa öbür öksüz öküz öldürme
öldürmek ölme ölü ölüm ömer önce öteki öyle öztürk palavracı papa papaz paranoyak paris paskalya
pat patlayıcı pazartesi peder pek peki perşembe peygamber pezevenk piç pis pislik polat porno psikiyatr
psikopat puro puşt rab rahibe rahip rahmetli rakı recep rehine rezalet rezil rize rom roma ruhani
rum rus rusça rüşvet saatinde sabaha sabahtan sabote sadece sağır sahte sakarya sakat salak saldırgan
saldırmak salgın salı salim sam samsun san sana sanık sanki sanma sapık sara sarhoş savaş say sefil
seks seksi selim selin sen sende senden seni senin seninki serkan serseri sever sıç sırf sidik sigara
siirt sik sikiş silah silahlı sinop sivas siz sizde sizden size sizi sizin sizinki sonra sonraları
sorgu sorgulama sorma sorum soruma sosyalist soygun soyguncu soykırım söyleme star striptiz su suç
suçlama suçlamak suçlu sudan suikast suikastçı suistimal suriye süleyman sürtük şaka şakacı şampanya
şanlıurfa şarap şayet şerefsiz şey şeytan şırfıntı şırnak şiddet şimdi şişman şizofreni şubat şuna
şunda şundan şunlar şunu şurada şuradan şurası şuraya şurayı şurda tabanca tabii tabut taciz tahrik
tam tamam tanrı tapınak taşak tavuklar tecavüz tehlike tehlikeli tekila tekin tekirdağ tekrar temmuz
terör terörist tımarhane tokat tolga topal topla trabzon tunceli tutsak tutuklama tüfek tüm türk
türkçe türkiye tütün ulan unutma uşak uyuşturucu üstelik üvey üzere üzülme vahşi vaktinde vampir
van var vay ve veba vefat verdi verme veya viski votka yağız yahu yahudi yahut yalakalık yalova yangın
yani yapma yapmak yaptı yarak yaralanma yarrak yasaklama yaşa yat yatma yeme yetim yılmaz yine yok
yoksa yoksul yoksulluk yozgat yukarıda yunan yunanca yusuf yüzden zalim zanlı zaten zehir zehirli
zenci zeynep zina zira zombi zonguldak zorba zorbalık
`.trim().split(/\s+/));
