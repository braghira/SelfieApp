## Legenda:

- Le specifiche in bianco sono obbligatorie

- Le specifiche in <span class='orange'>Arancione</span> sono facoltative

## Requisiti di progetto

> I progetti 18-27 e 18-33 sono presentati di persona su appuntamento. Gruppi di 2-3 persone, mai più di 3, mai meno di 2.

Dato che siamo in 3, le nostre specifiche obbligatorie sono quelle fino all'estensione **18-27**. Mi sono preso la briga di indicare già come obbligatorie le estensioni che ci competono, lasciando in <span class="orange">Arancione</span> le estensioni da **18-33**.

- il backend è realizzato con Node, MongoDB e vanilla Javascript. Express e moduli ok. Moduli installabili con npm, ok. Assolutamente NO a php, perl, python, java, ruby, MySQL e altre tecnologie server side fuori dal mondo Node.
- L'applicazione **home + calendario + note + pomodoro + Time Machine** è realizzata con un framework a scelta tra Angular, React, Vue, Svelte, etc.
- L'applicazione **gestione progetto** è realizzata senza framework (vanno bene Web Components) e vanilla Javascript.
- Le parti **calendario, note e pomodoro** sono _mobile first_, sono realizzate con il framework Javascript/Typescript e CSS preferito, e sono pensate per essere usate velocemente e facilmente da tutti. Su PC è comunque possibile compiere in maniera adeguata le funzionalità previste.
- La **Time Machine** è sempre visualizzata su PC e immediatamente accessibile (senza navigazione) su mobile.
- <span class="orange">La parte **gestione progetto** è PC-first, e sfrutta completamente e appropriatamente uno schermo grande. Deve essere fatta in Javascript puro (vanno bene Web Components) e con il framework CSS preferito. Device mobili debbono comunque permettere di compiere in maniera adeguata le funzionalità previste</span>

## Struttura dell'applicazione *Selfie*

- Home e accesso utente
- Calendario
- Note
- Applicazione pomodoro
- <span class="orange">Applicazione gestione progetti</span>
- Applicazione Time Machine

# Specifiche Progetto

- L'applicazione base prevede di aggiungere, rimuovere, postare e modificare eventi semplici del solo utente, posizionati in un **calendario** e di durata nota (intervallo di ore, intere giornate, periodi più lunghi). Gli eventi si possono sovrapporre liberamente.
- Esistono visualizzazioni comode giornaliere, settimanali e mensili degli eventi inseriti.
- E' realizzato un timer (la view **Pomodoro**) per organizzare il passo dello studio.
- E' fornito un editor di appunti e note di studio (**TODO app**).
- E' realizzato un sistema per navigare nel tempo e arrivare ad una data passata o futura come desiderato (**Time Machine**).
- La prima estensione sono i sistemi di **notifica e geolocalizzazione**: messaggia mentre sto usando l'app, ma anche mentre sto facendo qualcos'altro. La messaggistica deve essere calibrabile per testo, ripetizione, urgenza crescente, gestione dei ritardi e degli snooze. La geolocalizzazione permette di situare eventi e impegni in un luogo e/o fuso orario.
- La seconda estensione sono gli **eventi di gruppo**: alcuni eventi e scadenze possono appartenere a più calendari collegati (io e i miei amici) e possono avere priorità e sovrapposizioni diverse. La corretta gestione della privacy è importante: i miei compagni di calcetto sanno solo del calcetto. Prevede anche l'integrazione con sistemi terzi (Google Calendar, Apple Calendar, lo standard iCalendar, etc.).
- <span class="orange">La terza estensione sono i sistemi di gestione di progetti complessi (ad esempio lo studio di un esame universitario). Ogni progetto è diviso in fasi, le fasi in attività, alla fine delle attività ci possono essere dei milestone. Un progetto organizzato tra più persone può avere attività individuali e di gruppo, periodi di grande autonomia e momenti di sincronizzazione, dipendenze reciproche e attività di monitoraggio e verifica. Un sistema noto di visualizzazione dei progetti si chiama diagramma di Gantt</span>

### Home Page e User Login
La Home page serve per navigare tra le view: **Calendario**, **Pomodoro**, **Note**, <span class='orange'>Progetti</span>.

