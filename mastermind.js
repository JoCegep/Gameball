let couleurs = ["red", "green", "blue", "yellow", "purple", "orange", "pink", "cyan", "lime", "turquoise", "brown",
"white"];

for (let i = 0; i < 10; i++) {
    let ligneDevinette = $("<div>");
    for (let j = 0; j < 5; j++) {
        let couleurDevinnette = $("<div>");

        // note: aurait pu tout mettre dans un appel .css()
        couleurDevinnette.css("background-color", "#0b1321");
        couleurDevinnette.css("border-radius", "10px");
        couleurDevinnette.css("display", "flex");
        couleurDevinnette.css("border-style", "dotted");
        couleurDevinnette.css("border-color", "#334155");
        couleurDevinnette.css("height", "40px");
        couleurDevinnette.css("width", "80px");
        couleurDevinnette.css("margin", "5px");
        couleurDevinnette.css("justify-content", "center");
        couleurDevinnette.attr("id", `case${j}`)
        couleurDevinnette.addClass("caseCouleur")

        //TODO: connecter chaque case a une fonction pour afficher la couleur lorsque pressed et btn effacer

        ligneDevinette.append(couleurDevinnette);
    }
    ligneDevinette.css("display", "flex")
    ligneDevinette.css("flexDirection", "row")
    ligneDevinette.css("width", "100%")
    ligneDevinette.attr("id", `ligne${i}`);
    ligneDevinette.addClass("ligneCouleur")

    //TODO: connecter lorsque btn valider pour verifier la ligne et changer de ligne

    $("#gauche").append(ligneDevinette);
}

for (let couleur in couleurs) {
    let choixCouleur = $("<div>");
    choixCouleur.css({
        backgroundColor: couleurs[couleur],
        borderRadius: "50px",
        height: "30px",
        width: "30px",
        display: "block",
        margin: "5px"
    });
    choixCouleur.attr("id", couleurs[couleur])
    $("#couleurs").append(choixCouleur);

    //TODO: connect au boutons pour gerer le comportement lorsque clique afficher dans les carres pr deviner
    choixCouleur.on("click", function () {
        caseSelectionnee.append($(this).clone());

        // desactiver le bouton
        $(this).addClass("desactive")

        if (prochaineCase < 4) {
            prochaineCase++;
            caseSelectionnee = ligneSelectionnee.find(`#case${prochaineCase}`);
        } else if (prochaineCase === 4) {
            prochaineCase++;
            $("#couleurs div").each(function () {
                $(this).addClass("desactive")
            })
        }
        else {
            $("#couleurs div").each(function () {
                $(this).addClass("desactive")
            })
        }

        /*
        else {
            prochaineCase = 0;
            caseSelectionnee = ligneSelectionnee.find(`#case${prochaineCase}`);
            if (prochaineLigne < 9) {
                prochaineLigne++;
                ligneSelectionnee = $(`#ligne${prochaineLigne}`);
                $("#couleurs div").each(function () {
                    $(this).removeClass("desactive")
                })
            } else {
                prochaineLigne = 0;
                ligneSelectionnee = $(`#ligne${prochaineLigne}`);
            }
        }
         */

    })
}

// evenements boutons
$("#btn-effacer").on("click", function () {
    if (prochaineCase >= 1) {
        prochaineCase--;

        if (prochaineCase === 4){
            // todo: if couleur dans les cases laisser disabled sinon re enable
            $("#couleurs div").each(function () {
                $(this).removeClass("desactive")
            })
        }

        caseSelectionnee = ligneSelectionnee.find(`#case${prochaineCase}`);
        let couleurReactivee = caseSelectionnee.children().first()
        $("#couleurs div").each(function () {
            if (couleurReactivee.attr("id") === $(this).attr("id")) {
                $(this).removeClass("desactive")
            }
        })
        caseSelectionnee.empty();
        // todo: reactiver la couleur lorsqu elle est enlevee de la case
    }
})

$("#btn-valider").on("click", function (){
    if (prochaineCase === 5){
        let index = 0

        $(`#ligne${prochaineLigne} div div`).each(function () {
            if ($(this).attr("id") === couleursADevinner[index]){
                $(this).parent().css("border-color", "green")
            } else if (couleursADevinner.includes($(this).attr("id"))){
                $(this).parent().css("border-color", "yellow")
            }
            index++;
        })

        prochaineCase = 0;
        prochaineLigne++;
        ligneSelectionnee = $(`#ligne${prochaineLigne}`);
        caseSelectionnee = ligneSelectionnee.find(`#case${prochaineCase}`);
        $("#couleurs div").each(function () {
            $(this).removeClass("desactive")
        })
    }
})

let prochaineLigne = 0;
let prochaineCase = 0;
let ligneSelectionnee = $(`#ligne${prochaineLigne}`);
let caseSelectionnee = ligneSelectionnee.find(`#case${prochaineCase}`);

let couleursADevinner = []
for (let i = 0; i < 5; i++){
    let couleur = Math.floor(Math.random() * couleurs.length)
    couleursADevinner.push(couleurs[couleur])
    couleurs.splice(couleur, 1)
}