import dayjs from 'dayjs';

export var data = {
	mitarbeiter: [],
	dienstplaene: [],
	dienstLegende: [],
};

var config = {
	id: 1,
};

function Mitarbeiter(name) {
	this.id
	this.name = name;
	this.vorname;
	this.beruf;
	this.qualifikation;
	this.fk;
	this.wochenStunden;
	this.disable = false; //bool ob der Mitarbeiter in verschiedenen Bewertungen ausgenommen werden soll
}

function Dienstplan() {
	this.eingelesen; // Date type
	this.monat; // Date type
	this.dReihe = [];
}

function dReihe() {
	this.mitarbeiter; //should contain reference to Mitarbeiter
	this.dienstEl = [];		//refs auf alle Dienste vom Typ Dienstlegende des Monats, des Mitarbeiters
	this.disable = false; //bool ob die Reihe in der Bewertung ausgenommen werden soll.
}

function DEl(dienst) {
	this.dienst = dienst; //ref auf Dienst aus Dienstlegende
	this.flags = []; //flag IDs
}

class DienstLegende {
	// "FDB" "5:30" "15:00" "8.75" "30"
	// startUm, endeUm offset of 0:00 in Unixmillis
	constructor(name, start, ende, dauer, pause) {
		this.name = name;
		this.start = start;
		let h = parseInt(start.match("^[^:]*"));
		let m = parseInt(start.match("(?<=:).*"));
		this.startUm = h * 3600000 + m * 60000;
		this.ende = ende;
		this.endeUm = this.startUm + dauer * 3600000 + pause * 60000;
		var endeUm;
		this.dauer = dauer;
		this.pause = pause;
	}
}

export function parse(str, date) {
	var raw_data = [[]];

	//Parse data
	let i = 0; // data index 
	let cur_char;
	//seek to next line
	while (str[i++] != '\n' && i < str.length) { }

	for (let im = 0; i < str.length && im < 100; im++) {
		raw_data[im] = [];
		raw_data[im][0] = [];
		let cur_parse = "";

		//parse name format: Name, Vorname
		for (; str[i] != ',' && str[i] != '\n'; i++) {
			cur_parse += str[i];
		}
		if (cur_parse.length > 20) {
			break;
		}
		i++;
		i++;
		raw_data[im][0] = new Mitarbeiter(cur_parse);
		cur_parse = "";
		for (; str[i] != '\t'; i++) {
			cur_parse += str[i];
		}
		raw_data[im][0].vorname = cur_parse;

		//springe zum ersten DienstLegende
		for (let j = 0; j < 3;) {
			if (str[i++] == '\t')
				j++;
		}

		let dienst_parse = [];
		for (let d = 0; (cur_char = str[i]) != '\n' && d < 50; d++) {
			cur_parse = "";
			while (cur_char != '\n' && cur_char != '\t') {
				cur_parse += cur_char;
				cur_char = str[++i];
			}
			dienst_parse[d] = cur_parse;
			if (cur_char == '\t') i++;
		}
		//remove last five
		for (let j = 0; j < 5; j++) dienst_parse.pop();
		raw_data[im][1] = dienst_parse;

		//parse Beruf
		//go into right line
		i++;
		cur_parse = "";
		for (let j = 0; str[i] != '\t';) {
			cur_parse += str[i++];
		}
		raw_data[im][0].beruf = cur_parse;
		i++;

		//parse Wochenstunden
		cur_parse = "";
		for (let j = 0; str[i] != '\t';) {
			cur_parse += str[i++];
		}
		raw_data[im][0].wochenStunden = parseFloat(cur_parse);

		//seek to next line
		while (str[i++] != '\n') { }

		//parse Qualifikation
		cur_parse = "";
		for (let j = 0; str[i] != '\t';) {
			cur_parse += str[i++];
		}
		raw_data[im][0].qualifikation = cur_parse;
		raw_data[im][0].fk = (cur_parse.search(/fachkraft/i) != -1) ? true : false;

		//seek to next line skip 4 lines
		for (let j = 0; j < 4; j++) {
			while (str[i++] != '\n') { }
		}
	}
	raw_data.pop();
	//console.log(raw_data);
	data.dienstplaene.push(convert_raw(raw_data, date));
	//sortiere
	data.dienstplaene = data.dienstplaene.sort((a, b) => {
		if (a.monat > b.monat)
			return -1; //sort a before b
	});
}

