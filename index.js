(function($) {
    $.fn.mySliderPlugin= function(options) {
        
        // настройки по умолчанию
        options = $.extend({            
            backgroundColor: 'aqua',
            expansion: '100%',
            thickness: 8,
            vertical: false,
        }, options);

        const makeSliderFunction = function(){

            //добавляем HTML содержание
            let $this = $(this);
            let content = "<div class='slider-range-content'><div class='slider-range-min'></div><span class='slider-range-handle' ></span></div><p>Значение: <span id='slider-range-value'>0</span></p>"
            
            $($this).append(content);

            
            let slider =$this.find('.slider-range-content');
            let handle =$this.find('.slider-range-handle');
            let colorRange = $this.find('.slider-range-min');
            
            let sliderValue = $this.find('#slider-range-value');

            // определяем ориентацию слайдера
            let length = '';
            let thickness = '';
            let handlePos = '';

            if (options.vertical){
                length = 'height';
                thickness = 'width';
                handlePos = 'left'
            }
            else{
                length = 'width';
                thickness = 'height';
                handlePos = 'top';
            }

            colorRange.css('background-color', options.backgroundColor);
            slider.css(thickness, options.thickness);
            colorRange.css(thickness, options.thickness);
            slider.css(length, options.expansion);

            // параметры и расположение рукоятки
            handle.css({'width': 2*options.thickness, 'height': 2*options.thickness});
           
            let handlePosObject = {};
            handlePosObject[handlePos] = -options.thickness/2;
            handle.css(handlePosObject);

            // функция работы слайдера
            const onHandleMove = (movePosition) => {
                let minPos;
                let maxPos;
                let movePos;
                let offsetProperty;
                if(options.vertical){
                    minPos = slider.offset().top;
                    maxPos = minPos + slider.height();
                    movePos = movePosition.pageY;
                    offsetProperty = 'top';
                }
                else{
                    minPos = slider.offset().left;
                    maxPos = minPos + slider.width();
                    movePos = movePosition.pageX;
                    offsetProperty = 'left';
                }
                
                if(movePos < minPos){
                    movePos = minPos;
                }
                else if(movePos > maxPos){
                    movePos = maxPos;
                }

                let offsetModifier = {};
                offsetModifier[offsetProperty] = movePos;
                handle.offset(offsetModifier);

                // закрашиваем слайдер цветом
                colorRange.css(length, movePos - minPos);

                sliderValue.text(movePos - minPos);
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
$('.vertical-slider').mySliderPlugin({vertical:true, thickness: 15});



// для выбора одного(текущего обЪекта)
    // $('.example-class').on('mouseenter', event => {
    //     $(event.currentTarget).addClass('photo-active');
    // });