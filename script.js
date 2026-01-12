import { currentUser, userStats } from "./userState.js";

const btnCompte = document.getElementById("btnCompte");
const pseudo = document.getElementById("pseudo");
const essais = document.getElementById("essais");
const tempsRecord = document.getElementById("temps-record");

const container = document.getElementById("container-jeux");
const recherche = document.getElementById("recherche");
const btnMenu = document.getElementById("btnMenu");
// Enleve la logique pour faciliter pour 1 seul jeu
let jeux = ["", "2e jeu plus populaire"];
// let InfosJeu = [
//     // Premiere valeur faite moi meme et demande a chatgpt de me donner d autres valeurs appropriées modifiées par moi
//     ["32%", "1%", "30vw", "img/memoire.png", "memoire.html"],  // Jeu plus populaire (center, largest)
//     ["72%", "5%", "25vw", "path", "blue"],  // 2e jeu plus populaire (top right)
//     // Enleve pour l instant car jeux par encore crees
// /*    ["75%", "60%", "20vw", "path", "blue"],  // 3e jeu plus populaire (bottom right)
//     ["5%", "60%", "17vw", "path", "blue"],  // 4e jeu plus populaire (bottom left)
//     ["15%", "30%", "15vw", "path", "blue"],  // 5e jeu plus populaire (middle left)
//     ["5%", "10%", "13vw", "path", "blue"],   // 6e jeu plus populaire (top left)
//     ["60%", "75%", "10vw", "path", "blue"]   // 7e jeu plus populaire (smallest, mid-right)*/
// ];
//
// btnMenu.addEventListener("click", (e) => {
//     // a definir
// })
// let nb = 0
// for (let jeu in jeux){ // pour tous les jeux existants dans la liste de jeux
//     let iconeJeu = document.createElement("div");
//     iconeJeu.innerText = jeux[jeu]; // a verifier, attribuer le nom du jeu provenant de la liste a la div
//     iconeJeu.classList.add("jeu");  // application du css
//     iconeJeu.style.left = InfosJeu[nb][0]
//     iconeJeu.style.top = InfosJeu[nb][1]
//     iconeJeu.style.height = InfosJeu[nb][2]
//     iconeJeu.style.width = InfosJeu[nb][2]
//     let logo = document.createElement("img");
//     logo.src = InfosJeu[nb][3]
//     logo.alt = "logo";
//     logo.height = 400;
//     logo.width = 400;
//     logo.style.borderRadius = "40%";
//     iconeJeu.appendChild(logo);
//     let lienJeu = document.createElement("a")
//     lienJeu.href = InfosJeu[nb][4];
//     logo.parentNode.insertBefore(lienJeu, logo);
//     lienJeu.appendChild(logo);
//     container.appendChild(iconeJeu);
//     nb ++;
//     // facultatif: si jeu est le plus populaire, ajouter un icone de feu a cote
// }

const register = document.getElementById('container-creation');
const login = document.getElementById('container-connexion');

// au chargement de la page
login.hidden = true;

document.getElementById('registerBtn').addEventListener('change', () => {
    register.hidden = false;
    login.hidden = true;
});

document.getElementById('loginBtn').addEventListener('change', () => {
    login.hidden = false;
    register.hidden = true;
});

// logique btn succes Start
document.getElementById("continueBtn").addEventListener("click", () => {
    document
        .getElementById("loginSuccessOverlay")
        .classList.add("hidden");

    // fermer offcanvas
    let offcanvas = document.getElementById("offcanvasWithBothOptions")

    let bsoffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);

    bsoffcanvas.hide()
});

document.addEventListener("user-logged-in", () => {
    btnCompte.classList.remove("hidden");
    pseudo.innerText = currentUser.displayName;

    essais.innerText = userStats?.bestAttempts ?? "None";
    tempsRecord.innerText = userStats?.bestTime ?? "None";

    // disable login
    btnMenu.classList.add("hidden");
});

document.addEventListener("user-logged-out", () => {
    btnCompte.classList.add("hidden");

    // re enable login
    btnMenu.classList.remove("hidden");
});

import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document
    .getElementById("logoutIcon")
    .addEventListener("click", async () => {
        try {
            await signOut(getAuth());
            console.log("User logged out");

            // Optional but recommended
            //localStorage.removeItem("utilisateurActuel");

            // Redirect or refresh UI
            window.location.href = "index.html";
            //location.reload();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    });