- [ ] L’utente accede all’app tramite account basato su nome utente e password. Il record di un account contiene sicuramente nome utente, password e nome vero ed una quantità a piacere di informazioni personali (e.g. selfie personale, data del compleanno da aggiungere al calendario).
- [ ] Nell’Home vengono mostrate preview dei contenuti delle singole view: ad esempio gli eventi della settimana/giorno corrente, l’ultima nota creata, le attività imminente, report sull’ultimo pomodoro svolto, <span class='orange'>scadenze imminenti dei progetti</span>.
- [ ] Estensione 18-24: Gli utenti hanno la possibilità di personalizzare il tipo di preview per ogni view.
- [ ] Estensione 18-27: Gli utenti possono mandare messaggi e notifiche ad altri utenti (ma non una chat a tutti gli effetti)
- [ ] <span class="orange">Estensione 18-33: Gli utenti hanno un mini hub dove poter chattare con gli altri utenti.</span>

### Calendario

#### Eventi
Il calendario consente ad un utente di creare eventi: questi sono specifici appuntamenti o 
incontri che hanno una data, un'ora e una durata definite. Hanno un titolo.

- [ ] Possono essere una tantum, come un appuntamento medico, o ripetibili, come 
lezioni settimanali. Possono anche essere lunghi come tutta la giornata o più giorni. 
- [ ] Gli eventi ripetibili hanno una frequenza (es.: tutti i giorni, tutti i martedì e giovedì, una volta la 
settimana, tutti i giorni 4 del mese, tutti i primi lunedì del mese, ecc.) 
- [ ] Gli eventi ripetibili hanno un numero di ripetizioni (ripeti indefinitamente, ripeti N volte, ripeti fino alla data XX/XX/XXXX). 
- [ ] Gli eventi possono anche includere un luogo fisico o virtuale dove si svolgono.
- [ ] Gli utenti possono indicare meccanismo di notifica dell'imminente appuntamento
- [ ] Usando uno o più meccanismi (il servizio di notifica del sistema operativo e/o un alert, son una mail con un whatsapp, ecc.) 
- [ ] Con un certo anticipo (all'ora voluta, un minuto, cinque minuti, un'ora, due ore, un giorno, due giorni prima, ecc.) 
- [ ] Con una certa ripetizione (ripeti tre volte, ripeti ogni minuto, ripeti ogni ora, ripeti fino a che non rispondo, ecc.).
- [ ] Gli utenti possono includere altri utenti nei loro eventi
- [ ] Gli altri utenti possono accettare, rifiutare o rimandare l'accettazione dell'evento
- [ ] Gli utenti possono indicare certi intervalli di tempo (anche ripetuti) come non disponibili per eventi di gruppo
- [ ] Gli eventi devono essere integrati con lo standard iCalendar, ed essere liberamente importabili/esportabili. (Google Calendar, Apple Calendar, 
ecc. anche via mail).
- [ ] <span class='orange'>Alcuni utenti sono risorse (ad esempio una stanza riunioni o un'apparecchiatura): posso includerla nell'evento solo se è libera e in quel caso l'evento viene automaticamente accettato.</span>
- [ ] <span class='orange'>Un utente speciale ha la responsabilità di gestire, oltre al proprio 
calendario, anche quello di tutte le risorse. Il calendario delle risorse è liberamente esplorabile da chiunque.</span>
- [ ] <span class='orange'>Le scadenze dei progetti creano eventi per specifici utenti che vengono
automaticamente aggiunti ai calendari relativi.</span>

*Alcuni esempi di librerie che aiutano a gestire i file iCalendar:*
- https://www.npmjs.com/package/ical
- https://www.npmjs.com/package/datebook
- https://www.npmjs.com/package/@pgswe/ics.js

#### Attività
Il calendario consente ad un utente di creare attività: queste sono azioni o compiti di durata prolungata e non esclusiva che un utente deve completare mentre fa anche altre cose. Non necessariamente devono svolgersi in un momento specifico, ma possono avere una scadenza. Ad esempio, "completare la relazione" ed inviarla entro una certa data.
- [ ] In genere non sono associate ad un intervallo di tempo preciso, ma "da adesso ed entro una certa data". 
- [ ] Il loro completamento deve essere esplicitamente specificato o si trascinano nei giorni successivi (attività in ritardo)
- [ ] Le attività devono essere visualizzate nel calendario come scadenza e separatamente come lista.
- [ ] Gli utenti possono ricevere notifica di urgenza crescente via via che ci si allontana dalla data di scadenza
- [ ] Le attività possono essere assegnate a più persone in un ambiente di gruppo
- [ ] <span class='orange'>Le attività possono essere suddivise in sotto-attività e possono
essere correlate a progetti più grandi.</span>

### Note
Una nota è un testo di lunghezza arbitraria(fate prove anche con testi molto lunghi) dotata di titolo, categorie(a scelta dell'utente), data di creazione, e data di ultima modifica. 

- [ ] Le note devono essere gestite in una view separata dal calendario.
- [ ] E' possibile duplicare note e copiare ed incollare il contenuto delle note. 
- [ ] E' possibile cancellare note. 
- [ ] L’home delle note deve mostrare una preview delle note esistenti(i primi N caratteri, N almeno 200) e consentire di aggiungerne delle nuove. Possono essere categorizzate per ordine alfabetico(dal titolo), per data e per lunghezza del contenuto. 
- [ ] Le note possono essere scritte in markdown. Si veda https://www.npmjs.com/package/marked
- [ ] Le note sono dotate di autore e lista di accesso: aperte a tutti, aperte ad alcune specifiche persone, private.
- [ ] <span class='orange'>Oltre alle note a testo libero si possono inserire anche liste di cose da fare con spunte cliccabili</span>
- [ ] <span class='orange'>Aggiungendo una scadenza ad un list item si aggiunge automaticamente una attività nel calendario</span>

### Pomodoro
La view Pomodoro gestisceil metododi studio pomodoro per studiare. Organizza il tempo dello studente in cicli studio-relax secondo una tecnica fissa di 30+5 minuti. La view è composta da:
- [ ] Form per scegliere il tempo di studio e di pausa. Quello standard è 5 cicli da 
30 minuti di studio e 5 minuti di pausa. 
- [ ] Si possono anche inserire un totale di ore/minuti disponibili e si ottengono una o più proposte di cicli di studio/pausa, per esempio: 
    - Input: 200 minuti; Output: 5 cicli da 35 minuti di studio e 5 minuti di pausa.
    - Input: 6 ore; output: 8 cicli da 35 minuti di studio e 10 minuti di pausa.
- [ ] Inizio del tempo di studio/pausa successivo forzato da bottone; 
- [ ] Tasto ricomincia ciclo; 
- [ ] Tasto fine ciclo. 
- [ ] Notifica per inizio ciclo, passaggio da una fase allasuccessiva, fine ciclo.
- [ ] Si richiede un’animazione (OBBLIGATORIAMENTE fatta in CSS, non una gif) per lo studio e una per la pausa
- [ ] Programmare cicli di studio su diverse giornate come Evento su calendario, i.e. cliccando sull’evento si viene rimandati alla view pomodoro; 
- [ ] I cicli previsti e non completati vengono automaticamente passati alle giornate successive e si sommano a quelli previsti per quella giornata.
- [ ] E' possibile mandare una notifica ad un altro utente che gli rende possibile studiare con le stesse impostazioni.
- [ ] <span class='orange'>Musica, video su youtube (music to study to?), modifica del tempo una volta iniziato.</span>

### Time Machine
Durante la presentazione i docenti non vogliono aspettare tre mesi che si concluda una fase e arrivi la relativa notifica. Quindi vogliono poter viaggiare nel tempo. Questo significa che OGNI ANNOTAZIONE TEMPORALE DI QUALUNQUE TIPO sia del server che del client non dipende dalla data e dall'ora del sistema operativo, ma dalla data e dall'ora di un apposito servizio chiamato Time Machine.

- [ ] Per default è allineato alla data e all'ora del sistema operativo ma è possibile modificare data e ora in avanti ed indietro in qualunque momento.
- [ ] Una apposita parte dell'interfaccia, separata dalle altre view ma sempre visibile, e con colori contrastanti rispetto al resto dell'interfaccia, permette all'utente di cambiare data ed ora della Time Machine
- [ ] Immediatamente e senza reload le view cambiano e riflettono la nuova data. 
- [ ] Le notifiche relative al giorno appena specificato si attivano, ma non quelle dei giorni precedenti. 
- [ ] Un semplice pulsante rimette a posto la view alla data e ora del sistema operativo.

### Gestione Progetti 
<span class='orange'>Per ora lascio vuote queste specifiche visto che non sono obbligatorie. Le estensioni in arancione delle altre view sono separate dalla sezione gestione progetti, quindi possiamo implementarle a prescindere se vogliamo aumentare il voto</span>

## Organizzazione Generale Progetto

In ordine di importanza:

- [ ] Definire una volta per tutte la struttura dati user
- [ ] Aggiornare la pagina di Login e Sign Up con i campi giusti (no email)
- [ ] Definire la struttura dati delle note
- [ ] Transizione dai workouts alle note
- [ ] Modificare la Navbar per accogliere le view