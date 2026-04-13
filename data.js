const DB = {
  getPhrases() { try { return JSON.parse(localStorage.getItem('pz_phrases') || '[]'); } catch(e) { return []; } },
  savePhrases(p) { localStorage.setItem('pz_phrases', JSON.stringify(p)); },
  getCategories() { try { return JSON.parse(localStorage.getItem('pz_categories') || '[]'); } catch(e) { return []; } },
  saveCategories(c) { localStorage.setItem('pz_categories', JSON.stringify(c)); },
  getSessions() { try { return JSON.parse(localStorage.getItem('pz_sessions') || '[]'); } catch(e) { return []; } },
  saveSessions(s) { localStorage.setItem('pz_sessions', JSON.stringify(s)); },
  isSeeded() { return localStorage.getItem('pz_seeded') === '1'; },
  markSeeded() { localStorage.setItem('pz_seeded', '1'); },

  addPhrase(data) {
    const phrases = this.getPhrases();
    const phrase = { id: Date.now().toString(), dateAdded: new Date().toISOString(), studyCount: 0, lastStudied: null, ...data };
    phrases.unshift(phrase);
    this.savePhrases(phrases);
    return phrase;
  },
  updatePhrase(id, data) {
    const phrases = this.getPhrases();
    const idx = phrases.findIndex(p => p.id === id);
    if (idx !== -1) { phrases[idx] = { ...phrases[idx], ...data }; this.savePhrases(phrases); }
  },
  deletePhrase(id) {
    this.savePhrases(this.getPhrases().filter(p => p.id !== id));
  },
  addCategory(data) {
    const cats = this.getCategories();
    const cat = { id: Date.now().toString(), ...data };
    cats.push(cat);
    this.saveCategories(cats);
    return cat;
  },
  deleteCategory(id) {
    this.saveCategories(this.getCategories().filter(c => c.id !== id));
    const phrases = this.getPhrases();
    phrases.forEach(p => { if (p.categoryId === id) p.categoryId = null; });
    this.savePhrases(phrases);
  },
  addSession(data) {
    const sessions = this.getSessions();
    const session = { id: Date.now().toString(), date: new Date().toISOString(), ...data };
    sessions.unshift(session);
    this.saveSessions(sessions);
  }
};

