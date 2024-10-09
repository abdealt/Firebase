// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import "dotenv/config";
import { addDoc, getFirestore, collection, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

    // Ajouter une colonne avec un bouton de suppression
    row.innerHTML = `
      <td>${facture.number}</td>
      <td>${facture.status}</td>
      <td>${factureDate}</td>
      <td><button class="delete-btn" data-id="${facture.id}">Supprimer</button></td>
    `;

    // Ajouter la ligne dans le tableau
    tableBody.appendChild(row);
  });

  // Ajouter des listeners à tous les boutons "Supprimer"
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach(button => {
    button.addEventListener("click", async (event) => {
      const id = event.target.getAttribute("data-id"); // Récupérer l'ID du document
      await deleteFacture(id); // Appeler la fonction de suppression
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
  event.preventDefault();  // Empêcher le rechargement de la page lors de la soumission du formulaire

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
    alert('Veuillez renseigner tous les champs'); // Alerte si les champs ne sont pas remplis
  }
});

// Fonction pour supprimer une facture dans Firestore
async function deleteFacture(id) {
  // Référence au document spécifique à supprimer
  const factureDocRef = doc(db, "factures", id);

  try {
    // Supprimer le document dans Firestore
    await deleteDoc(factureDocRef);
    console.log(`Facture avec l'ID ${id} supprimée`);
  } catch (error) {
    console.error("Erreur lors de la suppression de la facture :", error);
  }
}

// Surveiller les changements dans les factures dès que la page est chargée
window.addEventListener('DOMContentLoaded', monitorFactures);
