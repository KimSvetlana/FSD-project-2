(function ($) {
    $.fn.mySliderPlugin = function (options) {

        // настройки по умолчанию
        options = $.extend({
            backgroundColor: '#759cd8',
            expansion: '100%',
            thickness: 8,
            min: -100,
            max: 100,
            step: 1,
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

            let handleMin = {
                jqueryObject: handles.first(),
                getPosition: null,
                setPosition: null,
            };

            let handleMax = {
                ...handleMin,
                jqueryObject: handles.last(),
            };

            let activeHandle = handleMax;

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
            // корректируем положение индикатора
            indicator.css(_leftPropertyName, (_handleWidth / 2 - indicatorWidth / 2));

            // шкала значений 
            if (options.scaleOfValues) {
                let wrapScale = "<div class = 'slider-scale-values'></div>";
                slider.append(wrapScale);
                let sliderScale = $this.find('.slider-scale-values');
                
                for(let i = 0; i < options.scaleDivision; i++){
                    sliderScale.append("<span><i class = 'scale-number'></i></span>");
                }
                
                let arrSpan = sliderScale.children('span');
                let indicatorLeft = 100 / (arrSpan.length -1);
                let count = '';

                for(i = 0; i < arrSpan.length; i++){
                    count = `${indicatorLeft * i}%`;
                    arrSpan.eq(i).css('left', count);
                }  

                let arrNumberScale = $this.find('.scale-number');
                let stepScale = (options.max - options.min) / (options.scaleDivision -1);
                let scaleValue = 0;
                for(i = 0; i < arrNumberScale.length; i++){
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

            handleMin.getPosition = function () {
                // console.log("handleMin offset = " + this.jqueryObject.offset()[_leftPropertyName]);
                return this.jqueryObject.offset()[_leftPropertyName] + _handleWidth / 2;
            };
            handleMax.getPosition = function () {
                // console.log("handleMax offset = " + this.jqueryObject.offset()[_leftPropertyName]);
                return this.jqueryObject.offset()[_leftPropertyName] + _handleWidth / 2;
            };
            handleMin.setPosition = function (pos, clamp = true) {
                // Коррекция на доступную область перемещения
                if (clamp) {
                    if (pos < _sliderMinPos) {
                        pos = _sliderMinPos;
                    }
                    if (pos > handleMax.getPosition()) {
                        pos = handleMax.getPosition();
                    }
                }
                let offsetModifier = {};
                offsetModifier[_leftPropertyName] = pos - _handleWidth / 2;
                // console.log("handleMin set offset = " + offsetModifier[_leftPropertyName]);
                return this.jqueryObject.offset(offsetModifier)
            };
            handleMax.setPosition = function (pos, clamp = true) {
                let offsetModifier = {};
                if(clamp){
                    if (pos > _sliderMaxPos) {
                        pos = _sliderMaxPos
                    }
                    if (pos < handleMin.getPosition()) {
                        pos = handleMin.getPosition();
                    }
                }
                offsetModifier[_leftPropertyName] = pos - _handleWidth / 2;
                // console.log("handleMax set offset = " + offsetModifier[_leftPropertyName]);
                return this.jqueryObject.offset(offsetModifier)
            };

            // console.log("sliderMinPos = " + _sliderMinPos);
            // Начальное положение бегунков
            handleMin.setPosition(_sliderMinPos, clamp = false);
            handleMax.setPosition(_sliderMaxPos, clamp = false);

            // задаем координаты для второго бегунка при его наличии
            if (!options.isDouble) {
                handleMax.setPosition(_sliderMinPos, clamp = false);
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
                    value: activeHandle.getPosition(),
                    values: [handleMin.getPosition(), handleMax.getPosition()],
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
                let indicatorText = activeHandle.getPosition() - _sliderMinPos

                if (handleMax.getPosition() === _sliderMaxPos) {
                    indicator.text(handleMax.getPosition() - _sliderMinPos);
                }
                else {
                    indicator.text(indicatorText);
                }
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


$('.slider-range-container').each(function () {
    let $this = $(this);
    $this.mySliderPlugin({
        scaleOfValues: true,
        indicatorVisibility: true,
        slideHandler: function (sliderState) {
            $this.next().find('.slider-value').text(`${sliderState.value}`)
        }
    });
});
$('.slider-range').mySliderPlugin({
    isDouble: true,
    indicatorVisibility: true,
    slideHandler: function (sliderState) {
        let slider = $(sliderState.self);
        slider.next().find('.slider-value').text('от ' + sliderState.values[0] + ' до ' + sliderState.values[1])
    }
});
$('.vertical-slider').mySliderPlugin({ isDouble: true, vertical: true, thickness: 15, indicatorVisibility: true });



// для выбора одного(текущего обЪекта)
    // $('.example-class').on('mouseenter', event => {
    //     $(event.currentTarget).addClass('photo-active');
    // });