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

                    // Mi creo all'interno di ogni oggetto film due stringhe per visualizzare generi e 5 attori
                    this.total_array.forEach((movie) => {
                        this.additional_infos.push(this.get_add_infos(movie));
                    });

                    console.log("Lunghezza additional infos: " + this.additional_infos.length);
                    console.log(this.additional_infos);
                    console.log("Lunghezza total array: " + this.total_array.length);
                    console.log(this.total_array);

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

        // Funzione per creazione oggetto di info addizionali nel array additional info
        get_add_infos(movie){

            let new_id = movie.id;
            let new_genres = this.get_genres(movie.genre_ids);
            let new_actors = this.get_credits(movie);

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

        // Funzione per recupero dei primi 5 nomi di attori del film
        get_credits(movie){

            let id = movie.id;
            let five_actors = [];
            let i = 0;

            // Se ha la proprietà Title , quindi è un film, fai la chiamata credit per i movies
            if(movie.title){
                axios.get( ("https://api.themoviedb.org/3/movie/" + id + "/credits") , {
                    params: {
                        api_key: this.api_key
                    }}
                ).then((credits) =>{
                    do{
                        let name = credits.data.cast[i].name;
                        // console.log(name);
                        five_actors.push(name);
                        i++;
                    } while (credits.data.cast[i].name && i<5)

                    // for (var i = 0; i < 5; i++) {
                    //     let name = credits.data.cast[i].name;
                    //     // console.log(name);
                    //     five_actors.push(name);
                    // };
                    console.log(five_actors);
                    return five_actors;
                });
            } else { // Se non ha title, ma ha name, saraà un tv show
                axios.get( ("https://api.themoviedb.org/3/tv/" + id + "/credits") , {
                    params: {
                        api_key: this.api_key
                    }}
                ).then((credits) =>{
                    do{
                        let name = credits.data.cast[i].name;
                        // console.log(name);
                        five_actors.push(name);
                        i++;
                    } while (credits.data.cast[i].name && i<5)
                    // for (var i = 0; i < 5; i++) {
                    //     let name = credits.data.cast[i].name;
                    //     // console.log(name);
                    //     five_actors.push(name);
                    // };
                    console.log(five_actors);
                    return five_actors;
                });
            }
        },

        // Stampa a video della stringa di attori
        print_actors_string(id){
            let actors_string = "";

            for (var i = 0; i < this.additional_infos.length; i++) {
                if(id == this.additional_infos[i].id){
                    actors_string = this.additional_infos[i].main_actors;
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



    }
})