const SEED_PHRASES = [
  ["J'ai perdu beaucoup de gens dans ma vie, mais toi je refuse de te perdre","I've lost many people in my life, but I refuse to lose you"],
  ["Quand j'apprends une dinguerie et que je sais parfaitement à qui je vais la raconter","When I learn something crazy and I know exactly who I'm going to tell it to"],
  ["Hôpital","Hospital"],["Joie de vivre","Joy of living"],["Bien sûr","Of course"],
  ["Bon y va","Well, let's go"],["On y va","Let's go"],["Comme","Like"],
  ["Je pense que je me trompe","I think I am wrong"],["Avoir tort","To be wrong"],
  ["Autre","Other"],["C'est ça","That's it / That's right"],
  ["Vous sortez l'ascenseur","You exit the elevator"],["Alors","So / Then / Well"],
  ["Lorsque","When"],["Ça sera sur la droite","It will be on the right"],
  ["Wow la classe !","Wow, how stylish! / Amazing!"],
  ["J'espère que ça vous convient","I hope this works for you"],
  ["Oui, ça me va","Yes, it works for me"],["Ouais","Yeah"],["Hier","Yesterday"],
  ["La semaine dernière","Last week"],["Le mois dernier","Last month"],
  ["L'année dernière","Last year"],["Je vous retrouve","I'll meet up with you again"],
  ["Trouver","To find (a new discovery)"],["Retrouver","To find again (a reunion or rediscovery)"],
  ["Prêté","Lent / Borrowed"],["C'est parti !","Here we go! / We're off!"],
  ["Vous êtes combien ?","How many are you?"],["C'est pour deux personnes","It's for two people"],
  ["Suivez-moi","Follow me"],["Vous avez choisi ?","Have you chosen? / Are you ready to order?"],
  ["Tout de suite","Immediately / Right away"],["L'addition","The bill / The check"],
  ["Vous apportez l'addition s'il vous plaît ?","Could you bring the bill please?"],
  ["C'était ?","How was it?"],["Parfois","Sometimes"],
  ["Tout le monde a un parapluie","Everyone has an umbrella"],["Cuire / Cuisiner","To cook"],
  ["Il n'y a pas de quoi","Don't mention it / You're welcome"],["Voici","Here is"],
  ["Voilà","There it is / There you go"],["Ici","Here"],["Comme ci comme ça","So-so"],
  ["Quoi","What"],["Chacun","Each one / Everyone"],
  ["Dis oui, non ou change","Say yes, no or change (dog command)"],
  ["Où tu veux me dire comment s'est passé ta journée ?","Do you want to tell me how your day went?"],
  ["Super, merci !","Great, thank you!"],["Aujourd'hui","Today"],
  ["As-tu une question, ou veux-tu dire quelque chose avant qu'on termine la leçon ?","Do you have a question, or do you want to say something before we end the lesson?"],
  ["D'abord","First / First of all"],["Lancer","To launch / To throw"],
  ["Étends","Stretch / Lie down"],["Je suis très fière de toi","I am very proud of you"],
  ["Trop","Too / Too much"],["Assez","Quite / Enough"],["Extrêmement","Extremely"],
  ["Est-ce qu'on peut chanter ?","Can we sing?"],["Du coup, moi c'est Tim","So, I'm Tim"],
  ["Espère","Hope"],["Où sont les poubelles ?","Where are the trash cans?"],
  ["Où est-ce que je peux acheter des vêtements ?","Where can I buy clothes?"],
  ["Je peux vous aider ?","Can I help you?"],["Je regarde","I'm just looking"],
  ["Est-ce que je peux l'essayer ?","Can I try it on?"],["Lèche-vitrines","Window shopping"],
  ["Ça coûte combien ?","How much does it cost?"],["Ça coûte trente euros","That costs thirty euros"],
  ["Est-ce que je peux payer avec une carte de crédit ?","Can I pay with a credit card?"],
  ["Voulez-vous un sac ?","Would you like a bag?"],
  ["Est-ce que je peux avoir un sac s'il vous plaît ?","Can I have a bag please?"],
  ["Le ticket","The ticket"],["Donnez-moi !","Give me!"],
  ["Je voudrais acheter des oranges","I would like to buy some oranges"],
  ["Une fermière","A female farmer"],["C'est gentil","That's kind / That's nice"],
  ["Vous désirez un sac monsieur ?","Would you like a bag, sir?"],
  ["Ils sont à combien ?","How much are they?"],["J'habite à côté","I live nearby"],
  ["J'ai dit","I said"],["Par contre","On the other hand / However"],
  ["Sur la tête","On the head"],["Tant pis","Too bad / Never mind"],
  ["Attendez !","Wait!"],["Je vais régler par carte","I'll pay by card"],
  ["Mec","Dude / Guy"],["Il fait 19 degrés et plein soleil !","It's 19 degrees and full sunshine!"],
  ["Pote","Buddy / Pal"],["Un peu plus","A little more"],["Un peu moins","A little less"],
  ["Comment tu vas ?","How are you?"],["Je vais bien","I'm doing well"],
  ["Mon niveau de français est tellement drôle","My French level is so funny"],
  ["Quand quelqu'un parle en français je comprends tout","When someone speaks French I understand everything"],
  ["Mais mon vocabulaire est nul","But my vocabulary is terrible"],
  ["Et quoi d'autre ?","And what else?"],["Demi","Half"],["Déjà","Already"],
  ["Je me sens déjà pompette","I already feel tipsy"],["Santé","Cheers / Health"],
  ["Je me souviens quand j'ai eu un pique-nique ici","I remember when I had a picnic here"],
  ["Tu te souviens de la première classe ?","Do you remember the first class?"],
  ["J'ai mal à la tête","I have a headache"],
  ["Et d'après-midi, il ferait du soleil et il ferait chaud","And in the afternoon, it would be sunny and warm"],
  ["Où est-ce que je peux acheter du café ?","Where can I buy coffee?"],
  ["Où se trouvent les toilettes ?","Where are the restrooms?"],["Je la prends","I'll take it"],
  ["Est-ce que je peux goûter s'il vous plaît ?","Can I taste it please?"],
  ["Je dois changer de l'argent","I have to exchange money"],["Quelque chose","Something"],
  ["Cuir de veau","Calfskin / Veal leather"],["On est dans l'aéroport","We are in the airport"],
  ["Une machine à faire de la glace","An ice machine"],["Tu veux un ?","You want one?"],
  ["Non ça va !","No, it's fine!"],["Je vais goûter un peu le tien","I'll taste a little of yours"],
  ["J'ai étudié le français à l'école mais j'ai tout oublié","I studied French at school but I forgot everything"],
  ["Regarde, un oiseau vole près de l'eau","Look, a bird is flying near the water"],
  ["C'est trop petit ou c'est très ambitieux","It's too small or it's very ambitious"],
  ["À côté de","Next to / Beside"],["Entre","Between"],
  ["Je pense que nous allons prendre le car","I think we are going to take the bus/coach"],
  ["Une chambre qui donne sur la mer","A room that looks out over the sea"],
  ["Plus cher","More expensive"],["Le supplément est dix euros","The surcharge is ten euros"],
  ["Plutôt sur la terrasse si c'est possible","Rather on the terrace if it is possible"],
  ["Vous êtes d'où ?","Where are you from?"],["Nous sommes d'Écosse","We are from Scotland"],
  ["Qu'est-ce que tu fais pour le travail ?","What do you do for work?"],
  ["J'en sais rien","I have no idea"],["Aucune idée","No idea"],
  ["En train de + verb","In the middle of / Currently doing"],
  ["J'apprends le français depuis un mois","I've been learning French for a month"],
  ["J'ai passé la moitié de l'examen","I took half the exam"],
  ["Qu'est-ce qu'on peut faire ?","What can we do?"],
  ["Avez-vous déjà un plan de la ville ?","Do you already have a map of the city?"],
  ["On a besoin de","We need / We have need of"],
  ["On peut faire beaucoup de promenades","We can take a lot of walks"],
  ["Je pense que c'est ouvert","I think it's open"],["J'ai besoin de me concentrer","I need to focus"],
  ["Avant de dormir","Before sleeping"],["N'oublie jamais","Never forget"],
  ["Pas encore","Not yet"],["Alors chaque nuit","So each night"],
  ["Avoir de la chance","To be lucky"],
  ["Vous cherchez quelque chose de particulier ?","Are you looking for anything in particular?"],
  ["Non, on regarde juste","No, we're just looking"],
  ["Est-ce que mon ami peut essayer ces chaussures ?","Can my friend try on these shoes?"],
  ["La pointure","The shoe size"],["C'est pas grave","It's not a problem / No worries"],
  ["Celui-là","That one"],["À la semaine prochaine !","See you next week!"],
  ["À la prochaine fois !","Until next time!"],["Se demander","To wonder"],
  ["Je me demande si c'est ouvert le dimanche","I wonder if it's open on Sunday"],
  ["S'il y avait","If there was"],["Tout droit","Straight ahead"],["Au cas où","Just in case"],
  ["Je ne me sens pas bien","I do not feel well"],
  ["Dehors, tout peut arriver !","Outside, anything can happen!"],
  ["Nous riions tous","We were all laughing"],
  ["Nous habitons ici depuis trois ans","We have been living here for three years"],
  ["Je fais beaucoup de fautes","I make a lot of mistakes"],["Presque","Nearly / Almost"],
  ["J'ai presque tout oublié","I almost forgot everything"],
  ["Vous avez quel âge ?","How old are you?"],["Toujours","Always"],["Pendant","During"],
  ["Où","Where"],["Enfance","Childhood"],["Une verre de vin rouge","A glass of red wine"],
  ["Je le vois","I see him"],["Je la vois","I see her"],["Tout est bon !","Everything is good"],
  ["Je vous en prie","You're welcome"],["Voulez-vous attendre ?","Do you want to wait?"],
  ["Vitraux","Stained glass windows"],["On peut manger ici ?","Can we eat here?"],
  ["Quelquefois","Sometimes"],["Chambre","Bedroom"],["Fois","Times"],
  ["Même","Same / Even"],["Parfait","Perfect"],["Prendre des notes","To take notes"],
  ["Donc","So / Therefore"],["D'où viens-tu ?","Where are you from?"],
  ["Plus lentement","More slowly"],["Je viens de...","I come from..."],
  ["Où se trouve la piscine ?","Where is the swimming pool?"],["Parce que","Because"],
  ["Loisirs","Hobbies"],["Jamais","Never"],["Demain","Tomorrow"],
  ["Chaque fois","Every time"],["Partout","Everywhere"],["Gauche","Left"],
  ["Droite","Right"],["Devant","In front of"],["Derrière","Behind"],
  ["Jardiner","To garden"],["Plantes","Plants"],["Arbres","Trees"],
  ["Merci pour votre enregistrement, bravo !","Thank you for recording, well done!"],
  ["Meilleur(e)","Best"],["Je ne parle pas très bien français","I don't speak French very well"],
  ["Combien","How many"],["Pour la plupart","For the most part"],["Plupart","Most"],
  ["Oiseaux","Birds"],["Quelle ville ou quel parc ?","What city or what park?"],
  ["Peinture","Painting"],["Le tableau","The painting"],["Ferais","I would do"],
  ["On dirait qu'il neige","It looks like it is snowing"],["L'homme est mort","The man is dead"],
  ["Il y a beaucoup de chiens","There are a lot of dogs"],
  ["Il y a un tas de chiens","There are a bunch of dogs"],
  ["C'est le matin, car tout le monde a un parapluie et n'en a pas laissé à l'école ou au travail","It is morning because everyone has an umbrella and didn't leave one at school or work"],
  ["Pull","Sweater"],["Poulet","Chicken (general / meat)"],["Poule","Hen / Chicken"],
  ["Quand","When"],["Depuis","Since"]
];

function seedIfNeeded() {
  if (DB.isSeeded()) return;
  const base = Date.now() - SEED_PHRASES.length * 1000;
  SEED_PHRASES.forEach((p, i) => {
    const phrase = { id: (base + i).toString(), dateAdded: new Date(base + i * 1000).toISOString(), studyCount: 0, lastStudied: null, french: p[0], english: p[1], notes: '', categoryId: null };
    const phrases = DB.getPhrases();
    phrases.push(phrase);
    DB.savePhrases(phrases);
  });
  DB.markSeeded();
}
