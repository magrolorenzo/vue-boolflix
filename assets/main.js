// Boolflix

var app = new Vue({
    el:"#root",

    data:{
        search: "",
        text_searched: "",

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
                    let movies_array = (searched_movie.data.results);
                    // Aggiungo all array finale i risultati dei film
                    this.total_array = this.total_array.concat(movies_array);
                    // Effettuo subito chiamata axios per recupero di al massimo 5 attori
                    this.get_movies_credits(movies_array);

                });

                // Get per recuperare la lista dei tv show
                axios.get((this.db_root_path + "tv") , {
                    params: {
                        api_key:  this.api_key,
                        query: this.text_searched
                    }}
                ).then((searched_tv_show) =>{
                    let tv_array = (searched_tv_show.data.results);

                    // Concateno i due array dei risultati dei film e tv shows nell array finale
                    this.total_array = this.total_array.concat(tv_array);
                    this.isSearching = false;
                    this.search = "";

                    // Effettuo subito chiamata axios per recupero di al massimo 5 attori
                    this.get_tv_credits(tv_array);

                });
            }
        },

        get_movies_credits(movies_array){
            movies_array.forEach((movie) => {
                axios.get( ("https://api.themoviedb.org/3/movie/" + movie.id + "/credits") , {
                    params: {
                        api_key: this.api_key
                    }}
                ).then((credits) =>{

                    if(credits.data.cast.length != 0){

                        let five_actors = [];
                        let i = 0;
                        do{
                            // console.log("Nome " + i + ": " +credits.data.cast[i].name +"del film " + movie.original_title);
                            let name = credits.data.cast[i].name;
                            five_actors.push(name);
                            i++;
                        } while (credits.data.cast[i].name && (i < 5))

                        this.additional_infos.push(this.get_add_infos(movie, five_actors));
                    }
                });
            });
        },

        get_tv_credits(tv_array){
            tv_array.forEach((tv_show) => {
                axios.get( ("https://api.themoviedb.org/3/tv/" + tv_show.id + "/credits") , {
                    params: {
                        api_key: this.api_key
                    }}
                ).then((credits) =>{
                    if(credits.data.cast.length != 0){

                        let five_actors = [];
                        let i = 0;

                        do{
                            let name = credits.data.cast[i].name;
                            five_actors.push(name);
                            i++;

                        } while (credits.data.cast[i].name && (i < 5))

                        this.additional_infos.push(this.get_add_infos(tv_show, five_actors))
                    }

                });
            });
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

        // Funzione per creazione oggetto di info addizionali nel array additional info
        get_add_infos(movie, five_actors){

            let new_id = movie.id;
            let new_genres = this.get_genres(movie.genre_ids);
            let new_actors = five_actors

            let add_info_obj ={
                id: new_id,
                genres: new_genres,
                main_actors: new_actors
            };

            return add_info_obj;
        },

        // Funzione per recupero dei generi del film in formato stringa
        get_genres(genre_ids){
            // Esempio di genre_ids = [ 100 , 45 ]
            let genres = [];

            genre_ids.forEach(genre_id => {
                this.all_genres.forEach((genre, index) => {
                    // Confronta ogni id del film con l array del genere
                    if(genre_id == genre.id){
                        // Quando trova corrispondenza aggiunge il nome del genre alla stringa
                        genres.push(genre.name);
                    };
                });
            });
            return genres;
        },
        // Funzione per la stampa a video dell array dei generi
        print_genres_string(id){
            let genres_string = "";

            for (var i = 0; i < this.additional_infos.length; i++) {
                if(id == this.additional_infos[i].id){
                    genres_string = this.additional_infos[i].genres.join(" / ");
                };
            };
            return genres_string;
        },

        // Stampa a video della stringa di attori
        print_actors_string(id){
            let actors_string = "";

            for (var i = 0; i < this.additional_infos.length; i++) {
                if(id == this.additional_infos[i].id){
                    actors_string = this.additional_infos[i].main_actors.join(", ");
                };
            };
            return actors_string;
        },

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


        // Ricerca iniziale dei Film di tendenza della settimana
        axios.get(("https://api.themoviedb.org/3/trending/movie/week"), {
            params: {
                api_key: this.api_key
            }}
        ).then(response => {
            let movies_array = (response.data.results);
            // Aggiungo all array finale i risultati dei film
            this.total_array = this.total_array.concat(movies_array);
            // Effettuo subito chiamata axios per recupero di al massimo 5 attori
            this.get_movies_credits(movies_array);
        });
    }
})
