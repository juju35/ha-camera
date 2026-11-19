/*
 * Home Camera sidebar panel — every home camera on one page, for every user (not only administrators).
 *
 * Two tabs under the toolbar, as in Smart Comfort: Cameras (the cameras full page: the card's illustrated header as a
 * card, then the video wall edge to edge) and, for administrators only, Settings (a header card with its illustrated
 * banner, the sidebar title, the cameras of Home Assistant not shown yet, from home_camera/discover, the cameras shown
 * as the panel's own list — reordered by drag or arrow keys, each edited with the card editor's camera fields — and
 * the card's display options, with a copy of a camera card found on a dashboard). The settings come from home_camera/subscribe,
 * open to every user and pushed again whenever they change; home_camera/update_settings (administrators)
 * saves them. The tab is in the address (/cameras/settings). The panel draws its toolbar, tabs and forms itself;
 * the camera grid is the card's (streams, privacy, HD / SD, PTZ, fullscreen).
 *
 * https://github.com/juju35/ha-camera
 */
var HOME_CAMERA_PANEL_VERSION = '4.8.1';

var HomeCameraPanelI18n = {
  en: {
    cameras: 'Cameras',
    settings: 'Settings',
    sidebar_title: 'Sidebar title',
    sidebar_title_helper: 'Left empty: “{d}”, in the server’s language',
    cameras_heading: 'Cameras shown',
    save: 'Save',
    revert: 'Cancel changes',
    saved: 'Saved',
    save_error: 'Could not save: {e}',
    unsaved: 'Unsaved changes',
    empty_admin: 'No camera yet: choose them in the Settings tab.',
    empty_user: 'No camera yet: an administrator chooses them in the Settings tab.',
    choose: 'Choose the cameras',
    load_error: 'Could not load the cameras: {e}',
    retry: 'Retry',
    import: 'Copy from a dashboard',
    import_none: 'No camera card found on the dashboards.',
    imported: 'Cameras copied from “{d}”: save to keep them.',
    integration: 'Open the integration',
    found_heading: 'Cameras found',
    found_hint: 'Cameras of Home Assistant not shown in the panel yet.',
    found_none: 'Every camera found is already in the panel.',
    add: 'Add',
    add_all: 'Add all',
    added: 'Cameras added: {n}. Save to keep them.',
    card_error: 'The camera card could not be loaded: clear the browser cache and reload the page.',
    panel_heading: 'Panel',
    display_heading: 'Display',
    up_to_date: 'Up to date',
    edit: 'Edit {c}',
    remove: 'Remove from the panel',
    move: 'Move {c} (drag, or the arrow keys)',
    tag_motion: 'Motion',
    tag_privacy: 'Privacy',
    none_shown: 'No camera shown yet: add the ones found above.',
    toolbar: 'Top bar',
    toolbar_never: 'Shown',
    toolbar_users: 'Hidden for non-admins',
    toolbar_everyone: 'Hidden for everyone',
    toolbar_helper: 'Hidden: the title bar goes, the tabs stay; the menu button stays wherever Home Assistant shows it.',
    live_one: "{n} camera live",
    live_many: "{n} cameras live",
    hidden_one: "{n} hidden",
    hidden_many: "{n} hidden",
    st_live: "Live",
    st_motion: "Motion detected",
    st_privacy: "Private",
    st_offline: "Unavailable",
    hd: "HD",
    sd: "SD",
    quality_hint: "Switch between HD and SD",
  },
  fr: {
    cameras: 'Caméras',
    settings: 'Réglages',
    sidebar_title: 'Titre dans la barre latérale',
    sidebar_title_helper: 'Vide : « {d} », dans la langue du serveur',
    cameras_heading: 'Caméras affichées',
    save: 'Enregistrer',
    revert: 'Annuler les modifications',
    saved: 'Enregistré',
    save_error: 'Enregistrement impossible : {e}',
    unsaved: 'Modifications non enregistrées',
    empty_admin: 'Aucune caméra pour l’instant : choisissez-les dans l’onglet Réglages.',
    empty_user: 'Aucune caméra pour l’instant : un administrateur les choisit dans l’onglet Réglages.',
    choose: 'Choisir les caméras',
    load_error: 'Impossible de charger les caméras : {e}',
    retry: 'Réessayer',
    import: 'Copier depuis un tableau de bord',
    import_none: 'Aucune carte caméras trouvée sur les tableaux de bord.',
    imported: 'Caméras copiées depuis « {d} » : enregistrez pour les garder.',
    integration: 'Ouvrir l’intégration',
    found_heading: 'Caméras trouvées',
    found_hint: 'Caméras de Home Assistant pas encore affichées dans le panneau.',
    found_none: 'Toutes les caméras trouvées sont déjà dans le panneau.',
    add: 'Ajouter',
    add_all: 'Tout ajouter',
    added: 'Caméras ajoutées : {n}. Enregistrez pour les garder.',
    card_error: 'La carte caméras n’a pas pu être chargée : videz le cache du navigateur et rechargez la page.',
    panel_heading: 'Panneau',
    display_heading: 'Affichage',
    up_to_date: 'À jour',
    edit: 'Modifier {c}',
    remove: 'Retirer du panneau',
    move: 'Déplacer {c} (glisser, ou les flèches du clavier)',
    tag_motion: 'Mouvement',
    tag_privacy: 'Confidentialité',
    none_shown: 'Aucune caméra affichée : ajoutez celles trouvées ci-dessus.',
    toolbar: 'Barre du haut',
    toolbar_never: 'Affichée',
    toolbar_users: 'Masquée pour les non-admins',
    toolbar_everyone: 'Masquée pour tous',
    toolbar_helper: 'Masquée : la barre de titre disparaît, les onglets restent ; le bouton menu reste là où Home Assistant l’affiche.',
    live_one: "{n} caméra en direct",
    live_many: "{n} caméras en direct",
    hidden_one: "{n} masquée",
    hidden_many: "{n} masquées",
    st_live: "En direct",
    st_motion: "Mouvement détecté",
    st_privacy: "Privé",
    st_offline: "Indisponible",
    hd: "HD",
    sd: "SD",
    quality_hint: "Basculer entre HD et SD",
  },
  de: {
    cameras: 'Kameras',
    settings: 'Einstellungen',
    sidebar_title: 'Titel in der Seitenleiste',
    sidebar_title_helper: 'Leer: „{d}“, in der Sprache des Servers',
    cameras_heading: 'Angezeigte Kameras',
    save: 'Speichern',
    revert: 'Änderungen verwerfen',
    saved: 'Gespeichert',
    save_error: 'Speichern nicht möglich: {e}',
    unsaved: 'Nicht gespeicherte Änderungen',
    empty_admin: 'Noch keine Kamera: wähle sie im Tab Einstellungen.',
    empty_user: 'Noch keine Kamera: ein Administrator wählt sie im Tab Einstellungen.',
    choose: 'Kameras wählen',
    load_error: 'Kameras konnten nicht geladen werden: {e}',
    retry: 'Erneut versuchen',
    import: 'Aus einem Dashboard kopieren',
    import_none: 'Keine Kamerakarte in den Dashboards gefunden.',
    imported: 'Kameras aus „{d}“ kopiert: speichern, um sie zu behalten.',
    integration: 'Integration öffnen',
    found_heading: 'Gefundene Kameras',
    found_hint: 'Kameras aus Home Assistant, die das Panel noch nicht zeigt.',
    found_none: 'Alle gefundenen Kameras sind bereits im Panel.',
    add: 'Hinzufügen',
    add_all: 'Alle hinzufügen',
    added: 'Kameras hinzugefügt: {n}. Speichern, um sie zu behalten.',
    card_error: 'Die Kamerakarte konnte nicht geladen werden: Browser-Cache leeren und Seite neu laden.',
    panel_heading: 'Panel',
    display_heading: 'Anzeige',
    up_to_date: 'Aktuell',
    edit: '{c} bearbeiten',
    remove: 'Aus dem Panel entfernen',
    move: '{c} verschieben (ziehen oder Pfeiltasten)',
    tag_motion: 'Bewegung',
    tag_privacy: 'Privatsphäre',
    none_shown: 'Noch keine Kamera angezeigt: füge die oben gefundenen hinzu.',
    toolbar: 'Obere Leiste',
    toolbar_never: 'Angezeigt',
    toolbar_users: 'Für Nicht-Admins ausgeblendet',
    toolbar_everyone: 'Für alle ausgeblendet',
    toolbar_helper: 'Ausgeblendet: die Titelleiste verschwindet, die Tabs bleiben; der Menüknopf bleibt, wo Home Assistant ihn zeigt.',
    live_one: "{n} Kamera live",
    live_many: "{n} Kameras live",
    hidden_one: "{n} ausgeblendet",
    hidden_many: "{n} ausgeblendet",
    st_live: "Live",
    st_motion: "Bewegung erkannt",
    st_privacy: "Privat",
    st_offline: "Nicht verfügbar",
    hd: "HD",
    sd: "SD",
    quality_hint: "Zwischen HD und SD wechseln",
  },
  es: {
    cameras: 'Cámaras',
    settings: 'Ajustes',
    sidebar_title: 'Título en la barra lateral',
    sidebar_title_helper: 'Vacío: «{d}», en el idioma del servidor',
    cameras_heading: 'Cámaras mostradas',
    save: 'Guardar',
    revert: 'Descartar cambios',
    saved: 'Guardado',
    save_error: 'No se pudo guardar: {e}',
    unsaved: 'Cambios sin guardar',
    empty_admin: 'Aún no hay cámaras: elígelas en la pestaña Ajustes.',
    empty_user: 'Aún no hay cámaras: un administrador las elige en la pestaña Ajustes.',
    choose: 'Elegir las cámaras',
    load_error: 'No se pudieron cargar las cámaras: {e}',
    retry: 'Reintentar',
    import: 'Copiar de un panel',
    import_none: 'No se encontró ninguna tarjeta de cámaras en los paneles.',
    imported: 'Cámaras copiadas de «{d}»: guarda para conservarlas.',
    integration: 'Abrir la integración',
    found_heading: 'Cámaras encontradas',
    found_hint: 'Cámaras de Home Assistant que el panel aún no muestra.',
    found_none: 'Todas las cámaras encontradas ya están en el panel.',
    add: 'Añadir',
    add_all: 'Añadir todas',
    added: 'Cámaras añadidas: {n}. Guarda para conservarlas.',
    card_error: 'No se pudo cargar la tarjeta de cámaras: vacía la caché del navegador y recarga la página.',
    panel_heading: 'Panel',
    display_heading: 'Visualización',
    up_to_date: 'Al día',
    edit: 'Editar {c}',
    remove: 'Quitar del panel',
    move: 'Mover {c} (arrastrar o teclas de flecha)',
    tag_motion: 'Movimiento',
    tag_privacy: 'Privacidad',
    none_shown: 'Aún no se muestra ninguna cámara: añade las encontradas arriba.',
    toolbar: 'Barra superior',
    toolbar_never: 'Visible',
    toolbar_users: 'Oculta para no administradores',
    toolbar_everyone: 'Oculta para todos',
    toolbar_helper: 'Oculta: la barra de título desaparece, las pestañas se quedan; el botón de menú sigue donde Home Assistant lo muestra.',
    live_one: "{n} cámara en directo",
    live_many: "{n} cámaras en directo",
    hidden_one: "{n} oculta",
    hidden_many: "{n} ocultas",
    st_live: "En directo",
    st_motion: "Movimiento detectado",
    st_privacy: "Privado",
    st_offline: "No disponible",
    hd: "HD",
    sd: "SD",
    quality_hint: "Cambiar entre HD y SD",
  },
  sr: {
    cameras: 'Камере',
    settings: 'Подешавања',
    sidebar_title: 'Наслов у бочној траци',
    sidebar_title_helper: 'Празно: „{d}”, на језику сервера',
    cameras_heading: 'Приказане камере',
    save: 'Сачувај',
    revert: 'Откажи измене',
    saved: 'Сачувано',
    save_error: 'Чување није успело: {e}',
    unsaved: 'Несачуване измене',
    empty_admin: 'Још нема камера: изаберите их на картици Подешавања.',
    empty_user: 'Још нема камера: администратор их бира на картици Подешавања.',
    choose: 'Изабери камере',
    load_error: 'Учитавање камера није успело: {e}',
    retry: 'Покушај поново',
    import: 'Копирај са контролне табле',
    import_none: 'На контролним таблама није пронађена картица камера.',
    imported: 'Камере копиране са „{d}”: сачувајте да бисте их задржали.',
    integration: 'Отвори интеграцију',
    found_heading: 'Пронађене камере',
    found_hint: 'Камере из Home Assistant-а које панел још не приказује.',
    found_none: 'Све пронађене камере су већ у панелу.',
    add: 'Додај',
    add_all: 'Додај све',
    added: 'Додате камере: {n}. Сачувајте да бисте их задржали.',
    card_error: 'Картица камера није учитана: обришите кеш прегледача и поново учитајте страницу.',
    panel_heading: 'Панел',
    display_heading: 'Приказ',
    up_to_date: 'Ажурно',
    edit: 'Измени {c}',
    remove: 'Уклони из панела',
    move: 'Помери {c} (превуци или стрелице)',
    tag_motion: 'Покрет',
    tag_privacy: 'Приватност',
    none_shown: 'Још нема приказаних камера: додајте пронађене изнад.',
    toolbar: 'Горња трака',
    toolbar_never: 'Приказана',
    toolbar_users: 'Скривена за неадминистраторе',
    toolbar_everyone: 'Скривена за све',
    toolbar_helper: 'Скривена: трака наслова нестаје, картице остају; дугме менија остаје где га Home Assistant приказује.',
    live_one: "{n} камера уживо",
    live_many: "Камере уживо: {n}",
    hidden_one: "{n} скривена",
    hidden_many: "Скривене: {n}",
    st_live: "Уживо",
    st_motion: "Откривен покрет",
    st_privacy: "Приватно",
    st_offline: "Недоступно",
    hd: "HD",
    sd: "SD",
    quality_hint: "Пребацивање између HD и SD квалитета",
  },
  'sr-Latn': {
    cameras: 'Kamere',
    settings: 'Podešavanja',
    sidebar_title: 'Naslov u bočnoj traci',
    sidebar_title_helper: 'Prazno: „{d}”, na jeziku servera',
    cameras_heading: 'Prikazane kamere',
    save: 'Sačuvaj',
    revert: 'Otkaži izmene',
    saved: 'Sačuvano',
    save_error: 'Čuvanje nije uspelo: {e}',
    unsaved: 'Nesačuvane izmene',
    empty_admin: 'Još nema kamera: izaberite ih na kartici Podešavanja.',
    empty_user: 'Još nema kamera: administrator ih bira na kartici Podešavanja.',
    choose: 'Izaberi kamere',
    load_error: 'Učitavanje kamera nije uspelo: {e}',
    retry: 'Pokušaj ponovo',
    import: 'Kopiraj sa kontrolne table',
    import_none: 'Na kontrolnim tablama nije pronađena kartica kamera.',
    imported: 'Kamere kopirane sa „{d}”: sačuvajte da biste ih zadržali.',
    integration: 'Otvori integraciju',
    found_heading: 'Pronađene kamere',
    found_hint: 'Kamere iz Home Assistant-a koje panel još ne prikazuje.',
    found_none: 'Sve pronađene kamere su već u panelu.',
    add: 'Dodaj',
    add_all: 'Dodaj sve',
    added: 'Dodate kamere: {n}. Sačuvajte da biste ih zadržali.',
    card_error: 'Kartica kamera nije učitana: obrišite keš pregledača i ponovo učitajte stranicu.',
    panel_heading: 'Panel',
    display_heading: 'Prikaz',
    up_to_date: 'Ažurno',
    edit: 'Izmeni {c}',
    remove: 'Ukloni iz panela',
    move: 'Pomeri {c} (prevuci ili strelice)',
    tag_motion: 'Pokret',
    tag_privacy: 'Privatnost',
    none_shown: 'Još nema prikazanih kamera: dodajte pronađene iznad.',
    toolbar: 'Gornja traka',
    toolbar_never: 'Prikazana',
    toolbar_users: 'Skrivena za neadministratore',
    toolbar_everyone: 'Skrivena za sve',
    toolbar_helper: 'Skrivena: traka naslova nestaje, kartice ostaju; dugme menija ostaje gde ga Home Assistant prikazuje.',
    live_one: "{n} kamera uživo",
    live_many: "Kamere uživo: {n}",
    hidden_one: "{n} skrivena",
    hidden_many: "Skrivene: {n}",
    st_live: "Uživo",
    st_motion: "Otkriven pokret",
    st_privacy: "Privatno",
    st_offline: "Nedostupno",
    hd: "HD",
    sd: "SD",
    quality_hint: "Prebacivanje između HD i SD kvaliteta",
  },
  it: {
    cameras: 'Telecamere',
    settings: 'Impostazioni',
    sidebar_title: 'Titolo nella barra laterale',
    sidebar_title_helper: 'Vuoto: «{d}», nella lingua del server',
    cameras_heading: 'Telecamere mostrate',
    save: 'Salva',
    revert: 'Annulla le modifiche',
    saved: 'Salvato',
    save_error: 'Impossibile salvare: {e}',
    unsaved: 'Modifiche non salvate',
    empty_admin: 'Ancora nessuna telecamera: sceglile nella scheda Impostazioni.',
    empty_user: 'Ancora nessuna telecamera: un amministratore le sceglie nella scheda Impostazioni.',
    choose: 'Scegli le telecamere',
    load_error: 'Impossibile caricare le telecamere: {e}',
    retry: 'Riprova',
    import: 'Copia da una plancia',
    import_none: 'Nessuna scheda telecamere trovata nelle plance.',
    imported: 'Telecamere copiate da «{d}»: salva per mantenerle.',
    integration: 'Apri l’integrazione',
    found_heading: 'Telecamere trovate',
    found_hint: 'Telecamere di Home Assistant non ancora mostrate nel pannello.',
    found_none: 'Tutte le telecamere trovate sono già nel pannello.',
    add: 'Aggiungi',
    add_all: 'Aggiungi tutte',
    added: 'Telecamere aggiunte: {n}. Salva per mantenerle.',
    card_error: 'Impossibile caricare la scheda telecamere: svuota la cache del browser e ricarica la pagina.',
    panel_heading: 'Pannello',
    display_heading: 'Visualizzazione',
    up_to_date: 'Aggiornato',
    edit: 'Modifica {c}',
    remove: 'Rimuovi dal pannello',
    move: 'Sposta {c} (trascina o tasti freccia)',
    tag_motion: 'Movimento',
    tag_privacy: 'Privacy',
    none_shown: 'Ancora nessuna telecamera mostrata: aggiungi quelle trovate sopra.',
    toolbar: 'Barra superiore',
    toolbar_never: 'Visibile',
    toolbar_users: 'Nascosta ai non amministratori',
    toolbar_everyone: 'Nascosta a tutti',
    toolbar_helper: 'Nascosta: la barra del titolo sparisce, le schede restano; il pulsante del menu resta dove Home Assistant lo mostra.',
    live_one: "{n} telecamera in diretta",
    live_many: "{n} telecamere in diretta",
    hidden_one: "{n} nascosta",
    hidden_many: "{n} nascoste",
    st_live: "In diretta",
    st_motion: "Movimento rilevato",
    st_privacy: "Privato",
    st_offline: "Non disponibile",
    hd: "HD",
    sd: "SD",
    quality_hint: "Passa da HD a SD e viceversa",
  },
  nl: {
    cameras: "Camera's",
    settings: 'Instellingen',
    sidebar_title: 'Titel in de zijbalk',
    sidebar_title_helper: 'Leeg: “{d}”, in de taal van de server',
    cameras_heading: "Getoonde camera's",
    save: 'Opslaan',
    revert: 'Wijzigingen annuleren',
    saved: 'Opgeslagen',
    save_error: 'Opslaan mislukt: {e}',
    unsaved: 'Niet-opgeslagen wijzigingen',
    empty_admin: "Nog geen camera's: kies ze op het tabblad Instellingen.",
    empty_user: "Nog geen camera's: een beheerder kiest ze op het tabblad Instellingen.",
    choose: "Camera's kiezen",
    load_error: "Camera's konden niet worden geladen: {e}",
    retry: 'Opnieuw proberen',
    import: 'Kopiëren uit een dashboard',
    import_none: 'Geen camerakaart gevonden op de dashboards.',
    imported: "Camera's gekopieerd uit “{d}”: sla op om ze te bewaren.",
    integration: 'Integratie openen',
    found_heading: 'Gevonden camera\'s',
    found_hint: 'Camera\'s uit Home Assistant die het paneel nog niet toont.',
    found_none: 'Alle gevonden camera\'s staan al in het paneel.',
    add: 'Toevoegen',
    add_all: 'Alles toevoegen',
    added: 'Camera\'s toegevoegd: {n}. Sla op om ze te bewaren.',
    card_error: 'De camerakaart kon niet worden geladen: wis de browsercache en laad de pagina opnieuw.',
    panel_heading: 'Paneel',
    display_heading: 'Weergave',
    up_to_date: 'Bijgewerkt',
    edit: '{c} bewerken',
    remove: 'Uit het paneel verwijderen',
    move: '{c} verplaatsen (slepen of pijltjestoetsen)',
    tag_motion: 'Beweging',
    tag_privacy: 'Privacy',
    none_shown: "Nog geen camera's getoond: voeg de hierboven gevonden toe.",
    toolbar: 'Bovenbalk',
    toolbar_never: 'Getoond',
    toolbar_users: 'Verborgen voor niet-beheerders',
    toolbar_everyone: 'Verborgen voor iedereen',
    toolbar_helper: 'Verborgen: de titelbalk verdwijnt, de tabbladen blijven; de menuknop blijft waar Home Assistant hem toont.',
    live_one: "{n} camera live",
    live_many: "{n} camera's live",
    hidden_one: "{n} verborgen",
    hidden_many: "{n} verborgen",
    st_live: "Live",
    st_motion: "Beweging gedetecteerd",
    st_privacy: "Privé",
    st_offline: "Niet beschikbaar",
    hd: "HD",
    sd: "SD",
    quality_hint: "Wisselen tussen HD en SD",
  },
  pt: {
    cameras: 'Câmaras',
    settings: 'Definições',
    sidebar_title: 'Título na barra lateral',
    sidebar_title_helper: 'Vazio: «{d}», no idioma do servidor',
    cameras_heading: 'Câmaras apresentadas',
    save: 'Guardar',
    revert: 'Cancelar alterações',
    saved: 'Guardado',
    save_error: 'Não foi possível guardar: {e}',
    unsaved: 'Alterações não guardadas',
    empty_admin: 'Ainda sem câmaras: escolha-as no separador Definições.',
    empty_user: 'Ainda sem câmaras: um administrador escolhe-as no separador Definições.',
    choose: 'Escolher as câmaras',
    load_error: 'Não foi possível carregar as câmaras: {e}',
    retry: 'Tentar novamente',
    import: 'Copiar de um painel',
    import_none: 'Nenhum cartão de câmaras encontrado nos painéis.',
    imported: 'Câmaras copiadas de «{d}»: guarde para as manter.',
    integration: 'Abrir a integração',
    found_heading: 'Câmaras encontradas',
    found_hint: 'Câmaras do Home Assistant que o painel ainda não mostra.',
    found_none: 'Todas as câmaras encontradas já estão no painel.',
    add: 'Adicionar',
    add_all: 'Adicionar todas',
    added: 'Câmaras adicionadas: {n}. Guarde para as manter.',
    card_error: 'Não foi possível carregar o cartão de câmaras: limpe a cache do navegador e recarregue a página.',
    panel_heading: 'Painel',
    display_heading: 'Apresentação',
    up_to_date: 'Atualizado',
    edit: 'Editar {c}',
    remove: 'Remover do painel',
    move: 'Mover {c} (arrastar ou teclas de seta)',
    tag_motion: 'Movimento',
    tag_privacy: 'Privacidade',
    none_shown: 'Ainda sem câmaras apresentadas: adicione as encontradas acima.',
    toolbar: 'Barra superior',
    toolbar_never: 'Visível',
    toolbar_users: 'Oculta para não administradores',
    toolbar_everyone: 'Oculta para todos',
    toolbar_helper: 'Oculta: a barra de título desaparece, os separadores ficam; o botão de menu fica onde o Home Assistant o mostra.',
    live_one: "{n} câmara em direto",
    live_many: "{n} câmaras em direto",
    hidden_one: "{n} oculta",
    hidden_many: "{n} ocultas",
    st_live: "Em direto",
    st_motion: "Movimento detetado",
    st_privacy: "Privado",
    st_offline: "Indisponível",
    hd: "HD",
    sd: "SD",
    quality_hint: "Alternar entre HD e SD",
  },
  pl: {
    cameras: 'Kamery',
    settings: 'Ustawienia',
    sidebar_title: 'Tytuł na pasku bocznym',
    sidebar_title_helper: 'Puste: „{d}”, w języku serwera',
    cameras_heading: 'Wyświetlane kamery',
    save: 'Zapisz',
    revert: 'Anuluj zmiany',
    saved: 'Zapisano',
    save_error: 'Nie udało się zapisać: {e}',
    unsaved: 'Niezapisane zmiany',
    empty_admin: 'Brak kamer: wybierz je w karcie Ustawienia.',
    empty_user: 'Brak kamer: administrator wybiera je w karcie Ustawienia.',
    choose: 'Wybierz kamery',
    load_error: 'Nie udało się wczytać kamer: {e}',
    retry: 'Spróbuj ponownie',
    import: 'Skopiuj z dashboardu',
    import_none: 'Nie znaleziono karty kamer na dashboardach.',
    imported: 'Kamery skopiowane z „{d}”: zapisz, aby je zachować.',
    integration: 'Otwórz integrację',
    found_heading: 'Znalezione kamery',
    found_hint: 'Kamery z Home Assistant, których panel jeszcze nie pokazuje.',
    found_none: 'Wszystkie znalezione kamery są już w panelu.',
    add: 'Dodaj',
    add_all: 'Dodaj wszystkie',
    added: 'Dodane kamery: {n}. Zapisz, aby je zachować.',
    card_error: 'Nie udało się wczytać karty kamer: wyczyść pamięć podręczną przeglądarki i odśwież stronę.',
    panel_heading: 'Panel',
    display_heading: 'Wyświetlanie',
    up_to_date: 'Aktualne',
    edit: 'Edytuj {c}',
    remove: 'Usuń z panelu',
    move: 'Przenieś {c} (przeciągnij lub strzałki)',
    tag_motion: 'Ruch',
    tag_privacy: 'Prywatność',
    none_shown: 'Brak wyświetlanych kamer: dodaj znalezione powyżej.',
    toolbar: 'Górny pasek',
    toolbar_never: 'Widoczny',
    toolbar_users: 'Ukryty dla nie-administratorów',
    toolbar_everyone: 'Ukryty dla wszystkich',
    toolbar_helper: 'Ukryty: pasek tytułu znika, karty zostają; przycisk menu zostaje tam, gdzie pokazuje go Home Assistant.',
    live_one: "{n} kamera na żywo",
    live_many: "Kamery na żywo: {n}",
    hidden_one: "{n} ukryta",
    hidden_many: "Ukryte: {n}",
    st_live: "Na żywo",
    st_motion: "Wykryto ruch",
    st_privacy: "Prywatne",
    st_offline: "Niedostępna",
    hd: "HD",
    sd: "SD",
    quality_hint: "Przełącz między HD a SD",
  },
  ro: {
    cameras: 'Camere',
    settings: 'Setări',
    sidebar_title: 'Titlu în bara laterală',
    sidebar_title_helper: 'Gol: „{d}”, în limba serverului',
    cameras_heading: 'Camere afișate',
    save: 'Salvează',
    revert: 'Anulează modificările',
    saved: 'Salvat',
    save_error: 'Salvarea a eșuat: {e}',
    unsaved: 'Modificări nesalvate',
    empty_admin: 'Nicio cameră încă: alegeți-le în fila Setări.',
    empty_user: 'Nicio cameră încă: un administrator le alege în fila Setări.',
    choose: 'Alege camerele',
    load_error: 'Camerele nu au putut fi încărcate: {e}',
    retry: 'Reîncearcă',
    import: 'Copiază dintr-un tablou de bord',
    import_none: 'Niciun card de camere găsit în tablourile de bord.',
    imported: 'Camere copiate din „{d}”: salvați pentru a le păstra.',
    integration: 'Deschide integrarea',
    found_heading: 'Camere găsite',
    found_hint: 'Camere din Home Assistant pe care panoul nu le afișează încă.',
    found_none: 'Toate camerele găsite sunt deja în panou.',
    add: 'Adaugă',
    add_all: 'Adaugă toate',
    added: 'Camere adăugate: {n}. Salvați pentru a le păstra.',
    card_error: 'Cardul camerelor nu a putut fi încărcat: goliți memoria cache a browserului și reîncărcați pagina.',
    panel_heading: 'Panou',
    display_heading: 'Afișare',
    up_to_date: 'La zi',
    edit: 'Editează {c}',
    remove: 'Elimină din panou',
    move: 'Mută {c} (trage sau tastele săgeți)',
    tag_motion: 'Mișcare',
    tag_privacy: 'Confidențialitate',
    none_shown: 'Nicio cameră afișată încă: adăugați-le pe cele găsite mai sus.',
    toolbar: 'Bara de sus',
    toolbar_never: 'Afișată',
    toolbar_users: 'Ascunsă pentru non-administratori',
    toolbar_everyone: 'Ascunsă pentru toți',
    toolbar_helper: 'Ascunsă: bara de titlu dispare, filele rămân; butonul de meniu rămâne acolo unde îl afișează Home Assistant.',
    live_one: "{n} cameră în direct",
    live_many: "Camere în direct: {n}",
    hidden_one: "{n} ascunsă",
    hidden_many: "Ascunse: {n}",
    st_live: "În direct",
    st_motion: "Mișcare detectată",
    st_privacy: "Privat",
    st_offline: "Indisponibilă",
    hd: "HD",
    sd: "SD",
    quality_hint: "Comutați între HD și SD",
  },
  da: {
    cameras: 'Kameraer',
    settings: 'Indstillinger',
    sidebar_title: 'Titel i sidepanelet',
    sidebar_title_helper: 'Tom: “{d}”, på serverens sprog',
    cameras_heading: 'Viste kameraer',
    save: 'Gem',
    revert: 'Fortryd ændringer',
    saved: 'Gemt',
    save_error: 'Kunne ikke gemme: {e}',
    unsaved: 'Ikke-gemte ændringer',
    empty_admin: 'Ingen kameraer endnu: vælg dem under fanen Indstillinger.',
    empty_user: 'Ingen kameraer endnu: en administrator vælger dem under fanen Indstillinger.',
    choose: 'Vælg kameraerne',
    load_error: 'Kameraerne kunne ikke indlæses: {e}',
    retry: 'Prøv igen',
    import: 'Kopiér fra et dashboard',
    import_none: 'Intet kamerakort fundet på dashboardene.',
    imported: 'Kameraer kopieret fra “{d}”: gem for at beholde dem.',
    integration: 'Åbn integrationen',
    found_heading: 'Fundne kameraer',
    found_hint: 'Kameraer i Home Assistant, som panelet endnu ikke viser.',
    found_none: 'Alle fundne kameraer er allerede i panelet.',
    add: 'Tilføj',
    add_all: 'Tilføj alle',
    added: 'Kameraer tilføjet: {n}. Gem for at beholde dem.',
    card_error: 'Kamerakortet kunne ikke indlæses: ryd browserens cache, og genindlæs siden.',
    panel_heading: 'Panel',
    display_heading: 'Visning',
    up_to_date: 'Opdateret',
    edit: 'Rediger {c}',
    remove: 'Fjern fra panelet',
    move: 'Flyt {c} (træk eller piletaster)',
    tag_motion: 'Bevægelse',
    tag_privacy: 'Privatliv',
    none_shown: 'Ingen kameraer vist endnu: tilføj dem, der er fundet ovenfor.',
    toolbar: 'Topbjælke',
    toolbar_never: 'Vist',
    toolbar_users: 'Skjult for ikke-administratorer',
    toolbar_everyone: 'Skjult for alle',
    toolbar_helper: 'Skjult: titellinjen forsvinder, fanerne bliver; menuknappen bliver, hvor Home Assistant viser den.',
    live_one: "{n} kamera live",
    live_many: "{n} kameraer live",
    hidden_one: "{n} skjult",
    hidden_many: "{n} skjulte",
    st_live: "Live",
    st_motion: "Bevægelse registreret",
    st_privacy: "Privat",
    st_offline: "Utilgængelig",
    hd: "HD",
    sd: "SD",
    quality_hint: "Skift mellem HD og SD",
  },
  sv: {
    cameras: 'Kameror',
    settings: 'Inställningar',
    sidebar_title: 'Titel i sidofältet',
    sidebar_title_helper: 'Tomt: ”{d}”, på serverns språk',
    cameras_heading: 'Visade kameror',
    save: 'Spara',
    revert: 'Ångra ändringar',
    saved: 'Sparat',
    save_error: 'Kunde inte spara: {e}',
    unsaved: 'Osparade ändringar',
    empty_admin: 'Inga kameror ännu: välj dem på fliken Inställningar.',
    empty_user: 'Inga kameror ännu: en administratör väljer dem på fliken Inställningar.',
    choose: 'Välj kamerorna',
    load_error: 'Kamerorna kunde inte läsas in: {e}',
    retry: 'Försök igen',
    import: 'Kopiera från en instrumentpanel',
    import_none: 'Inget kamerakort hittades på instrumentpanelerna.',
    imported: 'Kameror kopierade från ”{d}”: spara för att behålla dem.',
    integration: 'Öppna integrationen',
    found_heading: 'Hittade kameror',
    found_hint: 'Kameror i Home Assistant som panelen ännu inte visar.',
    found_none: 'Alla hittade kameror finns redan i panelen.',
    add: 'Lägg till',
    add_all: 'Lägg till alla',
    added: 'Kameror tillagda: {n}. Spara för att behålla dem.',
    card_error: 'Kamerakortet kunde inte läsas in: rensa webbläsarens cache och ladda om sidan.',
    panel_heading: 'Panel',
    display_heading: 'Visning',
    up_to_date: 'Uppdaterad',
    edit: 'Redigera {c}',
    remove: 'Ta bort från panelen',
    move: 'Flytta {c} (dra eller piltangenter)',
    tag_motion: 'Rörelse',
    tag_privacy: 'Integritet',
    none_shown: 'Inga kameror visas ännu: lägg till de som hittats ovan.',
    toolbar: 'Översta fältet',
    toolbar_never: 'Visas',
    toolbar_users: 'Dolt för icke-administratörer',
    toolbar_everyone: 'Dolt för alla',
    toolbar_helper: 'Dolt: namnlisten försvinner, flikarna stannar; menyknappen stannar där Home Assistant visar den.',
    live_one: "{n} kamera live",
    live_many: "{n} kameror live",
    hidden_one: "{n} dold",
    hidden_many: "{n} dolda",
    st_live: "Live",
    st_motion: "Rörelse upptäckt",
    st_privacy: "Privat",
    st_offline: "Inte tillgänglig",
    hd: "HD",
    sd: "SD",
    quality_hint: "Växla mellan HD och SD",
  },
  bg: {
    cameras: 'Камери',
    settings: 'Настройки',
    sidebar_title: 'Заглавие в страничната лента',
    sidebar_title_helper: 'Празно: „{d}“, на езика на сървъра',
    cameras_heading: 'Показани камери',
    save: 'Запази',
    revert: 'Отказ от промените',
    saved: 'Запазено',
    save_error: 'Неуспешно запазване: {e}',
    unsaved: 'Незапазени промени',
    empty_admin: 'Все още няма камери: изберете ги в раздела Настройки.',
    empty_user: 'Все още няма камери: администратор ги избира в раздела Настройки.',
    choose: 'Изберете камерите',
    load_error: 'Камерите не можаха да се заредят: {e}',
    retry: 'Опитай отново',
    import: 'Копиране от табло',
    import_none: 'Не е намерена карта с камери в таблата.',
    imported: 'Камерите са копирани от „{d}“: запазете, за да ги задържите.',
    integration: 'Отвори интеграцията',
    found_heading: 'Открити камери',
    found_hint: 'Камери от Home Assistant, които панелът още не показва.',
    found_none: 'Всички открити камери вече са в панела.',
    add: 'Добави',
    add_all: 'Добави всички',
    added: 'Добавени камери: {n}. Запазете, за да ги задържите.',
    card_error: 'Картата с камери не можа да се зареди: изчистете кеша на браузъра и презаредете страницата.',
    panel_heading: 'Панел',
    display_heading: 'Изглед',
    up_to_date: 'Актуално',
    edit: 'Редактирай {c}',
    remove: 'Премахни от панела',
    move: 'Премести {c} (плъзни или стрелки)',
    tag_motion: 'Движение',
    tag_privacy: 'Поверителност',
    none_shown: 'Все още няма показани камери: добавете откритите по-горе.',
    toolbar: 'Горна лента',
    toolbar_never: 'Показана',
    toolbar_users: 'Скрита за неадминистратори',
    toolbar_everyone: 'Скрита за всички',
    toolbar_helper: 'Скрита: лентата със заглавие изчезва, разделите остават; бутонът на менюто остава там, където Home Assistant го показва.',
    live_one: "{n} камера на живо",
    live_many: "{n} камери на живо",
    hidden_one: "{n} скрита",
    hidden_many: "{n} скрити",
    st_live: "На живо",
    st_motion: "Открито движение",
    st_privacy: "Поверително",
    st_offline: "Недостъпна",
    hd: "HD",
    sd: "SD",
    quality_hint: "Превключване между HD и SD",
  },
  ru: {
    cameras: 'Камеры',
    settings: 'Настройки',
    sidebar_title: 'Заголовок на боковой панели',
    sidebar_title_helper: 'Пусто: «{d}», на языке сервера',
    cameras_heading: 'Показываемые камеры',
    save: 'Сохранить',
    revert: 'Отменить изменения',
    saved: 'Сохранено',
    save_error: 'Не удалось сохранить: {e}',
    unsaved: 'Несохранённые изменения',
    empty_admin: 'Камер пока нет: выберите их на вкладке «Настройки».',
    empty_user: 'Камер пока нет: администратор выбирает их на вкладке «Настройки».',
    choose: 'Выбрать камеры',
    load_error: 'Не удалось загрузить камеры: {e}',
    retry: 'Повторить',
    import: 'Скопировать с дашборда',
    import_none: 'На дашбордах не найдена карточка камер.',
    imported: 'Камеры скопированы с «{d}»: сохраните, чтобы оставить их.',
    integration: 'Открыть интеграцию',
    found_heading: 'Найденные камеры',
    found_hint: 'Камеры Home Assistant, которых ещё нет на панели.',
    found_none: 'Все найденные камеры уже на панели.',
    add: 'Добавить',
    add_all: 'Добавить все',
    added: 'Добавлено камер: {n}. Сохраните, чтобы оставить их.',
    card_error: 'Не удалось загрузить карточку камер: очистите кэш браузера и перезагрузите страницу.',
    panel_heading: 'Панель',
    display_heading: 'Отображение',
    up_to_date: 'Актуально',
    edit: 'Изменить {c}',
    remove: 'Убрать с панели',
    move: 'Переместить {c} (перетаскиванием или стрелками)',
    tag_motion: 'Движение',
    tag_privacy: 'Приватность',
    none_shown: 'Камер пока нет: добавьте найденные выше.',
    toolbar: 'Верхняя панель',
    toolbar_never: 'Показана',
    toolbar_users: 'Скрыта для не-администраторов',
    toolbar_everyone: 'Скрыта для всех',
    toolbar_helper: 'Скрыта: строка заголовка исчезает, вкладки остаются; кнопка меню остаётся там, где её показывает Home Assistant.',
    live_one: "{n} камера в эфире",
    live_many: "Камеры в эфире: {n}",
    hidden_one: "{n} скрыта",
    hidden_many: "Скрыты: {n}",
    st_live: "В эфире",
    st_motion: "Обнаружено движение",
    st_privacy: "Приватно",
    st_offline: "Недоступна",
    hd: "HD",
    sd: "SD",
    quality_hint: "Переключение между HD и SD",
  },
  uk: {
    cameras: 'Камери',
    settings: 'Налаштування',
    sidebar_title: 'Заголовок на бічній панелі',
    sidebar_title_helper: 'Порожньо: «{d}», мовою сервера',
    cameras_heading: 'Показані камери',
    save: 'Зберегти',
    revert: 'Скасувати зміни',
    saved: 'Збережено',
    save_error: 'Не вдалося зберегти: {e}',
    unsaved: 'Незбережені зміни',
    empty_admin: 'Камер поки немає: виберіть їх на вкладці «Налаштування».',
    empty_user: 'Камер поки немає: адміністратор вибирає їх на вкладці «Налаштування».',
    choose: 'Вибрати камери',
    load_error: 'Не вдалося завантажити камери: {e}',
    retry: 'Повторити',
    import: 'Скопіювати з дашборда',
    import_none: 'На дашбордах не знайдено картки камер.',
    imported: 'Камери скопійовано з «{d}»: збережіть, щоб залишити їх.',
    integration: 'Відкрити інтеграцію',
    found_heading: 'Знайдені камери',
    found_hint: 'Камери Home Assistant, яких ще немає на панелі.',
    found_none: 'Усі знайдені камери вже на панелі.',
    add: 'Додати',
    add_all: 'Додати всі',
    added: 'Додано камер: {n}. Збережіть, щоб залишити їх.',
    card_error: 'Не вдалося завантажити картку камер: очистьте кеш браузера та перезавантажте сторінку.',
    panel_heading: 'Панель',
    display_heading: 'Відображення',
    up_to_date: 'Актуально',
    edit: 'Змінити {c}',
    remove: 'Прибрати з панелі',
    move: 'Перемістити {c} (перетягуванням або стрілками)',
    tag_motion: 'Рух',
    tag_privacy: 'Приватність',
    none_shown: 'Камер поки немає: додайте знайдені вище.',
    toolbar: 'Верхня панель',
    toolbar_never: 'Показана',
    toolbar_users: 'Прихована для неадміністраторів',
    toolbar_everyone: 'Прихована для всіх',
    toolbar_helper: 'Прихована: рядок заголовка зникає, вкладки лишаються; кнопка меню лишається там, де її показує Home Assistant.',
    live_one: "{n} камера в ефірі",
    live_many: "Камери в ефірі: {n}",
    hidden_one: "{n} прихована",
    hidden_many: "Приховані: {n}",
    st_live: "В ефірі",
    st_motion: "Виявлено рух",
    st_privacy: "Приватно",
    st_offline: "Недоступна",
    hd: "HD",
    sd: "SD",
    quality_hint: "Перемикання між HD і SD",
  },
  hu: {
    cameras: 'Kamerák',
    settings: 'Beállítások',
    sidebar_title: 'Cím az oldalsávban',
    sidebar_title_helper: 'Üresen: „{d}”, a szerver nyelvén',
    cameras_heading: 'Megjelenített kamerák',
    save: 'Mentés',
    revert: 'Módosítások elvetése',
    saved: 'Mentve',
    save_error: 'A mentés nem sikerült: {e}',
    unsaved: 'Nem mentett módosítások',
    empty_admin: 'Még nincs kamera: válaszd ki őket a Beállítások lapon.',
    empty_user: 'Még nincs kamera: egy rendszergazda választja ki őket a Beállítások lapon.',
    choose: 'Kamerák kiválasztása',
    load_error: 'A kamerák nem tölthetők be: {e}',
    retry: 'Újra',
    import: 'Másolás irányítópultról',
    import_none: 'Nem található kamerakártya az irányítópultokon.',
    imported: 'Kamerák átmásolva innen: „{d}”; mentsd, hogy megmaradjanak.',
    integration: 'Integráció megnyitása',
    found_heading: 'Talált kamerák',
    found_hint: 'Home Assistant-kamerák, amelyeket a panel még nem mutat.',
    found_none: 'Minden talált kamera már a panelen van.',
    add: 'Hozzáadás',
    add_all: 'Összes hozzáadása',
    added: 'Hozzáadott kamerák: {n}. Mentsd, hogy megmaradjanak.',
    card_error: 'A kamerakártya nem tölthető be: ürítsd a böngésző gyorsítótárát, és töltsd újra az oldalt.',
    panel_heading: 'Panel',
    display_heading: 'Megjelenítés',
    up_to_date: 'Naprakész',
    edit: '{c} szerkesztése',
    remove: 'Eltávolítás a panelről',
    move: '{c} áthelyezése (húzással vagy nyílbillentyűkkel)',
    tag_motion: 'Mozgás',
    tag_privacy: 'Adatvédelem',
    none_shown: 'Még nincs megjelenített kamera: add hozzá a fent találtakat.',
    toolbar: 'Felső sáv',
    toolbar_never: 'Látható',
    toolbar_users: 'Rejtett a nem rendszergazdák számára',
    toolbar_everyone: 'Rejtett mindenki számára',
    toolbar_helper: 'Rejtett: a címsor eltűnik, a lapok maradnak; a menügomb ott marad, ahol a Home Assistant mutatja.',
    live_one: "{n} kamera élőben",
    live_many: "{n} kamera élőben",
    hidden_one: "{n} rejtett",
    hidden_many: "{n} rejtett",
    st_live: "Élő",
    st_motion: "Mozgás észlelve",
    st_privacy: "Privát",
    st_offline: "Nem elérhető",
    hd: "HD",
    sd: "SD",
    quality_hint: "Váltás HD és SD között",
  },
  sk: {
    cameras: 'Kamery',
    settings: 'Nastavenia',
    sidebar_title: 'Názov v bočnom paneli',
    sidebar_title_helper: 'Prázdne: „{d}“, v jazyku servera',
    cameras_heading: 'Zobrazené kamery',
    save: 'Uložiť',
    revert: 'Zrušiť zmeny',
    saved: 'Uložené',
    save_error: 'Uloženie zlyhalo: {e}',
    unsaved: 'Neuložené zmeny',
    empty_admin: 'Zatiaľ žiadne kamery: vyberte ich na karte Nastavenia.',
    empty_user: 'Zatiaľ žiadne kamery: správca ich vyberá na karte Nastavenia.',
    choose: 'Vybrať kamery',
    load_error: 'Kamery sa nepodarilo načítať: {e}',
    retry: 'Skúsiť znova',
    import: 'Kopírovať z dashboardu',
    import_none: 'Na dashboardoch sa nenašla karta kamier.',
    imported: 'Kamery skopírované z „{d}“: uložte ich, aby zostali.',
    integration: 'Otvoriť integráciu',
    found_heading: 'Nájdené kamery',
    found_hint: 'Kamery z Home Assistant, ktoré panel ešte nezobrazuje.',
    found_none: 'Všetky nájdené kamery sú už v paneli.',
    add: 'Pridať',
    add_all: 'Pridať všetky',
    added: 'Pridané kamery: {n}. Uložte ich, aby zostali.',
    card_error: 'Kartu kamier sa nepodarilo načítať: vymažte vyrovnávaciu pamäť prehliadača a obnovte stránku.',
    panel_heading: 'Panel',
    display_heading: 'Zobrazenie',
    up_to_date: 'Aktuálne',
    edit: 'Upraviť {c}',
    remove: 'Odstrániť z panela',
    move: 'Presunúť {c} (potiahnutím alebo šípkami)',
    tag_motion: 'Pohyb',
    tag_privacy: 'Súkromie',
    none_shown: 'Zatiaľ sa nezobrazuje žiadna kamera: pridajte nájdené vyššie.',
    toolbar: 'Horná lišta',
    toolbar_never: 'Zobrazená',
    toolbar_users: 'Skrytá pre nesprávcov',
    toolbar_everyone: 'Skrytá pre všetkých',
    toolbar_helper: 'Skrytá: lišta s názvom zmizne, karty zostanú; tlačidlo ponuky zostane tam, kde ho Home Assistant zobrazuje.',
    live_one: "{n} kamera naživo",
    live_many: "Kamery naživo: {n}",
    hidden_one: "{n} skrytá",
    hidden_many: "Skryté: {n}",
    st_live: "Naživo",
    st_motion: "Zistený pohyb",
    st_privacy: "Súkromné",
    st_offline: "Nedostupná",
    hd: "HD",
    sd: "SD",
    quality_hint: "Prepnúť medzi HD a SD",
  },
  cs: {
    cameras: 'Kamery',
    settings: 'Nastavení',
    sidebar_title: 'Název v postranním panelu',
    sidebar_title_helper: 'Prázdné: „{d}“, v jazyce serveru',
    cameras_heading: 'Zobrazené kamery',
    save: 'Uložit',
    revert: 'Zrušit změny',
    saved: 'Uloženo',
    save_error: 'Uložení se nezdařilo: {e}',
    unsaved: 'Neuložené změny',
    empty_admin: 'Zatím žádné kamery: vyberte je na kartě Nastavení.',
    empty_user: 'Zatím žádné kamery: správce je vybírá na kartě Nastavení.',
    choose: 'Vybrat kamery',
    load_error: 'Kamery se nepodařilo načíst: {e}',
    retry: 'Zkusit znovu',
    import: 'Kopírovat z dashboardu',
    import_none: 'Na dashboardech nebyla nalezena karta kamer.',
    imported: 'Kamery zkopírovány z „{d}“: uložte je, aby zůstaly.',
    integration: 'Otevřít integraci',
    found_heading: 'Nalezené kamery',
    found_hint: 'Kamery z Home Assistant, které panel zatím nezobrazuje.',
    found_none: 'Všechny nalezené kamery už jsou v panelu.',
    add: 'Přidat',
    add_all: 'Přidat vše',
    added: 'Přidané kamery: {n}. Uložte je, aby zůstaly.',
    card_error: 'Kartu kamer se nepodařilo načíst: vymažte mezipaměť prohlížeče a obnovte stránku.',
    panel_heading: 'Panel',
    display_heading: 'Zobrazení',
    up_to_date: 'Aktuální',
    edit: 'Upravit {c}',
    remove: 'Odebrat z panelu',
    move: 'Přesunout {c} (přetažením nebo šipkami)',
    tag_motion: 'Pohyb',
    tag_privacy: 'Soukromí',
    none_shown: 'Zatím se nezobrazuje žádná kamera: přidejte nalezené výše.',
    toolbar: 'Horní lišta',
    toolbar_never: 'Zobrazená',
    toolbar_users: 'Skrytá pro nesprávce',
    toolbar_everyone: 'Skrytá pro všechny',
    toolbar_helper: 'Skrytá: lišta s názvem zmizí, karty zůstanou; tlačítko nabídky zůstane tam, kde ho Home Assistant zobrazuje.',
    live_one: "{n} kamera živě",
    live_many: "Kamery živě: {n}",
    hidden_one: "{n} skrytá",
    hidden_many: "Skryté: {n}",
    st_live: "Živě",
    st_motion: "Zjištěn pohyb",
    st_privacy: "Soukromé",
    st_offline: "Nedostupná",
    hd: "HD",
    sd: "SD",
    quality_hint: "Přepnout mezi HD a SD",
  },
  sl: {
    cameras: 'Kamere',
    settings: 'Nastavitve',
    sidebar_title: 'Naslov v stranski vrstici',
    sidebar_title_helper: 'Prazno: »{d}«, v jeziku strežnika',
    cameras_heading: 'Prikazane kamere',
    save: 'Shrani',
    revert: 'Prekliči spremembe',
    saved: 'Shranjeno',
    save_error: 'Shranjevanje ni uspelo: {e}',
    unsaved: 'Neshranjene spremembe',
    empty_admin: 'Še ni kamer: izberite jih na zavihku Nastavitve.',
    empty_user: 'Še ni kamer: skrbnik jih izbere na zavihku Nastavitve.',
    choose: 'Izberi kamere',
    load_error: 'Kamer ni bilo mogoče naložiti: {e}',
    retry: 'Poskusi znova',
    import: 'Kopiraj z nadzorne plošče',
    import_none: 'Na nadzornih ploščah ni kartice kamer.',
    imported: 'Kamere kopirane iz »{d}«: shranite, da jih obdržite.',
    integration: 'Odpri integracijo',
    found_heading: 'Najdene kamere',
    found_hint: 'Kamere iz Home Assistanta, ki jih plošča še ne prikazuje.',
    found_none: 'Vse najdene kamere so že na plošči.',
    add: 'Dodaj',
    add_all: 'Dodaj vse',
    added: 'Dodane kamere: {n}. Shranite, da jih obdržite.',
    card_error: 'Kartice kamer ni bilo mogoče naložiti: počistite predpomnilnik brskalnika in znova naložite stran.',
    panel_heading: 'Plošča',
    display_heading: 'Prikaz',
    up_to_date: 'Posodobljeno',
    edit: 'Uredi {c}',
    remove: 'Odstrani s plošče',
    move: 'Premakni {c} (povleci ali puščice)',
    tag_motion: 'Gibanje',
    tag_privacy: 'Zasebnost',
    none_shown: 'Še ni prikazanih kamer: dodajte zgoraj najdene.',
    toolbar: 'Zgornja vrstica',
    toolbar_never: 'Prikazana',
    toolbar_users: 'Skrita za neskrbnike',
    toolbar_everyone: 'Skrita za vse',
    toolbar_helper: 'Skrita: naslovna vrstica izgine, zavihki ostanejo; gumb menija ostane tam, kjer ga prikaže Home Assistant.',
    live_one: "{n} kamera v živo",
    live_many: "Kamere v živo: {n}",
    hidden_one: "{n} skrita",
    hidden_many: "Skrite: {n}",
    st_live: "V živo",
    st_motion: "Zaznano gibanje",
    st_privacy: "Zasebno",
    st_offline: "Ni na voljo",
    hd: "HD",
    sd: "SD",
    quality_hint: "Preklopi med HD in SD",
  },
  lv: {
    cameras: 'Kameras',
    settings: 'Iestatījumi',
    sidebar_title: 'Virsraksts sānjoslā',
    sidebar_title_helper: 'Tukšs: “{d}”, servera valodā',
    cameras_heading: 'Rādītās kameras',
    save: 'Saglabāt',
    revert: 'Atcelt izmaiņas',
    saved: 'Saglabāts',
    save_error: 'Neizdevās saglabāt: {e}',
    unsaved: 'Nesaglabātas izmaiņas',
    empty_admin: 'Vēl nav kameru: izvēlieties tās cilnē Iestatījumi.',
    empty_user: 'Vēl nav kameru: administrators tās izvēlas cilnē Iestatījumi.',
    choose: 'Izvēlēties kameras',
    load_error: 'Neizdevās ielādēt kameras: {e}',
    retry: 'Mēģināt vēlreiz',
    import: 'Kopēt no informācijas paneļa',
    import_none: 'Informācijas paneļos nav atrasta kameru kartīte.',
    imported: 'Kameras nokopētas no “{d}”: saglabājiet, lai tās paturētu.',
    integration: 'Atvērt integrāciju',
    found_heading: 'Atrastās kameras',
    found_hint: 'Home Assistant kameras, kuras panelis vēl nerāda.',
    found_none: 'Visas atrastās kameras jau ir panelī.',
    add: 'Pievienot',
    add_all: 'Pievienot visas',
    added: 'Pievienotas kameras: {n}. Saglabājiet, lai tās paturētu.',
    card_error: 'Neizdevās ielādēt kameru kartīti: notīriet pārlūka kešatmiņu un pārlādējiet lapu.',
    panel_heading: 'Panelis',
    display_heading: 'Attēlojums',
    up_to_date: 'Aktuāls',
    edit: 'Rediģēt {c}',
    remove: 'Noņemt no paneļa',
    move: 'Pārvietot {c} (velkot vai ar bultiņām)',
    tag_motion: 'Kustība',
    tag_privacy: 'Privātums',
    none_shown: 'Vēl nav rādītu kameru: pievienojiet iepriekš atrastās.',
    toolbar: 'Augšējā josla',
    toolbar_never: 'Rādīta',
    toolbar_users: 'Paslēpta ne-administratoriem',
    toolbar_everyone: 'Paslēpta visiem',
    toolbar_helper: 'Paslēpta: virsraksta josla pazūd, cilnes paliek; izvēlnes poga paliek tur, kur to rāda Home Assistant.',
    live_one: "{n} kamera tiešraidē",
    live_many: "Kameras tiešraidē: {n}",
    hidden_one: "{n} paslēpta",
    hidden_many: "Paslēptas: {n}",
    st_live: "Tiešraide",
    st_motion: "Konstatēta kustība",
    st_privacy: "Privāti",
    st_offline: "Nav pieejama",
    hd: "HD",
    sd: "SD",
    quality_hint: "Pārslēgt starp HD un SD",
  },
  el: {
    cameras: 'Κάμερες',
    settings: 'Ρυθμίσεις',
    sidebar_title: 'Τίτλος στην πλαϊνή μπάρα',
    sidebar_title_helper: 'Κενό: «{d}», στη γλώσσα του διακομιστή',
    cameras_heading: 'Κάμερες που εμφανίζονται',
    save: 'Αποθήκευση',
    revert: 'Ακύρωση αλλαγών',
    saved: 'Αποθηκεύτηκε',
    save_error: 'Αδυναμία αποθήκευσης: {e}',
    unsaved: 'Μη αποθηκευμένες αλλαγές',
    empty_admin: 'Δεν υπάρχουν ακόμη κάμερες: επιλέξτε τις στην καρτέλα Ρυθμίσεις.',
    empty_user: 'Δεν υπάρχουν ακόμη κάμερες: ένας διαχειριστής τις επιλέγει στην καρτέλα Ρυθμίσεις.',
    choose: 'Επιλογή καμερών',
    load_error: 'Αδυναμία φόρτωσης των καμερών: {e}',
    retry: 'Επανάληψη',
    import: 'Αντιγραφή από πίνακα ελέγχου',
    import_none: 'Δεν βρέθηκε κάρτα καμερών στους πίνακες ελέγχου.',
    imported: 'Οι κάμερες αντιγράφηκαν από «{d}»: αποθηκεύστε για να τις κρατήσετε.',
    integration: 'Άνοιγμα ενσωμάτωσης',
    found_heading: 'Κάμερες που βρέθηκαν',
    found_hint: 'Κάμερες του Home Assistant που ο πίνακας δεν εμφανίζει ακόμη.',
    found_none: 'Όλες οι κάμερες που βρέθηκαν είναι ήδη στον πίνακα.',
    add: 'Προσθήκη',
    add_all: 'Προσθήκη όλων',
    added: 'Κάμερες που προστέθηκαν: {n}. Αποθηκεύστε για να τις κρατήσετε.',
    card_error: 'Η κάρτα καμερών δεν φορτώθηκε: καθαρίστε την κρυφή μνήμη του προγράμματος περιήγησης και φορτώστε ξανά τη σελίδα.',
    panel_heading: 'Πίνακας',
    display_heading: 'Εμφάνιση',
    up_to_date: 'Ενημερωμένο',
    edit: 'Επεξεργασία {c}',
    remove: 'Αφαίρεση από τον πίνακα',
    move: 'Μετακίνηση {c} (σύρσιμο ή βέλη)',
    tag_motion: 'Κίνηση',
    tag_privacy: 'Ιδιωτικότητα',
    none_shown: 'Δεν εμφανίζεται ακόμη καμία κάμερα: προσθέστε όσες βρέθηκαν παραπάνω.',
    toolbar: 'Επάνω γραμμή',
    toolbar_never: 'Εμφανίζεται',
    toolbar_users: 'Κρυφή για μη διαχειριστές',
    toolbar_everyone: 'Κρυφή για όλους',
    toolbar_helper: 'Κρυφή: η γραμμή τίτλου φεύγει, οι καρτέλες μένουν· το κουμπί μενού μένει όπου το δείχνει το Home Assistant.',
    live_one: "{n} κάμερα ζωντανά",
    live_many: "{n} κάμερες ζωντανά",
    hidden_one: "{n} κρυφή",
    hidden_many: "{n} κρυφές",
    st_live: "Ζωντανά",
    st_motion: "Εντοπίστηκε κίνηση",
    st_privacy: "Ιδιωτικό",
    st_offline: "Μη διαθέσιμη",
    hd: "HD",
    sd: "SD",
    quality_hint: "Εναλλαγή μεταξύ HD και SD",
  },
};

