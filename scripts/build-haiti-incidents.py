#!/usr/bin/env python3
"""Turn the Haiti drone TSV into a bilingual CSV for the interactive map sheet."""

from __future__ import annotations

import csv
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/lib/data/haiti-map/haiti-drones-source.tsv"
OUTPUT = ROOT / "src/lib/data/haiti-map/haiti-incidents-fallback.csv"

HEADERS = [
	"id",
	"type",
	"latitude",
	"longitude",
	"date",
	"killedOrWounded",
	"droneCount",
	"explosiveDroneCount",
	"killed",
	"wounded",
	"casualtyKnown",
	"titleEN",
	"titleFR",
	"descriptionEN",
	"descriptionFR",
	"sources",
	"imageUrl",
	"imageCaptionEN",
	"imageCaptionFR",
	"videoUrl",
	"videoCaption",
	"department",
	"commune",
	"sectionCommunale",
	"locality",
	"identifiant",
]


def parse_euro_date(value: str) -> str:
	return datetime.strptime(value.strip(), "%d/%m/%Y").strftime("%Y-%m-%d")


def clean_fr(text: str) -> str:
	text = text.replace("\u00a0", " ").replace("\u202f", " ")
	text = re.sub(r"\s+", " ", text).strip()
	text = text.replace(" .", ".").replace("..", ".")
	text = re.sub(r"^Des membres de la PNH ont ont ", "Des membres de la PNH ont ", text)
	text = re.sub(r"^Des membres de la forces ", "Des membres des forces ", text)
	text = re.sub(r"des des ", "des ", text)
	text = re.sub(r"\s+ ", " ", text)
	text = text.strip(" \t.")
	if text and not text.endswith("."):
		text += "."
	return text[0].upper() + text[1:] if text else text


