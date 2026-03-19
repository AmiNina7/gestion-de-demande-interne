
let demandes  = JSON.parse(localStorage.getItem('demandes') || '[]');
let idCourant = null; // null = ajout, sinon = modification

const STATUTS = {
  en_attente: { label: 'En attente', cls: 'b-attente' },
  en_cours:   { label: 'En cours',   cls: 'b-cours'   },
  traite:     { label: 'Traité',     cls: 'b-traite'  },
  rejete:     { label: 'Rejeté',     cls: 'b-rejete'  },
};


function sauver() {
  localStorage.setItem('demandes', JSON.stringify(demandes));
}


function formatDate(d) {
  if (!d) return '';
  const [y, m, j] = d.split('-');
  return j + '/' + m + '/' + y;
}


function majStats() {
  const c = { en_attente:0, en_cours:0, traite:0, rejete:0 };
  demandes.forEach(d => c[d.statut]++);
  document.getElementById('total').textContent      = demandes.length;
  document.getElementById('nb-attente').textContent = c.en_attente;
  document.getElementById('nb-cours').textContent   = c.en_cours;
  document.getElementById('nb-traite').textContent  = c.traite;
  document.getElementById('nb-rejete').textContent  = c.rejete;
}


function afficher() {
  const q    = document.getElementById('recherche').value.toLowerCase();
  const dept = document.getElementById('fil-dept').value;
  const stat = document.getElementById('fil-statut').value;

  let liste = demandes.filter(d => {
    const texte = (d.nom + d.dept + d.desc).toLowerCase();
    return (!q || texte.includes(q))
        && (!dept || d.dept === dept)
        && (!stat || d.statut === stat);
  });

  const tbody = document.getElementById('tbody');

  if (liste.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="vide">Aucune demande pour l\'instant.</td></tr>';
    return;
  }

  tbody.innerHTML = liste.map(d => {
    const s    = STATUTS[d.statut] || STATUTS.en_attente;
    const desc = d.desc.length > 50 ? d.desc.slice(0, 50) + '...' : d.desc;
    return `<tr>
      <td><strong>${d.nom}</strong></td>
      <td>${d.dept}</td>
      <td class="desc-courte">${desc}</td>
      <td>${formatDate(d.date)}</td>
      <td><span class="badge ${s.cls}">${s.label}</span></td>
      <td>
        <button class="btn-modifier" onclick="openModifier(${d.id})">Modifier</button>
        <button class="btn-suppr"    onclick="supprimer(${d.id})">Supprimer</button>
      </td>
    </tr>`;
  }).join('');
}

// Ouvrir le modal en mode AJOUT
function openModal() {
  idCourant = null;
  document.getElementById('modal-titre').textContent    = 'Nouvelle demande';
  document.getElementById('btn-submit').textContent     = 'Ajouter';
  document.getElementById('f-nom').value                = '';
  document.getElementById('f-dept').value               = '';
  document.getElementById('f-desc').value               = '';
  document.getElementById('f-date').valueAsDate         = new Date();
  document.getElementById('f-statut').value             = 'en_attente';
  document.getElementById('modal').style.display        = 'flex';
}

// Ouvrir le modal en mode MODIFICATION
function openModifier(id) {
  const d = demandes.find(x => x.id === id);
  if (!d) return;
  idCourant = id;
  document.getElementById('modal-titre').textContent    = 'Modifier la demande';
  document.getElementById('btn-submit').textContent     = 'Enregistrer';
  document.getElementById('f-nom').value                = d.nom;
  document.getElementById('f-dept').value               = d.dept;
  document.getElementById('f-desc').value               = d.desc;
  document.getElementById('f-date').value               = d.date;
  document.getElementById('f-statut').value             = d.statut;
  document.getElementById('modal').style.display        = 'flex';
}

// Fermer le modal
function closeModal() {
  document.getElementById('modal').style.display = 'none';
  idCourant = null;
}

// Soumettre le formulaire (ajout ou modification)
function soumettre() {
  const nom  = document.getElementById('f-nom').value.trim();
  const dept = document.getElementById('f-dept').value;
  const desc = document.getElementById('f-desc').value.trim();
  const date = document.getElementById('f-date').value;
  const stat = document.getElementById('f-statut').value;

  if (!nom || !dept || !desc || !date) {
    alert('Veuillez remplir tous les champs obligatoires.');
    return;
  }

  if (idCourant === null) {
    // AJOUT
    demandes.unshift({ id: Date.now(), nom, dept, desc, date, statut: stat });
  } else {
    // MODIFICATION
    const d = demandes.find(x => x.id === idCourant);
    d.nom    = nom;
    d.dept   = dept;
    d.desc   = desc;
    d.date   = date;
    d.statut = stat;
  }

  sauver();
  majStats();
  afficher();
  closeModal();
}

// Supprimer une demande
function supprimer(id) {
  if (!confirm('Voulez-vous vraiment supprimer cette demande ?')) return;
  demandes = demandes.filter(d => d.id !== id);
  sauver();
  majStats();
  afficher();
}


majStats();
afficher();