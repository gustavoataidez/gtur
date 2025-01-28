( function( $ ) {
	"use strict";
	jQuery(document).ready(function($) {
		setTimeout(function(){ 
			$(".elementor").not(".elementor-location-popup").each(function(e){
	            $( "input.elementor-field-telephone", $(this) ).each(function( index ) {
	                elementor_field_telephone($(this));
	            });
	        }) 
		 }, 200);
        jQuery( document ).on( 'elementor/popup/show', () => {
             $( "input.elementor-field-telephone" ).each(function( index ) {
                    elementor_field_telephone($(this));
            });
        } );
		$("input").on("done_load_repeater",function(e){
			$( "input.elementor-field-telephone" ).each(function( index ) {
					elementor_field_telephone($(this));
			});
		})
		function elementor_field_telephone(field) {
			// Pega os dados do campo (como 'onlyct', 'excludecountries', etc.)
			var onlyCountries_data = field.data("onlyct");
			var exclude = field.data("excludecountries");
			var preferredCountries_data = field.data("pre");
			var geoIpLookup_data = field.data("auto");
			var countrySearch = field.data("telephone_search");
			var initialCountry_data = field.data("defcountry");
			var input = "form_fields[" + field.data("name") + "]";
		
			// Converte o valor de countrySearch para booleano
			countrySearch = (countrySearch == "yes") ? true : false;
		
			// Definindo arrays padrão se as variáveis forem vazias ou não definidas
			var data = [];
			
			// Verificação e atribuição de valor para onlyCountries_data
			if (onlyCountries_data === "") { 
				onlyCountries_data = [];  // Se não houver valor, atribui um array vazio
			} else {
				if (typeof onlyCountries_data === 'string' && onlyCountries_data.trim() !== '') {
					onlyCountries_data = onlyCountries_data.split('|'); // Se for uma string, divide pelo separador '|'
				} else {
					console.error('A variável onlyCountries_data não foi definida corretamente.');
					onlyCountries_data = [];  // Se não for válida, atribui um array vazio
				}
			}
		
			// Verifica a variável exclude e converte para um array
			if (exclude === "") { 
				exclude = []; 
			} else {
				exclude = exclude.split('|');  // Divide a string de países para exclusão
			}
		
			// Verifica a variável preferredCountries_data
			if (preferredCountries_data === "") { 
				preferredCountries_data = ["us", "gb"];  // Países preferenciais padrão (EUA e Reino Unido)
			} else {
				preferredCountries_data = preferredCountries_data.split('|');  // Divide a string de países preferenciais
			}
		
			// Verifica o valor de initialCountry_data e atribui o valor padrão "auto" se estiver vazio
			if (initialCountry_data === "") { 
				initialCountry_data = "auto";
			}
		
			// Inicializa o intlTelInput com as configurações apropriadas
			if (geoIpLookup_data === "yes") {
				var iti = field.intlTelInput({
					nationalMode: true,
					countrySearch: countrySearch,
					onlyCountries: onlyCountries_data,
					excludeCountries: exclude,
					initialCountry: initialCountry_data,
					preferredCountries: preferredCountries_data,
					utilsScript: elementor_tel.utilsScript,
					separateDialCode: true,
					hiddenInput: () => ({ phone: input }), // Entrada oculta
					geoIpLookup: function(success, failure) {
						$.get("https://ipinfo.io", function() {}, "jsonp").always(function(resp) {
							var countryCode = (resp && resp.country) ? resp.country : "";
							success(countryCode);  // Define o código do país a partir do IP do usuário
						});
					},
				});
			} else {
				var iti = field.intlTelInput({
					countrySearch: countrySearch,
					onlyCountries: onlyCountries_data,
					excludeCountries: exclude,
					initialCountry: initialCountry_data,
					preferredCountries: preferredCountries_data,
					utilsScript: elementor_tel.utilsScript,
					separateDialCode: true,
					hiddenInput: () => ({ phone: input })  // Entrada oculta
				});
			}
		}
		
		// phon us
		$("body").on('keypress','.elementor-field-telephone-us', function(e) {
			  var key = e.charCode || e.keyCode || 0;
			  var phone = $(this);
			  if (phone.val().length === 0) {
			    phone.val(phone.val() + '(');
			  }
			  // Auto-format- do not expose the mask as the user begins to type
			  if (key !== 8 && key !== 9) {
			    if (phone.val().length === 4) {
			      phone.val(phone.val() + ')');
			    }
			    if (phone.val().length === 5) {
			      phone.val(phone.val() + ' ');
			    }
			    if (phone.val().length === 9) {
			      phone.val(phone.val() + '-');
			    }
			    if (phone.val().length >= 14) {
			      phone.val(phone.val().slice(0, 13));
			    }
			  }

			  // Allow numeric (and tab, backspace, delete) keys only
			  return (key == 8 ||
			    key == 9 ||
			    key == 46 ||
			    (key >= 48 && key <= 57) ||
			    (key >= 96 && key <= 105));
			})

			.on('focus', function() {
			 var phone = $(this);

			  if (phone.val().length === 0) {
			    phone.val('(');
			  } else {
			    var val = phone.val();
			    phone.val('').val(val); // Ensure cursor remains at the end
			  }
			})

			.on('blur', function() {
			  var $phone = $(this);

			  if ($phone.val() === '(') {
			    $phone.val('');
			  }
		});

	$("body").on("change",".elementor-field-telephone",function(){
		var content = $.trim($(this).val());
		var check_field = $(this).closest('.elementor-field-type-telephone').find('.phone_check');
		var number = $(this).intlTelInput("getNumber");
		$(this).next().attr("value",number);
		$(this).next().val(number);
		if( $(this).data("validation") == "yes" && content.length > 0 ) {
			var number = $(this).intlTelInput("getNumber");
			if ($(this).intlTelInput("isValidNumber")) { 
				check_field.attr("value","yes");
				check_field.val("yes");
				$(this).addClass('wpcf7-not-valid-blue').removeClass('wpcf7-not-valid-red').removeClass('wpcf7-not-valid');	
			}else{
				check_field.attr("value","no");
				check_field.val("no");
				$(this).addClass('wpcf7-not-valid-red').removeClass('wpcf7-not-valid-blue');
			}
		}
	})
	$( ".elementor-field-telephone" ).keyup(function( event ) {
		var check_field = $(this).closest('.elementor-field-type-telephone').find('.phone_check');
	 	var content = $.trim($(this).val());
		if( $(this).data("validation") == "yes"  ) {
			if ($(this).intlTelInput("isValidNumber")) { 
				check_field.attr("value","yes");
				check_field.val("yes");
				$(this).addClass('wpcf7-not-valid-blue').removeClass('wpcf7-not-valid-red').removeClass('wpcf7-not-valid');	
			}else{
				check_field.attr("value","no");
				check_field.val("no");
				$(this).addClass('wpcf7-not-valid-red').removeClass('wpcf7-not-valid-blue');
			}
		}
	}).keydown(function( event ) {
	  
	});
	$("body").on("focus",".elementor-field-telephone",function(){
		$(this).removeClass('wpcf7-not-valid-blue').removeClass('wpcf7-not-valid-red');
	})
		document.addEventListener("countrychange", function() {
		  $("input.elementor-field-telephone").change();
		});
	})
} )( jQuery );