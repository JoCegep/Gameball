import { getAuth, onAuthStateChanged, signOut } from
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getFirestore, doc, getDoc, updateDoc } from
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { app } from "./base.js"; // app initialisee
import { getUserData } from "./Auth.js";

// logique acces a utilisateur connecte
const auth = getAuth(app);
const db = getFirestore(app);
const btnLogout = document.getElementById("logoutIcon");
const btnCompte = document.getElementById("compteIcon");
const btnMix = document.getElementById("btnMix");

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        btnCompte.classList.add("invisible");
        return;
    };

    currentUser = user;
    btnCompte.classList.remove("invisible");
    // afficher le nom utilisateur
    document.getElementById("pseudo").innerText = user.displayName;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();

    if (snap.exists()) {
        const data = snap.data();
        // afficher le score utilisateur
        essais.innerText = data.bestAttempts ?? "None";
        tempsRecord.innerText = data.bestTime ?? "None";
    }
});

// toast icon
const toastEl = document.getElementById("loginToast");
const loginToast = new bootstrap.Toast(toastEl);


setTimeout(async () => {
    if (!currentUser) {
        setTimeout(() => {
            loginToast.show();
        }, 100);

        // auto-hide after a few seconds
        // setTimeout(() => {
        //     loginToast.hide();
        // }, 6000);
    } else {
        loginToast.hide();
    }
}, 2000);

async function saveScore(attempts, time) {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();

    const updates = {};

    // Best attempts (lower is better)
    if (data.bestAttempts === null || attempts < data.bestAttempts) {
        updates.bestAttempts = attempts;
    }

    // Best time (convert to seconds)
    if (
        data.bestTime === null ||
        convertirTempsSecondes(time) < convertirTempsSecondes(data.bestTime)
    ) {
        updates.bestTime = time;
    }

    if (Object.keys(updates).length > 0) {
        await updateDoc(ref, updates);
    }
}