REPLACEMENTS: list[tuple[str, str]] = [
	# Long institutional openings
	(
		r"Des agents des différentes unités spécialisées de la PNH, venus en renfort d'une brigade de vigilance, ont",
		"Officers from various specialised PNH units, reinforcing a neighbourhood watch brigade,",
	),
	(
		r"Des agents de la PNH, provenant de différentes unités spécialisées, ont",
		"PNH officers from various specialised units",
	),
	(
		r"Des agents de plusieurs unités spécialisées de la PNH ont",
		"Officers from several specialised PNH units",
	),
	(
		r"Des agents de différentes unités spécialisées de la PNH ont",
		"Officers from various specialised PNH units",
	),
	(
		r"Des agents des différentes unités spécialisées de la PNH ont",
		"Officers from various specialised PNH units",
	),
	(
		r"Des agents des unités spécialisées de la PNH ont",
		"Officers from specialised PNH units",
	),
	(
		r"Des agents d'une unité spécialisée de la PNH ont",
		"Officers from a specialised PNH unit",
	),
	(
		r"Des agents de l’unité spécialisée de la Task Force ont",
		"Officers from the specialised Task Force unit",
	),
	(
		r"Des agents de l'unité spécialisée de la Task Force ont",
		"Officers from the specialised Task Force unit",
	),
	(
		r"Des agents de l’unité spécialisée Task Force ont",
		"Officers from the specialised Task Force unit",
	),
	(
		r"Des unités spécialisées de la PNH \(Task Force\) ont",
		"Specialised PNH Task Force units",
	),
	(
		r"Des unités spécialisées de la Task Force ont",
		"Specialised Task Force units",
	),
	(r"Des unités de la Task Force ont", "Task Force units"),
	(r"Des agents de la Task Force ont", "Task Force officers"),
	(r"Des agents de Task Force ont", "Task Force officers"),
	(
		r"Des unités de la Police Nationale d’Haïti \(PNH\) ont",
		"Haitian National Police (PNH) units",
	),
	(
		r"Des unités de la Police Nationale d'Haïti \(PNH\) ont",
		"Haitian National Police (PNH) units",
	),
	(
		r"Des agents de la Police Nationale d’Haïti \(PNH\) ont",
		"Haitian National Police (PNH) officers",
	),
	(
		r"Des agents de la Police Nationale d'Haïti \(PNH\) ont",
		"Haitian National Police (PNH) officers",
	),
	(r"Des agents de la Police nationale d’Haïti ont", "Haitian National Police officers"),
	(r"Des agents de la Police nationale d'Haïti ont", "Haitian National Police officers"),
	(r"Des unités spécialisées de la PNH ont", "Specialised PNH units"),
	(r"Des unités de la PNH ont", "PNH units"),
	(r"Des agents spécialisés de la PNH ont", "Specialised PNH officers"),
	(r"Des agents de la PNH ont", "PNH officers"),
	(r"Des agents de PNH ont", "PNH officers"),
	(r"Des membres de la PNH ont", "PNH officers"),
	(r"Les membres de la PNH ont", "PNH officers"),
	(
		r"Des membres des forces de défense et de sécurité ont",
		"Members of the defence and security forces",
	),
	(
		r"Des membres des forces de défense et sécurité ont",
		"Members of the defence and security forces",
	),
	(
		r"Les forces de défense et de sécurité ont",
		"Defence and security forces",
	),
	(
		r"Des forces de défense et de sécurité ont",
		"Defence and security forces",
	),
	(
		r"Des agents des forces de défense et de sécurité ont",
		"Defence and security force officers",
	),
	(r"Des agents des forces de l’ordre ont", "Security-force officers"),
	(r"Des agents des forces de l'ordre ont", "Security-force officers"),
	(r"Des membres des forces de l’ordre ont", "Members of the security forces"),
	(r"Des membres des forces de l'ordre ont", "Members of the security forces"),
	(r"Les forces de l’ordre ont", "Security forces"),
	(r"Les forces de l'ordre ont", "Security forces"),
	(
		r"Des unités spécialisées des forces de l'ordres ont",
		"Specialised security-force units",
	),
	(r"Des unités spécialisées de la PNH en appui des unités au sol ont", "Specialised PNH units supporting ground units"),
	# Verbs / actions
	(r"lancé une offensive et déployé", "launched an offensive and deployed"),
	(r"lancé une opération contre", "launched an operation against"),
	(r"mené une opération en lançant", "carried out an operation, launching"),
	(r"mené une opération contre", "carried out an operation against"),
	(r"mené une opération dans", "carried out an operation in"),
	(r"mené une opération au cours de laquelle", "carried out an operation during which"),
	(r"mené une attaque contre", "carried out an attack against"),
	(r"mené une intervention et lancé", "carried out an intervention and launched"),
	(r"mené une frappe contre", "carried out a strike against"),
	(r"procédé à une frappe ciblée à l’aide de", "carried out a targeted strike using"),
	(r"procédé à une frappe ciblée à l'aide de", "carried out a targeted strike using"),
	(r"ont dû faire usage d’", "had to use "),
	(r"ont dû faire usage d'", "had to use "),
	(r"fait usage d’au moins", "used at least"),
	(r"fait usage d'au moins", "used at least"),
	(r"fait au moins usage d'", "used at least "),
	(r"fait usage d'", "used "),
	(r"fait usage de", "used"),
	(r"ouvert le feu avant de lancer", "opened fire before launching"),
	(r"ouvert le feu contre", "opened fire on"),
	(r"ouvert le feu pour", "opened fire to"),
	(r"à nouveau lancé", "again launched"),
	(r"lancé au moins", "launched at least"),
	(r"lancé plusieurs", "launched several"),
	(r"lancé des", "launched"),
	(r"lancé un", "launched a"),
	(r"lancé deux", "launched two"),
	(r"déployé au moins", "deployed at least"),
	(r"déployé un", "deployed a"),
	(r"déployé des", "deployed"),
	(r"utilisé des", "used"),
	(r"utilisé au moins", "used at least"),
	(r"utilisé un", "used a"),
	(r"frappé des", "struck"),
	(r"frappé la base", "struck the base"),
	(r"attaqué et lancé", "attacked and launched"),
	(r"attaqué en lançant", "attacked by launching"),
	(r"attaqué des", "attacked"),
	(r"tiré plusieurs", "fired several"),
	(r"tiré des", "fired"),
	(r"tiré et utilisé", "fired and used"),
	# Nouns / phrases
	(r"drones explosifs", "explosive drones"),
	(r"drone explosif", "explosive drone"),
	(r"drones à charge explosive", "explosive-laden drones"),
	(r"drones portant des charges explosives", "drones carrying explosive charges"),
	(r"drones porteurs de charges explosives", "explosive-laden drones"),
	(r"drones en direction", "drones toward"),
	(r"au moins un drone explosif a été déployés par", "at least one explosive drone was deployed by"),
	(r"Au moins un drone explosif a été déployés par", "At least one explosive drone was deployed by"),
	(r"Au moins trois drones explosifs ont été déployés par", "At least three explosive drones were deployed by"),
	(r"Au moins", "At least"),
	(r"au moins", "at least"),
	(r"membres du GCO", "members of GCO"),
	(r"membres des GCO", "members of the GCO groups"),
	(r"membres de GCO", "members of GCO"),
	(r"membres d’une alliance de GCO", "members of a GCO alliance"),
	(r"membres d'une alliance de GCO", "members of a GCO alliance"),
	(r"membres d'une coalition de GCO", "members of a GCO coalition"),
	(r"présumés membres", "suspected members"),
	(r"la base du GCO", "the GCO base"),
	(r"la base de", "the base of"),
	(r"positions du GCO", "GCO positions"),
	(r"positions des membres", "positions of members"),
	(r"retranchés dans les montagnes", "holed up in the mountains"),
	(r"retranchés dans des habitations abandonnées", "holed up in abandoned homes"),
	(r"retranchés dans des habitations", "holed up in homes"),
	(r"retranchés dans une maison", "holed up in a house"),
	(r"retranchés dans une rue", "holed up in a street"),
	(r"retranchés dans des zones difficilement accessibles", "holed up in hard-to-reach areas"),
	(r"retranchés dans des zones difficiles d’accès", "holed up in hard-to-reach areas"),
	(r"retranchés dans des zones montagneuses", "holed up in mountainous areas"),
	(r"retranchés dans un ancien bâtiment public", "holed up in a former public building"),
	(r"cachés dans les montagnes", "hiding in the mountains"),
	(r"lors d’une opération", "during an operation"),
	(r"lors d'une opération", "during an operation"),
	(r"lors d’une intervention", "during an intervention"),
	(r"lors d'une intervention", "during an intervention"),
	(r"lors d’une frappe", "during a strike"),
	(r"dans le cadre d’une opération", "as part of an operation"),
	(r"dans le cadre d'une opération", "as part of an operation"),
	(r"au cours d’une opération", "during an operation"),
	(r"au cours d'une opération", "during an operation"),
	(r"au cours d’une intervention", "during an intervention"),
	(r"visant à les déloger", "aimed at dislodging them"),
	(r"visant à les repousser", "aimed at pushing them back"),
	(r"pour les repousser", "to push them back"),
	(r"pour cibler", "to target"),
	(r"pour frapper", "to strike"),
	(r"en direction de", "toward"),
	(r"en direction des", "toward"),
	(r"en directions des", "toward"),
	(r"contre des", "against"),
	(r"contre les", "against"),
	(r"contre la", "against the"),
	(r"afin de tenter de repousser", "in an attempt to push back"),
	(r"population civile", "civilian population"),
	(r"membres de la population civile", "civilians"),
	(r"bilan humain", "casualty toll"),
	(r"dommages matériels", "material damage"),
	(r"dégâts matériels", "material damage"),
	(r"n'ont pas été rapportés", "were not reported"),
	(r"n’ont pas été rapportés", "were not reported"),
	(r"n'a pas été rapporté", "was not reported"),
	(r"n’a pas été rapporté", "was not reported"),
	(r"n'est pas encore connu", "is not yet known"),
	(r"n'est pour l'instant pas connu", "is not yet known"),
	(r"reste imprécis", "remains unclear"),
	(r"maisons ont été partiellement détruites", "houses were partially destroyed"),
	(r"maisons ont été totalement détruites", "houses were completely destroyed"),
	(r"maisons appartenant aux membres du GCO ont été détruites", "houses belonging to GCO members were destroyed"),
	(r"habitations situées à proximité de la population civile", "homes near the civilian population"),
	(r"à proximité de la population civile", "near civilians"),
	(r"échanges de tirs", "exchanges of fire"),
	(r"tirs de riposte", "return fire"),
	(r"ont opéré des tirs de riposte", "returned fire"),
	(r"ont riposté", "fought back"),
	(r"prendre la fuite", "flee"),
	(r"pris la fuite", "fled"),
	(r"mettant en fuite", "putting them to flight"),
	(r"provoquant la fuite des habitants", "prompting residents to flee"),
	(r"provoquant un climat de panique au sein de la population", "causing panic among the population"),
	(r"aucun coup de feu n’a été entendu", "no gunfire was heard"),
	(r"aucun coup de feu n'a été entendu", "no gunfire was heard"),
	(r"Aucun blessé n’est à signaler", "No injuries were reported"),
	(r"alors qu’aucun tir n’a été entendu dans la zone", "while no gunfire was heard in the area"),
	(r"à la suite d’échanges de tirs", "following exchanges of fire"),
	(r"à la suite d'échanges de tirs", "following exchanges of fire"),
	(r"à la suite de violents affrontements", "following violent clashes"),
	(r"en mouvement", "on the move"),
	(r"qui se déplaçait dans un marché public", "who were moving through a public market"),
	(r"qui tentaient d’installer des barricades", "who were trying to set up barricades"),
	(r"qui tentaient de progresser", "who were trying to advance"),
	(r"qui occupaient un quartier", "who were occupying a neighbourhood"),
	(r"qui avaient occupé un quartier", "who had occupied a neighbourhood"),
	(r"qu'ils avaient pris d'assaut", "they had stormed"),
	(r"depuis plus de deux mois", "for more than two months"),
	(r"depuis plus d'un mois", "for more than a month"),
	(r"depuis plus de quatre mois", "for more than four months"),
	(r"L’explosion a causé la mort d’", "The explosion killed "),
	(r"L'explosion a causé la mort d'", "The explosion killed "),
	(r"L’explosion a fait au moins", "The explosion killed at least"),
	(r"L’engin a explosé sur", "The device exploded on"),
	(r"causant la mort d’", "killing "),
	(r"causant la mort d'", "killing "),
	(r"entraîné la mort de", "killed"),
	(r"entraîné la mort d’", "killed "),
	(r"a succombé à ses blessures", "died of his injuries"),
	(r"ont été tués", "were killed"),
	(r"ont été tué", "were killed"),
	(r"a été tué", "was killed"),
	(r"ont été blessés", "were wounded"),
	(r"a été blessé", "was wounded"),
	(r"blessé deux autres", "wounded two others"),
	(r"parmi la population civile", "among the civilian population"),
	(r"parmi lesquels figurent", "including"),
	(r"hélicoptères", "helicopters"),
	(r"véhicules blindés", "armoured vehicles"),
	(r"un hélicoptère", "a helicopter"),
	(r"camionnette", "pickup truck"),
	(r"motocyclette", "motorcycle"),
	(r"quartier", "neighbourhood"),
	(r"axes routiers", "roads"),
	(r"début de soirée", "early evening"),
	(r"dans la matinée", "in the morning"),
	(r"pendant plusieurs heures", "for several hours"),
	(r"pendant quelques minutes", "for a few minutes"),
	(r"une trentaine de minutes", "about thirty minutes"),
	(r"Lors de la frappe", "During the strike"),
	(r"Lors de cette opération", "During this operation"),
	(r"Lors de ces explosions", "During these explosions"),
	(r"Cette intervention visait", "The intervention aimed"),
	(r"L’opération visait", "The operation aimed"),
	(r"L'utilisation de ce drone visait", "The drone was aimed at"),
	(r"le chef de ce groupe", "the group's leader"),
	(r"le chef du GCO", "the GCO leader"),
	(r"Chef du GCO", "GCO leader"),
	(r"activités carnavalesques", "carnival events"),
	(r"fête de Noël", "Christmas party"),
	(r"à l'occasion d'une fête qu'ils ont organisée", "during a party they had organised"),
	(r"Des tirs ont été entendus", "Gunfire was heard"),
	(r"après l'explosion", "after the explosion"),
	(r"en appui des", "in support of"),
	(r"venus en renfort", "who came as reinforcements"),
	(r"appuyés par", "backed by"),
	(r"à bord de véhicules blindés", "in armoured vehicles"),
	(r"à bord duquel il circulait", "they were travelling in"),
	(r"ont réussi à", "managed to"),
	(r"ont abandonné le véhicule", "abandoned the vehicle"),
	(r"Des armes et de l’argent ont été récupérés", "Weapons and money were recovered"),
	(r"au moins une maison a été détruite", "at least one house was destroyed"),
	(r"La résidence du", "The residence of the"),
	(r"a été partiellement endommagée", "was partially damaged"),
	(r"son véhicule détruit", "his vehicle destroyed"),
	(r"dont quatre femmes", "including four women"),
	(r"dont un ancien", "including a former"),
	(r"trois enfants, neuf femmes", "three children and nine women"),
	(r"11 adultes et 2 enfants", "11 adults and 2 children"),
	(r"3 adultes et 2 enfants", "3 adults and 2 children"),
	(r"Sept agents de santé communautaires volontaires ont été piégés", "Seven volunteer community health workers were trapped"),
	(r"pendant plusieurs heures dans un bâtiment scolaire utilisé pour des activités médicales par une ONG internationale", "for several hours in a school building used for medical activities by an international NGO"),
	(r"lors d’affrontements entre les membres d’un GCO et la PNH", "during clashes between GCO members and the PNH"),
	(r"Des drones explosifs ont été également utilisés à proximité de la structure médicale", "Explosive drones were also used near the medical facility"),
	(r"et de nombreux civils ont été victimes", "and many civilians were harmed"),
	(r"avec lequel l’organisation avait collaboré en 2025 qui a succombé à ses blessures devant le portail du bâtiment", "the organisation had worked with in 2025, who died of his injuries in front of the building gate"),
	(r"au moment du passage d’un véhicule d’une ONG qui évacuait le site de son activité en raison des attaques dans la zone", "as an NGO vehicle was passing, evacuating its activity site because of attacks in the area"),
	(r"L’explosion a fait au moins seize morts, quinze blessés", "The explosion killed at least sixteen people and wounded fifteen"),
	(r"dans une foule réunie pour célébrer l’anniversaire du chef du GCO Simon Pelé", "into a crowd gathered to celebrate the birthday of GCO Simon Pelé’s leader"),
	(r"qui a failli atteindre des civils se trouvant à proximité", "which nearly hit civilians nearby"),
	(r"Celle-ci, utilisée comme cachette par les membres du groupe, a été ciblée et encerclée par les forces de l’ordre", "The house, used as a hideout by group members, was targeted and surrounded by security forces"),
	(r"utilisées comme postes de repli tactique", "used as tactical fallback positions"),
	(r"en repli vers des zones difficilement accessibles", "falling back toward hard-to-reach areas"),
	(r"depuis leurs positions dans le but de les atteindre", "from their positions in an effort to reach them"),
	(r"Le nombre exact de victimes ainsi que l’ampleur des", "The exact number of victims and the scale of the"),
	(r"y compris le chef", "including the leader"),
	(r"Des véhicules et des maisons servant de cachette aux membres du GCO ont également été détruits", "Vehicles and houses used as hideouts by GCO members were also destroyed"),
	(r"Le bilan indique", "The toll includes"),
	(r"Le bilan des", "The toll of"),
	(r"Ils ont également utilisé", "They also used"),
	(r"Ils ont tué", "They killed"),
	(r"et blessé deux autres", "and wounded two others"),
	(r"Des drones explosifs ont été utilisés par la PNH", "The PNH used explosive drones"),
	(r"allié de", "an ally of"),
	(r"dont 5 Segonn", "including 5 Segonn"),
	(r"incluant 5 Segonn", "including 5 Segonn"),
	(r"et ceux de", "and those of"),
	(r"et de Gran Ravin", "and Gran Ravin"),
	(r"et Gran Ravin", "and Gran Ravin"),
	(r"et de Bel-Air", "and Bel-Air"),
	(r"de Bel-Air", "of Bel-Air"),
	(r"du GCO", "of GCO"),
	(r"des GCO", "of the GCO groups"),
	(r"le GCO", "the GCO"),
	(r"un GCO", "a GCO"),
	(r"ce GCO", "this GCO"),
	(r"ces GCO", "these GCO groups"),
	(r"ces groupes", "these groups"),
	(r"la zone", "the area"),
	(r"cette zone", "this area"),
	(r"cette opération", "this operation"),
	(r"cette attaque", "this attack"),
	(r"cette intervention", "this intervention"),
	(r"dans la zone", "in the area"),
	(r"dans un quartier", "in a neighbourhood"),
	(r"d'un quartier", "of a neighbourhood"),
	(r"d’un quartier", "of a neighbourhood"),
	(r"vers le centre-ville", "toward downtown"),
	(r"au centre-ville", "in downtown"),
	(r"centre-ville", "downtown"),
	(r"sur la RN2", "on Route Nationale 2"),
	(r"quatres drones", "four drones"),
	(r"deux drones", "two drones"),
	(r"d’au moins", "at least"),
	(r"d'au moins", "at least"),
	(r"d’une opération", "an operation"),
	(r"d'une opération", "an operation"),
	(r"d’une localité", "a locality"),
	(r"d'une localité", "a locality"),
	(r"d’un véhicule", "a vehicle"),
	(r"et ont ouvert le feu", "and opened fire"),
	(r"et ont frappé", "and struck"),
	(r"avant de prendre la fuite", "before fleeing"),
	(r"Ces derniers", "The latter"),
	(r"ces derniers", "the latter"),
	(r"ces individus", "these individuals"),
	(r"chasser ces individus", "drive these individuals out"),
	(r"reprendre le contrôle", "regain control"),
	(r"limiter leur progression", "limit their advance"),
	(r"repousser les assaillants", "push back the attackers"),
	(r"l’explosion de ce dernier à proximité de la base du SWAT", "its explosion near the SWAT base"),
	(r"2 membres du SWAT", "two SWAT members"),
	(r"blessé 7 autres", "wounded seven others"),
	(r"parmi eux", "among them"),
	(r"un autre gravement blessé", "another seriously wounded"),
	(r"Des dommages matériels ont également été rapportés", "Material damage was also reported"),
	(r"Des dommages matériels ont également été enregistrés", "Material damage was also recorded"),
	(r"Des dommages matériels ont été observés", "Material damage was observed"),
	(r"avec des maisons détruites", "with houses destroyed"),
	(r"Le nombre de personnes blessées", "The number of people wounded"),
	(r"Les assaillants ont opéré des tirs de riposte", "The attackers returned fire"),
	(r"Les membres du GCO ont opéré des tirs de riposte", "GCO members returned fire"),
	(r"Des tirs de riposte ont été opérés par les membres de ce GCO", "Members of this GCO returned fire"),
	(r"Des maisons ont été partiellement endommagées", "Houses were partially damaged"),
	(r"ont déjà été lancés", "have already been launched"),
	(r"ont été aussi utilisés", "were also used"),
	(r"au cours de l'opération", "during the operation"),
	(r"alors qu'il organisait", "while he was organising"),
	(r"grièvement blessé", "seriously wounded"),
	(r"gravement blessé", "seriously wounded"),
	(r"ont été abattus", "were shot dead"),
	(r"a été abattu", "was shot dead"),
	(r"ont été piégés", "were trapped"),
	(r"volontaire communautaire", "community volunteer"),
	(r"ONG internationale", "international NGO"),
	(r"structure médicale", "medical facility"),
	(r"bâtiment scolaire", "school building"),
	(r"activités médicales", "medical activities"),
	(r"devant le portail du bâtiment", "in front of the building gate"),
	(r"PNH\.Le bilan", "PNH. The toll"),
	(r"Des explosive drones", "Explosive drones"),
	(r"Ils ont tué", "They killed"),
	(r"Ils ont également utilisé", "They also used"),
	(r"Ils ont", "They"),
	(r"ont été utilisés par la PNH", "were used by the PNH"),
	(r"ont été utilisés", "were used"),
	(r"ont été lancés", "were launched"),
	(r"a été déployé", "was deployed"),
	(r"a été utilisé", "was used"),
	(r"a été lancé", "was launched"),
	(r"présumés criminels", "suspected criminals"),
	(r"cinq ", "five "),
	(r"six ", "six "),
	(r"sept ", "seven "),
	(r"huit ", "eight "),
	(r"neuf ", "nine "),
	(r"dix ", "ten "),
	(r"onze ", "eleven "),
	(r"douze ", "twelve "),
	(r"quatorze ", "fourteen "),
	(r"quinze ", "fifteen "),
	(r"seize ", "sixteen "),
	(r"vingt ", "twenty "),
	(r"  ", " "),
]

