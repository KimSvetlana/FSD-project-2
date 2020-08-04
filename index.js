(function($) {
    $.fn.mySliderPlugin= function(options) {
        
        // настройки по умолчанию
        options = $.extend({            
            backgroundColor: 'aqua',
            expansion: '100%',
            thickness: 8,
            isSingle: true,
            vertical: false,
            indicatorVisibility: false,
            slideHandler: null,
        }, options);


        const makeSliderFunction = function(){

            //добавляем HTML содержание
            let $this = $(this);
            // console.log($this);
            let content = "<div class='slider-range-content'><div class='slider-range-min'></div><span class='slider-range-handle'></span><span class='slider-range-handle' ></span></div><p>Значение: <span id='slider-range-value'>0</span></p>"
            
            $($this).append(content);

            let _handleMovedHandlers = [];
            if (options.slideHandler != null)
                _handleMovedHandlers.push(options.slideHandler);

            const handleMovedEvent = function(handlePos, handleRadius){
                _handleMovedHandlers.forEach(handler => {
                    handler(handlePos, handleRadius);
                })
            };
            
            let slider =$this.find('.slider-range-content');
            let handles =$this.find('.slider-range-handle');

            let handleMin = {
                jqueryObject : handles.first(),
                currentPos : 0,
                maxPos : 0,
                minPos : 0,
            };

            let handleMax = {
                ... handleMin,
                jqueryObject : handles.last(),
            };
            
           
            let activeHandle = handleMax;
            let colorRange = $this.find('.slider-range-min');
            
            let sliderValue = $this.find('#slider-range-value');

            // определяем переменные и ориентацию слайдера
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

            // определяем индикаотр значений
            let indicatorContent = "<span class='indicator'>0</span>";
            if(options.indicatorVisibility){
                slider.append(indicatorContent);
            }
            let indicator = $this.find('.indicator');
            let indicatorWidth = indicator.outerWidth();
            // корректируем положение индикатора
            indicator.css(_leftPropertyName, (_handleWidth/2 - indicatorWidth/2));
            
            // параметры и расположение бегунка
            handles.css({'width': _handleWidth, 'height': _handleHeight});
            // выравнивание бегунка относительно кулисы
            handles.css(_topPropertyName, -options.thickness/2);

            // если бегунок один
            if(options.isSingle){
                handleMin.jqueryObject.hide();
            }

            let sliderWidth = parseFloat(slider.css(_widthPropertyName));
            // задаем координаты для второго бегунка при его наличии
            if(!options.isSingle){
                handleMax.jqueryObject.css(_leftPropertyName, sliderWidth - _handleWidth);
            }
            
            // зная все размеры, можно уточнить границы слайдера
            let _sliderMinPos;
            let _sliderMaxPos;
            if(!options.vertical){
                _sliderMinPos = slider.offset().left;
                _sliderMaxPos = _sliderMinPos + slider.width() - _handleWidth;
            }
            else{
                _sliderMinPos = slider.offset().top;
                _sliderMaxPos = _sliderMinPos + slider.height() - _handleHeight;
            }
            // зная границы, определяем перемещение бегунка
            handleMax.maxPos = _sliderMaxPos;
            handleMin.minPos = _sliderMinPos;
            handleMin.currentPos = parseFloat(handleMin.jqueryObject.css(_leftPropertyName));
            handleMax.currentPos = parseFloat(handleMax.jqueryObject.css(_leftPropertyName));

            // функция работы слайдера
            const onHandleMove = (movePosition) => {
                let movePos;
                
                // Коррекция на радиус
                if(options.vertical){
                    movePos = movePosition.pageY - _handleHeight / 2;
                }
                else{
                    movePos = movePosition.pageX - _handleWidth / 2;
                }
                
                // Коррекция на доступную область перемещения
                if(movePos < activeHandle.minPos){
                    movePos = activeHandle.minPos;
                }
                else if(movePos > activeHandle.maxPos){
                    movePos = activeHandle.maxPos;
                }

                activeHandle.currentPos = movePos;
                
                let offsetModifier = {};
                offsetModifier[_leftPropertyName] = movePos;

                activeHandle.jqueryObject.offset(offsetModifier); // передаем координаты бегунку

   
                let textValue = movePos - _sliderMinPos;
                if(movePos === _sliderMaxPos){
                    sliderValue.text(textValue + 2 * options.thickness);
                    indicator.text(textValue + 2 * options.thickness);
                }
                else{
                    sliderValue.text(textValue);
                    indicator.text(textValue);
                }
                
                // вызываем событие перемещения(передаем координату центра и радиус бегунка )
                handleMovedEvent(activeHandle.currentPos, _handleWidth / 2);
            };
            
            // Обработать перемещение бегунка
            const onHandleMoved = function(pos, rad){
                // При перемещении надо закрасить слайдер цветом
                applyColorToSlider(handleMin.currentPos, handleMax.currentPos);

                // при перемещении бегунка переместить индикатор
                indicatorMoved(activeHandle.currentPos);
            };

            // Закрасить слайдер
            const applyColorToSlider = function(from, to){
                let colorWidth = to - from;
                let offSetObject = {};
                offSetObject[_leftPropertyName] = from;
                colorRange.offset(offSetObject);
                colorRange.css(_widthPropertyName, colorWidth);
            };
            // перемещаем индикатор
            const indicatorMoved = function(coordinatеs) {
                let modifier = {};
                modifier[_leftPropertyName] = coordinatеs - indicator.outerWidth() / 2;
                indicator.offset(modifier); //передаем координаты индикатору
            };

            _handleMovedHandlers.push(onHandleMoved);

            const onHandleMouseDown  = (mouseEvent) => {
                if (handleMin.jqueryObject.get(0) === mouseEvent.currentTarget) {
                    activeHandle = handleMin;
                }
                else {
                    activeHandle = handleMax;
                }

                handleMin.maxPos = handleMax.currentPos;
                handleMax.minPos = handleMin.currentPos;

                $(document).on('mousemove', onHandleMove);

                $(document).on('mouseup', function() {
                    $(document).off('mousemove');
                })
            };

            handles.on('mousedown', onHandleMouseDown);
            slider.on('click', onHandleMove);

        };
        
        return this.each(makeSliderFunction);
    };

})(jQuery);

$('.slider-range-container').mySliderPlugin({indicatorVisibility: true});
$('.slider-range').mySliderPlugin({isSingle: false, indicatorVisibility: true});
$('.vertical-slider').mySliderPlugin({isSingle:false, vertical:true, thickness: 15, indicatorVisibility: true});



// для выбора одного(текущего обЪекта)
    // $('.example-class').on('mouseenter', event => {
    //     $(event.currentTarget).addClass('photo-active');
    // });