function convert_raw(raw_data, monat) {
	if (data.dienstLegende[0] == undefined) {
		console.log('initialisiere Dienste');
		data.dienstLegende = initDienste();
	}
	var dienstLegende = data.dienstLegende;
	var cDienstplan = new Dienstplan();
	cDienstplan.eingelesen = dayjs();
	cDienstplan.monat = monat;

	for (let im = 0; im < raw_data.length; im++) {
		let cMitarbeiter = raw_data[im][0];
		let cdRow = new dReihe();
		let t;
		if (((t = data.mitarbeiter.find(function (e) {
			if (e.name == cMitarbeiter.name &&
				e.vorname === cMitarbeiter.vorname &&
				e.beruf === cMitarbeiter.beruf &&
				e.qualifikation === cMitarbeiter.qualifikation &&
				e.fk === cMitarbeiter.fk &&
				e.wochenStunden === cMitarbeiter.wochenStunden)
				return true;

			else
				return false;
		}))) != undefined) {
			cMitarbeiter = t;
		}
		else {
			cMitarbeiter.id = config.id++;
			data.mitarbeiter.push(cMitarbeiter);
		}
		cdRow.mitarbeiter = cMitarbeiter;
		for (let i = 0; i < raw_data[im][1].length; i++) {
			let found = dienstLegende.find(e => e.name == raw_data[im][1][i]);

			if (found == undefined) {
				console.log("Dienst " + raw_data[im][1][i] + " nicht bekannt, wird hinzugefügt mit keinen Zeitangaben.");
				found = new DienstLegende(raw_data[im][1][i], "", "", 0, 0);
				dienstLegende.push(found);
			}
			let cdel = new DEl(found);
			cdRow.dienstEl.push(cdel);
		}
		cDienstplan.dReihe.push(cdRow);
	}
	//console.log(data.mitarbeiter);
	return cDienstplan;
}

function initDienste() {
	var dienstLegende = new Array();
	dienstLegende.push(new DienstLegende("", "", "", 0, 0));
	dienstLegende.push(new DienstLegende("/", "", "", 0, -1));
	dienstLegende.push(new DienstLegende("/_F", "", "", 0, -1));
	dienstLegende.push(new DienstLegende("/_S", "", "", 0, -1));
	dienstLegende.push(new DienstLegende("1. U", "", "", 0, 0));
	dienstLegende.push(new DienstLegende("EU", "", "", 0, 0));
	dienstLegende.push(new DienstLegende("BR", "", "", 0, 0));
	dienstLegende.push(new DienstLegende("AZ", "", "", 0, 0));
	dienstLegende.push(new DienstLegende("DB", "12:00", "15:00", 3, 0));
	dienstLegende.push(new DienstLegende("Bü", "8:00", "16:30", 8, 30));
	dienstLegende.push(new DienstLegende("F1", "5:30", "9:00", 3.5, 0));
	dienstLegende.push(new DienstLegende("F1b", "5:30", "9:30", 4, 0));
	dienstLegende.push(new DienstLegende("F11", "5:30", "9:30", 4, 0));
	dienstLegende.push(new DienstLegende("F2", "5:30", "11:00", 5.5, 0));
	dienstLegende.push(new DienstLegende("F3", "5:30", "14:00", 8, 30));
	dienstLegende.push(new DienstLegende("F4", "7:00", "14:30", 7, 30));
	dienstLegende.push(new DienstLegende("F5", "7:30", "15:00", 7, 30));
	dienstLegende.push(new DienstLegende("F6", "8:00", "14:00", 6, 0));
	dienstLegende.push(new DienstLegende("F7", "8:30", "15:00", 6, 30));
	dienstLegende.push(new DienstLegende("F8", "9:00", "15:00", 6, 0));
	dienstLegende.push(new DienstLegende("FA1", "7:00", "15:30", 8, 30));
	dienstLegende.push(new DienstLegende("FA2", "7:30", "16:00", 8, 30));
	dienstLegende.push(new DienstLegende("FB", "9:00", "17:00", 7.5, 30));
	dienstLegende.push(new DienstLegende("FDB", "5:30", "15:00", 8.75, 30));
	dienstLegende.push(new DienstLegende("HWW", "10:00", "16:00", 6, 0));
	dienstLegende.push(new DienstLegende("N1", "21:30", "7:00", 9.5, 0));
	dienstLegende.push(new DienstLegende("N2", "21:45", "7:30", 9.75, 0));
	dienstLegende.push(new DienstLegende("N3", "21:30", "7:30", 10, 0));
	dienstLegende.push(new DienstLegende("PBS", "9:00", "17:00", 7.5, 30));
	dienstLegende.push(new DienstLegende("RB", "22:00", "6:00", 2, 0));
	dienstLegende.push(new DienstLegende("S1", "12:00", "22:00", 9.25, 45));
	dienstLegende.push(new DienstLegende("S10", "12:00", "21:00", 8.5, 30));
	dienstLegende.push(new DienstLegende("S11", "12:00", "21:30", 8.75, 45));
	dienstLegende.push(new DienstLegende("S2", "13:30", "22:00", 8, 30));
	dienstLegende.push(new DienstLegende("S3", "13:30", "21:00", 7, 30));
	dienstLegende.push(new DienstLegende("S5", "14:30", "22:00", 7, 30));
	dienstLegende.push(new DienstLegende("S6", "14:30", "21:00", 6, 30));
	dienstLegende.push(new DienstLegende("S7", "15:00", "22:00", 6.5, 30));
	dienstLegende.push(new DienstLegende("S8", "15:30", "21:00", 5.5, 0));
	dienstLegende.push(new DienstLegende("S9", "15:30", "21:30", 6, 0));
	dienstLegende.push(new DienstLegende("Z1", "11:00", "16:00", 5, 0));
	dienstLegende.push(new DienstLegende("Z2", "11:00", "19:00", 7.5, 30));
	//dienstLegende.push(new DienstLegende("SCH", "8:00", "16:00", 0, 0));
	console.log(dienstLegende);
	return dienstLegende;
}