POST_FRENCH = [
	(r"attaqué", "attacked"),
	(r"ciblée", "targeted"),
	(r"ciblé", "targeted"),
	(r"Utilisant", "Using"),
	(r"utilisant", "using"),
	(r"blessé", "wounded"),
	(r"membres", "members"),
	(r"membre", "member"),
	(r"assaillants", "attackers"),
	(r"ouvert the feu", "opened fire"),
	(r"L'objectif", "The aim"),
	(r"l'objectif", "the aim"),
	(r"l'opération", "the operation"),
	(r"était", "was"),
	(r"bilan", "toll"),
	(r"communiqué", "released"),
	(r"déployés", "deployed"),
	(r"déployé", "deployed"),
	(r"avançaient", "were advancing"),
	(r"occupaient", "were occupying"),
	(r"différents endroits", "various places"),
	(r"différentes unités spécialisées", "various specialised units"),
	(r"à charge explosive", "explosive-laden"),
	(r"chargés d'explosifs", "loaded with explosives"),
	(r"nombre n'est pas connu", "number is not known"),
	(r"n'est pas connu", "is not known"),
	(r"n'a pas been", "was not"),
	(r"à l'aide", "using"),
	(r"à l’aide", "using"),
	(r"avant of flee", "before fleeing"),
	(r"ils have", "they"),
	(r"have opéré", "carried out"),
	(r"opéré", "carried out"),
	(r"opérés", "carried out"),
	(r"groupe criminel", "criminal group"),
	(r"visait à", "aimed to"),
	(r"visait", "aimed"),
	(r"repousser", "push back"),
	(r"\btrois\b", "three"),
	(r"\bquatre\b", "four"),
	(r"\bcinq\b", "five"),
	(r"\bsix\b", "six"),
	(r"\bsept\b", "seven"),
	(r"\bhuit\b", "eight"),
	(r"\bneuf\b", "nine"),
	(r"\bdix\b", "ten"),
	(r"\bonze\b", "eleven"),
	(r"\bdouze\b", "twelve"),
	(r"\bquatorze\b", "fourteen"),
	(r"\bquinze\b", "fifteen"),
	(r"\bseize\b", "sixteen"),
	(r"\bvingt\b", "twenty"),
	(r"\bdeux\b", "two"),
	(r"\bet\b", "and"),
	(r"\bdans\b", "in"),
	(r"\bpour\b", "to"),
	(r"\bavec\b", "with"),
	(r"\bcontre\b", "against"),
	(r"\bpar\b", "by"),
	(r"\bsur\b", "on"),
	(r"\bvers\b", "toward"),
	(r"\bqui\b", "who"),
	(r"\bdont\b", "including"),
	(r"\blors\b", "during"),
	(r"\bainsi\b", "thus"),
	(r"\bmais\b", "but"),
	(r"\bpuis\b", "then"),
	(r"\baussi\b", "also"),
	(r"\bégalement\b", "also"),
	(r"\bces\b", "these"),
	(r"\bcette\b", "this"),
	(r"\bces\b", "these"),
	(r"\bdes\b", "of the"),
	(r"\bdu\b", "of the"),
	(r"\bde\b", "of"),
	(r"\bles\b", "the"),
	(r"\blau\b", "the"),
	(r"\ble\b", "the"),
	(r"\bla\b", "the"),
	(r"\baux\b", "to the"),
	(r"\bau\b", "to the"),
	(r"\bune\b", "a"),
	(r"\bun\b", "a"),
	(r"\bsont\b", "are"),
	(r"\bété\b", "been"),
	(r"\bont\b", "have"),
	(r"\ba\b été\b", "was"),
	(r"PNH\.The", "PNH. The"),
	(r"PNH\.Le", "PNH. The"),
]


