(function($) {
    $.fn.mySliderPlugin= function(options) {
        
        options = $.extend({            
            backgroundColor: 'aqua',
            height: 8,
        }, options);

        const makeSliderFunction = function(){

            let $this = $(this);
            let content = " <div class='slider-range-content'><div class='slider-range-min'></div><span class='slider-range-handle' ></span><p>Значение: <span id='slider-range-value'>0</span></p></div>"
            
            $($this).append(content);


            let slider = $('.slider-range-content')
            let handle = $('.slider-range-handle')
            let colorRange = $('.slider-range-min')

            colorRange.css("background-color", options.backgroundColor);
            slider.css('height', options.height);
            colorRange.css('height', options.height);


            let sliderValue = $('#slider-range-value')

            const onHandleMove = (movePosition) => {
                const minPos = slider.offset().left;
                const maxPos = minPos + slider.width();
                let moveX = movePosition.pageX;

                if(moveX < minPos){
                    moveX = minPos;
                }
                else if(moveX > maxPos){
                    moveX = maxPos;
                }

                handle.offset({left:moveX});

                colorRange.css('width', moveX - minPos);

                sliderValue.text(moveX - minPos);
            };

            const onHandleMouseDown  = () => {
                $(document).on('mousemove', onHandleMove);

                $(document).on('mouseup', function() {
                    $(document).off('mousemove');
                })
            };

            handle.on('mousedown', onHandleMouseDown);
            slider.on('click', onHandleMove)

        };
     
       return this.each(makeSliderFunction);        
    };

})(jQuery);

$('.slider-range-container').mySliderPlugin();


// для выбора одного(текущего обЪекта)
    // $('.example-class').on('mouseenter', event => {
    //     $(event.currentTarget).addClass('photo-active');
    // });