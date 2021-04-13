$(function(){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'db/projet_reservation_hotel.db', true);
	xhr.responseType = 'arraybuffer';
	var errorsArea = $("#errors");
	var tableArea = $("#table");
	
	var hotelsArea = $("#hotels-table-content");
	var chambresArea = $("#chambres-table-content");
	var reservationsArea = $("#reservations-table-content");
	var villesArea = $("#villes");
	
	var formAjoutHotel = $("#formAjoutHotel");
	var formChambre = $("#formChambre");
	var formReservation = $("#formReservation");

	var modalAjoutHotel = $("#AjouterHotelModal");
	var modalChambre = $("#chambreModal");
	var modalReservation = $("#reservationModal");

	xhr.onload = function(e) {
		var uInt8Array = new Uint8Array(this.response);
		var db = new SQL.Database(uInt8Array);
		

		//
		//var tasks = db.exec("SELECT * FROM tasks WHERE user_id=1")

		// $("#results").html(contents);
		function getHotelList() {
			return db.exec("SELECT * FROM hotel");
		}

		function getVillesList() {
			return db.exec("SELECT DISTINCT ville FROM hotel");
		}

		function getChambresList() {
			return db.exec("SELECT chambre.id_chambre, chambre.capacite, chambre.tarif, hotel.nom FROM chambre JOIN hotel WHERE hotel.id_hotel = chambre.id_hotel");
		}

		function getReservationList() {
			return db.exec("SELECT reservation.id_reservation, reservation.date_arrivee, reservation.date_depart, reservation.id_chambre, hotel.id_hotel, formule.libelle, client.nom FROM reservation, hotel, formule, client  WHERE reservation.id_hotel=hotel.id_hotel AND reservation.id_formule=formule.id_formule AND reservation.id_client = client.id_client");
		}

		try {
			afficheVille(getVillesList());
			afficheHotels(getHotelList()[0].values);
			afficheChambre(getChambresList()[0].values);
			afficheReservations(getReservationList()[0].values);
			// remplir les selects 
			// remplirFormulaire();
			
			// Ajouter un nouveau hotel
			formAjoutHotel.submit(function( event ) {
				event.preventDefault();
				var hotelNom = $("#hotelNom").val();
				var hotelVille = $("#hotelVille").val();
				var hotelEtoile = $("#hotelEtoiles").val();

				//db.run("INSERT INTO hotel VALUES (id_hotel,nom,ville)", [hotelNom, hotelVille, hotelEtoile]);
				db.run("INSERT INTO hotel VALUES (?,?,?,?)", [, hotelNom, hotelVille, hotelEtoile]);
				//ajouterHotel(hotelNom, hotelVille, hotelEtoile);
				// db.export();
				$(this)[0].reset();
				// this.form.reset();
				modalAjoutHotel.modal('hide')
				afficheVille(getVillesList());
				afficheHotels(getHotelList()[0].values);
			});


			// Ajouter / Modifier chambre
			formChambre.submit(function( event ) {
				event.preventDefault();
				var confort = 1;
				var capacite = $("#chambreCapacite").val();
				var tarif = $("#chambreTarif").val();
				var hotel = $("#chambreHotel").val();
				
				db.run("INSERT INTO chambre VALUES (?,?,?,?,?)", [, confort, capacite, tarif, hotel]);
				//ajouterHotel(hotelNom, hotelVille, hotelEtoile);
				// db.export();
				$(this)[0].reset();
				// this.form.reset();
				modalChambre.modal('hide')
				afficheVille(getVillesList());
				afficheHotels(getHotelList()[0].values);
			});


			// reservation
			formReservation.submit(function() {
				event.preventDefault();
				var reservationArrivee = $("#reservationArrive").val();
				var reservationDepart = $("#reservationDepart").val();
				var reservationHotel = $("#reservationHotel").val();
				var reservationChambre = $("#reservationChambre").val();
				var reservationFormule = $("#reservationFormule").val();
				var reservationClient = $("#reservationClient").val();
				var nouveauClientId;
				
				if(!reservationClient) {
					var nomClient = $("#nomClient");
					var prenomClient = $("#prenomClient");
					var telClient = $("#telClient");

					db.run("INSERT INTO client VALUES (?,?,?,?)", [, nomClient, prenomClient, telClient]);
					nouveauClientId = db.exec("SELECT count(*) FROM CLIENT")[0].values[0];
					reservationClient = nouveauClientId;
				}
				
				db.run("INSERT INTO reservation VALUES (?,?,?,?,?,?,?)", [, reservationArrivee, reservationDepart, reservationChambre, reservationHotel, reservationFormule, reservationClient]);
				$(this)[0].reset();
				modalReservation.modal('hide')
				afficheReservations(getReservationList()[0].values);
			});


			// Filtrer par ville
			villesArea.find("button").click(function() {
				var filtreValeur = $(this).text();
				afficheHotels(getHotels(filtreValeur));
			});

			// Actions
			chambresArea.on("click", ".modifier-chambre", function() {
				var chambreId = $(this).data("chambre-id");
				
				setModal(modalChambre, "Modifier chambre", "Modifier", "update", chambreId)
				// db.exec(`DELETE FROM chambre WHERE id_chambre ="${chambreId}"`);
				afficheChambre(getChambresList()[0].values);
				setFormulaireChambre(chambreId);
			});

			chambresArea.on("click", ".supprimer-chambre", function() {
				var chambreId = $(this).data("chambre-id");
				
				db.exec(`DELETE FROM chambre WHERE id_chambre ="${chambreId}"`);
				afficheChambre(getChambresList()[0].values);
			});

			reservationsArea.on("click", ".supprimer-reservation", function() {
				var reservationId = $(this).data("reservation-id");
				
				db.exec(`DELETE FROM reservation WHERE id_reservation ="${reservationId}"`);
				afficheReservations(getReservationList()[0].values);
			});
			

			
			function afficheVille(villes) {
				var villeValues = villes[0].values
				var html = "<ul class='villes d-flex flex-wrap list-unstyled'>";
				for (var i = 0; i < villeValues.length; i++) {
					html += "<li class='mx-1 my-1'><button data-id class='btn btn-outline-light'>" + villeValues[i] + "</button></li>";
				}
				html += "</ul>";
				villesArea.html(html);
			}
			
			function afficheHotels(hotelValues) {
				var html = "";
				for (var i = 0; i < hotelValues.length; i++) {
					var hotel = hotelValues[i];
					html += `<tr data-hotel-id="${hotel[0]}">`;
					for (var j = 0; j < hotel.length; j++) {
						html += "<td>" + hotel[j] + "</td>";
					}
					html += "</tr>";
				}
				html += "";
				hotelsArea.html(html);
			}
	
			function afficheChambre(chambreValues) {
				
				var html = "";
				for (var i = 0; i < chambreValues.length; i++) {
					var chambre = chambreValues[i];
					html += `<tr data-chambre-id="${chambre[0]}">`;
					for (var j = 0; j < chambre.length; j++) {
						html += "<td>" + chambre[j] + "</td>";
					}
					html += "<td>";
					html += `<button class="btn supprimer-chambre" data-chambre-id="${chambre[0]}">Supprimer</button>`;
					html += "</td>"
					html += "</tr>";
				}
				html += "";
				chambresArea.html(html);
			}
	
			function afficheReservations(reservationValues) {
				
				var html = "";
				for (var i = 0; i < reservationValues.length; i++) {
					var reservation = reservationValues[i];
					html += `<tr data-chambre-id="${reservation[0]}">`;
					for (var j = 0; j < reservation.length; j++) {
						html += "<td>" + reservation[j] + "</td>";
					}
					html += "<td>";
					html += `<button class="btn supprimer-reservation" data-reservation-id="${reservation[0]}">Supprimer</button>`;
					html += "</td>"
					html += "</tr>";
				}
				html += "";
				reservationsArea.html(html);
			}
		
	
			function getHotels(ville) {
				var stmt = db.prepare("SELECT * FROM hotel WHERE ville=$villechoisie");
				stmt.getAsObject({$villechoisie:ville});
		  
				stmt.bind({$villechoisie:ville});
				var results = [];
				while(stmt.step()) { //
					results.push(stmt.get());
				}
	
				return results;
			}
	
			function getChambres(idHotel) {
				
				var stmt = db.prepare("SELECT * FROM chambre WHERE chambre.id_hotel=$hotelchoisi");
				stmt.getAsObject({$hotelchoisi:idHotel});
		  
				stmt.bind({$hotelchoisi:idHotel});
				var results = [];
				while(stmt.step()) { //
					results.push(stmt.get());
				}
	
				return results;
			}
	
			function getChambre(idChambre) {
				var stmt = db.prepare("SELECT * FROM chambre WHERE id_chambre=$idchambre");
				result = stmt.getAsObject({$idchambre:idChambre});
	
				return result;
			}
	
	
			function getReservation(idChambre) {
				var stmt = db.prepare("SELECT * FROM reservation WHERE id_chambre=$idchambre");
				result = stmt.getAsObject({$idchambre:idChambre});
	
				return result;
			}
	
	
			// actions	
			function setModal(modal, title, buttonText, action, id) {
				modal.find(".modal-title").text(title);
				modal.find("form").data("action", action);
				modal.find("form").data("update", id);
				modal.find("#actionChambre").text(buttonText);
				modal.modal('show')
			}
	
			function setFormulaireChambre(idChambre) {
				chambre = getChambre(idChambre);
				modalChambre.find("form").data("action","update").data("update",idChambre);
				
				$("#chambreConfort").val(chambre.id_chambre);
				$("#chambreCapacite").val(chambre.capacite);
				$("#chambreTarif").val(chambre.tarif);
				$("#chambreHotel").find(`option[value=${chambre.id_hotel}]`).attr('selected', true);
				afficheChambre(getChambresList()[0].values);
			}
	
		} catch (error) {
			//displayError(error);
			console.log(error);
			alert(error);
		}
	};
	xhr.send();
});