def translate_description(fr: str) -> str:
	text = fr
	for pattern, replacement in REPLACEMENTS:
		text = re.sub(pattern, replacement, text)
	for pattern, replacement in POST_FRENCH:
		text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
	text = re.sub(r"\s+", " ", text).strip()
	text = text.replace(" .", ".").replace(" ,", ",")
	text = re.sub(r"\s+([,.])", r"\1", text)
	sentences = [s.strip() for s in re.split(r"(?<=\.)\s+", text) if s.strip()]
	fixed = []
	for sentence in sentences:
		sentence = sentence[0].upper() + sentence[1:] if sentence else sentence
		fixed.append(sentence)
	text = " ".join(fixed)
	if text and not text.endswith("."):
		text += "."
	return text


def title_pair(locality: str, drones: int, killed: int, wounded: int, known: bool) -> tuple[str, str]:
	if known and (killed or wounded):
		en_parts = []
		fr_parts = []
		if killed:
			en_parts.append(f"{killed} killed")
			fr_parts.append(f"{killed} tué{'s' if killed > 1 else ''}")
		if wounded:
			en_parts.append(f"{wounded} wounded")
			fr_parts.append(f"{wounded} blessé{'s' if wounded > 1 else ''}")
		return (
			f"{', '.join(en_parts)} in {locality}",
			f"{', '.join(fr_parts)} à {locality}",
		)
	en_drone = "explosive drone" if drones == 1 else "explosive drones"
	fr_drone = "drone explosif" if drones == 1 else "drones explosifs"
	return (f"{drones} {en_drone} in {locality}", f"{drones} {fr_drone} à {locality}")