var feierTageCache = {};
//https://feiertage-api.de/api/?jahr=2022&nur_land=NW
//only accepts dayjs date
export async function getFeiertageMonat(date) {
	let jahr = date.year();
	let ret = [];
	if (feierTageCache[jahr] == undefined) {
		const response = await fetch("https://feiertage-api.de/api/?jahr=" + jahr + "&nur_land=NW");
		const result = await response.json();
		for (const [key, value] of Object.entries(result)) {
			let extrDate = dayjs(value.datum)
			ret.push({ name: key, date: extrDate })
		}
		feierTageCache[jahr] = ret;
	} else {
		ret = feierTageCache[jahr];
	}
	ret = ret.filter((e) => e.date.month() === date.month());
	return ret;
}

//zaehlt die freien Tage des Mitarbeiters
export function calcFreieTage(dReihe) {
	let fTage = 0;
	for (let i = 2; i < dReihe.dienstEl.length; i++) {
		if (dReihe.dienstEl[i].dienst.dauer == 0 && dReihe.dienstEl[i - 1].dienst.name[0] != 'N')
			fTage++;
	}
	return fTage;
}

//zaehlt Wochenendtage im Monat inkl Feiertagen 
//dayjs only
export async function calcFreieTageMonat(in_date) {
	let c = 0;
	//set to first day
	let date = in_date.set('date', 1);
	let lastDayOfMonth = date.daysInMonth();
	for (let i = 0; i < lastDayOfMonth; i++) {
		if (date.day() === 0 || date.day() === 6) {
			c++;
		}
		date = date.add(1, 'day');
	}
	//Feiertage async :(
	let feierTage = await getFeiertageMonat(in_date);
	for (const feierTag of feierTage) {
		if (feierTag.date.day() != 0 && feierTag.date.day() != 6) {
			c++;
		} else {
		}
	}
	return c;
}

