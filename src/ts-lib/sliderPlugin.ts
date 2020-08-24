import $ from 'jquery';
global.jQuery = global.$ = $;


(function ($) {
    $.fn.mySliderPlugin = function (options) {
        // настройки по умолчанию
        options = $.extend({
            backgroundColor: '#759cd8',
            expansion: '100%',
            thickness: 8,
            min: -100,
            max: 100,
            step: 5,
            scaleOfValues: false,
            scaleDivision: 5,
            isDouble: false,
            vertical: false,
            indicatorVisibility: false,
            slideHandler: null,
        }, options);

        const makeSliderFunction = function () {

            //добавляем HTML содержание
            let $this = $(this);
            let self = this;

            let content = "<div class='slider-range-content'>" +
                                "<div class='slider-color-range'></div>" +
                                "<span class='slider-range-handle'></span>" +
                                "<span class='slider-range-handle' ></span>"+
                            "</div>"

            $($this).append(content);

            let _handleMovedHandlers = [];
            if (options.slideHandler != null)
                _handleMovedHandlers.push(options.slideHandler);

            const handleMovedEvent = function (state) {
                _handleMovedHandlers.forEach(handler => {
                    handler(state);
                })
            };

            let handles = $this.find('.slider-range-handle');           

            // определяем переменные и ориентацию слайдера
            let _leftPropertyName;
            let _widthPropertyName = '';
            let _thicknessPropertyName = '';
            let _topPropertyName = '';
            let _handleWidth = options.thickness * 2;

            if (!options.vertical) {
                _leftPropertyName = 'left';
                _widthPropertyName = 'width';
                _thicknessPropertyName = 'height';
                _topPropertyName = 'top';
            }
            else {
                _leftPropertyName = 'top';
                _widthPropertyName = 'height';
                _thicknessPropertyName = 'width';
                _topPropertyName = 'left'
            }

            // параметры и размеры слайдера
            let slider = $this.find('.slider-range-content');
            slider.css(_thicknessPropertyName, options.thickness);
            slider.css(_widthPropertyName, options.expansion);

            let colorRange = $this.find('.slider-color-range');
            colorRange.css('background-color', options.backgroundColor);
            colorRange.css(_thicknessPropertyName, options.thickness);

            // определяем индикаотр значений
            let indicatorContent = "<span class='indicator'>0</span>";
            if (options.indicatorVisibility) {
                slider.append(indicatorContent);
            }
            let indicator = $this.find('.indicator');
            let indicatorWidth = indicator.outerWidth();
            let indicatorHeight = indicator.outerHeight();
            // корректируем положение индикатора
            if(!options.vertical){
                indicator.css(_leftPropertyName, (- indicatorWidth / 2));
            }
            else{
                indicator.css(_leftPropertyName, (- indicatorHeight / 2));
                indicator.css(_topPropertyName, '-55px');
            }

            // шкала значений 
            if (options.scaleOfValues) {
                let wrapScale = "<div class='slider-scale-values'></div>";
                slider.append(wrapScale);
                let sliderScale = $this.find('.slider-scale-values');
                sliderScale.css(_topPropertyName, options.thickness * 1.5 );   

                for(let i = 0; i < options.scaleDivision; i++){
                    sliderScale.append("<span><i class='scale-number'></i></span>");
                }
                
                let arrSpan = sliderScale.children('span');
                if(!options.vertical){
                    arrSpan.css({'border-left': '1px solid grey', 'height' : '8px'});
                }
                else{
                    arrSpan.css({'border-bottom': '1px solid grey', 'width':'8px'});
                };

                let indicatorLeft = 100 / (arrSpan.length -1);
                let count = '';

                for(let i = 0; i < arrSpan.length; i++){
                    count = `${indicatorLeft * i}%`;
                    arrSpan.eq(i).css(_leftPropertyName, count);
                }  

                let arrNumberScale = $this.find('.scale-number');

                if(!options.vertical){
                    arrNumberScale.css({'top': '10px', 'left' : '-5px'});
                }
                else{
                    arrNumberScale.css({'left': '10px', 'top':'-5px'});
                };
                let stepScale = (options.max - options.min) / (options.scaleDivision -1);
                let scaleValue = 0;
                for(let i = 0; i < arrNumberScale.length; i++){
                    scaleValue = options.min + stepScale * i;
                    arrNumberScale.eq(i).text(scaleValue);
                }                
            }

            // параметры и расположение бегунка
            handles.css({ 'width': _handleWidth, 'height': _handleWidth });
            // выравнивание бегунка относительно кулисы
            handles.css(_topPropertyName, -options.thickness / 2);

            // зная все размеры, можно уточнить границы слайдера
            let _sliderMinPos;
            let _sliderMaxPos;
            if (!options.vertical) {
                _sliderMinPos = slider.offset().left;
                _sliderMaxPos = _sliderMinPos + slider.width();
            }
            else {
                _sliderMinPos = slider.offset().top;
                _sliderMaxPos = _sliderMinPos + slider.height();
            }

            let handleMin = {
                jqueryObject: handles.first(),
                clamp: null,
                getClosestStepPos: function (pos){
                    let value = this.posToValue(pos);
                    value = Math.round(value / options.step) * options.step;
                    return this.valueToPos(value);
                },
                getPosition: function () {
                    // console.log("handleMin offset = " + this.jqueryObject.offset()[_leftPropertyName]);
                    return this.jqueryObject.offset()[_leftPropertyName] + _handleWidth / 2;
                },

                getValue: function(){
                    return Math.round(this.posToValue(this.getPosition()));
                },

                setPositionWithoutCorrection: function (pos) {
                    let offsetModifier = {};
                    offsetModifier[_leftPropertyName] = pos - _handleWidth / 2;
                    // console.log("handleMin set offset = " + offsetModifier[_leftPropertyName]);
                    return this.jqueryObject.offset(offsetModifier)
                },

                setInitialPosition: function(pos){
                    this.setPositionWithoutCorrection(pos);
                },

                setPosition: function (pos) {
                    //console.log("pos before correction: " + pos);
                    pos = this.getClosestStepPos(pos);

                    // Коррекция на доступную область перемещения
                    pos = this.clamp(pos);

                    //console.log("pos after correction: " + pos);

                    this.setPositionWithoutCorrection(pos);
                },

                posToValue: function (pos) {                
                    let proportion = (pos - _sliderMinPos) / (_sliderMaxPos - _sliderMinPos) * (options.max - options.min)
                    let handleValue = options.min + proportion;
                    return handleValue;
                },

                valueToPos: function (value) {
                    let proportion = (value - options.min) / (options.max - options.min) *(_sliderMaxPos - _sliderMinPos);
                    return _sliderMinPos + proportion;
                }
            };

            let handleMax = {
                ...handleMin,
                jqueryObject: handles.last(),
            };

            const clampValue = (val, minVal, maxVal) => {
                if (val < minVal){
                    val = minVal;
                }

                if (val > maxVal){
                    val = maxVal;
                }

                return val;
            };

            handleMin.clamp = function(pos){
                return clampValue(pos, _sliderMinPos, handleMax.getPosition());
            };

            handleMax.clamp = function(pos){
                return clampValue(pos, handleMin.getPosition(), _sliderMaxPos); 
            };

            let activeHandle = handleMax;

            // console.log("sliderMinPos = " + _sliderMinPos);
            // Начальное положение бегунков
            handleMin.setInitialPosition(_sliderMinPos);
            handleMax.setInitialPosition(_sliderMaxPos);

            // задаем координаты для второго бегунка при его наличии
            if (!options.isDouble) {
                handleMax.setInitialPosition(_sliderMinPos);
                handleMin.jqueryObject.css("visibility", "hidden");
            }

            // функция работы слайдера
            const onHandleMove = (movePosition) => {
                let movePos;

                // Коррекция на радиус
                if (options.vertical) {
                    movePos = movePosition.pageY;
                }
                else {
                    movePos = movePosition.pageX;
                }

                activeHandle.setPosition(movePos);

                // вызываем событие перемещения(передаем координату центра и радиус бегунка )
                handleMovedEvent({
                    value: activeHandle.getValue(),
                    values: [handleMin.getValue(), handleMax.getValue()],
                    self: this,
                });
            };

            // Обработать перемещение бегунка
            const onHandleMoved = function (state) {
                // При перемещении надо закрасить слайдер цветом
                applyColorToSlider(handleMin.getPosition(), handleMax.getPosition());

                // при перемещении бегунка переместить индикатор
                indicatorMoved(activeHandle.getPosition());

                // вывести значение положения в индикаторе
                indicatorTextFun();
            };

            // Закрасить слайдер
            const applyColorToSlider = function (from, to) {
                let colorWidth = to - from;
                let offSetObject = {};
                offSetObject[_leftPropertyName] = from;
                colorRange.offset(offSetObject);
                colorRange.css(_widthPropertyName, colorWidth);
            };
            // перемещаем индикатор
            const indicatorMoved = function (coordinatеs) {
                let modifier = {};
                modifier[_leftPropertyName] = coordinatеs - indicator.outerWidth() / 2;
                indicator.offset(modifier); //передаем координаты индикатору
            };

            // вывод текста индикатора
            const indicatorTextFun = function () {
                indicator.text(activeHandle.getValue());
            };

            _handleMovedHandlers.push(onHandleMoved);

            const onHandleMouseDown = (mouseEvent) => {
                if (handleMin.jqueryObject.get(0) === mouseEvent.currentTarget) {
                    activeHandle = handleMin;
                }
                else {
                    activeHandle = handleMax;
                }

                $(document).on('mousemove', onHandleMove);

                $(document).on('mouseup', function () {
                    $(document).off('mousemove');
                })
            };

            // Первоначальные действия со слайдером
            handles.on('mousedown', onHandleMouseDown);
            slider.on('click', onHandleMove);
            
            applyColorToSlider(handleMin.getPosition(), handleMax.getPosition());

        };

        return this.each(makeSliderFunction);
    };

})(jQuery);
