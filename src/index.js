// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { addDoc, getFirestore, collection, onSnapshot, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKl7NUdG55aBFHRTi_JUNUV1UAG2pFSnk",
  authDomain: "test-c562e.firebaseapp.com",
  projectId: "test-c562e",
  storageBucket: "test-c562e.appspot.com",
  messagingSenderId: "91911157958",
  appId: "1:91911157958:web:3175238aa007bdbd0abfc7"
};

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fonction pour afficher les factures dans le tableau HTML
function displayFactures(factures) {
  const tableBody = document.querySelector("#facturesTable tbody");
  tableBody.innerHTML = ''; // On vide d'abord le tableau
  
  factures.forEach(facture => {
    const row = document.createElement('tr');

    // Vérification si la facture a une date, sinon afficher "Date non disponible"
    const factureDate = facture.date ? new Date(facture.date.seconds * 1000).toLocaleString() : 'Date non disponible';

    // Ajouter une colonne avec un bouton de modification et suppression
    row.innerHTML = `
      <td><input class="form-control" type="text" id="number-${facture.id}" value="${facture.number}" /></td>
      <td><input class="form-control" type="text" id="status-${facture.id}" value="${facture.status}" /></td>
      <td>${factureDate}</td>
      <td>
        <button class="btn btn-primary edit-btn" data-id="${facture.id}">Modifier</button>
        <button class="btn btn-primary delete-btn" data-id="${facture.id}">Supprimer</button>
      </td>
    `;

    // Ajouter la ligne dans le tableau
    tableBody.appendChild(row);
  });

  // Ajouter des listeners à tous les boutons "Modifier" et "Supprimer"
  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", async (event) => {
      const id = event.target.getAttribute("data-id");
      await deleteFacture(id);
    });
  });

  document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", async (event) => {
      const id = event.target.getAttribute("data-id");
      await editFacture(id);
    });
  });
}

// Fonction pour surveiller les changements en temps réel dans la collection "factures"
function monitorFactures() {
  const facturesCol = collection(db, 'factures');
  
  // Surveiller les changements en temps réel dans la collection "factures"
  onSnapshot(facturesCol, (snapshot) => {
    const factures = [];
    snapshot.docs.forEach((doc) => {
      factures.push({ ...doc.data(), id: doc.id });
    });
    
    // Mettre à jour l'affichage avec les nouvelles données
    displayFactures(factures);
  });
}

// Fonction pour ajouter une nouvelle facture dans Firestore
document.querySelector("#addFacture").addEventListener('submit', async (event) => {
  event.preventDefault();

  const number = document.querySelector('#number').value;
  const status = document.querySelector('#status').value;

  if (number !== "" && status !== "") {
    // Ajouter une nouvelle facture dans la collection "factures"
    await addDoc(collection(db, "factures"), {
      'number': number,
      'status': status,
      'date': serverTimestamp()
    });

    // Réinitialiser les champs du formulaire
    document.querySelector('#number').value = '';
    document.querySelector('#status').value = '';
  } else {
    alert('Veuillez renseigner tous les champs');
  }
});

// Fonction pour supprimer une facture dans Firestore
async function deleteFacture(id) {
  const factureDocRef = doc(db, "factures", id);

  try {
    await deleteDoc(factureDocRef);
    console.log(`Facture avec l'ID ${id} supprimée`);
  } catch (error) {
    console.error("Erreur lors de la suppression de la facture :", error);
  }
}

// Fonction pour modifier une facture dans Firestore
async function editFacture(id) {
  const factureDocRef = doc(db, "factures", id);
  const number = document.querySelector(`#number-${id}`).value;
  const status = document.querySelector(`#status-${id}`).value;

  if (number !== "" && status !== "") {
    await updateDoc(factureDocRef, {
      number: number,
      status: status,
      date: serverTimestamp()
    });

    console.log(`Facture avec l'ID ${id} modifiée`);
  } else {
    console.log("Les champs 'number' et 'status' sont requis.");
  }
}

// Surveiller les changements dans les factures dès que la page est chargée
window.addEventListener('DOMContentLoaded', monitorFactures);