/*	start and end indexing is depended on dienstplan Array 
		Gibt frueh[], spaet[], nacht[] und sonst[] zurueck, welche fuer die jeweiligen den tag [i] die 
		frueh[0][0].mitarbeiter Typ Mitarbeiter
		frueh[0][0] dienst Typ Dienstlegende 
*/
function dienstplanRange(dienstplan, start, end) {
	var start = start;
	var frueh = Array(end - start + 1).fill().map(() => Array());
	var spaet = Array(end - start + 1).fill().map(() => Array());
	var nacht = Array(end - start + 1).fill().map(() => Array());
	var sonst = Array(end - start + 1).fill().map(() => Array());

	console.log(frueh);
	console.log("frueh size: " + frueh.length);

	for (reihe of dienstplan.dReihe) {
		for (let i = start; i <= end; i++) {
			if (reihe.dienstEl[i].dienst.dauer > 0) {
				let tdienst = reihe.dienstEl[i].dienst;
				//console.log(reihe.mitarbeiter.vorname + "arbeitetet " + tdienst.name);
				switch (tdienst.name[0]) {
					case 'F':
						frueh[i - start].push({ mitarbeiter: reihe.mitarbeiter, dienst: tdienst });
						break;
					case 'S':
						spaet[i - start].push({ mitarbeiter: reihe.mitarbeiter, dienst: tdienst });
						break;
					case 'N':
						nacht[i - start].push({ mitarbeiter: reihe.mitarbeiter, dienst: tdienst });
						break;
					default:
						sonst[i - start].push({ mitarbeiter: reihe.mitarbeiter, dienst: tdienst });
				}
			}
		}
	}
	console.log(frueh);
	console.log(spaet);
	console.log(nacht);
	console.log(sonst);

}

// give me whole data set and dayjs date
export function getTagesBesetzungen(data, startDate, endDate) {

	if (startDate > endDate) {
		return [];
	};
	const spaetThreshold = 32400000 // 9:00 bzw. 12 Stunden in unixmillis
	const nachtThreshold = 72000000 // 20:00
	let result = [];
	let cDate = startDate;
	let offset = 0;


	while (cDate <= endDate) {
		let cDienstplan = undefined;
		while (cDienstplan === undefined && cDate <= endDate) {
			cDienstplan = data.dienstplaene.find(e => {
				return cDate.month() === e.monat.month() && cDate.year() === e.monat.year();
			});
			if (cDienstplan === undefined) {
				//einen Monat nach vorne springen koennte funktionieren.
				cDate = cDate.date(1);
				cDate = cDate.add(1, 'month');
			}
		}


		//Dienstplan mit Startdatum nicht gefunden oder nächster Monat nicht mehr da.
		if (cDienstplan === undefined) {
			sortResult();
			return result;
		}

		//calculiere Indexis
		const start = cDate.date() + 1; //index ist immer einen hoeher als der KalenderTag des Monats
		let end;
		if (cDate.month() === endDate.month()) {
			end = endDate.date() + 1;
		} else {
			end = cDate.daysInMonth() + 1;
		}
		for (let t = start; t <= end; t++) {
			result.push({
				date: cDate,
				frueh: [],
				spaet: [],
				nacht: [],
				sonst: [],

			});
			cDate = cDate.add(1, 'day');
		}
		for (const dReihe of cDienstplan.dReihe) {
			if (!dReihe.disable && !dReihe.mitarbeiter.disable) {
				let i = start;
				while (i <= end) {
					if (dReihe.dienstEl[i].dienst.dauer > 0) {
						if (dReihe.dienstEl[i].dienst.startUm <= spaetThreshold) {
							result[i - start + offset].frueh.push({
								mitarbeiter: dReihe.mitarbeiter,
								dienst: dReihe.dienstEl[i].dienst
							});
						} else if (dReihe.dienstEl[i].dienst.startUm <= nachtThreshold) {
							result[i - start + offset].spaet.push({
								mitarbeiter: dReihe.mitarbeiter,
								dienst: dReihe.dienstEl[i].dienst
							});
						} else {
							result[i - start + offset].nacht.push({
								mitarbeiter: dReihe.mitarbeiter,
								dienst: dReihe.dienstEl[i].dienst
							});
						}
					}
					i++;
				}
			}
		}
		offset += end - start + 1;
	}


	//sorting at the end primary is startUm asc secondary dauer asc
	function sortByStart(a, b) {
		if (a.dienst.startUm > b.dienst.startUm) {
			return 1;
		} else if (a.dienst.startUm < b.dienst.startUm) {
			return -1;
		} else if (a.dienst.dauer < b.dienst.dauer) {
			return 1;
		}
		return -1
	}
	function sortResult() {
		for (const el of result) {
			el.frueh = el.frueh.sort(sortByStart);
		}
		for (const el of result) {
			el.spaet = el.spaet.sort(sortByStart);
		}
		for (const el of result) {
			el.spaet = el.spaet.sort(sortByStart);
		}
	}
	sortResult();
	return result;
}