var HCP_TABS = ['cameras', 'settings'];
var HCP_CARD = 'home-camera-card';
var HCP_HIDE = ['never', 'users', 'everyone'];

// Text into HTML: the five special characters as numeric references
function hcpEsc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function hcpT(lang, key, vars) {
  var text = (HomeCameraPanelI18n[lang] || HomeCameraPanelI18n.en)[key] || HomeCameraPanelI18n.en[key] || key;
  for (var name of Object.keys(vars || {})) text = text.replace(`{${name}}`, vars[name]);
  return text;
}

// The first camera card (the full one, not the mini) of a dashboard configuration: views, sections, stacks.
function hcpFindCard(node) {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (var item of node) {
      var found = hcpFindCard(item);
      if (found) return found;
    }
    return null;
  }
  if (node.type === `custom:${HCP_CARD}` && Array.isArray(node.cameras)) return node;
  for (var key of ['views', 'sections', 'cards', 'card']) {
    var inner = hcpFindCard(node[key]);
    if (inner) return inner;
  }
  return null;
}

// A found camera as a camera entry of the card, with the controls found on its device (privacy switch, pan and tilt
// buttons, motion sensors), so they show in the editor; the same entry as the server's discovery.card_entry
function hcpFoundEntry(cam) {
  var entry = { camera: cam.camera, name: cam.name };
  if (cam.privacy) entry.privacy = cam.privacy;
  if (cam.ptz) entry.ptz = cam.ptz;
  if (cam.motion?.length) entry.motion = cam.motion.length === 1 ? cam.motion[0] : cam.motion;
  return entry;
}