// deconnexion
btnLogout.addEventListener("click", async () => {
    try {
        await signOut(auth);
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

const containerCartes = document.getElementById("container-cartes");
const nbEssais = document.getElementById("nbEssais");
const nbTemps = document.getElementById("temps");
const winModalEl = document.getElementById("winModal");
const essaisSuccess = document.getElementById("essaisSuccess");
const tempsSuccess = document.getElementById("tempsSucess");
const pseudo = document.getElementById("pseudo");
const essais = document.getElementById("essais");
const tempsRecord = document.getElementById("temps-record");

let cartes = [["img/cartes/rotationsTxt/1.png", "p1"],
    ["img/cartes/p1.png", "p1"],
    ["img/cartes/rotationsTxt/2.png", "p2"],
    ["img/cartes/p2.png", "p2"],
    ["img/cartes/rotationsTxt/3.png", "p3"],
    ["img/cartes/p3.png", "p3"],
    ["img/cartes/rotationsTxt/4.png", "p4"],
    ["img/cartes/p4.png", "p4"],
    ["img/cartes/rotationsTxt/5.png", "p5"],
    ["img/cartes/p5.png", "p5"],
    ["img/cartes/rotationsTxt/6.png", "p6"],
    ["img/cartes/p6.png", "p6"]];

let utilisateurConnecte = JSON.parse(localStorage.getItem("utilisateurActuel"));
let pairesDevinees = 0;
let lstCartes = [];

async function updateScoreUtilisateur(utilisateur){
    try {
        const response = await fetch(`https://693652e4f8dc350aff30789a.mockapi.io/jeu/utilisateurs/${utilisateur.id}`, {
            method: "PUT", // put pcq mockapi ne supporte pas patch
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(utilisateur)
        });

        if (!response.ok) {
            console.error("Erreur HTTP: ", response.status);
            return null;
        }
        console.log("Score utilisateur modifié: ", utilisateur);
    } catch (error) {
        console.error("Erreur: ", error);
        return null;
    }
}

function convertirTempsSecondes(temps){
    const [minutes, seconds] = temps.split(':');
    const secondes = (+minutes) * 60 + (+seconds);

    return secondes;
}

// controle de pouvoir cliquer carte ou non
let clickable = true;

for (let i = 0; i < cartes.length; i++) {
    // Creation de cartes differentes avec images
    /*
    old card version

    const carteBaseImg = document.createElement("p");
    carteBaseImg.setAttribute("face", "hidden");
    carteBaseImg.id = `carteBase`
    carteBaseImg.innerText = "❓";
     */
    let carteBaseImg = new Image();
    carteBaseImg.setAttribute("face", "hidden");
    carteBaseImg.id = `carteBase`
    carteBaseImg.src = "img/monke.png"
    carteBaseImg.style.height = "15"
    carteBaseImg.style.width = "15"



    let carteValeurImg = new Image();
    carteValeurImg.id = `carteValeur`
    carteValeurImg.setAttribute("face", "shown");
    carteValeurImg.setAttribute("valeur", cartes[i][1]);
    carteValeurImg.src = cartes[i][0];
    carteValeurImg.classList.add("invisible");

    let carteImg = document.createElement("div");
    carteImg.append(carteBaseImg, carteValeurImg);
    carteImg.baseImg = carteBaseImg;
    carteImg.valeurImg = carteValeurImg;
    carteImg.dataset.valeurCarte = cartes[i][1];
    carteImg.setAttribute("face", "hidden");

    // carteImg.addEventListener("click", () => {
    //     if (document.body.style.pointerEvents === 'none') {
    //         return; // ADD THIS CHECK - don't allow toggling during comparison
    //     }
    //     if (cartesComparees.length >= 2) {
    //         carteImg.style.pointerEvents = "none";
    //     }
    //     else{
    //         carteBaseImg.classList.toggle("invisible");
    //         carteValeurImg.classList.toggle("invisible");
    //     }
    // })

    // Ajout de cartes dans le container
    lstCartes.push(carteImg);

    // logique du jeu
    carteImg.addEventListener("click", async function () {
        if (carteImg.getAttribute("face") === "shown") {
            return;
        }

        if (!clickable) {
            return;
        }

        if (document.body.style.pointerEvents === 'none') {
            return; // ADD THIS CHECK HERE TOO
        }
        if (!tempStart) {
            compterTemps();
            tempStart = true;
        }

        carteBaseImg.classList.toggle("invisible");
        carteValeurImg.classList.toggle("invisible");
        carteImg.setAttribute("face", "shown");

        if (cartesComparees.length < 1) {
            cartesComparees.push(carteImg);
        } else if (cartesComparees.length === 1) {
            clickable = false;
            cartesComparees.push(carteImg);
            document.body.style.pointerEvents = 'none'; // desactiver clicks de tous
            cartesComparees[1].style.pointerEvents = "none"; // desactiver 2e carte, empecher d etre recliquee
            let vCarte1 = cartesComparees[0].dataset.valeurCarte;
            let vCarte2 = cartesComparees[1].dataset.valeurCarte;
            if (vCarte1 === vCarte2) {
                if (true) // if user has premium
                {
                    shuffleCardsPremium();
                }

                cartesComparees[0].style.pointerEvents = "none";
                cartesComparees[1].style.pointerEvents = "none";
                cartesComparees = []
                nbEssaisVal++;
                pairesDevinees++;
                document.body.style.pointerEvents = 'auto'; // ADD THIS LINE
                clickable = true;
                if (pairesDevinees === 6) {
                    // ecran succes
                    essaisSuccess.innerText = `${nbEssaisVal}`;
                    tempsSuccess.innerText = `${nbTemps.innerText}`;

                    const winModal = bootstrap.Modal.getOrCreateInstance(winModalEl);
                    winModal.show();

                    //logique firestore
                    try {
                    await saveScore(nbEssaisVal, nbTemps.innerText);
                    } catch (e) {
                        console.warn("Score not saved:", e);
                    }

                    // sauvegarder score joueur localement
                    // sauvegarder slm lorsque superieur a l ancient score

                    /*
                    Logique sauvegarde utilisateur avec mockapi

                    if (utilisateurConnecte.recordVbMemoire != null) {
                        if (utilisateurConnecte.recordVbMemoire > nbEssaisVal) {
                            utilisateurConnecte.recordVbMemoire = nbEssaisVal;
                        }
                    } else {
                        utilisateurConnecte.recordVbMemoire = nbEssaisVal;
                    }

                    // eux verifier le temps
                    if (utilisateurConnecte.tempsrecordVbMemoire != null) {
                        if (convertirTempsSecondes(utilisateurConnecte.tempsrecordVbMemoire) > convertirTempsSecondes(nbTemps.innerText)) {
                            utilisateurConnecte.tempsrecordVbMemoire = nbTemps.innerText;
                        }
                    } else {
                        utilisateurConnecte.tempsrecordVbMemoire = nbTemps.innerText;
                    }

                    localStorage.setItem("utilisateurActuel", JSON.stringify(utilisateurConnecte));

                    // sauvegarder score joueur dans l api
                    let success = updateScoreUtilisateur(utilisateurConnecte);
                    */
                }
            } else {
                //document.body.style.pointerEvents = 'none'; // fix tire du ai overview de google
                nbEssaisVal++;
                setTimeout(() => {
                    carteBaseImg.classList.toggle("invisible");
                    carteValeurImg.classList.toggle("invisible");
                    carteImg.setAttribute("face", "hidden");
                    cartesComparees[0].querySelector("#carteValeur").classList.toggle("invisible");
                    cartesComparees[0].querySelector("#carteBase").classList.toggle("invisible");
                    cartesComparees[0].setAttribute("face", "hidden");
                    // RE-ENABLE pointer events for both cards - THIS WAS MISSING!
                    carteImg.style.pointerEvents = "auto";  // current card (2nd card)
                    cartesComparees[0].style.pointerEvents = "auto";  // first card
                    cartesComparees = []
                    document.body.style.pointerEvents = 'auto';
                    clickable = true;
                }, 3000)
            }
        }
        nbEssais.innerText = nbEssaisVal;
    })
}
let tempStart = false;
let nbEssaisVal = 0;
let cartesComparees = []

// extra modes logic
function showPaywall(){

}

function decrementFreeUse(uid){

}

function startExtraMode(){

}

function canAccessExtraModes(userData) {
    if (!userData) return false;

    if (userData.hasPremium) return true;

    return userData.freeGames > 0;
}

async function onExtraModeClick() {
    const userData = await getUserData(currentUser.uid);

    if (!canAccessExtraModes(userData)) {
        showPaywall();
        return;
    }

    // Allow access
    if (!userData.hasPremium) {
        await decrementFreeUse(currentUser.uid);
    }

    startExtraMode();
}

btnMix.addEventListener("click", async function () {
    console.log(cartesComparees);
    for (let carte of lstCartes) {
        carte.baseImg.src = "img/monkechaos.png";
    }

    // changer images
    btnLogout.src = "img/log-outchaos.png";
    document.getElementById("accountIcon").src = "img/accountchaos.png";
    document.getElementById("memoryIcon").src = "img/monkechaos.png";

    document.body.classList.add("chaos-theme");
    document
        .getElementById("ShuffleSuccessOverlay")
        .classList.remove("hidden");
    shuffleCardsPremium();
})

document.getElementById("continueShuffleBtn").addEventListener("click", () => {
    document
        .getElementById("ShuffleSuccessOverlay")
        .classList.add("hidden");

    // fermer offcanvas
    let offcanvas = document.getElementById("offCanvasJeu")

    let bsoffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);

    bsoffcanvas.hide()
})

function shuffleCardsPremium() {
    const cards = Array.from(containerCartes.children);

    // FIRST
    const firstRects = cards.map(card => card.getBoundingClientRect());

    // SHUFFLE DOM
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        containerCartes.insertBefore(cards[j], cards[i]);
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    // LAST
    const lastRects = cards.map(card => card.getBoundingClientRect());

    // INVERT
    cards.forEach((card, i) => {
        const dx = firstRects[i].left - lastRects[i].left;
        const dy = firstRects[i].top - lastRects[i].top;

        card.style.transition = "none";
        card.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    // PLAY (next frame)
    requestAnimationFrame(() => {
        cards.forEach(card => {
            card.style.transition = "transform 350ms ease";
            card.style.transform = "";
        });
    });
}

function afficherUser(){
    if (utilisateurConnecte != null){
        pseudo.innerText = currentUser.displayName;
        if (currentUser.recordVbMemoire != null){
            essais.innerText = `${utilisateurConnecte.recordVbMemoire}`;
        }
        if (utilisateurConnecte.tempsrecordVbMemoire != null){
            tempsRecord.innerText = `${utilisateurConnecte.tempsrecordVbMemoire}`;
        }
    }
}

function compterTemps(){
    let debut = 0;
    setInterval(() => {
        if (pairesDevinees < 6) {
            let tempsPasse = ++debut;
            // Solution fortement inspiree du AI overview du a longue recherche, mais condensee a mon gout
            const minutesFormatees = String(Math.floor(tempsPasse / 60)).padStart(2, "0");
            const secondesFormatees = String(tempsPasse % 60).padStart(2, "0");
            // avait deja fait cette partie moi meme
            nbTemps.innerText = `${minutesFormatees}:${secondesFormatees}`;
        }

    }, 1000)
}

// Mélanger les cartes (méthode Fisher–Yates)
function melanger(tab) {
    for (let i = tab.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // indice aléatoire entre 0 et i
        [tab[i], tab[j]] = [tab[j], tab[i]]; // échange
    }
    return tab;
}

//afficherUser();
melanger(lstCartes);

for (const carte of lstCartes){
    containerCartes.append(carte);
}
