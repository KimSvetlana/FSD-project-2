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
            let self = this;

            let content = "<div class='slider-range-content'><div class='slider-color-range'></div><span class='slider-range-handle'></span><span class='slider-range-handle' ></span></div>"
            
            $($this).append(content);

            let _handleMovedHandlers = [];
            if (options.slideHandler != null)
                _handleMovedHandlers.push(options.slideHandler);

            const handleMovedEvent = function(state){
                _handleMovedHandlers.forEach(handler => {
                    handler(state);
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
                handleMin .jqueryObject.css(_leftPropertyName, - _handleWidth / 2);
                handleMax.jqueryObject.css(_leftPropertyName, _sliderWidth - _handleWidth / 2);
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
                handleMax.jqueryObject.css(_leftPropertyName, - _handleWidth / 2);
            }

            // шкала значений 
            if(options.scaleOfValues){
                let contentScale = "<div class = 'slider-scale-values'></div>";
                slider.append(contentScale);

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
                handleMovedEvent({
                    value: activeHandle.currentPos,
                    values: [handleMin.currentPos, handleMax.currentPos],
                    self: this,
                });
            };
            
            // Обработать перемещение бегунка
            const onHandleMoved = function(state){
                // При перемещении надо закрасить слайдер цветом
                applyColorToSlider(handleMin.currentPos, handleMax.currentPos);
                
                // при перемещении бегунка переместить индикатор
                indicatorMoved(activeHandle.currentPos);
                
                // вывести значение положения в индикаторе
                indicatorTextFun(); 
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
            
            // вывод текста индикатора
            const indicatorTextFun = function(){ 
                let indicatorText = activeHandle.currentPos - _sliderMinPos
                
                if(handleMax.currentPos === _sliderMaxPos){
                    indicator.text(handleMax.currentPos - _sliderMinPos + 2 * options.thickness);
                }
                else{
                    indicator.text(indicatorText);
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


let options = {
    indicatorVisibility: true,
    scaleOfValues: true,
    slideHandler: function(sliderState){
        $(sliderState.self).children('.slider-value').text(sliderState.value)
    }
};
$('.slider-range-container').each(function(){
    let $this = $(this);
    $this.mySliderPlugin({
        indicatorVisibility: true,
        slideHandler: function(sliderState){
            $this.next().find('.slider-value').text(`${sliderState.value}`)
        }
    });
});
$('.slider-range').mySliderPlugin({
    isDouble: true,
    indicatorVisibility: true,
    slideHandler: function(sliderState){
        let slider = $(sliderState.self);
        slider.next().find('.slider-value').text('от ' + sliderState.values[0] + ' до ' + sliderState.values[1])
    }});
$('.vertical-slider').mySliderPlugin({isDouble:true, vertical:true, thickness: 15, indicatorVisibility: true});



// для выбора одного(текущего обЪекта)
    // $('.example-class').on('mouseenter', event => {
    //     $(event.currentTarget).addClass('photo-active');
    // });