// The card configuration the panel stores: no type, no layout options of the dashboard it came from.
function hcpCardConfig(card) {
  var out = Object.assign({}, card);
  // `layout` too: the panel always shows the wall, whatever the stored configuration says
  for (var key of ['type', 'layout', 'grid_options', 'view_layout', 'layout_options', 'visibility']) delete out[key];
  return out;
}

class HomeCameraPanel extends HTMLElement {
  static VERSION = HOME_CAMERA_PANEL_VERSION;

  static STYLE = `
    :host { display:block; min-height:100%; background:var(--primary-background-color); color:var(--primary-text-color); }
    /* The top bar: the card's illustrated header across the page (a camera on a wall, a parquet strip, day and
       night), as on the ENT ONE panel — title and status, how many cameras are live, HD / SD and the integration */
    .toolbar { position:relative; height:90px; overflow:hidden; background:#f2efe9; color:#1f2328; --hcp-muted:#5d6670; }
    .toolbar.night { background:#2a2b33; color:#fff; --hcp-muted:rgba(255,255,255,.78); }
    .toolbar .hc-scene { right:var(--tb-acts, 150px); width:min(200px, 34%); }
    .toolbar .bhead { right:calc(min(200px, 34%) + var(--tb-acts, 150px)); padding:0 8px; }
    .toolbar .bhead ha-menu-button { flex:none; color:inherit; }
    .toolbar .bname { font-size:20px; }
    .toolbar .bicon.motion, .toolbar .stpill.motion { --c:var(--warning-color, #ffa600); }
    .toolbar .bicon.live, .toolbar .stpill.live { --c:#e5484d; }
    .toolbar .bicon.privacy, .toolbar .stpill.privacy { --c:#7a8594; }
    .toolbar .bicon.offline, .toolbar .stpill.offline { --c:var(--error-color, #db4437); }
    .tacts { position:absolute; z-index:2; top:calc((100% - 10px) / 2 - 17px); right:12px; display:flex; align-items:center; gap:6px; }
    .tacts a, .tacts .qseg { color:#33506b; background:rgba(255,255,255,.55); box-shadow:inset 0 0 0 1px rgba(255,255,255,.7); }
    .tacts a { width:34px; height:34px; border-radius:50%; display:grid; place-items:center; --mdc-icon-size:20px; }
    .tacts a:hover { background:rgba(255,255,255,.82); }
    .night .tacts a, .night .tacts .qseg { color:#fff; background:rgba(255,255,255,.12); box-shadow:inset 0 0 0 1px rgba(255,255,255,.2); }
    .qseg { display:inline-flex; padding:3px; border-radius:17px; gap:2px; }
    .qseg button { border:0; background:none; cursor:pointer; font:inherit; font-size:12px; font-weight:600; padding:4px 10px; border-radius:14px; color:inherit; opacity:.7; }
    .qseg button[aria-checked="true"] { background:#fff; color:var(--primary-color, #03a9f4); opacity:1; }
    .night .qseg button[aria-checked="true"] { background:rgba(255,255,255,.2); color:#fff; }
    .qseg button:focus-visible, .tacts a:focus-visible { outline:2px solid var(--primary-color); outline-offset:1px; }
    @media (max-width:600px) { .toolbar .hc-scene { display:none; } .toolbar .bhead { right:var(--tb-acts, 150px); } .toolbar .bicon { display:none; } }
    /* Tabs under the top bar, on the page background: text, the active one underlined, sticky at the top */
    .tabs { display:flex; align-items:center; gap:4px; padding:0 12px; overflow-x:auto; background:var(--primary-background-color);
            border-bottom:1px solid var(--divider-color, rgba(0,0,0,.12)); position:sticky; top:0; z-index:2; }
    .tabs[hidden] { display:none; }
    .tab { background:none; border:none; border-bottom:2px solid transparent; color:var(--secondary-text-color); padding:12px 12px 10px; font:inherit;
           font-size:14px; font-weight:500; cursor:pointer; white-space:nowrap; }
    .tab:hover { color:var(--primary-text-color); }
    .tab:focus-visible { outline:2px solid var(--primary-color); outline-offset:-2px; }
    .tab.active { color:var(--primary-text-color); border-bottom-color:var(--warning-color, #ffa600); }
    .tab .cnt { display:inline-block; min-width:18px; padding:1px 5px; margin-left:5px; border-radius:9px; font-size:11px; text-align:center; box-sizing:border-box;
                color:color-mix(in srgb, var(--warning-color, #ffa600) 60%, var(--primary-text-color)); background:color-mix(in srgb, var(--warning-color, #ffa600) 18%, transparent); }
    /* Settings: its header card without a picture (the picture is the top bar now) */
    .thead { display:flex; align-items:center; gap:10px; padding:12px 16px; min-width:0; }
    .thead .bicon { background:color-mix(in srgb, var(--c) 14%, transparent); box-shadow:none; }
    .thead .bsub { color:var(--secondary-text-color); }
    .thead .stpill { background:color-mix(in srgb, var(--c) 15%, transparent); color:color-mix(in srgb, var(--c) 55%, var(--primary-text-color)); }
    main { margin:0 auto; padding:16px; box-sizing:border-box; }
    /* The cameras as a video wall, edge to edge under its header card; the settings at reading width */
    main.settings { max-width:940px; }
    section[hidden] { display:none; }
    .column { display:flex; flex-direction:column; gap:12px; min-width:0; }
    .note { padding:16px; color:var(--secondary-text-color); display:flex; flex-direction:column; gap:10px; align-items:flex-start; }
    .note.error { color:var(--primary-text-color); border-left:3px solid var(--error-color, #db4437); }
    .block { padding:14px 16px; display:flex; flex-direction:column; gap:12px; }
    .block h2 { margin:0; font-size:16px; font-weight:500; }
    .ctl { display:flex; flex-direction:column; gap:4px; min-width:0; }
    .ctl > span { font-size:12px; color:var(--secondary-text-color); }
    .ctl small { font-size:11px; color:var(--secondary-text-color); opacity:.85; }
    .box { display:flex; align-items:center; border-radius:8px; border:1px solid var(--divider-color, rgba(127,127,127,.3));
           background:var(--secondary-background-color, rgba(127,127,127,.08)); }
    .box:focus-within { border-color:var(--primary-color); }
    .box input { flex:1; min-width:0; border:0; outline:0; background:none; color:inherit; font:inherit; font-size:14px; padding:8px 10px; }
    .bar { display:flex; align-items:center; flex-wrap:wrap; gap:8px; }
    .bar .grow { flex:1; }
    .msg { font-size:12px; color:var(--secondary-text-color); overflow-wrap:anywhere; }
    .msg.good { color:color-mix(in srgb, var(--success-color, #43a047) 50%, var(--primary-text-color)); }
    .msg.bad { color:color-mix(in srgb, var(--error-color, #db4437) 50%, var(--primary-text-color)); }
    /* Tinted buttons, never filled (the convention of the ha-* cards) */
    .act { display:inline-flex; align-items:center; gap:6px; border:0; cursor:pointer; font:inherit; font-size:13px; font-weight:500;
           padding:7px 12px; border-radius:8px; --mdc-icon-size:16px; color:var(--primary-color); text-decoration:none;
           background:color-mix(in srgb, var(--primary-color) 14%, transparent); }
    .act:hover:not([disabled]) { background:color-mix(in srgb, var(--primary-color) 22%, transparent); }
    .act.quiet { color:var(--primary-text-color); background:var(--secondary-background-color, rgba(127,127,127,.12)); }
    .act[disabled] { opacity:.5; cursor:default; }
    ha-card { display:block; }
    ha-card[hidden] { display:none; }
    .bar.head h2 { margin:0; }
    /* The charter of the ha-* cards and panels: a header card with its illustrated banner, then lists under an
       uppercase title whose rows are filled and rounded, each with a round tinted icon; pill buttons */
    :host { --hcp-sec: color-mix(in srgb, var(--primary-text-color) 6%, var(--card-background-color, #fff)); }
    .act { min-height:36px; box-sizing:border-box; padding:0 14px; border-radius:18px; }
    .act.quiet { background:var(--hcp-sec); }
    ha-card.list { padding:12px 16px 14px; display:flex; flex-direction:column; gap:6px; }
    ha-card.list[hidden] { display:none; }
    .lhead { display:flex; align-items:center; gap:8px; min-height:36px; padding-bottom:2px; }
    .lname { flex:1; min-width:0; margin:0; font-size:12px; font-weight:500; letter-spacing:.05em; text-transform:uppercase; color:var(--secondary-text-color); }
    .list .msg { margin:0 0 4px; }
    .list .ctl + .ctl { margin-top:12px; }
    .rows { display:flex; flex-direction:column; gap:6px; }
    .item { display:flex; align-items:center; gap:10px; min-height:56px; padding:8px 10px 8px 8px; border-radius:12px; background:var(--hcp-sec);
            border:1px solid transparent; box-sizing:border-box; min-width:0; }
    .item.found { background:color-mix(in srgb, var(--primary-color) 9%, var(--hcp-sec)); border-color:color-mix(in srgb, var(--primary-color) 22%, transparent); }
    .item.open { border-color:color-mix(in srgb, var(--primary-color) 45%, transparent); }
    .item.over { border-color:var(--primary-color); border-style:dashed; }
    .item .act.quiet, .item .round { background:var(--card-background-color, #fff); }
    .ic { width:40px; height:40px; flex:none; border-radius:50%; display:grid; place-items:center; --mdc-icon-size:22px;
          color:var(--primary-text-color); background:color-mix(in srgb, var(--secondary-text-color) 14%, transparent); }
    .ic.info { color:color-mix(in srgb, var(--primary-color) 70%, var(--primary-text-color)); background:color-mix(in srgb, var(--primary-color) 16%, transparent); }
    .ic.good { color:color-mix(in srgb, var(--success-color, #43a047) 70%, var(--primary-text-color)); background:color-mix(in srgb, var(--success-color, #43a047) 16%, transparent); }
    .ic.bad { color:color-mix(in srgb, var(--error-color, #db4437) 70%, var(--primary-text-color)); background:color-mix(in srgb, var(--error-color, #db4437) 16%, transparent); }
    .who { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
    .who .n { font-size:14px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .who .s { font-size:12px; color:var(--secondary-text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .tags { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:6px; flex:none; max-width:45%; }
    .tag { padding:2px 9px; border-radius:11px; font-size:11.5px; font-weight:500; line-height:16px; white-space:nowrap;
           background:var(--card-background-color, #fff); color:var(--primary-text-color); }
    .tag.good { background:color-mix(in srgb, var(--success-color, #43a047) 16%, transparent); color:color-mix(in srgb, var(--success-color, #43a047) 55%, var(--primary-text-color)); }
    .round { width:40px; height:40px; flex:none; border-radius:50%; border:0; display:grid; place-items:center; cursor:pointer; color:var(--primary-text-color); --mdc-icon-size:18px; }
    .round:hover { color:var(--primary-color); }
    .round[aria-expanded="true"] { color:var(--primary-color); background:color-mix(in srgb, var(--primary-color) 14%, transparent); }
    .drag { width:24px; height:40px; flex:none; border:0; padding:0; background:none; display:grid; place-items:center; cursor:grab; color:var(--secondary-text-color); --mdc-icon-size:20px; border-radius:6px; }
    .drag:focus-visible, .round:focus-visible, .act:focus-visible { outline:2px solid var(--primary-color); outline-offset:1px; }
    .editbox { margin:0 0 4px 34px; padding:4px 4px 0; display:flex; flex-direction:column; gap:8px; }
    .act.danger { color:var(--error-color, #db4437); }
    .savebar { padding:10px 12px; position:sticky; bottom:12px; z-index:1; }
    .savebar .msg { text-align:right; }
    /* The header card: the 90 px illustrated banner of the ha-* cards, edge to edge */
    ha-card.top { overflow:hidden; }
    .banner { position:relative; height:90px; overflow:hidden; background:#f2efe9; color:#1f2328; --hcp-muted:#5d6670; container-type:inline-size; }
    .banner.night { background:#2a2b33; color:#fff; --hcp-muted:rgba(255,255,255,.78); }
    .bscene { position:absolute; right:16px; bottom:10px; height:80px; width:min(200px, 40%); }
    .bground { position:absolute; left:0; right:0; bottom:0; height:10px; background:repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow:inset 0 2px 0 #a97c50; }
    .night .bground { background:repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow:inset 0 2px 0 #5a4634; }
    .bhead { position:absolute; left:0; top:0; bottom:10px; right:calc(min(200px, 40%) + 20px); padding:0 12px; display:flex; align-items:center; gap:10px; min-width:0; }
    .bicon { width:40px; height:40px; flex:none; border-radius:50%; display:grid; place-items:center; --mdc-icon-size:24px; --c:#7a8594; color:var(--c);
             background:rgba(255,255,255,.62); box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--c) 22%, transparent); }
    .bicon.warn { --c:var(--warning-color, #ffa600); }
    .night .bicon { background:rgba(255,255,255,.12); color:color-mix(in srgb, var(--c) 72%, #fff); box-shadow:inset 0 0 0 1px rgba(255,255,255,.14); }
    .btitles { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
    .brow { display:flex; align-items:center; flex-wrap:wrap; gap:4px 8px; min-width:0; }
    .bname { font-size:16px; font-weight:500; line-height:1.25; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .bsub { font-size:13px; line-height:18px; color:var(--hcp-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .stpill { display:inline-flex; align-items:center; gap:4px; padding:1px 8px; border-radius:12px; font-size:11px; font-weight:500; line-height:16px; white-space:nowrap;
              --c:var(--success-color, #43a047); background:color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color:color-mix(in srgb, var(--c) 45%, #0d2a45); }
    .stpill.warn { --c:var(--warning-color, #ffa600); }
    .stpill .sdot { width:7px; height:7px; border-radius:50%; background:var(--c); }
    .night .stpill { background:color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color:color-mix(in srgb, var(--c) 35%, #fff); }
    .bscene .rot { transform-box:fill-box; transform-origin:center; animation:hcp-rot 9s linear infinite; }
    .bscene .rot.rev { animation-duration:6s; animation-direction:reverse; }
    .bscene .leaf { transform-box:fill-box; transform-origin:50% 100%; animation:hcp-sway 4s ease-in-out infinite; }
    @keyframes hcp-rot { to { transform:rotate(360deg); } }
    @keyframes hcp-sway { 0%, 100% { transform:rotate(-4deg); } 50% { transform:rotate(4deg); } }
    @media (prefers-reduced-motion: reduce) { .bscene * { animation:none !important; } }
    @container (max-width:360px) { .bscene { display:none; } .bhead { right:0; } }
    @media (max-width:600px) { .tags { display:none; } .editbox { margin-left:0; } }
    /* Top bar hidden (Settings › Panel): the title bar goes, the tabs stay at the top. The menu button stays where
       Home Assistant shows it (narrow screen or sidebar hidden): at the start of the tabs, or, with no tabs (a user who
       is not an administrator), as a round button at the bottom left */
    .tabmenu { display:none; color:var(--primary-text-color); align-self:center; margin-right:4px; }
    :host([bare][menu]) .tabs .tabmenu { display:flex; }
    :host([bare]) .tabs { top:0; }
    :host([bare][tabs]) .toolbar, :host([bare]:not([menu])) .toolbar { display:none; }
    :host([bare]) .toolbar { display:flex; align-items:center; overflow:visible; position:fixed; top:auto; left:16px; bottom:16px; z-index:3; width:44px; height:44px; padding:0; gap:0;
                             justify-content:center; border-radius:50%; border-bottom:none; color:var(--primary-text-color);
                             background:color-mix(in srgb, var(--card-background-color, #fff) 82%, transparent);
                             -webkit-backdrop-filter:blur(8px); backdrop-filter:blur(8px); box-shadow:0 2px 8px rgba(0,0,0,.25); }
    :host([bare]) .toolbar > :not(.bhead), :host([bare]) .toolbar .bhead > :not(ha-menu-button) { display:none; }
    :host([bare]) .toolbar .bhead { position:static; padding:0; display:contents; }
    :host([bare]) .toolbar .grow { display:none; }
    .seg { display:inline-flex; flex-wrap:wrap; gap:4px; padding:3px; border-radius:20px; background:var(--hcp-sec); align-self:flex-start; }
    .seg button { border:0; background:none; cursor:pointer; font:inherit; font-size:13px; font-weight:500; padding:7px 14px; border-radius:17px; color:var(--secondary-text-color); }
    .seg button[aria-checked="true"] { background:var(--card-background-color, #fff); color:var(--primary-color); box-shadow:0 1px 2px rgba(0,0,0,.14); }
    .seg button:focus-visible { outline:2px solid var(--primary-color); outline-offset:1px; }
  `;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._tab = 'cameras';
    this._data = null; // the settings pushed by home_camera/subscribe
    this._draft = null; // the Settings tab's edits: { card, title }
    this._shownCard = null; // the card configuration the Cameras tab shows, as JSON
    this._status = null; // { tone, text } under the Settings tab's buttons
  }

  // /cameras/settings opens Settings (administrators); the base address is Cameras
  set route(route) {
    // Kept: before hass (who the user is), Settings cannot be told apart from a tab the user may not open
    this._wanted = (route?.path || '').split('/').filter(Boolean)[0];
    var tab = this._tabs().includes(this._wanted) ? this._wanted : 'cameras';
    if (tab !== this._tab) this._showTab(tab);
  }

  set narrow(narrow) {
    this._narrow = narrow;
    if (this._menu) this._menu.narrow = narrow;
    if (this._tabMenu) this._tabMenu.narrow = narrow;
    this._syncBare();
  }

  set panel(panel) {
    this._panel = panel;
    this._syncBare();
  }

  set hass(hass) {
    var first = !this._hass;
    var langBefore = this._lang();
    var adminBefore = this._admin();
    this._hass = hass;
    if (this._menu) this._menu.hass = hass;
    if (this._tabMenu) this._tabMenu.hass = hass;
    if (this._card) this._card.hass = hass;
    if (this._editor) this._editor.hass = hass;
    if (this._camEditor) this._camEditor.hass = hass;
    if (first) this._start();
    else if (this._lang() !== langBefore || this._admin() !== adminBefore) this._render();
    else if (this._tab === 'settings') this._renderBanner();
    // A motion, a privacy switch, a camera going offline: the top bar and the tab's count follow
    if (!first && this._data) {
      var camSig = JSON.stringify((this._camStates() || []).map((c) => [c.hidden, c.up, c.motion]));
      if (camSig !== this._camSig) {
        this._camSig = camSig;
        this._renderCameras();
      } else this._renderTop();
    }
    this._syncBare();
  }

  // Home Assistant may set panel, narrow, route and hass before the element is defined: they land as plain
  // properties hiding the setters, so they are passed through them (hass last: it starts the panel).
  _upgradeProperties() {
    ['panel', 'narrow', 'route', 'hass'].forEach((name) => {
      if (!Object.hasOwn(this, name)) return;
      var value = this[name];
      delete this[name];
      this[name] = value;
    });
  }

  connectedCallback() {
    this._upgradeProperties();
    // HD / SD switched on a card of this page: the top bar's switch follows
    this._onQuality = this._onQuality || (() => {
      this._topSig = null;
      this._renderTop();
    });
    window.addEventListener('home-camera-card-quality', this._onQuality);
    if (this._hass && !this._unsub) this._subscribe();
  }

  disconnectedCallback() {
    window.removeEventListener('home-camera-card-quality', this._onQuality);
    if (this._unsub) {
      this._unsub.then((off) => off()).catch(() => {});
      this._unsub = null;
    }
  }

  _admin() {
    return !!this._hass?.user?.is_admin;
  }

  // Settings is the administrators' only
  _tabs() {
    return this._admin() ? HCP_TABS : ['cameras'];
  }

  // Full code when it has a table (sr-Latn), else its base (de-AT → de), else English
  _lang() {
    var code = this._hass?.language || 'en';
    if (HomeCameraPanelI18n[code]) return code;
    var base = code.split('-')[0];
    return HomeCameraPanelI18n[base] ? base : 'en';
  }

  _t(key, vars) {
    return hcpT(this._lang(), key, vars);
  }

  _start() {
    this._render();
    this._loadCard();
    this._subscribe();
  }

  // The card is a dashboard resource, loaded on dashboards only: the panel loads it itself (same file, cached).
  async _loadCard() {
    if (customElements.get(HCP_CARD)) return;
    var url = this._panel?.config?.card_url || '/home_camera/home-camera-card.js';
    try {
      await import(url);
      await customElements.whenDefined(HCP_CARD);
    } catch (err) {
      console.error('Home Camera panel: could not load the card', err);
      this._cardError = true;
    }
    this._renderCameras();
  }

  // The settings at once, then on every change (saved here or on another device). The connection resubscribes
  // by itself after a reconnection.
  _subscribe() {
    if (this._unsub || !this._hass?.connection) return;
    this._unsub = this._hass.connection
      .subscribeMessage((data) => this._onSettings(data), { type: 'home_camera/subscribe' })
      .catch((err) => {
        this._unsub = null;
        this._loadError = String(err?.message || err).replace(/\.\s*$/, '');
        this._renderCameras();
        return () => {};
      });
  }

  _onSettings(data) {
    var dirty = this._dirty();
    this._data = data;
    this._loadError = null;
    // Unsaved edits are kept; otherwise the form follows what was saved (here or elsewhere)
    if (!dirty) this._draft = null;
    this._syncBare();
    this._renderCameras();
    this._renderSettings();
  }

  _dirty() {
    if (!this._draft || !this._data) return false;
    return (
      JSON.stringify(this._draft.card) !== JSON.stringify(this._data.card) ||
      this._draft.title !== this._data.title ||
      this._draft.hide !== (this._data.hide_toolbar || 'never')
    );
  }

  _goTab(tab, focus) {
    if (!this._tabs().includes(tab)) return;
    this._wanted = tab;
    this._showTab(tab, focus);
    var base = (this._panel?.url_path || 'cameras').replace(/^\//, '');
    try {
      history.replaceState(history.state, '', `/${base}${tab === 'cameras' ? '' : `/${tab}`}`);
    } catch (_err) {
      // no history (a test, a sandboxed page): the tab still shows
    }
  }

  _showTab(tab, focus) {
    this._tab = tab;
    var root = this.shadowRoot;
    root.querySelectorAll?.('.tab').forEach((button) => {
      var selected = button.dataset.tab === tab;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus({ preventScroll: true });
    });
    HCP_TABS.forEach((name) => {
      var section = root.getElementById?.(`tab-${name}`);
      if (section) section.hidden = name !== tab;
    });
    var main = root.querySelector?.('main');
    if (main) main.className = tab;
    this._syncBare();
    if (tab === 'settings') this._renderSettings();
  }

  // The title bar hidden as saved (never, for the users who are not administrators, or for everyone); the tabs stay.
  // Until the settings arrive, the panel's registration says it: the bar is never shown then hidden while loading.
  _bare() {
    var hide = this._data?.hide_toolbar ?? this._panel?.config?.hide_toolbar;
    return hide === 'everyone' || (hide === 'users' && !this._admin());
  }

  _syncBare() {
    this.toggleAttribute?.('bare', this._bare());
    this.toggleAttribute?.('tabs', this._tabs().length > 1);
    // Where Home Assistant shows the menu button: narrow screen, or the sidebar set to always hidden
    this.toggleAttribute?.('menu', !!this._narrow || this._hass?.dockedSidebar === 'always_hidden');
  }

  _render() {
    var root = this.shadowRoot;
    var esc = hcpEsc;
    var tabs = this._tabs();
    if (tabs.includes(this._wanted)) this._tab = this._wanted;
    if (!tabs.includes(this._tab)) this._tab = 'cameras';
    var title = this._data?.sidebar_title || this._panel?.title || this._t('cameras');
    root.innerHTML = `
      <style>${HomeCameraPanel.STYLE}</style>
      <div class="toolbar${this._hass?.themes?.darkMode ? ' night' : ''}">
        <div class="tbscene"></div>
        <div class="bhead"><ha-menu-button></ha-menu-button><span class="bicon"><ha-icon icon="mdi:cctv"></ha-icon></span>
          <div class="btitles"><div class="brow"><span class="grow bname">${esc(title)}</span><span class="tpill"></span></div><div class="bsub"></div></div></div>
        <div class="tacts"><span class="tq"></span>${this._admin() ? `<a href="/config/integrations/integration/home_camera" title="${esc(this._t('integration'))}" aria-label="${esc(this._t('integration'))}"><ha-icon icon="mdi:cog"></ha-icon></a>` : ''}</div>
      </div>
      <div class="tabs" role="tablist"${tabs.length < 2 ? ' hidden' : ''}><ha-menu-button class="tabmenu"></ha-menu-button>${tabs.map((tab) => this._tabHtml(tab)).join('')}</div>
      <main class="${this._tab}">
        <section class="column" id="tab-cameras" role="tabpanel" aria-labelledby="tabbtn-cameras"></section>
        <section class="column" id="tab-settings" role="tabpanel" aria-labelledby="tabbtn-settings"></section>
      </main>`;
    this._menu = root.querySelector('.toolbar ha-menu-button');
    this._topSig = null;
    this._menu.hass = this._hass;
    this._menu.narrow = this._narrow;
    this._tabMenu = root.querySelector('.tabmenu');
    this._tabMenu.hass = this._hass;
    this._tabMenu.narrow = this._narrow;
    root.querySelectorAll('.tab').forEach((button) => {
      button.addEventListener('click', () => this._goTab(button.dataset.tab));
      // Left and right arrows move between the tabs, as in a native tab bar
      button.addEventListener('keydown', (ev) => {
        var step = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        ev.preventDefault();
        var i = tabs.indexOf(this._tab);
        this._goTab(tabs[(i + step + tabs.length) % tabs.length], true);
      });
    });
    // A new shadow DOM: the card and the editor are drawn again
    this._card = null;
    this._shownCard = null;
    this._editor = null;
    this._camEditor = null;
    this._showTab(this._tab);
    this._renderCameras();
  }

  // The cameras of the panel as the card sees them (window.HomeCameraKit, from the card file), each with what it
  // is doing now: hidden (privacy on or power off), up (its camera entity answers), motion (a motion sensor on)
  _camStates() {
    var kit = window.HomeCameraKit;
    var hass = this._hass;
    var raws = this._data?.card?.cameras || [];
    if (!kit || !hass) return null;
    var st = (id) => hass.states?.[id]?.state;
    var showMotion = this._data?.card?.show_motion !== false;
    return raws
      .map((raw, i) => ({ raw, cam: kit.camera(hass, raw, i) }))
      .filter((x) => x.cam.camera)
      .map(({ raw, cam }) => {
        var hidden = (cam.privacy && st(cam.privacy) === 'on') || (cam.power && st(cam.power) === 'off');
        var up = !['unavailable', 'unknown', undefined].includes(st(cam.camera));
        var motion = showMotion && !hidden && up && cam.motion.some((id) => st(id) === 'on');
        return { raw, cam, hidden: !!hidden, up, motion };
      });
  }

  // The top bar: the card's picture in the panel's state, the title with its status pill, how many cameras are
  // live and hidden, and the HD / SD switch of the wall (drawn again only when one of them changed)
  _renderTop() {
    var bar = this.shadowRoot?.querySelector?.('.toolbar');
    if (!bar) return;
    var esc = hcpEsc;
    var kit = window.HomeCameraKit;
    var cams = this._camStates() || [];
    var visible = cams.filter((c) => !c.hidden);
    var state = !cams.length ? 'offline' : !visible.length ? 'privacy' : !visible.some((c) => c.up) ? 'offline' : visible.some((c) => c.motion) ? 'motion' : 'live';
    var night = kit ? kit.isNight(this._hass, this._data?.card || {}) : !!this._hass?.themes?.darkMode;
    var hd = this._card?._hd ? this._card._hd() : true;
    var hidden = cams.length - visible.length;
    var sub = cams.length ? this._t(visible.length === 1 ? 'live_one' : 'live_many', { n: visible.length }) : '';
    if (hidden) sub += ` · ${this._t(hidden === 1 ? 'hidden_one' : 'hidden_many', { n: hidden })}`;
    var sig = JSON.stringify([this._lang(), !!kit, state, night, hd, sub, !!this._card]);
    if (sig === this._topSig) return;
    this._topSig = sig;
    bar.classList.toggle('night', night);
    var scene = bar.querySelector('.tbscene');
    // The picture's colours and animations come with the card (its banner styles, added once)
    if (kit && !this.shadowRoot.getElementById('hc-kit')) {
      var css = document.createElement('style');
      css.id = 'hc-kit';
      css.textContent = kit.bannerStyle;
      this.shadowRoot.appendChild(css);
    }
    if (kit && scene) scene.innerHTML = kit.sceneSvg(state, 'panel');
    var icon = bar.querySelector('.bicon');
    if (icon) icon.className = `bicon ${state}`;
    var pill = bar.querySelector('.tpill');
    var label = this._t(`st_${state}`);
    if (pill) pill.innerHTML = cams.length ? `<span class="stpill ${state}" role="status"><span class="sdot"></span>${esc(label)}</span>` : '';
    var line = bar.querySelector('.bsub');
    if (line) line.textContent = sub;
    var q = bar.querySelector('.tq');
    if (q) {
      var opt = (key, on) => `<button role="radio" aria-checked="${on}" data-quality="${key}">${esc(this._t(key))}</button>`;
      q.innerHTML = this._card && visible.length ? `<span class="qseg" role="radiogroup" title="${esc(this._t('quality_hint'))}">${opt('hd', hd)}${opt('sd', !hd)}</span>` : '';
      for (var b of q.querySelectorAll('[data-quality]')) {
        b.addEventListener('click', (ev) => {
          if ((ev.currentTarget.dataset.quality === 'hd') === this._card?._hd?.()) return;
          this._card?._toggleQuality?.();
          this._topSig = null;
          setTimeout(() => this._renderTop(), 50);
        });
      }
    }
  }

  // The motion count of the Cameras tab, drawn again only when it changed
  _renderTabCount(cams) {
    var tab = this.shadowRoot?.getElementById?.('tabbtn-cameras');
    var n = (cams || []).filter((c) => c.motion).length;
    if (tab) {
      var label = `${hcpEsc(this._t('cameras'))}${n ? `<span class="cnt">${n}</span>` : ''}`;
      if (tab.innerHTML !== label) tab.innerHTML = label;
    }
  }

  _tabHtml(tab) {
    var selected = tab === this._tab;
    return `<button class="tab${selected ? ' active' : ''}" role="tab" id="tabbtn-${tab}" data-tab="${tab}" aria-selected="${selected}" aria-controls="tab-${tab}" tabindex="${selected ? 0 : -1}">${hcpEsc(this._t(tab))}</button>`;
  }

  // ── Cameras tab ────────────────────────────────────────────────────────────
  _renderCameras() {
    var tabSection = this.shadowRoot.getElementById?.('tab-cameras');
    if (!tabSection) return;
    var toolbarTitle = this.shadowRoot.querySelector('.toolbar .grow');
    if (toolbarTitle && this._data?.sidebar_title) toolbarTitle.textContent = this._data.sidebar_title;
    // The wall is the card, on its own under the tabs
    if (!tabSection.querySelector('#wall')) tabSection.innerHTML = '<div id="wall"></div>';
    var section = tabSection.querySelector('#wall');
    var cams = this._camStates();
    this._renderTop();
    var note = (html, error) => {
      this._card = null;
      this._shownCard = null;
      this._renderTabCount(null);
      section.innerHTML = `<ha-card><div class="note${error ? ' error' : ''}">${html}</div></ha-card>`;
    };
    if (this._loadError && !this._data) {
      note(`<span>${hcpEsc(this._t('load_error', { e: this._loadError }))}</span><button class="act quiet" data-retry>${hcpEsc(this._t('retry'))}</button>`, true);
      section.querySelector('[data-retry]').addEventListener('click', () => {
        this._loadError = null;
        this._subscribe();
      });
      return;
    }
    if (this._cardError) {
      note(`<span>${hcpEsc(this._t('card_error'))}</span>`, true);
      return;
    }
    if (!this._data || !customElements.get(HCP_CARD)) {
      if (!section.querySelector('ha-circular-progress')) {
        section.innerHTML = '<div class="note"><ha-circular-progress indeterminate size="small"></ha-circular-progress></div>';
      }
      this._card = null;
      this._shownCard = null;
      return;
    }
    var card = this._data.card || {};
    if (!(card.cameras || []).length) {
      if (this._admin()) {
        note(`<span>${hcpEsc(this._t('empty_admin'))}</span><button class="act" data-choose><ha-icon icon="mdi:cctv"></ha-icon>${hcpEsc(this._t('choose'))}</button>`);
        section.querySelector('[data-choose]').addEventListener('click', () => this._goTab('settings'));
      } else note(`<span>${hcpEsc(this._t('empty_user'))}</span>`);
      return;
    }
    this._renderTabCount(cams);
    // The card's own header is left out (its title, status and HD / SD are in the top bar), its privacy badges stay
    card = Object.assign({}, card, { show_header: false });
    // Drawn again only when the configuration changed: a new card would reconnect every stream
    var json = JSON.stringify(card);
    if (this._card && json === this._shownCard) return;
    if (!this._card) {
      section.replaceChildren();
      this._card = document.createElement(HCP_CARD);
    }
    try {
      // Always the video wall here: no card around the cameras (the configuration keeps its own layout for dashboards)
      this._card.setConfig(Object.assign({ type: `custom:${HCP_CARD}` }, card, { layout: 'wall' }));
    } catch (err) {
      note(`<span>${hcpEsc(String(err?.message || err))}</span>`, true);
      return;
    }
    this._shownCard = json;
    this._card.hass = this._hass;
    if (!this._card.isConnected) section.appendChild(this._card);
    this._topSig = null;
    this._renderTop();
  }

  // ── Settings tab (administrators) ──────────────────────────────────────────
  _formValues() {
    if (!this._draft && this._data) {
      this._draft = {
        card: JSON.parse(JSON.stringify(this._data.card || {})),
        title: this._data.title || '',
        hide: this._data.hide_toolbar || 'never',
      };
    }
    return this._draft;
  }

  async _renderSettings() {
    var section = this.shadowRoot.getElementById?.('tab-settings');
    if (!section || !this._admin() || this._tab !== 'settings' || !this._data) return;
    var values = this._formValues();
    var esc = hcpEsc;
    if (!section.querySelector('.settings-form')) {
      section.innerHTML = `
        <ha-card class="top settings-form"><div class="banner" data-banner></div></ha-card>
        <ha-card class="list">
          <div class="lhead"><h2 class="lname">${esc(this._t('panel_heading'))}</h2></div>
          <label class="ctl"><span>${esc(this._t('sidebar_title'))}</span>
            <div class="box"><input data-title maxlength="50" autocomplete="off"></div>
            <small data-title-helper></small></label>
          <div class="ctl"><span id="hcp-hide">${esc(this._t('toolbar'))}</span>
            <div class="seg" role="radiogroup" aria-labelledby="hcp-hide" data-hide-group>${HCP_HIDE.map(
              (h) => `<button role="radio" data-hide="${h}" aria-checked="false">${esc(this._t(`toolbar_${h}`))}</button>`,
            ).join('')}</div>
            <small>${esc(this._t('toolbar_helper'))}</small></div>
        </ha-card>
        <ha-card class="list" data-found hidden></ha-card>
        <ha-card class="list">
          <div class="lhead"><h2 class="lname" data-shown-head></h2>
            <button class="act quiet" data-import><ha-icon icon="mdi:content-copy"></ha-icon>${esc(this._t('import'))}</button></div>
          <div class="rows" data-shown></div>
        </ha-card>
        <ha-card class="list">
          <div class="lhead"><h2 class="lname">${esc(this._t('display_heading'))}</h2></div>
          <div data-editor></div>
        </ha-card>
        <ha-card class="bar savebar">
          <button class="act" data-save><ha-icon icon="mdi:content-save"></ha-icon>${esc(this._t('save'))}</button>
          <button class="act quiet" data-revert>${esc(this._t('revert'))}</button>
          <span class="grow msg" data-msg aria-live="polite"></span>
        </ha-card>`;
      var field = section.querySelector('[data-title]');
      field.addEventListener('input', () => {
        this._formValues().title = field.value;
        this._status = null;
        this._renderStatus();
      });
      section.querySelector('[data-hide-group]').addEventListener('click', (ev) => {
        var button = ev.composedPath().find((n) => n.dataset?.hide);
        if (!button) return;
        this._formValues().hide = button.dataset.hide;
        this._status = null;
        this._renderHide();
        this._renderStatus();
      });
      section.querySelector('[data-save]').addEventListener('click', () => this._save());
      section.querySelector('[data-revert]').addEventListener('click', () => {
        this._draft = null;
        this._status = null;
        this._editing = null;
        this._renderSettings();
      });
      section.querySelector('[data-import]').addEventListener('click', () => this._import());
      section.querySelector('[data-found]').addEventListener('click', (ev) => {
        var button = ev.composedPath().find((n) => n.dataset?.add !== undefined);
        if (button) this._addFound(button.dataset.add ? [button.dataset.add] : null);
      });
      this._listenShown(section.querySelector('[data-shown]'));
      this._discover();
    }
    var input = section.querySelector('[data-title]');
    if (input.value !== values.title && this.shadowRoot.activeElement !== input) input.value = values.title;
    section.querySelector('[data-title-helper]').textContent = this._t('sidebar_title_helper', { d: this._defaultTitle() });
    this._renderHide();
    this._renderFound();
    this._renderShown();
    await this._renderEditor(section.querySelector('[data-editor]'), values.card);
    this._renderStatus();
  }

  _renderHide() {
    var hide = this._formValues()?.hide || 'never';
    for (var b of this.shadowRoot.getElementById?.('tab-settings')?.querySelectorAll('[data-hide]') || []) {
      var on = b.dataset.hide === hide;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    }
  }

  // The header card of Settings: its banner (a camera on a desk, cogs turning, a plant), the title, a pill saying
  // whether the changes are saved, and how many cameras are shown and found. Drawn again only when it changed.
  _renderBanner() {
    var host = this.shadowRoot.getElementById?.('tab-settings')?.querySelector('[data-banner]');
    if (!host || !this._data) return;
    var esc = hcpEsc;
    var dirty = this._dirty();
    var night = !!this._hass?.themes?.darkMode;
    var shown = (this._formValues()?.card?.cameras || []).length;
    var sub = `${this._t('cameras_heading')}: ${shown}`;
    if (this._found) sub += ` · ${this._t('found_heading')}: ${this._newFound().length}`;
    var sig = JSON.stringify([this._lang(), dirty, night, sub]);
    if (sig === this._bannerSig && host.firstChild) return;
    this._bannerSig = sig;
    // The picture is the panel's top bar: this header keeps the icon, the title, its pill and the counts
    host.className = 'thead';
    host.innerHTML = `
        <span class="bicon${dirty ? ' warn' : ''}"><ha-icon icon="mdi:cog"></ha-icon></span>
        <div class="btitles">
          <div class="brow"><span class="bname">${esc(this._t('settings'))}</span>
            <span class="stpill${dirty ? ' warn' : ''}" role="status"><span class="sdot"></span>${esc(this._t(dirty ? 'unsaved' : 'up_to_date'))}</span></div>
          <div class="bsub">${esc(sub)}</div>
        </div>`;
  }

  // ── The cameras shown, listed by the panel: drag (or arrow keys on the handle) to reorder, the pencil opens the
  // camera's fields under its row (the card editor's own, one camera at a time) ──
  _cams() {
    return this._formValues()?.card?.cameras || [];
  }

  _camEntry(cam) {
    return typeof cam === 'string' ? { camera: cam } : Object.assign({}, cam);
  }

  _rowInner(cam, i) {
    var esc = hcpEsc;
    var c = this._camEntry(cam);
    var st = this._hass?.states?.[c.camera];
    var name = c.name || st?.attributes?.friendly_name || c.camera || '';
    var off = !st || st.state === 'unavailable';
    var tags = [];
    if (c.motion) tags.push(`<span class="tag good">${esc(this._t('tag_motion'))}</span>`);
    if (c.ptz) tags.push('<span class="tag">PTZ</span>');
    if (c.privacy || c.power) tags.push(`<span class="tag">${esc(this._t('tag_privacy'))}</span>`);
    var open = this._editing === i;
    return `<button class="drag" draggable="true" data-move="${i}" aria-label="${esc(this._t('move', { c: name }))}" title="${esc(this._t('move', { c: name }))}"><ha-icon icon="mdi:drag-vertical"></ha-icon></button>
      <span class="ic ${off ? 'bad' : 'good'}"><ha-icon icon="${off ? 'mdi:cctv-off' : 'mdi:cctv'}"></ha-icon></span>
      <div class="who"><div class="n">${esc(name)}</div><div class="s">${esc([c.camera, c.sd ? `SD ${c.sd}` : ''].filter(Boolean).join(' · '))}</div></div>
      ${tags.length ? `<span class="tags">${tags.join('')}</span>` : ''}
      <button class="round" data-edit="${i}" aria-expanded="${open}" aria-label="${esc(this._t('edit', { c: name }))}" title="${esc(this._t('edit', { c: name }))}"><ha-icon icon="mdi:pencil"></ha-icon></button>`;
  }

  _renderShown() {
    var section = this.shadowRoot.getElementById?.('tab-settings');
    var host = section?.querySelector('[data-shown]');
    if (!host) return;
    var cams = this._cams();
    section.querySelector('[data-shown-head]').textContent = `${this._t('cameras_heading')} · ${cams.length}`;
    if (this._editing != null && !cams[this._editing]) this._editing = null;
    if (!cams.length) {
      host.innerHTML = `<div class="msg">${hcpEsc(this._t('none_shown'))}</div>`;
      return;
    }
    host.innerHTML = cams
      .map(
        (cam, i) =>
          `<div class="item${this._editing === i ? ' open' : ''}" data-row="${i}">${this._rowInner(cam, i)}</div>` +
          (this._editing === i
            ? `<div class="editbox"><div data-cam-editor></div><div class="bar"><button class="act quiet danger" data-remove="${i}"><ha-icon icon="mdi:delete-outline"></ha-icon>${hcpEsc(this._t('remove'))}</button></div></div>`
            : ''),
      )
      .join('');
    if (this._editing != null) this._renderCamEditor(host.querySelector('[data-cam-editor]'), this._editing);
  }

  async _renderCamEditor(host, i) {
    await this._ensureForm();
    if (!host?.isConnected || !customElements.get('home-camera-card-editor')) return;
    if (!this._camEditor) {
      this._camEditor = document.createElement('home-camera-card-editor');
      this._camEditor.section = 'camera';
      this._camEditor.addEventListener('config-changed', (ev) => {
        ev.stopPropagation();
        var at = this._editing;
        if (at == null) return;
        var v = ev.detail.config || {};
        this._camEditorConfig = JSON.stringify(v);
        var values = this._formValues();
        var list = this._cams().slice();
        list[at] = Object.keys(v).length === 1 && v.camera ? v.camera : v;
        values.card = Object.assign({}, values.card, { cameras: list });
        this._status = null;
        // Only the row's text: the fields under it keep the typing and the focus
        var row = this.shadowRoot.getElementById('tab-settings')?.querySelector(`[data-row="${at}"]`);
        if (row) row.innerHTML = this._rowInner(list[at], at);
        this._renderStatus();
      });
      this._camEditorConfig = null;
    }
    this._camEditor.hass = this._hass;
    host.replaceChildren(this._camEditor);
    var cam = this._camEntry(this._cams()[i]);
    var json = JSON.stringify([i, cam]);
    if (json !== this._camEditorGiven || this._camEditorConfig !== JSON.stringify(cam)) {
      this._camEditorGiven = json;
      this._camEditorConfig = JSON.stringify(cam);
      this._camEditor.setConfig(cam);
    }
  }

  _moveCam(from, to) {
    var list = this._cams().slice();
    if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return false;
    list.splice(to, 0, list.splice(from, 1)[0]);
    var values = this._formValues();
    values.card = Object.assign({}, values.card, { cameras: list });
    this._editing = null;
    this._status = null;
    this._renderShown();
    this._renderStatus();
    return true;
  }

  _listenShown(host) {
    host.addEventListener('click', (ev) => {
      var path = ev.composedPath();
      var edit = path.find((n) => n.dataset?.edit !== undefined);
      if (edit) {
        var i = Number(edit.dataset.edit);
        this._editing = this._editing === i ? null : i;
        this._renderShown();
        this.shadowRoot.getElementById('tab-settings')?.querySelector(`[data-edit="${i}"]`)?.focus({ preventScroll: true });
        return;
      }
      var remove = path.find((n) => n.dataset?.remove !== undefined);
      if (remove) {
        var values = this._formValues();
        var list = this._cams().slice();
        list.splice(Number(remove.dataset.remove), 1);
        values.card = Object.assign({}, values.card, { cameras: list });
        this._editing = null;
        this._status = null;
        this._renderSettings();
      }
    });
    // Arrow keys on a handle move its camera up or down, the focus following it
    host.addEventListener('keydown', (ev) => {
      var handle = ev.composedPath().find((n) => n.dataset?.move !== undefined);
      var step = ev.key === 'ArrowUp' ? -1 : ev.key === 'ArrowDown' ? 1 : 0;
      if (!handle || !step) return;
      ev.preventDefault();
      var from = Number(handle.dataset.move);
      if (this._moveCam(from, from + step)) host.querySelector(`[data-move="${from + step}"]`)?.focus({ preventScroll: true });
    });
    var rowOf = (ev) => ev.composedPath().find((n) => n.dataset?.row !== undefined);
    host.addEventListener('dragstart', (ev) => {
      var handle = ev.composedPath().find((n) => n.dataset?.move !== undefined);
      if (!handle) return;
      this._dragFrom = Number(handle.dataset.move);
      ev.dataTransfer?.setData('text/plain', String(this._dragFrom));
      if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'move';
    });
    host.addEventListener('dragover', (ev) => {
      var row = rowOf(ev);
      if (!row || this._dragFrom == null) return;
      ev.preventDefault();
      for (var n of host.querySelectorAll('.over')) if (n !== row) n.classList.remove('over');
      row.classList.add('over');
    });
    host.addEventListener('drop', (ev) => {
      var row = rowOf(ev);
      if (!row || this._dragFrom == null) return;
      ev.preventDefault();
      var from = this._dragFrom;
      this._dragFrom = null;
      this._moveCam(from, Number(row.dataset.row));
    });
    host.addEventListener('dragend', () => {
      this._dragFrom = null;
      for (var n of host.querySelectorAll('.over')) n.classList.remove('over');
    });
  }

  // ── Camera discovery (home_camera/discover): the cameras of Home Assistant the panel does not show yet ──
  async _discover() {
    try {
      this._found = (await this._hass.callWS({ type: 'home_camera/discover' })).cameras || [];
    } catch (err) {
      console.warn('Home Camera panel: camera discovery failed', err);
      this._found = [];
    }
    this._renderFound();
  }

  // Found cameras missing from the edited list: neither the camera nor its SD stream is in it
  _newFound() {
    var listed = new Set();
    for (var cam of this._formValues()?.card?.cameras || []) {
      var id = typeof cam === 'string' ? cam : cam?.camera;
      if (id) listed.add(id);
      if (cam?.sd) listed.add(cam.sd);
    }
    return (this._found || []).filter((cam) => !listed.has(cam.camera) && !(cam.sd && listed.has(cam.sd)));
  }

  _renderFound() {
    var host = this.shadowRoot.getElementById?.('tab-settings')?.querySelector('[data-found]');
    if (!host || !this._found) return;
    var esc = hcpEsc;
    var found = this._newFound();
    host.hidden = false;
    var rows = found
      .map(
        (cam) => `<div class="item found">
          <span class="ic info"><ha-icon icon="mdi:cctv"></ha-icon></span>
          <div class="who"><div class="n">${esc(cam.name)}</div><div class="s">${esc([cam.area, cam.camera, cam.sd ? 'HD + SD' : ''].filter(Boolean).join(' · '))}</div></div>
          <button class="act quiet" data-add="${esc(cam.camera)}"><ha-icon icon="mdi:plus"></ha-icon>${esc(this._t('add'))}</button>
        </div>`,
      )
      .join('');
    host.innerHTML = `<div class="lhead"><h2 class="lname">${esc(this._t('found_heading'))}${found.length ? ` · ${found.length}` : ''}</h2>${
      found.length > 1 ? `<button class="act" data-add=""><ha-icon icon="mdi:plus-box-multiple"></ha-icon>${esc(this._t('add_all'))}</button>` : ''
    }</div>
      <div class="msg">${esc(this._t(found.length ? 'found_hint' : 'found_none'))}</div>
      <div class="rows">${rows}</div>`;
    this._renderBanner();
  }

  // Adds the given found cameras (all the new ones when `ids` is null) to the edited list, named after their device,
  // with their controls
  _addFound(ids) {
    var add = this._newFound().filter((cam) => !ids || ids.includes(cam.camera));
    if (!add.length) return;
    var values = this._formValues();
    values.card = Object.assign({}, values.card, {
      cameras: (values.card.cameras || []).concat(add.map(hcpFoundEntry)),
    });
    this._status = { tone: 'good', text: this._t('added', { n: add.length }) };
    this._renderSettings();
  }

  // The title the server gives the panel when none is set ("Cameras" in the server's language)
  _defaultTitle() {
    return this._data?.default_title || this._t('cameras');
  }

  // The card's own visual editor (cameras, HD / SD, columns…), built on Home Assistant's ha-form
  async _renderEditor(host, card) {
    if (!host) return;
    await this._ensureForm();
    if (!customElements.get('home-camera-card-editor')) return;
    if (!this._editor?.isConnected) {
      this._editor = document.createElement('home-camera-card-editor');
      // Always the wall here: no layout choice; the cameras are the panel's own list
      this._editor.panel = true;
      this._editor.section = 'options';
      this._editor.addEventListener('config-changed', (ev) => {
        ev.stopPropagation();
        var values = this._formValues();
        var options = hcpCardConfig(ev.detail.config);
        delete options.cameras;
        var cams = values.card?.cameras;
        values.card = Object.assign(cams ? { cameras: cams } : {}, options);
        this._editorConfig = JSON.stringify(options);
        this._status = null;
        this._renderStatus();
      });
      host.replaceChildren(this._editor);
      this._editorConfig = null;
    }
    this._editor.hass = this._hass;
    // Given again only when it changed from outside (saved elsewhere, reverted, copied): never under the typing
    var options = hcpCardConfig(card || {});
    delete options.cameras;
    var json = JSON.stringify(options);
    if (json !== this._editorConfig) {
      this._editorConfig = json;
      // As the wall: the editor offers no column count by default and keeps any count chosen
      this._editor.setConfig(Object.assign({ type: `custom:${HCP_CARD}` }, options, { layout: 'wall' }));
    }
  }

  // ha-form is loaded with the dashboard editor, not on a custom panel: a card editor of Home Assistant brings it
  async _ensureForm() {
    if (customElements.get('ha-form')) return;
    try {
      var helpers = await window.loadCardHelpers?.();
      var card = await helpers?.createCardElement({ type: 'entities', entities: [] });
      await card?.constructor?.getConfigElement?.();
      await Promise.race([customElements.whenDefined('ha-form'), new Promise((r) => setTimeout(r, 3000))]);
    } catch (err) {
      console.warn('Home Camera panel: could not load the form elements', err);
    }
  }

  _renderStatus() {
    var section = this.shadowRoot.getElementById?.('tab-settings');
    var msg = section?.querySelector('[data-msg]');
    if (!msg) return;
    var dirty = this._dirty();
    var status = this._status || (dirty ? { tone: '', text: this._t('unsaved') } : null);
    msg.className = `grow msg${status?.tone ? ` ${status.tone}` : ''}`;
    this._renderBanner();
    msg.textContent = status?.text || '';
    section.querySelector('[data-save]').disabled = !dirty || this._saving;
    section.querySelector('[data-revert]').disabled = !dirty || this._saving;
  }

  async _save() {
    var values = this._formValues();
    this._saving = true;
    this._renderStatus();
    try {
      var data = await this._hass.callWS({
        type: 'home_camera/update_settings',
        card: values.card,
        title: values.title.trim(),
        hide_toolbar: values.hide,
      });
      this._draft = null;
      this._status = { tone: 'good', text: this._t('saved') };
      this._onSettings(data);
    } catch (err) {
      this._status = { tone: 'bad', text: this._t('save_error', { e: String(err?.message || err) }) };
    }
    this._saving = false;
    this._renderStatus();
  }

  // The first camera card found on the dashboards (the default one first), as a starting point
  async _import() {
    var found = null;
    try {
      var dashboards = await this._hass.callWS({ type: 'lovelace/dashboards/list' });
      var targets = [{ url_path: null, title: 'Overview' }].concat(
        (dashboards || []).filter((d) => d.mode !== 'yaml' || d.url_path).map((d) => ({ url_path: d.url_path, title: d.title || d.url_path })),
      );
      for (var target of targets) {
        var config = await this._hass.callWS({ type: 'lovelace/config', url_path: target.url_path }).catch(() => null);
        var card = hcpFindCard(config);
        if (card) {
          found = { card: hcpCardConfig(card), title: target.title };
          break;
        }
      }
    } catch (err) {
      console.warn('Home Camera panel: could not read the dashboards', err);
    }
    if (!found) {
      this._status = { tone: 'bad', text: this._t('import_none') };
      this._renderStatus();
      return;
    }
    this._formValues().card = found.card;
    this._status = { tone: 'good', text: this._t('imported', { d: found.title }) };
    this._renderSettings();
  }
}

if (!customElements.get('home-camera-panel')) {
  customElements.define('home-camera-panel', HomeCameraPanel);
}
