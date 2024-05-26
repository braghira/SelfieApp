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

- [ ] L’utente accede all’app tramite account basato su nome utente e password. Il record di un account contiene sicuramente nome utente, password e nome vero ed una quantità a piacere di informazioni personali (e.g. selfie personale, data del compleanno da aggiungere al calendario).
- [ ] La Home page serve per navigare tra le view: Calendario, Pomodoro, Note, Progetti. Nell’Home vengono mostrate preview dei contenuti delle singole view: ad esempio gli eventi della settimana/giorno corrente, l’ultima nota creata, le attività imminente, report sull’ultimo pomodoro svolto, scadenze imminenti dei progetti.
- [ ] Estensione 18-24: Gli utenti hanno la possibilità di personalizzare il tipo di preview per ogni view.
- [ ] Estensione 18-27: Gli utenti possono mandare messaggi e notifiche ad altri utenti (ma non una chat a tutti gli effetti)
- [ ] <span class="orange">Estensione 18-33: Gli utenti hanno un mini hub dove poter chattare con gli altri utenti.</span>

## Organizzazione Generale Progetto

In ordine di importanza:

- [x] capire come strutturare lo schema UserType