//threshold in Stunden
export function flagKurzeWechsel(dienstplan, threshold = 12, flag = 0) {
	threshold = threshold * 3600000;
	for (const idReihe of dienstplan.dReihe) {
		for (let i = 1; i < idReihe.dienstEl.length; i++) {
			if ((idReihe.dienstEl[i].dienst.startUm + 3600000 * 24 - idReihe.dienstEl[i - 1].dienst.endeUm) < threshold) {
				idReihe.dienstEl[i].flags.push(flag);
			}
		}
	}
}

export function flagDreiNaechte(dienstplan, threshold = 3, flag = 1) {
	for (const idReihe of dienstplan.dReihe) {
		let nachtcounter = 0;
		for (const dienstEl of idReihe.dienstEl) {
			if (dienstEl.dienst.name[0] === 'N') {
				nachtcounter++;
				if (nachtcounter > threshold) {
					dienstEl.flags.push(flag);
				}
			}
			else {
				nachtcounter = 0;
			}
		}
	}
}

//jojo 125% Regel
export function flag125regel(data, dienstplan, threshold = 125, flag = 2) {
	threshold = threshold / 100;
	//0 is sunday. 1 to 3 is fine, for 0, 4, 5 ,6 we need to look into the dienstplan before :(
	const workMonth = dienstplan.monat.date(1);
	//offset is how many days of the past month we need
	var offset = workMonth.day() === 0 ? -4 : 3 - workMonth.day();
	if (offset < 0) {
		const vorMonatDienstplan = getNewest(data, workMonth.subtract(1, 'M'));
		if (vorMonatDienstplan) {
			//we do only the first week then go in normal loop without this pre month shit
			let start = vorMonatDienstplan.monat.daysInMonth() + offset + 1;
			for (let i = 0; i < dienstplan.dReihe.length; i++) {
				let counter = 0;
				let preReihe = vorMonatDienstplan.dReihe.find((el) => el.mitarbeiter.id === dienstplan.dReihe[i].mitarbeiter.id);
				if (preReihe) {
					//console.log('ping');
					//-2 length because we have first two days in dienstplan 
					for (let j = start; j < preReihe.dienstEl.length - 2; j++) {
						//if (preReihe.dienstEl[j].dienst.dauer > 0) {
						//	console.log(preReihe.mitarbeiter.name + ' zaehle Dienst: ' + preReihe.dienstEl[j].dienst.name);
						//}
						counter += preReihe.dienstEl[j].dienst.dauer;
					}
					//at this point we have relevant hours in counter and can just finish the week in dienstplan object
					//console.log(preReihe.mitarbeiter.name + ' hat in der VormonatsWoche ' + counter + ' Stunden absolviert');
					// offset+6 is week sunday
					let cThreshold = dienstplan.dReihe[i].mitarbeiter.wochenStunden * threshold;
					for (let j = 0; j <= offset + 6; j++) {
						counter += dienstplan.dReihe[i].dienstEl[j].dienst.dauer;
						if (counter > cThreshold) {
							console.log('flagging');
							// CUSTOM FLAG MIGHT BE NICE
							dienstplan.dReihe[i].dienstEl[j].flags.push(flag);
						}
					}
				}
			}
		} else {
			console.log('Dienstplan des Vormonats nicht gefunden, zur Prüfung der (125)% Regel');
		}
		offset += 7; //because monday is the start of the week
	}
	//normal here + continue normal overlapping stuff done
	let daysInMonth = workMonth.daysInMonth();
	for (const dReihe of dienstplan.dReihe) {
		let counter = 0;
		let cThreshold = dReihe.mitarbeiter.wochenStunden * threshold;
		for (let i = offset; i <= daysInMonth + 1; i++) {
			if ((i - offset) % 7 === 0) {
				counter = 0
			}
			counter += dReihe.dienstEl[i].dienst.dauer;
			if (counter > cThreshold && dReihe.dienstEl[i].dienst.dauer > 0) {
				// CUSTOM FlAG MAYBE
				dReihe.dienstEl[i].flags.push(flag);
			}
		}
	}


}

