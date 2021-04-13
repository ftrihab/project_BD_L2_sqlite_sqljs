$(function(){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'db/projet_reservation_hotel.db', true);
    xhr.responseType = 'arraybuffer';
    
    var views1 = $("#views1");
    var views2 = $("#views2");
    var views3 = $("#views3");
    var views4 = $("#views4");
    



	xhr.onload = function(e) {
		var uInt8Array = new Uint8Array(this.response);
		var db = new SQL.Database(uInt8Array);
        

        try {
            viewTopHotels = db.exec("SELECT * FROM top_10_hotel_5etoiles");
            viewClientsOntReserveChambre = db.exec("SELECT * FROM clients_ont_reserve_chambre");
            viewListeChambreParConfort = db.exec("SELECT * FROM liste_chambre_par_confort");
            viewListeChambreAvecDateReservation = db.exec("SELECT * FROM liste_chambre_avec_date_reservation");
        
            
            views1.html(generateViews(viewTopHotels[0].columns, viewTopHotels[0].values));
            views2.html(generateViews(viewClientsOntReserveChambre[0].columns, viewClientsOntReserveChambre[0].values));
            views3.html(generateViews(viewListeChambreParConfort[0].columns, viewListeChambreParConfort[0].values));
            views4.html(generateViews(viewListeChambreAvecDateReservation[0].columns, viewListeChambreAvecDateReservation[0].values));
            

        } catch(error) {
            alert(error);
        }

        

        function valconcat(vals, tagName) {
            if (vals.length === 0) return '';

            var open = '<' + tagName + '>', close = '</' + tagName + '>';
            return open + vals.join(close + open) + close;
        }
        
        function generateViews(columns, values) {
            var tbl = document.createElement('table');
            tbl.classList = "table table-light";
            var html = '<thead>' + valconcat(columns, 'th') + '</thead>';
            var rows = values.map(function (v) { return valconcat(v, 'td'); });
            html += '<tbody>' + valconcat(rows, 'tr') + '</tbody>';
            tbl.innerHTML = html;
            return tbl;
        }
	};
	xhr.send();
});