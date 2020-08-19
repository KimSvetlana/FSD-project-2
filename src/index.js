import $ from 'jquery';
global.jQuery = global.$ = $;
import './js-lib/sliderPlugin';

import './scss/style.scss';


$('.slider-range-container').each(function () {
    let $this = $(this);
    $this.mySliderPlugin({
        scaleOfValues: true,
        indicatorVisibility: true,
        min: -50,
        max: 50,
        step: 2,
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
$('.vertical-slider').mySliderPlugin({ 
    isDouble: true, 
    vertical: true, 
    thickness: 15, 
    indicatorVisibility: true,
    scaleOfValues: true
});