export async function flagAusgleichstage(dienstplan, flag = 3) {
	//Sonntage 2 Wochen Zeitraum
	//Feiertage 8 Wochen Zeitraum
	let sonntage = [];
	let feiertage = [];
	let feiertageData = await getFeiertageMonat(dienstplan.monat);

	let lastDayOfMonth = dienstplan.monat.daysInMonth();
	let iDate = dienstplan.monat.set('date', 1);
	for (let i = 1; i <= lastDayOfMonth; i++) {
		if (iDate.day() == 0) {
			sonntage.push(i);
		}
		iDate = iDate.add(1, 'd');
	}
	//console.log('Wir haben ' + sonntage + ' Sonntage im Monat');
	for (const feiertag of feiertageData) {
		feiertage++;
		if (feiertag.date.day() == 0) { // feiertag ist an einem Sonntag.
			//WAS PASSIERT HIER!? ICH WEIß ES NICHT
		}
	}
}

//stub
function flag_wechselInWoche(dienstplan, flag = 4) {
}

//compare
export function compareDienstplan(dienstplan1, dienstplan2) {
	let comparedPlan = {
		eingelesen: dienstplan1.eingelesen,
		monat: dienstplan1.monat,
		dReihe: [],
	};
	let changeLog = [];
	let compareMonth = dayjs(dienstplan1.monat).startOf('month');
	console.log('comparison started');

	for (let i = 0; i < dienstplan1.dReihe.length; i++) {
		comparedPlan.dReihe[i] = new dReihe();
		comparedPlan.dReihe[i].mitarbeiter = dienstplan1.dReihe[i].mitarbeiter;
		if (dienstplan1.dReihe[i].mitarbeiter === dienstplan2.dReihe[i].mitarbeiter) {
			for (let j = 0; j < dienstplan1.dReihe[i].dienstEl.length; j++) {
				comparedPlan.dReihe[i].dienstEl[j] = new DEl();
				comparedPlan.dReihe[i].dienstEl[j].dienst = dienstplan1.dReihe[i].dienstEl[j].dienst;
				if (dienstplan1.dReihe[i].dienstEl[j].dienst !== dienstplan2.dReihe[i].dienstEl[j].dienst) {
					comparedPlan.dReihe[i].dienstEl[j].before = dienstplan2.dReihe[i].dienstEl[j].dienst;
					changeLog.push({
						mitarbeiter: dienstplan1.dReihe[i].mitarbeiter,
						before: dienstplan2.dReihe[i].dienstEl[j].dienst,
						after: dienstplan1.dReihe[i].dienstEl[j].dienst,
						date: compareMonth.date(j - 1),
					}
					);
				}
			}
		}
		else {
			console.log('Mitarbeiter mismatch in comparison');
		}
	}
	return {
		comparedPlan: comparedPlan,
		changeLog: changeLog,
		compared1: dienstplan1.monat,
		compared2: dienstplan2.monat,
	}
}

//gibt ein Array mit auschließlich den neuesten Dienstplänen zurück.
export function getDPList(data) {
	const dpList = [];
	if (data.dienstplaene.length > 0) {
		if (data.dienstplaene) {
			let cMonth = data.dienstplaene[0].monat.month();
			dpList.push(data.dienstplaene[0]);
			for (const el of data.dienstplaene) {
				if (el.monat.month() != cMonth) {
					dpList.push(el);
					cMonth = el.monat.month();
				}
			}
		}
	}
	return dpList;
}

