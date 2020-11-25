// MILESTONE 1
// Creare un layout di base con una barra di ricerca composta da un input e un pulsante.
// Quando l'utente clicca sul pulsante, facciamo una chiamata all'API
// https://api.themoviedb.org/3/search/movie
//ricordandoci di passare la nostra API key e la query di ricerca,
// ossia il testo inserito dall'utente nell'input.

// api_key: 9288442951ff78eee0e3f39d2a7b597e

// Con i risultati che riceviamo, visualizziamo in pagina una card per ogni film,
// stampando per ciascuno:
// titolo
// titolo in lingua originale
// lingua originale
// voto

// MILESTONE 2
// La seconda milestone è a sua volta suddivisa in 3 punti:

// 1- sostituire il voto numerico su base 10 in un voto su base 5
// e visualizzare in totale 5 stelline, di cui tante piene quanto è il voto arrotondato
// (non gestiamo stelline a metà).
// Ad esempio, se il voto è 8.2, dobbiamo visualizzare 4 stelline piene
// e 1 stellina vuota (in totale sempre 5)

// 2- sostituire la lingua con una bandierina che identifica il paese.
// Suggerimento: scarichiamo una manciata di bandierine relative alle lingue che vogliamo gestire
// (attenzione che la lingua è "en", non "us" o "uk" :wink: ).
// Quindi andremo ad inserire solamente le bandierine che sappiamo di avere,
// mentre per le altre lingue di cui non abbiamo previsto la bandierina,
// lasciamo il codice della lingua testuale


// 3- aggiungere ai risultati anche le serie tv.
// Attenzione che alcune chiavi per le serie tv sono diverse da quelle dei film,
// come ad esempio "title" per i film e "name" per le serie

var app = new Vue({
    el:"#root",

    data:{
        search: "",
        text_searched: "",

        // Array dei risultati movie
        movies_array: [],
        // Array dei risultati dei TV show
        tv_array: [],
        // Array dei risultati totali
        total_array: [],

        isSearching: false,

        flags: ['cn', 'de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'no', 'ru'],
        api_key: "9288442951ff78eee0e3f39d2a7b597e",
        db_root_path: "https://api.themoviedb.org/3/search/"
    },

    methods:{

        search_movie(){

            if(this.search.trim()){

                this.isSearching = true;
                this.text_searched = this.search;

                // Get per recuperare la lista dei film
                axios.get((this.db_root_path + "movie") , {
                    params: {
                        api_key: this.api_key,
                        query: this.text_searched
                    }}
                ).then((searched_movie) =>{
                    this.movies_array = (searched_movie.data.results);
                });

                // Get per recuperare la lista dei tv show
                axios.get((this.db_root_path + "tv") , {
                    params: {
                        api_key:  this.api_key,
                        query: this.text_searched
                    }}
                ).then((searched_tv_show) =>{
                    this.tv_array = (searched_tv_show.data.results);
                    // Concateno i due array dei risultati dei film e tv shows
                    this.total_array = this.movies_array.concat(this.tv_array);
                    this.isSearching = false;
                    this.search = "";

                });
            }
        },

        get_score(score){
            // TRasformo la stringa in numero con la virgola, divido per due e arrotondo
            let int = Math.round(parseFloat(score)/2);
            return int;
        }

    }

})
