(function( $ ){
    var methods = {
        
        /**
         * Função inicial do sistema
         * @param div HTML Element
         */ 
        initMap: function (div){
            if(!div) {
                console.error('Nenhuma div encontrada');
                return false;
            }
            
            Gmaps = {
        
                /**
                 * Armazena o objeto Google Map
                 * google.maps.Map
                 * https://developers.google.com/maps/documentation/javascript/reference?hl=#Map
                 */
                Map: null,
        
                /**
                 *Array para armazenar objetos google.maps.InfoWindow
                 * https://developers.google.com/maps/documentation/javascript/reference#InfoWindow
                 */
                InfoWindows: new Array(),
        
                /**
                 * Array para armazenar objetos google.maps.Marker
                 * https://developers.google.com/maps/documentation/javascript/reference#Marker
                 */
                Markers: new Array(),
        
                /**
                 * Armazena um objeto google.maps.Polyline
                 * https://developers.google.com/maps/documentation/javascript/reference#Polyline
                 */
                Rota: new google.maps.Polyline()
            }
            
            //Inicia o map
            Gmaps.Map = new google.maps.Map(div, options['MapOptions']);
            return Gmaps;
        },
        
        /**
         * Valida o objeto Gmap
         * @param Gmap object
         */
        ValideteGmap: function (Gmap) {
            //Verifica se existe algum mapa para ser alterado
            if(!Gmap) { 
                if($.Gmap) {
                    Gmap = $.Gmap;
                } else{
                    throw 'Não há nenhnum mapa para carregar a polyline!';
                }
            }
            
            return Gmap;
        },
        
        /**
         * Carrega uma rota apartir de uma url codificada do google
         * https://developers.google.com/maps/documentation/javascript/geometry?hl=pt-br
         * @param UrlEncoded string
         * @param Gmap object
         * @param PolylineOptions object
         */ 
        LoadPolylineByUrlEncoded: function (UrlEncoded,Gmap,PolylineOptions) {
            try {
                if(!UrlEncoded) throw '@param UrlEncoded está não foi informada';
                if(typeof UrlEncoded != 'string') throw '@param UrlEncoded não é uma string';
                    
                if(!PolylineOptions) {
                    PolylineOptions = options['PolylineOptions'];
                }
                
                Gmap = methods['ValideteGmap'].apply(this,new Array(Gmap));
                
                //Seta as opções da Polyline de rota
                Gmap.Rota.setOptions(PolylineOptions);
            
                //Seta o mapa da Polyline de rota
                Gmap.Rota.setMap(Gmap.Map);
                
                //Passa um MVCArray para o Polyline da rota
                Gmap.Rota.setPath(consts['Geometry'].encoding.decodePath(UrlEncoded));
                
                methods['CenterMapByPath'].apply(this,new Array(Gmap));
                
                return Gmap;
            } catch(err) {
                console.error('Erro: '+err);
            }
        },
        
        /**
         * Centraliza o mapa baseado na rota atual
         * @param Gmap
         */ 
        CenterMapByPath: function (Gmap) {
            try {
                Gmap = methods['ValideteGmap'].apply(this,new Array(Gmap));
                
                path = Gmap.Rota.getPath();

                bounds = new google.maps.LatLngBounds();
                path.forEach(function (e) {
                    bounds.extend(e);
                });

                Gmap.Map.fitBounds(bounds);
                
            } catch(err) {
                console.error('Erro: '+err);
            }
        },
        
        /**
         * Carrega marcadores
         * @param Markers object|array
         * @param Gmap object
         * @param MarkerOptions object
         */ 
        LoadMarkers:function (Markers, Gmap, MarkerOptions) {
            try {
                
                if(typeof Markers != 'object') throw "@param markers deve ser do tipo array ou object";
                Gmap = methods['ValideteGmap'].apply(this,new Array(Gmap));
                
                if(!MarkerOptions)
                    MarkerOptions = options['MarkerOptions'];
                
                //Define o map em que os marcadores deverão ser colocados
                MarkerOptions.map = Gmap.Map;
                
                $(Markers).each(function (i,e) {
                    
                    //Define a posição do marcador
                    MarkerOptions.position = new google.maps.LatLng(e.lat,e.lng);
                    
                    //Define o icone do marcador
                    icon = null;
                    if(e.icon) {
                        
                        //Verifica se há uma pasta padrão para icones
                        if(typeof options['PathForIcons'] == 'string'){
                            icon = options['PathForIcons']+'/'+e.icon;
                        } else {
                            icon = e.icon;
                        }
                    }
                    MarkerOptions.icon = icon;
                    
                    Gmap.Markers.push(new google.maps.Marker(MarkerOptions));
                });
                
                return $.Gmap = Gmap;
            } catch (err) {
                console.error('Erro: '+err);
            }
        }
    }
    
    var options = {
        
        /**
         * Opçoes do Objeto mapa 
         * https://developers.google.com/maps/documentation/javascript/reference?hl=#MapOptions
         */
        MapOptions: {
            zoom: 8,
            mapTypeOptions: {
                mapTypeIds: [
                google.maps.MapTypeId.ROADMAP,
                google.maps.MapTypeId.SATELLI,
                google.maps.MapTypeId.TERRAIN,
                google.maps.MapTypeId.HYBRID
                ]
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: new google.maps.LatLng(-14.235004,-51.92527999999999)
        },
        
        /**
         * Opçoes do Objeto Rota(Polyline)
         * https://developers.google.com/maps/documentation/javascript/reference?hl=#PolylineOptions
         */ 
        PolylineOptions: {
            strokeColor: "#4C4CFF",
            strokeOpacity: 0.6, 
            strokeWeight: 5,
            clickable: true
        },
        
        /**
         * Opções do Objeto de Marcador
         * https://developers.google.com/maps/documentatin/javascript/reference?hl=pt-br#MarkerOptions
         */
        MarkerOptions: {},
        
        /**
         * Caminho padrão dos icones de marcadores
         */
        PathForIcons: null
    }
    
    /**
     * Constantes gerais
     */ 
    var consts ={
        /**
         * Instancia do objeto Google Geocoder
         * https://developers.google.com/maps/documentation/javascript/reference?hl=#Geocoder
         */
        Geocoder: new google.maps.Geocoder(),
        
        /**
         * Instancia do objeto Google Events
         * https://developers.google.com/maps/documentation/javascript/reference?hl=#event
         */
        MapEvent: google.maps.event,
        
        /**
         * Instancia do objeto Google Geometry
         * https://developers.google.com/maps/documentation/javascript/reference?hl=pt-br#encoding
         * https://developers.google.com/maps/documentation/javascript/reference?hl=pt-br#spherical
         * https://developers.google.com/maps/documentation/javascript/reference?hl=pt-br#poly
         */ 
        Geometry: google.maps.geometry
    }
    
    /**
     * Objeto Gmaps padrão
     */ 
    $.Gmap = null;
    
    /**
     * Função inicial do plugin Gmaps
     * @param option object,array,string
     */
    $.fn.Gmaps = function(option) {
        //Trata @param option
        switch(typeof option) {
            case 'object':
                //Verifica se @param option é um array. Se ele for, assume cada elemento
                //do array como uma opção de @var options
                for(i in option) {
                    if(typeof i != 'string') {
                        console.error('Ocorreu um erro com o tipo de indice do array passado');
                        return;
                    }
                       
                    //Altera o valor padrão da @var options[i]
                    options[i] = $.extend(options[i],option[i]);
                }
                break;
                
            case 'string':
                args = Array.prototype.slice.call( arguments, 1);
                if(methods[option]) {
                    //Retorna o método
                    return methods[option].apply( this, args);                    
                } else if(options[option]) {
                    args = args[0];
                    
                    if(typeof options == typeof args) {
                
                        if(typeof options[option] == 'object') {
                            options[option] = $.extend(options[option], args);
                        } else {
                            options[option] = args;
                        }
                    }
                }
                break;
                
        }
        
        var Len = this.length;
        var Return = new Array();
        
        /**
         * Função que percorre todos os elementos atigindos pelo seletor jquery.
         * @param i Indice do elemento HTML selecionado
         * @param e Elemento HTML selecionado
         */
        this.each(function(i,e) {
            if(Len > 1) {
                Return.push(methods['initMap'].apply(this, new Array(e)));
            } else {
                Return = $.Gmap = methods['initMap'].apply(this, new Array(e));
            }
        });
        
        return Return;        
    }
    
})( jQuery );