export function getDPListRange(data, startDate, endDate) {
	const dpList = [];
	if (data.dienstplaene.length > 0) {
		let cDate = endDate;
		let index = data.dienstplaene.findIndex((e) => { return e.monat.month() <= endDate.month() && e.monat.year() <= endDate.year() });
		if (index != -1) {
			dpList.push(data.dienstplaene[index]);
			cDate = data.dienstplaene[index].monat;
			for (let i = index; i < data.dienstplaene.length && cDate.isAfter(startDate); i++) {
				if (data.dienstplaene[i].monat.month() != cDate.month()) {
					dpList.push(data.dienstplaene[i]);
					cDate = data.dienstplaene[i].monat;
				}
			}
		}
	}
	return dpList.reverse();
}

export function getNewest(data, date) {
	if (!date) {
		return null;
	}
	let ret = null;
	ret = data.dienstplaene.find((e) => {
		return e.monat.month() == date.month() && e.monat.year() == date.year()
	});
	return ret;
}

export function getStats(dienstplan) {
	if (!dienstplan) return null;

	let date = dienstplan.monat;
	let wochenProMonat = dayjs(dienstplan.monat).daysInMonth() / 7;
	let urlaubsTage = 0;
	let urlaubsStunden = 0;
	let fkStundenEingestellt = 0;
	let ekStundenEingestellt = 0;
	let stundenEingestellt = 0;
	let fkMitarbeiterEingestellt = 0;
	let ekMitarbeiterEingestellt = 0;
	let mitarbeiterEingestellt = 0
	let fkStundenGeleistet = 0;
	let ekStundenGeleistet = 0;
	let stundenGeleistet = 0;

	for (const dReihe of dienstplan.dReihe) {
		if (!dReihe.disable && !dReihe.mitarbeiter.disable) {
			if (dReihe.mitarbeiter.fk) {
				fkStundenEingestellt += dReihe.mitarbeiter.wochenStunden * wochenProMonat;
				fkMitarbeiterEingestellt++;
			} else {
				ekStundenEingestellt += dReihe.mitarbeiter.wochenStunden * wochenProMonat;
				ekMitarbeiterEingestellt++;
			}
			for (const el of dReihe.dienstEl) {
				if (el.dienst.name === '1. U') {
					urlaubsTage++;
					urlaubsStunden += dReihe.mitarbeiter.wochenStunden / 5;
				}
				if (dReihe.mitarbeiter.fk) {
					fkStundenGeleistet += el.dienst.dauer;
				} else {
					ekStundenGeleistet += el.dienst.dauer;
				}
			}
		}
	}
	stundenEingestellt = fkStundenEingestellt + ekStundenEingestellt;
	mitarbeiterEingestellt = fkMitarbeiterEingestellt + ekMitarbeiterEingestellt;
	stundenGeleistet = fkStundenGeleistet + ekStundenGeleistet;

	return {
		date: date,
		UrlaubsTage: urlaubsTage,
		UlaubsStunden: urlaubsStunden,
		fkStundenEingestellt: fkStundenEingestellt,
		ekStundenEingestellt: ekStundenEingestellt,
		stundenEingestellt: stundenEingestellt,
		fkMitarbeiterEingestellt: fkMitarbeiterEingestellt,
		ekMitarbeiterEingestellt: ekMitarbeiterEingestellt,
		mitarbeiterEingestellt: mitarbeiterEingestellt,
		fkStundenGeleistet: fkStundenGeleistet,
		ekStundenGeleistet: ekStundenGeleistet,
		stundenGeleistet: stundenGeleistet,
	}
}

export function getStatsDienste(dienstplan, dienstLegende) {
	if (!dienstplan) return null;
	var cArr = [];
	if (data.dienstLegende)
		for (const dienst of dienstLegende) {
			cArr.push({
				name: dienst.name,
				count: 0,
			});
		}

	for (const dReihe of dienstplan.dReihe) {
		for (const el of dReihe.dienstEl) {
			let tmp = cArr.find((e) => e.name === el.dienst.name);
			if (tmp != undefined)
				tmp.count++;
			else
				console.log('found no match for: ' + el.dienst.name);
		}
	}
	cArr = cArr.sort((a, b) => { return b.count - a.count; });
	return cArr;
}

export function getStatsStub(dienstplan) {
	let urlaubsTage = 0;
	let urlaubsStunden = 0;
	let fkStunden = 0;
	let ekStunden = 0;


	for (const dReihe of dienstplan.dReihe) {
		for (const el of dReihe.dienstEl) {

		}
	}
}