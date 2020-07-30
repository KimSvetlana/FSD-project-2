(function($) {
    $.fn.mySliderPlugin= function(options) {
        
        // настройки по умолчанию
        options = $.extend({            
            backgroundColor: 'aqua',
            expansion: '100%',
            thickness: 8,
            vertical: false,
            indicatorVisibility: false,
            slideHandler: null,
        }, options);

        const makeSliderFunction = function(){

            //добавляем HTML содержание
            let $this = $(this);
            let content = "<div class='slider-range-content'><div class='slider-range-min'></div><span class='slider-range-handle' ></span></div><p>Значение: <span id='slider-range-value'>0</span></p>"
            
            $($this).append(content);

            let _handleMovedHandlers = [];
            if (options.slideHandler != null)
                _handleMovedHandlers.push(options.slideHandler);

            const handleMovedEvent = function(sliderCenterPos, sliderRadius){
                _handleMovedHandlers.forEach(handler => {
                    handler(sliderCenterPos, sliderRadius);
                })
            };



            
            let slider =$this.find('.slider-range-content');
            let handle =$this.find('.slider-range-handle');
            let colorRange = $this.find('.slider-range-min');
            
            let sliderValue = $this.find('#slider-range-value');

            // определяем ориентацию слайдера
            let _leftPropertyName;
            let _widthPropertyName = '';
            let _thicknessPropertyName = '';
            let _topPropertyName = '';
            let _handleWidth = options.thickness * 2;
            let _handleHeight = options.thickness * 2;
            if(!options.vertical){
                _leftPropertyName = 'left';
                _widthPropertyName = 'width';
                _thicknessPropertyName = 'height';
                _topPropertyName = 'top';
            }
            else{
                _leftPropertyName = 'top';
                _widthPropertyName = 'height';
                _thicknessPropertyName = 'width';
                _topPropertyName = 'left'
            }
            
            // параметры и размеры слайдера
            colorRange.css('background-color', options.backgroundColor);
            slider.css(_thicknessPropertyName, options.thickness);
            colorRange.css(_thicknessPropertyName, options.thickness);
            slider.css(_widthPropertyName, options.expansion);

            // параметры и расположение рукоятки
            handle.css({'width': _handleWidth, 'height': _handleHeight});

            // зная все размеры, можно уточнить границы перемещения рукоятки
            let _minPos;
            let _maxPos;
            if(!options.vertical){
                _minPos = slider.offset().left;
                _maxPos = _minPos + slider.width() - _handleWidth;
            }
            else{
                _minPos = slider.offset().top;
                _maxPos = _minPos + slider.height() - _handleHeight;
            }

            // выравнивание рукоятки относительно кулисы
            let handlePosObject = {};
            handlePosObject[_topPropertyName] = -options.thickness/2;
            handle.css(handlePosObject);

            let indicatorContent = "<span class='indicator'>0</span>";
            if(options.indicatorVisibility){
                slider.append(indicatorContent);
            }
            let indicator = $this.find('.indicator');
            

            // функция работы слайдера
            const onHandleMove = (movePosition) => {
                let movePos;
                if(options.vertical){
                    movePos = movePosition.pageY - _handleHeight / 2;
                }
                else{
                    movePos = movePosition.pageX - _handleWidth / 2;
                }
                
                if(movePos < _minPos){
                    movePos = _minPos;
                }
                else if(movePos > _maxPos){
                    movePos = _maxPos;
                }

                let offsetModifier = {};
                offsetModifier[_leftPropertyName] = movePos;
                handle.offset(offsetModifier);

                indicator.offset(offsetModifier);

                
                let textValue = movePos - _minPos;
                if(movePos === _maxPos){
                    sliderValue.text(textValue + 2 * options.thickness);
                    indicator.text(textValue + 2 * options.thickness);
                }
                else{
                    sliderValue.text(textValue);
                    indicator.text(textValue);
                }
                
                // вызываем событие перемещкния(передаем координату центра и радиус бегунка )
                handleMovedEvent(movePos + _handleWidth / 2, _handleWidth / 2);
            };
            
            // Обработать перемещение бегунка
            const onHandleMoved = function(handleCenterPosition, handleRad){

                // При перемещении надо закрасить слайдер цветом
                applyColorToSlider(_minPos, handleCenterPosition);
            };

            // Закрасить слайдер
            const applyColorToSlider = function(from, to){
                let colorWidth = to - from;
                let offSetObject = {_offsetPropertyName: from + _minPos};
                colorRange.css(offSetObject);
                colorRange.css(_widthPropertyName, colorWidth);
            };


            _handleMovedHandlers.push(onHandleMoved);

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

$('.slider-range-container').mySliderPlugin({indicatorVisibility: true});
$('.vertical-slider').mySliderPlugin({vertical:true, thickness: 15, indicatorVisibility: true});



// для выбора одного(текущего обЪекта)
    // $('.example-class').on('mouseenter', event => {
    //     $(event.currentTarget).addClass('photo-active');
    // });