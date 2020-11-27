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
        // Array di tutti i generi di Movies e TV shows
        all_genres: [],

        // id:movie + array text generi + array 5 attori
        additional_infos :[],

        isSearching: false,

        flags: ['cn', 'de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'no', 'ru'],
        api_key: "9288442951ff78eee0e3f39d2a7b597e",
        db_root_path: "https://api.themoviedb.org/3/search/",
        img_root_path:"https://image.tmdb.org/t/p/w342/",
        img_not_found: "./img/not_found.png",

        poster_is_hide: false,
        current_card: false
    },

    methods:{

        search_movie(){

            if(this.search.trim()){

                this.isSearching = true;
                this.text_searched = this.search;

                // Array dei risultati movie
                this.movies_array = [],
                // Array dei risultati dei TV show
                this.tv_array = [],
                // Array dei risultati totali
                this.total_array = [],
                // id:movie + array text generi + array 5 attori
                this.additional_infos = [],

                // Get per recuperare la lista dei film
                axios.get((this.db_root_path + "movie") , {
                    params: {
                        api_key: this.api_key,
                        query: this.text_searched
                    }}
                ).then((searched_movie) =>{
                    this.movies_array = (searched_movie.data.results);
                    // Aggiungo all array finale i risultati dei film
                    this.total_array = this.total_array.concat(this.movies_array);
                });

                // Get per recuperare la lista dei tv show
                axios.get((this.db_root_path + "tv") , {
                    params: {
                        api_key:  this.api_key,
                        query: this.text_searched
                    }}
                ).then((searched_tv_show) =>{
                    this.tv_array = (searched_tv_show.data.results);

                    // Concateno i due array dei risultati dei film e tv shows nell array finale
                    this.total_array = this.total_array.concat(this.tv_array);
                    this.isSearching = false;
                    this.search = "";

                    // Mi creo all'interno di ogni oggetto film due stringhe per visualizzare generi e 5 attori
                    this.total_array.forEach((movie) => {

                        this.additional_infos.push(this.get_add_infos(movie));
                        // movie.genres_string = this.get_genres(movie.genre_ids);
                        // movie.mainActors = this.get_credits(movie.id);
                    });
                    console.log(this.additional_infos);

                    // console.log(this.total_array[0]);

                });
            }
        },

        get_score(score){
            // TRasformo la stringa in numero con la virgola, divido per due e arrotondo
            let int = Math.round(parseFloat(score)/2);
            return int;
        },

        show_info(movie_index){
            this.current_card = movie_index;
            this.poster_is_hide = true;
        },

        show_poster(){
            this.current_card = false;
            this.poster_is_hide =  false;
        },

        get_add_infos(movie){

            let add_info_obj ={
                id: movie.id,
                genres: this.get_genres(movie.genre_ids),
                main_actors:[]
            }

            return add_info_obj;
        },

        get_genres(genre_ids){
            //  genre_id = [ 100 , 45 ]
            let genres = [];

                genre_ids.forEach(genre_id => {
                    this.all_genres.forEach((genre, index) => {
                    // Confronta ogni id del film con l array del genere
                    if(genre_id == genre.id){
                        console.log("found");
                        // Quando trova corrispondenza aggiunge il nome del genre alla stringa
                        genres.push(genre.name);
                        // if (genres_string.length == 0) {
                        //     genres_string = genres_string + genre.name;
                        // }else{
                        //     genres_string = genres_string + ", " + genre.name;
                        // };
                    };
                });
            });
            return genres;
        },

        print_genres_string(id){
            let genres_string = "";

            for (var i = 0; i < this.additional_infos.length; i++) {
                if(id == this.additional_infos[i].id){
                    genres_string = this.additional_infos[i].genres.join(" / ");
                };
            };
            return genres_string;
        },

        get_credits(id){

            let credits_string = "";

            axios.get(("https://api.themoviedb.org/3/movie/" + id + "/credits") , {
                params: {
                    api_key: this.api_key
                }}
            ).then((credits) =>{
                for (var i = 0; i < 5; i++) {
                    // console.log(credits.data.cast[i].name);
                    credits_string = credits_string + ", " + credits.data.cast[i].name;
                };
                // console.log("Stringa attori " + credits_string);
                return credits_string;
            });
        }

    }, // Chiusura Methods

    mounted(){

        // Recupero i generi dei film
        axios.get(("https://api.themoviedb.org/3/genre/movie/list") , {
            params: {
                api_key: this.api_key
            }}
        ).then((all_movie_genres) =>{
            let movie_genres = all_movie_genres.data.genres;

            // Recupero i generi dei TV shows
            axios.get(("https://api.themoviedb.org/3/genre/tv/list") , {
                params: {
                    api_key: this.api_key
                }}
            ).then((all_tv_genres) =>{
                // Concateno i due array
                let tv_genres = all_tv_genres.data.genres;

                // Una volta recuperati sia i generi dei film e tv show procedo con il merge
                this.all_genres = movie_genres;

                tv_genres.forEach(tv_genre => {
                    let genre_found = false;
                    this.all_genres.forEach(genre => {
                        if(genre.id == tv_genre.id){
                            genre_found = true;
                        }
                    });
                    if(genre_found == false){
                        this.all_genres.push(tv_genre);
                    }
                });
            });
        });



    }
})
