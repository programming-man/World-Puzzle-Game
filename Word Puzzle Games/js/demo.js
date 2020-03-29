// ----------------------------------------------------------------------------
// All right reserved
// Copyright (C) 2012 Garmd Motion Code
// http://www.garmd.com/
// ----------------------------------------------------------------------------
// Yes, we make magic!
// ----------------------------------------------------------------------------


buzz.defaults.formats = [ 'ogg', 'mp3' ];
buzz.defaults.preload = 'metadata';

var games = [
    { img: 'img/pig.png', color:'#f8bcb2', word: 'pig', sound: 'sounds/pig' },
    { img: 'img/duck.png', color:'#ffad5e', word: 'duck', sound: 'sounds/duck' },
    { img: 'img/chicken.png', color:'#b3602f', word: 'chicken', sound: 'sounds/chicken' },
    { img: 'img/dove.png', color:'#f7bfd7', word: 'dove', sound: 'sounds/dove' },
    { img: 'img/dog.png', color:'#90723e', word: 'dog', sound: 'sounds/dog' },
    { img: 'img/crow.png', color:'#fff8f8', word: 'crow', sound: 'sounds/crow' },
    { img: 'img/cow.png', color:'#a0c05e', word: 'cow', sound: 'sounds/cow' },
    { img: 'img/sheep.png', color:'#937a6d', word: 'sheep', sound: 'sounds/sheep' },
    { img: 'img/zebra.png', color:'#ffffff', word: 'zebra', sound: 'sounds/zebra' },
    { img: 'img/buzzard.png', color:'#a0d9ff', word: 'buzzard', sound: 'sounds/buzzard' },
    { img: 'img/cat.png', color:'#676664', word: 'cat', sound: 'sounds/cat' },
    { img: 'img/frog.png', color:'#acda34', word: 'frog', sound: 'sounds/frog' },
    { img: 'img/mouse.png', color:'#3f6165', word: 'mouse', sound: 'sounds/mouse' },
    { img: 'img/rooster.png', color:'#ffc700', word: 'rooster', sound: 'sounds/rooster' },
    { img: 'img/bird.png', color:'#9de4ea', word: 'bird', sound: 'sounds/bird' },
    //{ img: 'img/fox.png', color:'#d0893b', word: 'fox', sound: 'sounds/' },
    { img: 'img/billy-goat.png', color:'#99d504', word: 'goat', sound: 'sounds/goat' }
   
];

var winSound        = new buzz.sound('sounds/win' ),
    errorSound      = new buzz.sound('sounds/error' ),
    alphabetSounds  = {},
    alphabet        = 'abcdefghijklmnopqrstuvwxyz'.split( '' );

for( var i in alphabet ) {
    var letter = alphabet[ i ];
    alphabetSounds[ letter ] = new buzz.sound('sounds/kid/'+ letter );
}

$( function() {
    if ( !buzz.isSupported() ) {
        $('#warning').show();
    }

    var idx = 0,
        $container  = $( '#container' ),
        $picture    = $( '#picture' ),
        $models     = $( '#models' ),
        $letters    = $( '#letters' );

    $( 'body' ).bind('selectstart', function() { 
        return false 
    });

    $( '#next' ).click( function() {
        refreshGame();
        buildGame( ++idx ); 
        return false;
    });

    $( '#previous' ).click( function() {
       refreshGame();
       buildGame( --idx ); 
       return false;
    });

    $( '#level' ).click( function() {
        if ( $( this ).text() == 'easy' ) {
            $( this ).text( 'hard' );
            $models.addClass( 'hard' );
        } else {
            $( this ).text( 'easy' );
            $models.removeClass( 'hard' );
        }
        return false;
    });

    function refreshGame() {
        $( '#models' ).html( '' );
        $( '#letters' ).html( '' );
    }

    function buildGame( x ) {
        if ( x > games.length - 1 ) {
            idx = 0;
        }
        if ( x < 0 ) {
            idx = games.length - 1;
        }

        var game  = games[ idx ],
            score = 0;

        var gameSound = new buzz.sound( game.sound );
        gameSound.play();

        // Fade the background color
        $( 'body' ).stop().animate({
            backgroundColor: game.color
        }, 1000);
        $( '#header a' ).stop().animate({
            color: game.color
        }, 1000);

        // Update the picture
        $picture.attr( 'src', game.img )
            .unbind( 'click' )
            .bind( 'click', function() {
                gameSound.play();
            });

        // Build model
        var modelLetters = game.word.split( '' );

        for( var i in modelLetters ) {
            var letter = modelLetters[ i ];
            $models.append( '<li>' + letter + '</li>' );
        }

        var letterWidth = $models.find( 'li' ).outerWidth( true );

        $models.width( letterWidth * $models.find( 'li' ).length );

        // Build shuffled letters
        var letters  = game.word.split( '' ),
            shuffled = letters.sort( function() { return Math.random() < 0.5 ? -1 : 1 });

        for( var i in shuffled ) {
            $letters.append( '<li class="draggable">' + shuffled[ i ] + '</li>' );
        }

        $letters.find( 'li' ).each( function( i ) {
            var top   = ( $models.position().top ) + ( Math.random() * 100 ) + 80,
                left  = ( $models.offset().left - $container.offset().left ) + ( Math.random() * 20 ) + ( i * letterWidth ),
                angle = ( Math.random() * 30 ) - 10;

            $( this ).css({
                top:  top  + 'px',
                left: left + 'px'
            });

            rotate( this, angle );

            $( this ).mousedown( function() {
                var letter = $( this ).text();
                if ( alphabetSounds[ letter ] ) {
                    alphabetSounds[ letter ].play();
                }
            });
        });

        $letters.find( 'li.draggable' ).draggable({
            zIndex: 9999,
            stack: '#letters li'
        });

        $models.find( 'li' ).droppable( {
            accept:     '.draggable',
            hoverClass: 'hover',
            drop: function( e, ui ) {
                var modelLetter      = $( this ).text(),
                    droppedLetter = ui.helper.text();

                if ( modelLetter == droppedLetter ) {
                    ui.draggable.animate( {
                        top:     $( this ).position().top,
                        left:     $( this ).position().left
                    } ).removeClass( 'draggable' ).draggable( 'option', 'disabled', true );
                    
                    rotate( ui.draggable, 0 );
                    
                    score++;
                    
                    if ( score == modelLetters.length ) {
                        winGame();
                    }    
                } else {
                    ui.draggable.draggable( 'option', 'revert', true );
                    
                    errorSound.play();
                    
                    setTimeout( function() {
                        ui.draggable.draggable( 'option', 'revert', false );
                    }, 100 );
                }
            }
        });
    }

    function winGame() {
        winSound.play();

        $( '#letters li' ).each( function( i ) {
            var $$ = $( this );
            setTimeout( function() {
                $$.animate({
                    top:'+=60px'
                });
            }, i * 300 );
        });

        setTimeout( function() {
            refreshGame();
            buildGame( ++idx );
        }, 3000);
    }

    function rotate( el, angle ) {
        $( el ).css({
            '-webkit-transform': 'rotate(' + angle + 'deg)',
            '-moz-transform': 'rotate(' + angle + 'deg)',
            '-ms-transform': 'rotate(' + angle + 'deg)',
            '-o-transform': 'rotate(' + angle + 'deg)',
            'transform': 'rotate(' + angle + 'deg)'
        });
    }

    buildGame( idx );
});