def read_existing_events() -> list[dict[str, str]]:
	"""Keep editorial event rows when rebuilding incident rows from the source TSV."""
	if not OUTPUT.exists():
		return []
	with OUTPUT.open(newline="", encoding="utf-8") as handle:
		return [row for row in csv.DictReader(handle) if row.get("type") == "event"]


def main() -> None:
	with SOURCE.open(newline="", encoding="utf-8") as handle:
		rows = list(csv.DictReader(handle, delimiter="\t"))

	out_rows = []
	for raw in rows:
		fr = clean_fr(raw["Narratif"])
		drones = int(raw["Nombre de drones"])
		killed = int(raw["Tué"])
		wounded = int(raw["Blessé"])
		known = raw["Bilan humain"].strip().lower() == "connu"
		locality = raw["Localité"].strip()
		title_en, title_fr = title_pair(locality, drones, killed, wounded, known)
		out_rows.append(
			{
				"type": "incident",
				"latitude": raw["X"].strip(),
				"longitude": raw["Y"].strip(),
				"date": parse_euro_date(raw["Date"]),
				"killedOrWounded": killed + wounded,
				"droneCount": drones,
				"explosiveDroneCount": drones,
				"killed": killed,
				"wounded": wounded,
				"casualtyKnown": "TRUE" if known else "FALSE",
				"titleEN": title_en,
				"titleFR": title_fr,
				"descriptionEN": translate_description(fr),
				"descriptionFR": fr,
				"sources": "",
				"imageUrl": "",
				"imageCaptionEN": "",
				"imageCaptionFR": "",
				"videoUrl": "",
				"videoCaption": "",
				"department": raw["Département"].strip(),
				"commune": raw["Comune"].strip(),
				"sectionCommunale": raw["Section Communale"].strip(),
				"locality": locality,
				"identifiant": raw["Identifiant"].strip(),
			}
		)

	out_rows.sort(key=lambda r: (r["date"], r["identifiant"]))
	for index, row in enumerate(out_rows, start=1):
		row["id"] = index

	events = read_existing_events()
	for index, row in enumerate(events, start=len(out_rows) + 1):
		row["id"] = index
	out_rows.extend(events)

	with OUTPUT.open("w", newline="", encoding="utf-8") as handle:
		writer = csv.DictWriter(
			handle, fieldnames=HEADERS, extrasaction="ignore", lineterminator="\n"
		)
		writer.writeheader()
		writer.writerows(out_rows)

	print(f"Wrote {len(out_rows)} rows to {OUTPUT.relative_to(ROOT)}")
	print("Date range:", out_rows[0]["date"], "→", out_rows[-1]["date"])
	print("Known casualty rows:", sum(1 for r in out_rows if r["casualtyKnown"] == "TRUE"))
	print("Sample EN:", out_rows[0]["titleEN"])
	print(out_rows[0]["descriptionEN"][:240])


if __name__ == "__main__":
	main()
