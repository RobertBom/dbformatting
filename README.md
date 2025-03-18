# dbformatter 

Ein vue.js Dienstplan Formatierungs- und Analysetool.

# Beschreibung


Parsed Dienstplandaten und zeigt diese in tabellarischer Form dar.

Unterstützt Features wie Filter nach 
- Namen,
- Qualifikation (Fachkraft, Ergänzungskraft)

Findet unerwünschte Phänomäne wie:
- Kurze Wechsel (12 Stunden und weniger zwischen Dienstzeiten),
- mehr als drei Nachtschichten in Folge.
- zu wenig freie Tage im verlgeich zu einer gewöhnlichen 5-Tage Woche, berücksichtigt Feiertage automatisch und holt die Information von https://feiertage-api.de

Übersicht über Besetzung:
 - Wochenenden sind farblich hervorgehoben,
 - bietet eine farbkodierte Übersicht wieviel Mitarbeiter in einer Schicht sind, Popup mit Mitarbeiternamen
 - Ausfälle können per Checkbox eingetragen werden, die Übersicht der Besetzung aktualisiert sich automatisch.

 Kann ebenfalls tabellarische Wochenübersichten ode Übersichten über beliebige Zeiträume erstellen geteilt in Früh- Spät- und Nachtschicht.

Kann ein Gantt-Chart erstellen auf welchem, ersichtlich welcher Mitarbeiter zu welchem Zeitpunkt im Dienst ist.

Sind mehrere Monate eingertragen, können die Anzahl der Urlaubstage etc. als Graph geplottet werden.



https://github.com/user-attachments/assets/8bd50302-4329-40bf-9997-3c6369a17b4d



# Installation

Yarn oder npm muss bereits installiert sein.

``git clone https://github.com/RobertBom/dbformatting``
``cd dbformatting``

Falls vite nicht installiert ist, muss vite installiert werden:
``yarn add vite``

Das Projekt kompilieren mit:
``yarn run build``

Die Distributionsdateien befinden sich nun im Ordner dist.

Das Sample zum parsen ist zu finden unter:
https://github.com/RobertBom/dbformatting/blob/main/sample.txt
