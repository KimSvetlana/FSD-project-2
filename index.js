(function($) {
    $.fn.mySliderPlugin= function(options) {
        
        // настройки по умолчанию
        options = $.extend({            
            backgroundColor: '#759cd8',
            expansion: '100%',
            thickness: 8,
            min:0,
            max: 450,
            step: 1,
            scaleOfValues : false,
            isDouble: false,
            vertical: false,
            indicatorVisibility: false,
            slideHandler: null,
        }, options);

        const makeSliderFunction = function(){

            //добавляем HTML содержание
            let $this = $(this);

            let content = "<div class='slider-range-content'><div class='slider-color-range'></div><span class='slider-range-handle'></span><span class='slider-range-handle' ></span></div><p>Значение: <span id='slider-range-value'>0</span></p>"
            
            $($this).append(content);

            let _handleMovedHandlers = [];
            if (options.slideHandler != null)
                _handleMovedHandlers.push(options.slideHandler);

            const handleMovedEvent = function(handlePos, handleRadius){
                _handleMovedHandlers.forEach(handler => {
                    handler(handlePos, handleRadius);
                })
            };
            
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
            let slider =$this.find('.slider-range-content');
            slider.css(_thicknessPropertyName, options.thickness);
            slider.css(_widthPropertyName, options.expansion);
            
            let colorRange = $this.find('.slider-color-range');
            colorRange.css('background-color', options.backgroundColor);
            colorRange.css(_thicknessPropertyName, options.thickness);
            
            let sliderValue = $this.find('#slider-range-value');
            if(options.isDouble){
                sliderValue.html("от <span class = 'minValue'>0</span> до <span class = 'maxValue'>450</span>");
            }
            let minValue = sliderValue.find('.minValue');
            let maxValue = sliderValue.find('.maxValue');
            
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
                        
            // задаем координаты для второго бегунка при его наличии
            let _sliderWidth = parseFloat(slider.css(_widthPropertyName));
            if(options.isDouble){
                handleMax.jqueryObject.css(_leftPropertyName, _sliderWidth - _handleWidth);
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
            if(!options.vertical){
                handleMin.currentPos = handleMin.jqueryObject.offset().left;
                handleMax.currentPos = handleMax.jqueryObject.offset().left;
            }
            else{
                handleMin.currentPos = handleMin.jqueryObject.offset().top;
                handleMax.currentPos = handleMax.jqueryObject.offset().top;
            }

            colorRange.css(_widthPropertyName, handleMax.currentPos - handleMin.currentPos);
            
            // если бегунок один
            if(!options.isDouble){
                handleMin.jqueryObject.hide();
            }
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
                
                // вызываем событие перемещения(передаем координату центра и радиус бегунка )
                handleMovedEvent(activeHandle.currentPos, _handleWidth / 2, handleMin.currentPos, handleMax.currentPos);
            };
            
            // Обработать перемещение бегунка
            const onHandleMoved = function(pos, rad){
                // При перемещении надо закрасить слайдер цветом
                applyColorToSlider(handleMin.currentPos, handleMax.currentPos);
                
                // при перемещении бегунка переместить индикатор
                indicatorMoved(activeHandle.currentPos);
                
                // вывести значение положения в строке
                getTextValue(activeHandle.currentPos, handleMin.currentPos, handleMax.currentPos); 
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
            
            // вывод текста
            const getTextValue = function(elementCoordinate, coordinateOne, coordinateTwo){ 
                
                let textValueMin = coordinateOne - _sliderMinPos;
                let textValueMax = coordinateTwo - _sliderMinPos;
                if(options.isDouble){
                    if(coordinateTwo === _sliderMaxPos){
                        minValue.text(textValueMin);
                        maxValue.text(textValueMax + 2 * options.thickness);
                        indicator.text(textValueMax + 2 * options.thickness);
                        indicator.text(textValueMin);
                    }
                    else{
                        minValue.text(textValueMin);
                        maxValue.text(textValueMax);
                        indicator.text(textValueMax);
                        indicator.text(textValueMin);
                    }
                }
                else{
                    if(coordinateTwo === _sliderMaxPos){
                        sliderValue.text(textValueMax + 2 * options.thickness);
                        indicator.text(textValueMax + 2 * options.thickness);
                    }
                    else{
                        sliderValue.text(textValueMax);
                        indicator.text(textValueMax);
                    }
                }
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
$('.slider-range').mySliderPlugin({isDouble: true, indicatorVisibility: true});
$('.vertical-slider').mySliderPlugin({isDouble:true, vertical:true, thickness: 15, indicatorVisibility: true});



// для выбора одного(текущего обЪекта)
    // $('.example-class').on('mouseenter', event => {
    //     $(event.currentTarget).addClass('photo-active');
    // });